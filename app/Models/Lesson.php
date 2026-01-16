<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = [
        'user_id',
        'sermon_id',
        'title',
        'content',
        'source_verses',
        'source_highlights',
        'source_favorites',
        'theme',
        'position',
    ];

    protected $casts = [
        'source_verses' => 'array',
        'source_highlights' => 'array',
        'source_favorites' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sermon()
    {
        return $this->belongsTo(Sermon::class);
    }
}
