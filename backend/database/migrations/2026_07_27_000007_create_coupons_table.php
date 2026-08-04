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
        Schema::create('coupons', function (Blueprint $table) {
            $table->string('code', 50)->primary();
            $table->string('type', 20); // percentage, fixed, freeship
            $table->decimal('value', 12, 2);
            $table->decimal('minOrderValue', 12, 2)->default(0.00);
            $table->decimal('maxDiscount', 12, 2)->nullable();
            $table->integer('maxUses')->default(100);
            $table->integer('usedCount')->default(0);
            $table->dateTime('startDate');
            $table->dateTime('endDate');
            $table->string('status', 20)->default('active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
