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
        Schema::table('books', function (Blueprint $table) {
            $table->index('abbreviation');
            $table->index('position');
            $table->unique(['bible_version_id', 'abbreviation']);
        });

        Schema::table('chapters', function (Blueprint $table) {
            $table->unique(['book_id', 'number']);
        });

        Schema::table('verses', function (Blueprint $table) {
            $table->index(['chapter_id', 'number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropIndex(['abbreviation']);
            $table->dropIndex(['position']);
            $table->dropUnique(['bible_version_id', 'abbreviation']);
        });

        Schema::table('chapters', function (Blueprint $table) {
            $table->dropUnique(['book_id', 'number']);
        });

        Schema::table('verses', function (Blueprint $table) {
            $table->dropIndex(['chapter_id', 'number']);
        });
    }
};
