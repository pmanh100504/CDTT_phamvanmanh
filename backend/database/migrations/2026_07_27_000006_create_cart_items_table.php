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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('userId', 50);
            $table->string('productId', 50);
            $table->string('sku', 50);
            $table->integer('quantity');
            $table->dateTime('addedAt');

            $table->foreign('userId')->references('userId')->on('carts')->onDelete('cascade');
            $table->foreign('productId')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('sku')->references('sku')->on('product_variants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
