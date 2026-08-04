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
        Schema::create('order_items', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('orderId', 50);
            $table->string('productId', 50);
            $table->string('productName', 200);
            $table->string('sku', 50);
            $table->string('variantName', 100);
            $table->decimal('price', 12, 2);
            $table->integer('quantity');
            $table->string('image', 255);

            $table->foreign('orderId')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('productId')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('sku')->references('sku')->on('product_variants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
