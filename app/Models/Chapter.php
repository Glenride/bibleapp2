<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Book;
use App\Models\Verse;

class Chapter extends Model
{
    use HasFactory;

    //
    protected $guarded = [];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function verses()
    {
        return $this->hasMany(Verse::class);
    }
}
