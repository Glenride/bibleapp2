<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (str_starts_with((string) config('app.url'), 'https://') || $this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Affiliate attribution: Fortify dispatches Registered on every
        // signup (including beta signups), and this listener credits the
        // affiliate behind the referral cookie, if any.
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Auth\Events\Registered::class,
            \App\Listeners\AttributeAffiliateSignup::class
        );

        // Record affiliate commission when a subscription payment succeeds via Stripe webhook
        \Illuminate\Support\Facades\Event::listen(
            \Laravel\Cashier\Events\WebhookReceived::class,
            \App\Listeners\RecordAffiliateSubscriptionCommission::class
        );
    }
}
