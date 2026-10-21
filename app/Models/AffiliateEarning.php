<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateEarning extends Model
{
    public const KIND_SUBSCRIPTION = 'subscription_commission';
    public const KIND_ADJUSTMENT = 'manual_adjustment';

    public const STATUS_PENDING = 'pending';
    public const STATUS_AVAILABLE = 'available';
    public const STATUS_PAID = 'paid';

    protected $guarded = [];

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function referral(): BelongsTo
    {
        return $this->belongsTo(AffiliateReferral::class, 'affiliate_referral_id');
    }

    public function amountDollars(): string
    {
        return number_format($this->amount_cents / 100, 2);
    }
}
