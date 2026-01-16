<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sermon extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'share_token',
        'is_public',
        'detected_theme',
        'analysis',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Sermon $sermon) {
            if (!$sermon->share_token) {
                $sermon->share_token = Str::random(64);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('position');
    }

    public function sharedWith()
    {
        return $this->belongsToMany(User::class, 'sermon_shares', 'sermon_id', 'shared_with_user_id')
            ->withPivot('shared_by_user_id')
            ->withTimestamps();
    }

    public function getShareUrlAttribute(): string
    {
        return route('sermons.shared', $this->share_token);
    }
}
