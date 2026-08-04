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
        Schema::create('reviews', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('productId', 50);
            $table->string('userId', 50);
            $table->string('userName', 100);
            $table->string('userAvatar', 255)->nullable();
            $table->integer('rating');
            $table->text('comment')->nullable();
            $table->json('images')->nullable();
            $table->dateTime('createdAt');

            $table->foreign('productId')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
