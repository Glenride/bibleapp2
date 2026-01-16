<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::get('settings/subscription', function () {
        $user = auth()->user();
        $currentPlan = 'none';
        $subscriptionEndsAt = null;

        if ($user->subscribed('default')) {
            $subscription = $user->subscription('default');
            // Determine plan based on price ID
            if ($subscription->hasPrice('price_1SqIgxLenlwJrzcOw7OEiD4n')) {
                $currentPlan = 'pro';
            } elseif ($subscription->hasPrice('price_1SqIgMLenlwJrzcOoUWAw2qf')) {
                $currentPlan = 'basic';
            }
            if ($subscription->ends_at) {
                $subscriptionEndsAt = $subscription->ends_at->format('M d, Y');
            } elseif ($subscription->asStripeSubscription()->current_period_end) {
                $subscriptionEndsAt = \Carbon\Carbon::createFromTimestamp(
                    $subscription->asStripeSubscription()->current_period_end
                )->format('M d, Y');
            }
        }

        return Inertia::render('settings/subscription', [
            'currentPlan' => $currentPlan,
            'subscriptionEndsAt' => $subscriptionEndsAt,
        ]);
    })->name('subscription.edit');
});
