<?php

namespace App\Http\Controllers;

use App\Services\AffiliateService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Creator-facing dashboard. Strictly scoped to the logged-in user's OWN
 * affiliate record — never accepts an affiliate id from the request.
 */
class AffiliateDashboardController extends Controller
{
    public function __construct(
        protected AffiliateService $affiliates
    ) {}

    public function show(Request $request): InertiaResponse
    {
        $affiliate = $request->user()->affiliate;

        abort_unless($affiliate, 403, 'No affiliate account.');

        $affiliate->loadCount(['clicks', 'referrals']);
        $affiliate->load(['payouts' => fn ($q) => $q->latest()->limit(20)]);

        $earnedCents = (int) $affiliate->earnings()->sum('amount_cents');
        $paidCents = (int) $affiliate->payouts()->sum('amount_cents');

        return Inertia::render('Affiliates/Dashboard', [
            'affiliate' => [
                'code' => $affiliate->code,
                'status' => $affiliate->status,
                'referral_url' => $affiliate->referralUrl(),
                'commission_rate' => $affiliate->effectiveCommissionRate(),
            ],
            'stats' => [
                'clicks' => $affiliate->clicks_count,
                'signups' => $affiliate->referrals_count,
                'earned_cents' => $earnedCents,
                'owed_cents' => $this->affiliates->owedAmount($affiliate),
                'paid_cents' => $paidCents,
            ],
            'payouts' => $affiliate->payouts->map(fn ($p) => [
                'id' => $p->id,
                'amount_cents' => $p->amount_cents,
                'method' => $p->method,
                'reference' => $p->reference,
                'paid_at' => $p->paid_at?->toDateTimeString(),
            ]),
        ]);
    }
}
