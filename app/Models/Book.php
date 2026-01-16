<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\BibleVersion;
use App\Models\Chapter;

class Book extends Model
{
    use HasFactory;

    //
    protected $guarded = [];

    public function bibleVersion()
    {
        return $this->belongsTo(BibleVersion::class);
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class);
    }
}
