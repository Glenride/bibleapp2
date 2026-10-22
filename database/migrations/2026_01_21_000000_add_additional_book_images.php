<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $images = [
            'Genesis' => '/images/books/genesis.jpg',
            'Exodus' => '/images/books/exodus.jpg',
            'Leviticus' => '/images/books/leviticus.jpg',
            'Numbers' => '/images/books/numbers.jpg',
            'Deuteronomy' => '/images/books/deuteronomy.jpg',
            'Joshua' => '/images/books/joshua.jpg',
            'Judges' => '/images/books/judges.jpg',
            '1 Chronicles' => '/images/books/1 chronicles.jpg',
            '2 Chronicles' => '/images/books/2 chronicles.jpg',
            'Ezra' => '/images/books/Ezra.jpg',
            'Nehemiah' => '/images/books/Nehemiah.jpg',
            'Esther' => '/images/books/Esther.jpg',
            'Job' => '/images/books/Job.jpg',
        ];

        foreach ($images as $name => $path) {
            DB::table('books')
                ->where('name', $name)
                ->update(['image' => $path]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $names = [
            'Genesis',
            'Exodus',
            'Leviticus',
            'Numbers',
            'Deuteronomy',
            'Joshua',
            'Judges',
            '1 Chronicles',
            '2 Chronicles',
            'Ezra',
            'Nehemiah',
            'Esther',
            'Job',
        ];

        DB::table('books')
            ->whereIn('name', $names)
            ->update(['image' => null]);
    }
};
