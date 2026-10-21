<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Services\AffiliateService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Public referral-link entry point: GET /r/{code}
 *
 * Records the click (hashed IP, never raw), sets the attribution cookie
 * (HttpOnly, SameSite=Lax) for the configured attribution window, and
 * sends the visitor to registration. Unknown or non-active codes 404.
 */
class ReferralController extends Controller
{
    public function __construct(
        protected AffiliateService $affiliates
    ) {}

    public function redirect(string $code, Request $request): Response
    {
        $affiliate = Affiliate::where('code', strtoupper($code))
            ->where('status', Affiliate::STATUS_ACTIVE)
            ->firstOrFail();

        $this->affiliates->recordClick($affiliate, $request);

        $minutes = (int) config('affiliates.attribution_window_days', 30) * 24 * 60;

        $cookie = cookie(
            (string) config('affiliates.cookie_name', 'aff_code'),
            $affiliate->code,
            $minutes,
            '/',
            null,   // domain (current)
            false,  // secure — set true behind HTTPS-only deploys if desired
            true,   // httpOnly
            false,  // raw
            'Lax'   // sameSite
        );

        return redirect('/register')->withCookie($cookie);
    }
}
