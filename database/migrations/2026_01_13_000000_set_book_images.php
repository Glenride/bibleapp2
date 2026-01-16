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
            '1 Samuel' => '/images/books/samuel1.jpg',
            '2 Samuel' => '/images/books/samuel2.jpg',
            'Ruth' => '/images/books/ruth.jpg',
            '1 Kings' => '/images/books/kings1.jpg',
            '2 Kings' => '/images/books/kings2.jpg',
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
            '1 Samuel',
            '2 Samuel',
            'Ruth',
            '1 Kings',
            '2 Kings',
        ];

        DB::table('books')
            ->whereIn('name', $names)
            ->update(['image' => null]);
    }
};
