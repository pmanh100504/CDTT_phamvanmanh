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
        Schema::create('products', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('categoryId', 50);
            $table->string('name', 200);
            $table->string('slug', 200)->unique();
            $table->string('brand', 100);
            $table->text('description')->nullable();
            $table->json('specifications')->nullable();
            $table->json('images');
            $table->string('status', 20)->default('active');
            $table->decimal('ratingAverage', 3, 2)->default(5.00);
            $table->integer('ratingCount')->default(0);
            $table->dateTime('createdAt');

            $table->foreign('categoryId')->references('id')->on('categories')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
