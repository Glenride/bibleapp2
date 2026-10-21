<?php

namespace App\Listeners;

use App\Services\AffiliateService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Cookie;

/**
 * Attributes a new signup to the affiliate behind the referral cookie.
 *
 * Wired in AppServiceProvider::boot(). Fortify dispatches the Registered
 * event for every registration — including beta signups in the homelab
 * copy — so beta testers arriving via a creator's link are attributed
 * through this same hook with no extra code.
 */
class AttributeAffiliateSignup
{
    public function __construct(
        protected AffiliateService $affiliates
    ) {}

    public function handle(Registered $event): void
    {
        $code = request()->cookie((string) config('affiliates.cookie_name'));

        $this->affiliates->attributeSignup($event->user, $code);

        // Single-use: the signup consumed the attribution. Clear it so a
        // later logout/register cycle can't double-attribute.
        Cookie::queue(Cookie::forget((string) config('affiliates.cookie_name')));
    }
}
