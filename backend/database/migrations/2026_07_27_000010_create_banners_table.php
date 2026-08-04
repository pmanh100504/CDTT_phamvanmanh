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
        Schema::create('banners', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('title', 150);
            $table->string('desktopImage', 255);
            $table->string('mobileImage', 255);
            $table->string('position', 50); // HOME_SLIDER, SIDEBAR, POPUP
            $table->string('targetUrl', 255);
            $table->dateTime('startDate');
            $table->dateTime('endDate');
            $table->string('status', 20)->default('active');
            $table->integer('impressions')->default(0);
            $table->integer('clicks')->default(0);
            $table->integer('sortOrder')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
