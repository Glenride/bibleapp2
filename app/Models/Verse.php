<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Chapter;

class Verse extends Model
{
    use HasFactory;

    //
    protected $guarded = [];

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    public function highlights()
    {
        return $this->hasMany(Highlight::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }
}
