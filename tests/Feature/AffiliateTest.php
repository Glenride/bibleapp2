<?php

use App\Models\Affiliate;
use App\Models\AffiliateReferral;
use App\Models\User;
use App\Services\AffiliateService;

function makeAffiliateUser(array $attrs = []): User
{
    return User::factory()->create($attrs);
}

function makeAffiliate(User $user, array $attrs = []): Affiliate
{
    return app(AffiliateService::class)->makeAffiliate($user, $attrs);
}

test('referral link records a click, sets the cookie, and redirects to register', function () {
    $affiliate = makeAffiliate(makeAffiliateUser());

    $response = $this->get('/r/'.$affiliate->code);

    $response->assertRedirect('/register');
    $this->assertDatabaseHas('affiliate_clicks', ['affiliate_id' => $affiliate->id]);
    $response->assertCookie(config('affiliates.cookie_name'), $affiliate->code);
});

test('referral link 404s for unknown codes', function () {
    $this->get('/r/NOPE1234')->assertNotFound();
});

test('referral link 404s for suspended affiliates', function () {
    $affiliate = makeAffiliate(makeAffiliateUser());
    $affiliate->update(['status' => Affiliate::STATUS_SUSPENDED]);

    $this->get('/r/'.$affiliate->code)->assertNotFound();
});

test('signup with a referral cookie creates a referral', function () {
    $affiliate = makeAffiliate(makeAffiliateUser());

    $response = $this
        ->withCookie(config('affiliates.cookie_name'), $affiliate->code)
        ->post(route('register.store'), [
            'name' => 'Referred User',
            'email' => 'referred@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', 'referred@example.com')->firstOrFail();
    $this->assertDatabaseHas('affiliate_referrals', [
        'affiliate_id' => $affiliate->id,
        'referred_user_id' => $user->id,
    ]);
});

test('signup without a referral cookie creates no referral', function () {
    $this->post(route('register.store'), [
        'name' => 'Organic User',
        'email' => 'organic@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    expect(AffiliateReferral::count())->toBe(0);
});

test('self-referral is ignored by the attribution service', function () {
    $user = makeAffiliateUser();
    $affiliate = makeAffiliate($user);

    $result = app(AffiliateService::class)->attributeSignup($user, $affiliate->code);

    expect($result)->toBeNull();
    expect(AffiliateReferral::count())->toBe(0);
});

test('a referred user is only ever attributed once', function () {
    $a = makeAffiliate(makeAffiliateUser());
    $b = makeAffiliate(makeAffiliateUser());
    $user = makeAffiliateUser();

    app(AffiliateService::class)->attributeSignup($user, $a->code);
    $second = app(AffiliateService::class)->attributeSignup($user, $b->code);

    expect($second)->toBeNull();
    expect(AffiliateReferral::where('referred_user_id', $user->id)->count())->toBe(1);
});

test('commission math uses the config default and per-affiliate overrides', function () {
    $service = app(AffiliateService::class);
    $a = makeAffiliate(makeAffiliateUser());
    $b = makeAffiliate(makeAffiliateUser(), ['commission_rate' => 0.50]);

    $e1 = $service->recordSubscriptionCommission($a, 700, 'test');   // 20% of $7
    $e2 = $service->recordSubscriptionCommission($b, 700, 'test');   // 50% override

    expect($e1->amount_cents)->toBe(140);
    expect($e2->amount_cents)->toBe(350);
});

test('owed amount reflects available earnings minus recorded payouts', function () {
    $service = app(AffiliateService::class);
    $owner = makeAffiliateUser();
    $affiliate = makeAffiliate(makeAffiliateUser());

    $service->recordSubscriptionCommission($affiliate, 2700, 'test'); // 20% of $27 = 540
    $service->recordManualAdjustment($affiliate, 460, 'bonus');        // +460
    expect($service->owedAmount($affiliate))->toBe(1000);

    $service->recordPayout($affiliate, 1000, 'cashapp', 'ref1', null, $owner->id);
    expect($service->owedAmount($affiliate))->toBe(0);
});

test('non-admins cannot reach the affiliate admin area', function () {
    $user = makeAffiliateUser();
    $this->actingAs($user);

    $this->get('/admin/affiliates')->assertForbidden();
    $this->post('/admin/affiliates/invite', ['email' => 'x@example.com'])->assertForbidden();
});

test('admins can invite a creator by email', function () {
    $admin = makeAffiliateUser();
    $admin->forceFill(['is_admin' => true])->save();
    $creator = makeAffiliateUser(['email' => 'creator@example.com']);
    $this->actingAs($admin);

    $response = $this->post('/admin/affiliates/invite', ['email' => 'creator@example.com']);

    $response->assertRedirect();
    $this->assertDatabaseHas('affiliates', ['user_id' => $creator->id]);
});

test('invite fails cleanly when the email has no account', function () {
    $admin = makeAffiliateUser();
    $admin->forceFill(['is_admin' => true])->save();
    $this->actingAs($admin);

    $response = $this->post('/admin/affiliates/invite', ['email' => 'ghost@example.com']);

    $response->assertSessionHasErrors('email');
    expect(Affiliate::count())->toBe(0);
});

test('creator dashboard is scoped to the logged-in affiliate only', function () {
    $affiliate = makeAffiliate(makeAffiliateUser());
    $stranger = makeAffiliateUser();

    $this->actingAs($stranger)->get('/affiliate')->assertForbidden();
    $this->actingAs($affiliate->user)->get('/affiliate')->assertOk();
});
