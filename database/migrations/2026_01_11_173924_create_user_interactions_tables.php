<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('highlights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verse_id')->constrained()->cascadeOnDelete();
            $table->string('color')->default('yellow'); // yellow, green, blue, pink
            $table->timestamps();

            $table->unique(['user_id', 'verse_id']);
        });

        Schema::create('bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chapter_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verse_id')->nullable()->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verse_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'verse_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('bookmarks');
        Schema::dropIfExists('highlights');
    }
};
