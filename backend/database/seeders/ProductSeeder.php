<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Đầm xoan lụa tay bồng Jasmine
        $damJasmine = Product::create([
            'id' => 'prod-dam-jasmine',
            'categoryId' => 'cat-dam',
            'name' => 'Đầm xoan lụa tay bồng Jasmine',
            'slug' => 'dam-xoan-lua-tay-bong-jasmine',
            'brand' => 'JM',
            'description' => 'Mẫu đầm thiết kế độc quyền từ chất liệu voan lụa tơ tằm mềm mại, bay bổng. Cổ tròn thanh lịch kết hợp với phần tay bồng nhẹ che khuyết điểm bắp tay tối đa. Sản phẩm phù hợp cho cả đi làm công sở lẫn dạo phố cuối tuần.',
            'specifications' => [
                'Chất liệu' => 'Voan lụa tơ tằm lót thun cotton mềm',
                'Kiểu dáng' => 'Dáng xòe nhẹ, tay bồng, bo chun eo',
                'Xuất xứ' => 'Việt Nam - Thiết kế độc quyền bởi JM',
                'Hướng dẫn bảo quản' => 'Giặt tay nhẹ nhàng hoặc giặt máy chế độ lụa, phơi trong bóng râm, ủi nhiệt độ thấp.',
            ],
            'images' => [
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
                'https://images.unsplash.com/photo-1548624149-f7b31602675a?w=600&q=80'
            ],
            'status' => 'active',
            'ratingAverage' => 4.9,
            'ratingCount' => 3,
            'createdAt' => now()->subDays(10),
        ]);

        ProductVariant::create([
            'sku' => 'JM-DASM-T-S',
            'productId' => $damJasmine->id,
            'attributes' => ['color' => 'Trắng', 'size' => 'S'],
            'price' => 890000.00,
            'promoPrice' => 790000.00,
            'stock' => 20,
        ]);
        ProductVariant::create([
            'sku' => 'JM-DASM-T-M',
            'productId' => $damJasmine->id,
            'attributes' => ['color' => 'Trắng', 'size' => 'M'],
            'price' => 890000.00,
            'promoPrice' => 790000.00,
            'stock' => 15,
        ]);
        ProductVariant::create([
            'sku' => 'JM-DASM-H-S',
            'productId' => $damJasmine->id,
            'attributes' => ['color' => 'Hồng', 'size' => 'S'],
            'price' => 890000.00,
            'promoPrice' => null,
            'stock' => 8,
        ]);

        // 2. Áo sơ mi lụa tơ tằm cổ chữ V
        $aoSomi = Product::create([
            'id' => 'prod-ao-somi-v',
            'categoryId' => 'cat-ao',
            'name' => 'Áo sơ mi lụa tơ tằm cổ chữ V',
            'slug' => 'ao-so-mi-lua-to-tam-co-chu-v',
            'brand' => 'JM',
            'description' => 'Chiếc áo sơ mi công sở cơ bản nhưng không kém phần sang trọng nhờ chất liệu lụa satin bóng nhẹ cao cấp. Cổ V khoét nông vừa phải thanh lịch, dễ dàng kết hợp cùng quần tây hay chân váy bút chì.',
            'specifications' => [
                'Chất liệu' => 'Lụa satin cao cấp, không nhăn',
                'Kiểu dáng' => 'Dáng suông vừa, cổ V cách điệu',
                'Xuất xứ' => 'Việt Nam - Thiết kế độc quyền bởi JM',
                'Hướng dẫn bảo quản' => 'Giặt máy nhẹ nhàng với túi giặt, tránh phơi trực tiếp dưới ánh nắng gắt.',
            ],
            'images' => [
                'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
                'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80'
            ],
            'status' => 'active',
            'ratingAverage' => 4.8,
            'ratingCount' => 2,
            'createdAt' => now()->subDays(8),
        ]);

        ProductVariant::create([
            'sku' => 'JM-ASMV-T-S',
            'productId' => $aoSomi->id,
            'attributes' => ['color' => 'White', 'size' => 'S'],
            'price' => 495000.00,
            'promoPrice' => 450000.00,
            'stock' => 30,
        ]);
        ProductVariant::create([
            'sku' => 'JM-ASMV-T-M',
            'productId' => $aoSomi->id,
            'attributes' => ['color' => 'White', 'size' => 'M'],
            'price' => 495000.00,
            'promoPrice' => 450000.00,
            'stock' => 25,
        ]);

        // 3. Quần tây công sở ống đứng tôn dáng
        $quanTay = Product::create([
            'id' => 'prod-quan-tay-dung',
            'categoryId' => 'cat-quan',
            'name' => 'Quần tây công sở ống đứng tôn dáng',
            'slug' => 'quan-tay-cong-so-ong-dung-ton-dang',
            'brand' => 'JM',
            'description' => 'Thiết kế quần tây cạp cao tôn dáng đỉnh cao, chất vải tuyết mưa dày dặn co giãn nhẹ, giữ form ly quần cực tốt. Phối đồ thanh lịch chuẩn phong cách công sở hiện đại.',
            'specifications' => [
                'Chất liệu' => 'Vải tuyết mưa cao cấp',
                'Kiểu dáng' => 'Dáng đứng cạp cao, túi chéo',
                'Xuất xứ' => 'Việt Nam - Thiết kế độc quyền bởi JM',
                'Hướng dẫn bảo quản' => 'Ủi ly quần nhiệt độ vừa, tránh giặt chung với quần áo phai màu.',
            ],
            'images' => [
                'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80'
            ],
            'status' => 'active',
            'ratingAverage' => 4.7,
            'ratingCount' => 4,
            'createdAt' => now()->subDays(12),
        ]);

        ProductVariant::create([
            'sku' => 'JM-QTD-D-M',
            'productId' => $quanTay->id,
            'attributes' => ['color' => 'Black', 'size' => 'M'],
            'price' => 550000.00,
            'promoPrice' => null,
            'stock' => 18,
        ]);
        ProductVariant::create([
            'sku' => 'JM-QTD-D-L',
            'productId' => $quanTay->id,
            'attributes' => ['color' => 'Black', 'size' => 'L'],
            'price' => 550000.00,
            'promoPrice' => null,
            'stock' => 12,
        ]);

        // 4. Chân váy xếp ly chữ A thanh lịch
        $chanVay = Product::create([
            'id' => 'prod-chan-vay-a',
            'categoryId' => 'cat-chan-vay',
            'name' => 'Chân váy xếp ly chữ A thanh lịch',
            'slug' => 'chan-vay-xep-ly-chu-a-thanh-lich',
            'brand' => 'JM',
            'description' => 'Mẫu chân váy chữ A xếp nếp tinh tế ở phần hông tạo hiệu ứng thon gọn vòng hai và che khuyết điểm vòng đùi hiệu quả. Thích hợp phối cùng áo thun ôm hoặc sơ mi lụa.',
            'specifications' => [
                'Chất liệu' => 'Kaki tuyết dày dặn, đứng dáng',
                'Kiểu dáng' => 'Dáng chữ A, xếp ly vạt xéo',
                'Xuất xứ' => 'Việt Nam - Thiết kế độc quyền bởi JM',
                'Hướng dẫn bảo quản' => 'Nên giặt khô hoặc giặt nhẹ bằng tay để giữ nếp xếp ly bền lâu.',
            ],
            'images' => [
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'
            ],
            'status' => 'active',
            'ratingAverage' => 4.8,
            'ratingCount' => 2,
            'createdAt' => now()->subDays(15),
        ]);

        ProductVariant::create([
            'sku' => 'JM-CVA-K-S',
            'productId' => $chanVay->id,
            'attributes' => ['color' => 'Yellow', 'size' => 'S'],
            'price' => 420000.00,
            'promoPrice' => 380000.00,
            'stock' => 15,
        ]);
        ProductVariant::create([
            'sku' => 'JM-CVA-K-M',
            'productId' => $chanVay->id,
            'attributes' => ['color' => 'Yellow', 'size' => 'M'],
            'price' => 420000.00,
            'promoPrice' => 380000.00,
            'stock' => 22,
        ]);

        // 5. Áo khoác Blazer dáng suông Hàn Quốc
        $blazer = Product::create([
            'id' => 'prod-ao-blazer',
            'categoryId' => 'cat-ao-khoac',
            'name' => 'Áo khoác Blazer dáng suông Hàn Quốc',
            'slug' => 'ao-khoac-blazer-dang-suong-han-quoc',
            'brand' => 'JM',
            'description' => 'Mẫu áo blazer khoác thu đông với thiết kế dáng suông hiện đại, đệm vai mỏng tinh tế tạo form đứng thanh lịch nhưng vẫn vô cùng thoải mái khi cử động.',
            'specifications' => [
                'Chất liệu' => 'Vải tuyết mưa hàn quốc 2 lớp',
                'Kiểu dáng' => 'Dáng suông 2 cúc, lót lụa',
                'Xuất xứ' => 'Việt Nam - Thiết kế độc quyền bởi JM',
                'Hướng dẫn bảo quản' => 'Giặt khô hoặc giặt tay nước mát, treo bằng móc đệm vai chuyên dụng.',
            ],
            'images' => [
                'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'
            ],
            'status' => 'active',
            'ratingAverage' => 5.0,
            'ratingCount' => 3,
            'createdAt' => now()->subDays(5),
        ]);

        ProductVariant::create([
            'sku' => 'JM-BLZ-K-S',
            'productId' => $blazer->id,
            'attributes' => ['color' => 'Gray', 'size' => 'S'],
            'price' => 1250000.00,
            'promoPrice' => 1100000.00,
            'stock' => 10,
        ]);
        ProductVariant::create([
            'sku' => 'JM-BLZ-K-M',
            'productId' => $blazer->id,
            'attributes' => ['color' => 'Gray', 'size' => 'M'],
            'price' => 1250000.00,
            'promoPrice' => 1100000.00,
            'stock' => 15,
        ]);

        // 6. Đầm suông linen tơ tằm thoáng mát
        $damLinen = Product::create([
            'id' => 'prod-dam-linen',
            'categoryId' => 'cat-tinh-khoi',
            'name' => 'Đầm suông linen tơ tằm thoáng mát',
            'slug' => 'dam-suong-linen-to-tam-thoang-mat',
            'brand' => 'JM',
            'description' => 'Thiết kế thuộc bộ sưu tập Khởi Nguồn Tinh Khôi. Sự pha trộn giữa linen tự nhiên và tơ tằm mang lại độ rủ quyến rũ, cực mát mẻ và thấm hút mồ hôi tốt. Kiểu suông rộng thong thả sang trọng.',
            'specifications' => [
                'Chất liệu' => 'Linen organic pha tơ tằm',
                'Kiểu dáng' => 'Dáng suông dài, túi ẩn hai bên',
                'Xuất xứ' => 'Việt Nam - Thiết kế độc quyền bởi JM',
                'Hướng dẫn bảo quản' => 'Giặt tay bằng sữa tắm hoặc dầu gội nhẹ, phơi phẳng nằm ngang để giữ dáng.',
            ],
            'images' => [
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80'
            ],
            'status' => 'active',
            'ratingAverage' => 4.9,
            'ratingCount' => 1,
            'createdAt' => now()->subDays(3),
        ]);

        ProductVariant::create([
            'sku' => 'JM-DLN-W-M',
            'productId' => $damLinen->id,
            'attributes' => ['color' => 'White', 'size' => 'M'],
            'price' => 950000.00,
            'promoPrice' => 855000.00,
            'stock' => 12,
        ]);
    }
}
