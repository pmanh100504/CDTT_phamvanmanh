<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Banner Slider 1: KHỞI
        Banner::create([
            'id' => (string) Str::uuid(),
            'title' => 'KHỞI',
            'desktopImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260702_rTmJZIHi.jpg?v=1782983261',
            'mobileImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260702_wDR7tEVj.jpg?v=1782983360',
            'position' => 'HOME_SLIDER',
            'targetUrl' => '/shop?categoryId=cat-tinh-khoi',
            'startDate' => now()->subDays(5),
            'endDate' => now()->addDays(30),
            'status' => 'active',
            'impressions' => 4500,
            'clicks' => 840,
            'sortOrder' => 1,
        ]);

        // 2. Banner Slider 2: Ý NIỆM NGỌT NGÀO
        Banner::create([
            'id' => (string) Str::uuid(),
            'title' => 'Ý NIỆM NGỌT NGÀO',
            'desktopImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260618_47fWpvsE.jpg?v=1781778706',
            'mobileImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260618_MEkjNsMt.jpg?v=1781778923',
            'position' => 'HOME_SLIDER',
            'targetUrl' => '/shop?categoryId=cat-bst-moi',
            'startDate' => now()->subDays(4),
            'endDate' => now()->addDays(20),
            'status' => 'active',
            'impressions' => 3800,
            'clicks' => 610,
            'sortOrder' => 2,
        ]);

        // 3. Banner Slider 3: JASMINE BLOOMING
        Banner::create([
            'id' => (string) Str::uuid(),
            'title' => 'JASMINE BLOOMING',
            'desktopImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260604_mNtdARlT.jpg?v=1780558441',
            'mobileImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260604_JO6qAT3o.jpg?v=1780558441',
            'position' => 'HOME_SLIDER',
            'targetUrl' => '/shop?categoryId=cat-dam',
            'startDate' => now()->subDays(3),
            'endDate' => now()->addDays(15),
            'status' => 'active',
            'impressions' => 3100,
            'clicks' => 490,
            'sortOrder' => 3,
        ]);

        // 4. Banner Slider 4: HÀNH TRÌNH TIẾP NỐI
        Banner::create([
            'id' => (string) Str::uuid(),
            'title' => 'HÀNH TRÌNH TIẾP NỐI',
            'desktopImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260506_gEIrxOM6.jpg?v=1778054956',
            'mobileImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260506_B5h2lh0F.jpg?v=1778059179',
            'position' => 'HOME_SLIDER',
            'targetUrl' => '/shop?categoryId=cat-lookbook',
            'startDate' => now()->subDays(2),
            'endDate' => now()->addDays(25),
            'status' => 'active',
            'impressions' => 2800,
            'clicks' => 420,
            'sortOrder' => 4,
        ]);

        // 5. Banner Slider 5: KHOẢNH KHẮC THẢNH THƠI
        Banner::create([
            'id' => (string) Str::uuid(),
            'title' => 'KHOẢNH KHẮC THẢNH THƠI',
            'desktopImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260420_ByalOZ9u.jpg?v=1776670403',
            'mobileImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260420_d76EhFpx.jpg?v=1776670378',
            'position' => 'HOME_SLIDER',
            'targetUrl' => '/shop?categoryId=cat-ao-khoac',
            'startDate' => now()->subDays(1),
            'endDate' => now()->addDays(12),
            'status' => 'active',
            'impressions' => 2200,
            'clicks' => 310,
            'sortOrder' => 5,
        ]);

        // 6. Banner Slider 6: CHUYỆN NHẸ TÊNH
        Banner::create([
            'id' => (string) Str::uuid(),
            'title' => 'CHUYỆN NHẸ TÊNH',
            'desktopImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260420_OWBfnqcc.jpg?v=1776670233',
            'mobileImage' => 'https://pos.nvncdn.com/790194-223281/bn/20260420_MbfeH35i.jpg?v=1776670288',
            'position' => 'HOME_SLIDER',
            'targetUrl' => '/shop?categoryId=cat-quan',
            'startDate' => now()->subDays(1),
            'endDate' => now()->addDays(10),
            'status' => 'active',
            'impressions' => 1900,
            'clicks' => 250,
            'sortOrder' => 6,
        ]);
    }
}
