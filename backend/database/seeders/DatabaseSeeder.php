<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class, // handles both products and variants
            CouponSeeder::class,
            BannerSeeder::class,
            ReviewSeeder::class,
            OrderSeeder::class,    // handles both orders and order items
        ]);
    }
}
