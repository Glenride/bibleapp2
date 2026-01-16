<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Book;

class BibleVersion extends Model
{
    use HasFactory;
    
    //
    protected $guarded = [];

    public function books()
    {
        return $this->hasMany(Book::class);
    }
}
