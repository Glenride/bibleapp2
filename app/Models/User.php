<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, Billable;

    public const TRIAL_PLAN_PRICE_ID = 'price_1SqIvELenlwJrzcOf7LO0U6T';
    public const PRO_PLAN_PRICE_ID = 'price_1SqIgxLenlwJrzcOw7OEiD4n';
    public const BASIC_PLAN_PRICE_ID = 'price_1SqIgMLenlwJrzcOoUWAw2qf';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'is_beta_tester',
        'beta_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_admin' => 'boolean',
            'is_beta_tester' => 'boolean',
            'beta_expires_at' => 'datetime',
        ];
    }

    /**
     * Check if user is super admin (hardcoded email).
     */
    public function isSuperAdmin(): bool
    {
        return $this->email === 'dvaughnhouse@gmail.com';
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->is_admin || $this->isSuperAdmin();
    }

    /**
     * Check if user is an active beta tester.
     */
    public function isBetaTester(): bool
    {
        if (!$this->is_beta_tester) {
            return false;
        }

        // If no expiration set, beta access is permanent
        if (!$this->beta_expires_at) {
            return true;
        }

        // Check if beta access has expired
        return $this->beta_expires_at->isFuture();
    }

    public function currentPlan(): string
    {
        $subscription = $this->subscription('default');

        if (!$subscription || !$subscription->valid()) {
            return 'none';
        }

        if ($subscription->hasPrice(self::TRIAL_PLAN_PRICE_ID)) {
            return 'trial';
        }

        if ($subscription->hasPrice(self::PRO_PLAN_PRICE_ID)) {
            return 'pro';
        }

        if ($subscription->hasPrice(self::BASIC_PLAN_PRICE_ID)) {
            return 'basic';
        }

        return 'none';
    }

    public function hasProAccess(): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        // Beta testers get full pro access
        if ($this->isBetaTester()) {
            return true;
        }

        $plan = $this->currentPlan();

        return $plan === 'pro' || $plan === 'trial';
    }

    public function highlights()
    {
        return $this->hasMany(Highlight::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function sermons()
    {
        return $this->hasMany(Sermon::class);
    }

    public function sharedSermons()
    {
        return $this->belongsToMany(Sermon::class, 'sermon_shares', 'shared_with_user_id', 'sermon_id')
            ->withPivot('shared_by_user_id')
            ->withTimestamps();
    }
}
