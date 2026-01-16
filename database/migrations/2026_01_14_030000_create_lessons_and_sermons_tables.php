<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sermons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('share_token', 64)->unique()->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('share_token');
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sermon_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->json('source_verses')->nullable();
            $table->json('source_highlights')->nullable();
            $table->json('source_favorites')->nullable();
            $table->string('theme')->nullable();
            $table->integer('position')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['sermon_id', 'position']);
        });

        Schema::create('sermon_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sermon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shared_with_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('shared_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['sermon_id', 'shared_with_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sermon_shares');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('sermons');
    }
};
