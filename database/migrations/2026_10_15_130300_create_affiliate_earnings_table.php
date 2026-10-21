<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliate_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained('affiliates')->cascadeOnDelete();
            $table->foreignId('affiliate_referral_id')->nullable()->constrained('affiliate_referrals')->nullOnDelete();
            // money as integer cents, always
            $table->integer('amount_cents');
            $table->string('currency', 3)->default('usd');
            // subscription_commission | manual_adjustment
            $table->string('kind', 32)->default('subscription_commission');
            // pending = recorded but not yet payable (future: payment webhooks);
            // available = owed; paid = covered by a payout
            $table->string('status', 16)->default('available');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['affiliate_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_earnings');
    }
};
