<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

class CheckoutController extends Controller
{
    public function subscribe(Request $request, string $plan): Checkout|RedirectResponse
    {
        $planMap = [
            'study' => config('services.stripe.plans.study', env('STRIPE_PRICE_TIER7', 'price_1UTRg6RkHi4ZROlzFCH6wj5A')),
            'basic' => config('services.stripe.plans.study', env('STRIPE_PRICE_TIER7', 'price_1UTRg6RkHi4ZROlzFCH6wj5A')),
            'pro'   => config('services.stripe.plans.pro', env('STRIPE_PRICE_TIER27', 'price_1UTRg8RkHi4ZROlzhcha2bhU')),
        ];

        $targetPriceId = $planMap[$plan] ?? null;

        if (! $targetPriceId) {
            $validPriceIds = array_filter([
                config('services.stripe.plans.study', env('STRIPE_PRICE_TIER7')),
                config('services.stripe.plans.pro', env('STRIPE_PRICE_TIER27')),
                User::BASIC_PLAN_PRICE_ID,
                User::PRO_PLAN_PRICE_ID,
            ]);

            if (in_array($plan, $validPriceIds, true)) {
                $targetPriceId = $plan;
            }
        }

        if (! $targetPriceId) {
            return redirect()->route('pricing')->with('error', 'Invalid subscription plan selected.');
        }

        $user = $request->user();

        if ($user->subscribed('default') && $user->subscription('default')->hasPrice($targetPriceId)) {
            return redirect()->route('dashboard')->with('info', 'You are already subscribed to this plan.');
        }

        return $user
            ->newSubscription('default', $targetPriceId)
            ->checkout([
                'success_url' => route('dashboard') . '?checkout=success',
                'cancel_url' => route('pricing') . '?checkout=canceled',
            ]);
    }
}
