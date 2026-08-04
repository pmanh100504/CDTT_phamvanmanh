<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Percentage discount: 10% off, max 200,000đ, min order 500,000đ
        Coupon::create([
            'code' => 'VOUCHER50',
            'type' => 'fixed',
            'value' => 50000.00,
            'minOrderValue' => 300000.00,
            'maxDiscount' => 50000.00,
            'maxUses' => 500,
            'usedCount' => 45,
            'startDate' => now()->subDays(5),
            'endDate' => now()->addDays(30),
            'status' => 'active',
        ]);

        // 2. Fixed discount: 100,000đ off, min order 1,000,000đ
        Coupon::create([
            'code' => 'WELCOME100K',
            'type' => 'fixed',
            'value' => 100000.00,
            'minOrderValue' => 1000000.00,
            'maxDiscount' => 100000.00,
            'maxUses' => 500,
            'usedCount' => 120,
            'startDate' => now()->subDays(10),
            'endDate' => now()->addDays(60),
            'status' => 'active',
        ]);

        // 3. Freeship coupon: freeship up to 50,000đ, min order 100,000đ
        Coupon::create([
            'code' => 'FREESHIP',
            'type' => 'freeship',
            'value' => 50000.00,
            'minOrderValue' => 100000.00,
            'maxDiscount' => 50000.00,
            'maxUses' => 1000,
            'usedCount' => 340,
            'startDate' => now()->subDays(15),
            'endDate' => now()->addDays(15),
            'status' => 'active',
        ]);

        // 4. Expired coupon (for testing expired status)
        Coupon::create([
            'code' => 'EXPIRED50',
            'type' => 'percentage',
            'value' => 50.00,
            'minOrderValue' => 100000.00,
            'maxDiscount' => 50000.00,
            'maxUses' => 50,
            'usedCount' => 50,
            'startDate' => now()->subDays(30),
            'endDate' => now()->subDays(1),
            'status' => 'inactive',
        ]);
    }
}
