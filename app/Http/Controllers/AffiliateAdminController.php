<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\AffiliateEarning;
use App\Models\User;
use App\Services\AffiliateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Affiliate management, designed as a mountable module for the EXISTING
 * homelab admin panel.
 *
 * MOUNTING (see docs/affiliate-admin-integration.md):
 *   Move the route group in routes/web.php inside your existing admin panel's
 *   route group and swap EnsureIsAdmin::class for your panel's middleware.
 *   Add an "Affiliates" item to the panel's nav pointing at
 *   route('admin.affiliates.index').
 *
 * STANDALONE FALLBACK (default below): the same routes work on their own
 * behind auth + EnsureIsAdmin (users.is_admin flag).
 */
class AffiliateAdminController extends Controller
{
    public function __construct(
        protected AffiliateService $affiliates
    ) {}

    public function index(): InertiaResponse
    {
        $affiliates = Affiliate::with('user')
            ->withCount(['clicks', 'referrals'])
            ->latest()
            ->get()
            ->map(fn (Affiliate $a) => [
                'id' => $a->id,
                'name' => $a->user?->name,
                'email' => $a->user?->email,
                'code' => $a->code,
                'status' => $a->status,
                'clicks' => $a->clicks_count,
                'signups' => $a->referrals_count,
                'earned_cents' => (int) $a->earnings()->sum('amount_cents'),
                'owed_cents' => $this->affiliates->owedAmount($a),
                'created_at' => $a->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Affiliates/Index', [
            'affiliates' => $affiliates,
        ]);
    }

    /**
     * Invite-only: the creator must already have an account. Everything
     * goes through AffiliateService::makeAffiliate() — the same method the
     * existing panel's "Make affiliate" button should call.
     */
    public function invite(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'payout_details' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user) {
            return back()->withErrors([
                'email' => 'No account exists with that email. The creator must register first.',
            ]);
        }

        $affiliate = $this->affiliates->makeAffiliate($user, array_filter([
            'payout_details' => $data['payout_details'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]));

        return redirect()
            ->route('admin.affiliates.show', $affiliate)
            ->with('success', "Affiliate created for {$user->name} — code {$affiliate->code}.");
    }

    public function show(Affiliate $affiliate): InertiaResponse
    {
        $affiliate->load([
            'user',
            'referrals.referredUser',
            'earnings' => fn ($q) => $q->latest()->limit(100),
            'payouts' => fn ($q) => $q->latest(),
        ]);

        return Inertia::render('Admin/Affiliates/Show', [
            'affiliate' => [
                'id' => $affiliate->id,
                'name' => $affiliate->user?->name,
                'email' => $affiliate->user?->email,
                'code' => $affiliate->code,
                'status' => $affiliate->status,
                'commission_rate' => $affiliate->effectiveCommissionRate(),
                'commission_override' => $affiliate->commission_rate,
                'payout_details' => $affiliate->payout_details,
                'notes' => $affiliate->notes,
                'referral_url' => $affiliate->referralUrl(),
            ],
            'stats' => [
                'clicks' => $affiliate->clicks()->count(),
                'signups' => $affiliate->referrals()->count(),
                'earned_cents' => (int) $affiliate->earnings()->sum('amount_cents'),
                'owed_cents' => $this->affiliates->owedAmount($affiliate),
                'paid_cents' => (int) $affiliate->payouts()->sum('amount_cents'),
            ],
            'referrals' => $affiliate->referrals->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->referredUser?->name,
                'email' => $r->referredUser?->email,
                'created_at' => $r->created_at?->toDateTimeString(),
            ]),
            'earnings' => $affiliate->earnings->map(fn ($e) => [
                'id' => $e->id,
                'amount_cents' => $e->amount_cents,
                'kind' => $e->kind,
                'status' => $e->status,
                'description' => $e->description,
                'created_at' => $e->created_at?->toDateTimeString(),
            ]),
            'payouts' => $affiliate->payouts->map(fn ($p) => [
                'id' => $p->id,
                'amount_cents' => $p->amount_cents,
                'method' => $p->method,
                'reference' => $p->reference,
                'notes' => $p->notes,
                'paid_at' => $p->paid_at?->toDateTimeString(),
            ]),
        ]);
    }

    public function updateStatus(Request $request, Affiliate $affiliate): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:invited,active,suspended'],
        ]);

        $affiliate->update(['status' => $data['status']]);

        return back()->with('success', "Affiliate status set to {$data['status']}.");
    }

    public function update(Request $request, Affiliate $affiliate): RedirectResponse
    {
        $data = $request->validate([
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'payout_details' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $affiliate->update($data);

        return back()->with('success', 'Affiliate updated.');
    }

    public function storePayout(Request $request, Affiliate $affiliate): RedirectResponse
    {
        $owedCents = $this->affiliates->owedAmount($affiliate);
        $maxDollars = $owedCents / 100;

        $data = $request->validate([
            'amount_dollars' => ['required', 'numeric', 'min:0.01', "max:{$maxDollars}"],
            'method' => ['required', 'string', 'max:32'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->affiliates->recordPayout(
            $affiliate,
            (int) round($data['amount_dollars'] * 100),
            $data['method'],
            $data['reference'] ?? null,
            $data['notes'] ?? null,
            $request->user()->id,
        );

        return back()->with('success', 'Payout recorded.');
    }

    public function storeAdjustment(Request $request, Affiliate $affiliate): RedirectResponse
    {
        $data = $request->validate([
            'amount_dollars' => ['required', 'numeric', 'not_in:0'],
            'description' => ['required', 'string', 'max:500'],
        ]);

        $this->affiliates->recordManualAdjustment(
            $affiliate,
            (int) round($data['amount_dollars'] * 100),
            $data['description'],
        );

        return back()->with('success', 'Adjustment recorded.');
    }
}
