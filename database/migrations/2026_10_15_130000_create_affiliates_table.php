<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('code', 32)->unique();
            // invited = created by admin, not yet active; active = earning; suspended = links dead
            $table->string('status', 16)->default('invited');
            // null = use config('affiliates.commission_rate')
            $table->decimal('commission_rate', 5, 4)->nullable();
            // free text: how the creator wants to be paid (Cash App tag, Zelle email, ...)
            $table->text('payout_details')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliates');
    }
};
