<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Highlight extends Model
{
    protected $fillable = ['user_id', 'verse_id', 'color', 'note'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verse()
    {
        return $this->belongsTo(Verse::class);
    }
}
