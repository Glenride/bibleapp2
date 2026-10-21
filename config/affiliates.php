<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Affiliate commission rate
    |--------------------------------------------------------------------------
    |
    | Default share of subscription revenue paid to affiliates, as a decimal.
    | DEFAULT: 0.20 (20% recurring commission on subscription revenue).
    | Change this in one place; per-affiliate overrides live on the
    | affiliates.commission_rate column (null = use this default).
    |
    */
    'commission_rate' => (float) env('AFFILIATE_COMMISSION_RATE', 0.20),

    /*
    |--------------------------------------------------------------------------
    | Attribution window
    |--------------------------------------------------------------------------
    |
    | How long after clicking a referral link a signup still credits the
    | affiliate. DEFAULT: 30 days. The referral cookie lives this long.
    |
    */
    'attribution_window_days' => (int) env('AFFILIATE_ATTRIBUTION_DAYS', 30),

    /*
    |--------------------------------------------------------------------------
    | Referral cookie name
    |--------------------------------------------------------------------------
    */
    'cookie_name' => env('AFFILIATE_COOKIE_NAME', 'aff_code'),

    /*
    |--------------------------------------------------------------------------
    | Referral code length
    |--------------------------------------------------------------------------
    |
    | Length of the auto-generated human-readable referral codes
    | (uppercase alphanumeric, e.g. "K7Q2M9XD").
    |
    */
    'code_length' => 8,
];
