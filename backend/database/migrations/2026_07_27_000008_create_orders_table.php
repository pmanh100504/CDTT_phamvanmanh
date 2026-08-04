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
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('userId', 50);
            $table->dateTime('createdAt');
            $table->string('status', 20); // pending, processing, shipping, completed, cancelled
            $table->json('shippingAddress');
            $table->string('shippingMethod', 50);
            $table->decimal('shippingFee', 10, 2);
            $table->string('paymentMethod', 50); // COD, MOMO, VNPAY, CREDIT_CARD
            $table->string('paymentStatus', 20); // unpaid, paid, refunded
            $table->string('couponCode', 50)->nullable();
            $table->decimal('discountAmount', 12, 2)->default(0.00);
            $table->integer('pointsUsed')->default(0);
            $table->integer('pointsEarned')->default(0);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('total', 12, 2);
            $table->json('timeline');

            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('couponCode')->references('code')->on('coupons')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
