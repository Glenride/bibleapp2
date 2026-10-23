<?php

namespace App\Listeners;

use App\Models\AffiliateReferral;
use App\Models\User;
use App\Services\AffiliateService;
use Laravel\Cashier\Events\WebhookReceived;

class RecordAffiliateSubscriptionCommission
{
    public function __construct(
        protected AffiliateService $affiliates
    ) {}

    public function handle(WebhookReceived $event): void
    {
        $payload = $event->payload;

        if (($payload['type'] ?? '') !== 'invoice.payment_succeeded') {
            return;
        }

        $invoice = $payload['data']['object'] ?? [];
        $customerId = $invoice['customer'] ?? null;
        $amountPaid = (int) ($invoice['amount_paid'] ?? 0);
        $invoiceId = $invoice['id'] ?? 'unknown';

        if (! $customerId || $amountPaid <= 0) {
            return;
        }

        $user = User::where('stripe_id', $customerId)->first();
        if (! $user) {
            return;
        }

        $referral = AffiliateReferral::where('referred_user_id', $user->id)
            ->with('affiliate')
            ->first();

        if (! $referral || ! $referral->affiliate || ! $referral->affiliate->isActive()) {
            return;
        }

        // Prevent duplicate commission on webhook redelivery
        $alreadyRecorded = $referral->affiliate->earnings()
            ->where('description', 'like', "%{$invoiceId}%")
            ->exists();

        if ($alreadyRecorded) {
            return;
        }

        $this->affiliates->recordSubscriptionCommission(
            $referral->affiliate,
            $amountPaid,
            "Subscription invoice {$invoiceId} for {$user->email}",
            $referral->id
        );
    }
}
