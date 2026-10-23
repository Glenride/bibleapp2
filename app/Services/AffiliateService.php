<?php

namespace App\Services;

use App\Models\Affiliate;
use App\Models\AffiliateEarning;
use App\Models\AffiliatePayout;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Single home for all affiliate-program logic.
 *
 * Defaults (change in config/affiliates.php, one place):
 *   - commission_rate:        0.20  (20% recurring commission on subscription revenue)
 *   - attribution_window_days: 30   (cookie lifetime for referral attribution)
 *
 * Honesty notes (v1):
 *  - No payment processing exists in this repo, so nothing calls
 *    recordSubscriptionCommission() yet. It is the documented integration
 *    point for the future payments work (e.g. a Stripe webhook handler).
 *  - "Pay directly" in v1 means the owner pays however they like
 *    (Cash App, Zelle, ...) and records it via recordPayout(). Automated
 *    payouts (Stripe Connect etc.) are a documented future phase.
 */
class AffiliateService
{
    /**
     * THE method the admin panel's "Make affiliate" action calls.
     * Idempotent: returns the existing affiliate if the user already has one.
     */
    public function makeAffiliate(User $user, array $attrs = []): Affiliate
    {
        $existing = Affiliate::where('user_id', $user->id)->first();
        if ($existing) {
            return $existing;
        }

        return Affiliate::create(array_merge([
            'user_id' => $user->id,
            'code' => $this->generateUniqueCode(),
            'status' => Affiliate::STATUS_ACTIVE,
        ], $attrs));
    }

    public function generateUniqueCode(): string
    {
        $length = (int) config('affiliates.code_length', 8);

        do {
            // uppercase alphanumeric, no ambiguous chars (0/O, 1/I/L)
            $code = Str::upper(Str::random($length));
            $code = strtr($code, ['0' => '2', 'O' => 'X', '1' => '3', 'I' => 'Y', 'L' => 'Z']);
        } while (Affiliate::where('code', $code)->exists());

        return $code;
    }

    public function recordClick(Affiliate $affiliate, Request $request): void
    {
        $affiliate->clicks()->create([
            'ip_hash' => hash('sha256', (string) $request->ip()),
            'user_agent' => Str::limit((string) $request->userAgent(), 255),
        ]);
    }

    /**
     * Attribute a new signup to the affiliate behind $code.
     * Returns the referral, or null when attribution doesn't apply.
     * Guards: unknown/inactive code, duplicate referral, self-referral.
     */
    public function attributeSignup(User $user, ?string $code): ?\App\Models\AffiliateReferral
    {
        if (! $code) {
            return null;
        }

        $affiliate = Affiliate::where('code', $code)
            ->where('status', Affiliate::STATUS_ACTIVE)
            ->first();

        if (! $affiliate) {
            return null;
        }

        // no self-referral
        if ($affiliate->user_id === $user->id) {
            return null;
        }

        // one referral per referred user, ever
        if (\App\Models\AffiliateReferral::where('referred_user_id', $user->id)->exists()) {
            return null;
        }

        return $affiliate->referrals()->create([
            'referred_user_id' => $user->id,
        ]);
    }

    /**
     * INTEGRATION POINT for the future payments work. When a referred user's
     * subscription payment lands (e.g. Stripe invoice.payment_succeeded),
     * call this with the payment amount in cents. Computes the commission
     * from the affiliate's override rate or the config default.
     *
     * Future refinement: create these as 'pending' and flip to 'available'
     * on payment success / reverse on refund. In v1 (no payments yet) they
     * are created 'available' directly.
     */
    public function recordSubscriptionCommission(
        Affiliate $affiliate,
        int $amountCents,
        string $description = '',
        ?int $referralId = null
    ): AffiliateEarning {
        $commission = (int) round($amountCents * $affiliate->effectiveCommissionRate());

        return $affiliate->earnings()->create([
            'affiliate_referral_id' => $referralId,
            'amount_cents' => $commission,
            'currency' => 'usd',
            'kind' => AffiliateEarning::KIND_SUBSCRIPTION,
            'status' => AffiliateEarning::STATUS_AVAILABLE,
            'description' => $description ?: 'Subscription commission',
        ]);
    }

    /**
     * Manual credit (+) or debit (-) by the owner, e.g. bonuses or corrections.
     */
    public function recordManualAdjustment(
        Affiliate $affiliate,
        int $amountCents,
        string $description
    ): AffiliateEarning {
        return $affiliate->earnings()->create([
            'amount_cents' => $amountCents,
            'currency' => 'usd',
            'kind' => AffiliateEarning::KIND_ADJUSTMENT,
            'status' => AffiliateEarning::STATUS_AVAILABLE,
            'description' => $description,
        ]);
    }

    /**
     * Total currently owed to the affiliate, in cents.
     */
    public function owedAmount(Affiliate $affiliate): int
    {
        return (int) $affiliate->earnings()
            ->where('status', AffiliateEarning::STATUS_AVAILABLE)
            ->sum('amount_cents');
    }

    /**
     * Record an off-platform payout (v1: owner pays via Cash App/Zelle/etc.
     * and records it here). Marks the oldest available earnings 'paid' first
     * (FIFO) until the payout amount is covered, so the ledger always shows
     * exactly which earnings a payout settled.
     */
    public function recordPayout(
        Affiliate $affiliate,
        int $amountCents,
        string $method,
        ?string $reference,
        ?string $notes,
        int $recordedBy
    ): AffiliatePayout {
        return DB::transaction(function () use ($affiliate, $amountCents, $method, $reference, $notes, $recordedBy) {
            $payout = $affiliate->payouts()->create([
                'amount_cents' => $amountCents,
                'method' => $method,
                'reference' => $reference,
                'notes' => $notes,
                'paid_at' => now(),
                'recorded_by' => $recordedBy,
            ]);

            $remaining = $amountCents;

            $earnings = $affiliate->earnings()
                ->where('status', AffiliateEarning::STATUS_AVAILABLE)
                ->where('amount_cents', '>', 0)
                ->orderBy('created_at')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($earnings as $earning) {
                if ($remaining <= 0) {
                    break;
                }
                // FIFO: mark whole earning rows paid while they fit in the remainder.
                if ($earning->amount_cents <= $remaining) {
                    $earning->update(['status' => AffiliateEarning::STATUS_PAID]);
                    $remaining -= $earning->amount_cents;
                }
            }

            return $payout;
        });
    }
}
