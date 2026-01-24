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
}
