<?php

namespace Tests\Feature;

use App\Models\Affiliate;
use App\Models\AffiliateEarning;
use App\Models\AffiliateReferral;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Cashier\Events\WebhookReceived;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login_from_checkout(): void
    {
        $response = $this->get('/checkout/study');

        $response->assertRedirect('/login');
    }

    public function test_invalid_plan_redirects_to_pricing_with_error(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/checkout/nonexistent-plan');

        $response->assertRedirect(route('pricing'));
        $response->assertSessionHas('error');
    }

    public function test_already_subscribed_user_is_redirected_to_dashboard(): void
    {
        $user = User::factory()->create();
        $priceId = config('services.stripe.plans.study', env('STRIPE_PRICE_TIER7'));

        $user->subscriptions()->create([
            'type' => 'default',
            'stripe_id' => 'sub_test_already_subscribed',
            'stripe_status' => 'active',
            'stripe_price' => $priceId,
            'quantity' => 1,
            'trial_ends_at' => null,
            'ends_at' => null,
        ]);

        $response = $this->actingAs($user)->get('/checkout/study');

        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('info');
    }

    public function test_invoice_payment_succeeded_webhook_credits_affiliate_commission(): void
    {
        $affiliateUser = User::factory()->create();
        $affiliate = Affiliate::create([
            'user_id' => $affiliateUser->id,
            'code' => 'TESTAFF',
            'commission_rate' => 0.20,
            'status' => Affiliate::STATUS_ACTIVE,
        ]);

        $subscriber = User::factory()->create([
            'stripe_id' => 'cus_test_subscriber_123',
        ]);

        $referral = AffiliateReferral::create([
            'affiliate_id' => $affiliate->id,
            'referred_user_id' => $subscriber->id,
        ]);

        $payload = [
            'id' => 'evt_test_invoice_paid',
            'type' => 'invoice.payment_succeeded',
            'data' => [
                'object' => [
                    'id' => 'in_test_123456',
                    'customer' => 'cus_test_subscriber_123',
                    'amount_paid' => 700, // $7.00
                ],
            ],
        ];

        event(new WebhookReceived($payload));

        $this->assertDatabaseHas('affiliate_earnings', [
            'affiliate_id' => $affiliate->id,
            'affiliate_referral_id' => $referral->id,
            'amount_cents' => 140, // 20% of 700
            'kind' => AffiliateEarning::KIND_SUBSCRIPTION,
            'status' => AffiliateEarning::STATUS_AVAILABLE,
        ]);

        // Redelivery does not duplicate earnings
        event(new WebhookReceived($payload));

        $this->assertSame(1, AffiliateEarning::where('affiliate_id', $affiliate->id)->count());
    }
}
