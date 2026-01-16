<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bookmark extends Model
{
    protected $fillable = ['user_id', 'book_id', 'chapter_id', 'verse_id', 'note'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    public function verse()
    {
        return $this->belongsTo(Verse::class);
    }
}
