# Affiliate Admin — Integration Guide for the Existing Homelab Admin Panel

This repo ships the affiliate program as a **mountable module** designed to drop
into InspireWrite's EXISTING admin panel (the one in the homelab copy that already
grants beta-testing and admin privileges). Nothing here builds a competing panel.

## What the module provides

| Piece | Location |
|---|---|
| Admin controller (index/invite/show/status/update/payout/adjustment) | `app/Http/Controllers/AffiliateAdminController.php` |
| Admin Inertia pages | `resources/js/pages/Admin/Affiliates/Index.tsx`, `Show.tsx` |
| Single "make affiliate" entry point | `AffiliateService::makeAffiliate(User $user, array $attrs = [])` |
| Standalone fallback middleware | `app/Http/Middleware/EnsureIsAdmin.php` (alias `is_admin`) |

## Step 1 — Mount the routes inside your existing admin group

In `routes/web.php` the affiliate admin routes currently live in a standalone group:

```php
Route::middleware(['auth', 'verified', 'is_admin'])->prefix('admin/affiliates')->name('admin.affiliates.')->group(...)
```

To mount them in your panel, move the six routes inside your **existing** admin
route group and swap the middleware. Example — adapt the group/middleware names
to whatever your panel actually uses:

```php
Route::middleware(['auth', 'verified', YourExistingAdminMiddleware::class])
    ->prefix('admin')          // your panel's existing prefix
    ->name('admin.')           // your panel's existing name prefix
    ->group(function () {
        // ... your existing panel routes ...

        // Affiliates module — drop in as-is:
        Route::prefix('affiliates')->name('affiliates.')->group(function () {
            Route::get('/', [AffiliateAdminController::class, 'index'])->name('index');
            Route::post('/invite', [AffiliateAdminController::class, 'invite'])->name('invite');
            Route::get('/{affiliate}', [AffiliateAdminController::class, 'show'])->name('show');
            Route::patch('/{affiliate}', [AffiliateAdminController::class, 'update'])->name('update');
            Route::patch('/{affiliate}/status', [AffiliateAdminController::class, 'updateStatus'])->name('status');
            Route::post('/{affiliate}/payouts', [AffiliateAdminController::class, 'storePayout'])->name('payouts.store');
            Route::post('/{affiliate}/adjustments', [AffiliateAdminController::class, 'storeAdjustment'])->name('adjustments.store');
        });
    });
```

Route names stay `admin.affiliates.*` either way, so the Inertia pages' `route(...)`
calls keep working without changes.

If your panel already has its own admin concept, **skip**
`2026_10_15_130500_add_is_admin_to_users_table.php` when migrating (or roll it
back) and delete/ignore `EnsureIsAdmin` — it's only the standalone fallback.

## Step 2 — Add "Affiliates" to the panel nav

Add a nav item next to your existing admin sections:

- Label: **Affiliates**
- Href: `route('admin.affiliates.index')` (i.e. `/admin/affiliates`)

## Step 3 — "Make affiliate" next to "Grant beta" / "Grant admin"

On your user-management screen, next to the existing privilege actions, add a
**Make affiliate** button that calls the single entry point:

```php
use App\Services\AffiliateService;

app(AffiliateService::class)->makeAffiliate($user);
// or with extras:
app(AffiliateService::class)->makeAffiliate($user, [
    'payout_details' => 'Cash App: $creator',
    'notes' => 'Invited Oct 2026',
]);
```

What it does:
- Idempotent — returns the existing record if the user is already an affiliate.
- Generates a unique 8-char referral code (e.g. `K7Q2M9XD`).
- Sets status `active` immediately (override with `'status' => 'invited'` in `$attrs`
  if you want a manual activation step).
- The creator instantly sees their code + link: the creator dashboard
  (`/affiliate`), the dashboard widget, and the sidebar "Affiliate" link all key
  off the affiliate record — "the code is on their account" with no extra work.

To **revoke**, set status to `suspended` (links 404, cookie attribution stops).
The controller's status dropdown does this; programmatically:
`$affiliate->update(['status' => 'suspended'])`.

## Step 4 — Migrate + verify on the homelab

```bash
php artisan migrate
```

This creates `affiliates`, `affiliate_clicks`, `affiliate_referrals`,
`affiliate_earnings`, `affiliate_payouts` (+ `users.is_admin` for the standalone
fallback only).

Then: open an affiliate's `/r/{code}` link in a private window → confirm the
click is recorded and you land on `/register` → register → confirm the referral
row exists and the creator dashboard shows the signup.

## Defaults baked in (change in `config/affiliates.php`)

- **Commission: 20%** of subscription revenue, recurring (`commission_rate`).
  Per-affiliate overrides via the admin "details" form.
- **Attribution window: 30 days** (`attribution_window_days`) — the referral
  cookie lifetime.

## When payments land

`AffiliateService::recordSubscriptionCommission($affiliate, $amountCents, $description)`
is the integration point — call it from the future payment webhook (e.g. Stripe
`invoice.payment_succeeded`) with the payment amount in cents. Commissions are
computed from the affiliate's override rate or the 20% default. Nothing calls it
yet; that is intentional.

"Pay directly" in v1 = you pay however you like (Cash App, Zelle, …) and record
it in the admin "Record payout" form, which marks the oldest available earnings
paid (FIFO). Automated payouts (Stripe Connect) are a future phase — no fake
payment processing was built.

## Beta-tester attribution (no action needed)

Attribution hooks into Fortify's `Registered` event (`AttributeAffiliateSignup`
listener, wired in `AppServiceProvider`). Beta signups in the homelab copy go
through the same registration, so a beta tester arriving via a creator's link is
attributed automatically.
