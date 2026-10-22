<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display list of all users.
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                $currentPlan = 'none';
                $subscriptionEndsAt = null;

                $currentPlan = $user->currentPlan();

                if ($user->subscribed('default')) {
                    $subscription = $user->subscription('default');
                    if ($subscription->asStripeSubscription()->current_period_end ?? null) {
                        $subscriptionEndsAt = \Carbon\Carbon::createFromTimestamp(
                            $subscription->asStripeSubscription()->current_period_end
                        )->format('M d, Y');
                    }
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => $user->is_admin,
                    'is_super_admin' => $user->isSuperAdmin(),
                    'is_beta_tester' => $user->is_beta_tester,
                    'beta_expires_at' => $user->beta_expires_at?->format('M d, Y'),
                    'is_active_beta' => $user->isBetaTester(),
                    'current_plan' => $currentPlan,
                    'subscription_ends_at' => $subscriptionEndsAt,
                    'created_at' => $user->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('admin/users', [
            'users' => $users,
        ]);
    }

    /**
     * Make a user an admin.
     */
    public function makeAdmin(Request $request, User $user)
    {
        $user->update(['is_admin' => true]);

        return back()->with('success', "{$user->name} is now an admin.");
    }

    /**
     * Remove admin role from a user.
     */
    public function removeAdmin(Request $request, User $user)
    {
        // Cannot remove super admin
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Cannot remove super admin privileges.');
        }

        $user->update(['is_admin' => false]);

        return back()->with('success', "{$user->name} is no longer an admin.");
    }

    /**
     * Assign free trial subscription to a user.
     */
    public function assignTrial(Request $request, User $user)
    {
        // Cancel any existing subscription first
        if ($user->subscribed('default')) {
            $user->subscription('default')->cancelNow();
        }

        // Create new subscription with the free trial price
        $user->newSubscription('default', User::TRIAL_PLAN_PRICE_ID)
            ->create();

        return back()->with('success', "Free trial assigned to {$user->name}.");
    }

    /**
     * Cancel a user's subscription.
     */
    public function cancelSubscription(Request $request, User $user)
    {
        if ($user->subscribed('default')) {
            $user->subscription('default')->cancelNow();
            return back()->with('success', "Subscription cancelled for {$user->name}.");
        }

        return back()->with('error', 'User has no active subscription.');
    }

    /**
     * Toggle beta tester status for a user.
     */
    public function toggleBetaTester(Request $request, User $user)
    {
        $request->validate([
            'expires_in_days' => 'nullable|integer|min:1|max:365',
        ]);

        $expiresAt = null;
        if ($request->expires_in_days) {
            $expiresAt = now()->addDays($request->expires_in_days);
        }

        $user->update([
            'is_beta_tester' => true,
            'beta_expires_at' => $expiresAt,
        ]);

        $expiryMessage = $expiresAt ? " (expires {$expiresAt->format('M d, Y')})" : " (no expiration)";
        return back()->with('success', "{$user->name} is now a beta tester{$expiryMessage}.");
    }

    /**
     * Remove beta tester status from a user.
     */
    public function removeBetaTester(Request $request, User $user)
    {
        $user->update([
            'is_beta_tester' => false,
            'beta_expires_at' => null,
        ]);

        return back()->with('success', "{$user->name} is no longer a beta tester.");
    }

    /**
     * Display list of all trial users with stats.
     */
    public function trials()
    {
        $trialUsers = User::whereHas('subscriptions', function ($query) {
            $query->where('stripe_price', User::TRIAL_PLAN_PRICE_ID)
                  ->whereNull('ends_at');
        })->orderBy('created_at', 'desc')->get();

        $now = now();
        $users = $trialUsers->map(function ($user) use ($now) {
            $subscription = $user->subscription('default');
            $stripeSubscription = $subscription?->asStripeSubscription();
            $endTimestamp = $stripeSubscription?->current_period_end ?? null;
            $endsAt = $endTimestamp ? \Carbon\Carbon::createFromTimestamp($endTimestamp) : null;
            $daysRemaining = $endsAt ? $now->diffInDays($endsAt, false) : null;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'trial_started_at' => $subscription?->created_at?->format('M d, Y'),
                'trial_ends_at' => $endsAt?->format('M d, Y'),
                'days_remaining' => $daysRemaining,
                'created_at' => $user->created_at->format('M d, Y'),
            ];
        });

        // Calculate stats
        $stats = [
            'total' => $users->count(),
            'expiring_in_3_days' => $users->filter(fn($u) => $u['days_remaining'] !== null && $u['days_remaining'] <= 3 && $u['days_remaining'] >= 0)->count(),
            'expiring_in_7_days' => $users->filter(fn($u) => $u['days_remaining'] !== null && $u['days_remaining'] <= 7 && $u['days_remaining'] >= 0)->count(),
        ];

        return Inertia::render('admin/trials', [
            'users' => $users,
            'stats' => $stats,
        ]);
    }

    /**
     * Extend a user's trial subscription.
     */
    public function extendTrial(Request $request, User $user)
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $subscription = $user->subscription('default');
        if (!$subscription || !$subscription->hasPrice(User::TRIAL_PLAN_PRICE_ID)) {
            return back()->with('error', 'User does not have an active trial.');
        }

        // Get current period end and extend it
        $stripeSubscription = $subscription->asStripeSubscription();
        $currentEnd = $stripeSubscription->current_period_end;
        $newEnd = \Carbon\Carbon::createFromTimestamp($currentEnd)->addDays($request->days);

        // Update the subscription in Stripe
        $user->stripe()->subscriptions->update($stripeSubscription->id, [
            'trial_end' => $newEnd->timestamp,
            'proration_behavior' => 'none',
        ]);

        return back()->with('success', "Trial extended by {$request->days} days for {$user->name}. New end date: {$newEnd->format('M d, Y')}");
    }

    /**
     * Revoke a user's trial subscription immediately.
     */
    public function revokeTrial(Request $request, User $user)
    {
        $subscription = $user->subscription('default');
        if (!$subscription || !$subscription->hasPrice(User::TRIAL_PLAN_PRICE_ID)) {
            return back()->with('error', 'User does not have an active trial.');
        }

        $subscription->cancelNow();

        return back()->with('success', "Trial revoked for {$user->name}.");
    }

    /**
     * Extend multiple users' trials at once.
     */
    public function bulkExtendTrials(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id',
            'days' => 'required|integer|min:1|max:365',
        ]);

        $successCount = 0;
        $failedUsers = [];

        foreach ($request->user_ids as $userId) {
            $user = User::find($userId);
            $subscription = $user->subscription('default');
            
            if (!$subscription || !$subscription->hasPrice(User::TRIAL_PLAN_PRICE_ID)) {
                $failedUsers[] = $user->name;
                continue;
            }

            try {
                $stripeSubscription = $subscription->asStripeSubscription();
                $currentEnd = $stripeSubscription->current_period_end;
                $newEnd = \Carbon\Carbon::createFromTimestamp($currentEnd)->addDays($request->days);

                $user->stripe()->subscriptions->update($stripeSubscription->id, [
                    'trial_end' => $newEnd->timestamp,
                    'proration_behavior' => 'none',
                ]);
                $successCount++;
            } catch (\Exception $e) {
                $failedUsers[] = $user->name;
            }
        }

        $message = "Extended trials for {$successCount} users by {$request->days} days.";
        if (count($failedUsers) > 0) {
            $message .= " Failed for: " . implode(', ', $failedUsers);
        }

        return back()->with('success', $message);
    }

    /**
     * Revoke multiple users' trials at once.
     */
    public function bulkRevokeTrials(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id',
        ]);

        $successCount = 0;
        $failedUsers = [];

        foreach ($request->user_ids as $userId) {
            $user = User::find($userId);
            $subscription = $user->subscription('default');
            
            if (!$subscription || !$subscription->hasPrice(User::TRIAL_PLAN_PRICE_ID)) {
                $failedUsers[] = $user->name;
                continue;
            }

            try {
                $subscription->cancelNow();
                $successCount++;
            } catch (\Exception $e) {
                $failedUsers[] = $user->name;
            }
        }

        $message = "Revoked trials for {$successCount} users.";
        if (count($failedUsers) > 0) {
            $message .= " Failed for: " . implode(', ', $failedUsers);
        }

        return back()->with('success', $message);
    }
}
