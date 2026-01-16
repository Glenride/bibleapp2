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
        Schema::table('highlights', function (Blueprint $table) {
            $table->text('note')->nullable();
        });

        Schema::table('bookmarks', function (Blueprint $table) {
            $table->text('note')->nullable();
        });

        Schema::table('favorites', function (Blueprint $table) {
            $table->text('note')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('highlights', function (Blueprint $table) {
            $table->dropColumn('note');
        });

        Schema::table('bookmarks', function (Blueprint $table) {
            $table->dropColumn('note');
        });

        Schema::table('favorites', function (Blueprint $table) {
            $table->dropColumn('note');
        });
    }
};
