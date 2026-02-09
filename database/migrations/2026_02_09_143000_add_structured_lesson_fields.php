<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('big_takeaway')->nullable()->after('content');
            $table->json('movements')->nullable()->after('big_takeaway');
            $table->json('reflection_questions')->nullable()->after('movements');
            $table->text('prayer')->nullable()->after('reflection_questions');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['big_takeaway', 'movements', 'reflection_questions', 'prayer']);
        });
    }
};
