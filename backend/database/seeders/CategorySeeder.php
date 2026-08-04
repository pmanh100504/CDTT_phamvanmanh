<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Khởi nguồn tinh khôi
        $tinhKhoi = Category::create([
            'id' => 'cat-tinh-khoi',
            'name' => 'KHỞI NGUỒN TINH KHÔI',
            'slug' => 'khoi-nguon-tinh-khoi',
            'parentId' => null,
            'description' => 'Bộ sưu tập Khởi Nguồn Tinh Khôi với thiết kế thanh lịch, tinh tế từ chất liệu cao cấp.',
        ]);

        Category::create([
            'id' => 'cat-sale-tinh-khoi',
            'name' => 'Sale upto 70%',
            'slug' => 'sale-upto-70',
            'parentId' => $tinhKhoi->id,
            'description' => 'Ưu đãi cực lớn lên đến 70% cho các sản phẩm trong bộ sưu tập Khởi Nguồn Tinh Khôi.',
        ]);

        // 2. Đầm
        Category::create([
            'id' => 'cat-dam',
            'name' => 'Đầm',
            'slug' => 'dam',
            'parentId' => null,
            'description' => 'Các mẫu đầm công sở, đầm dạo phố, đầm tiệc sang trọng và tôn dáng.',
        ]);

        // 3. Áo
        Category::create([
            'id' => 'cat-ao',
            'name' => 'ÁO',
            'slug' => 'ao',
            'parentId' => null,
            'description' => 'Sơ mi thiết kế, áo kiểu điệu đà, áo blazer chất liệu cao cấp.',
        ]);

        // 4. Quần
        Category::create([
            'id' => 'cat-quan',
            'name' => 'QUẦN',
            'slug' => 'quan',
            'parentId' => null,
            'description' => 'Quần tây công sở, quần culottes, quần short tôn dáng và thoải mái.',
        ]);

        // 5. Chân Váy
        Category::create([
            'id' => 'cat-chan-vay',
            'name' => 'CHÂN VÁY',
            'slug' => 'chan-vay',
            'parentId' => null,
            'description' => 'Chân váy chữ A, chân váy bút chì, chân váy xếp ly điệu đà.',
        ]);

        // 6. Áo Khoác
        Category::create([
            'id' => 'cat-ao-khoac',
            'name' => 'ÁO KHOÁC',
            'slug' => 'ao-khoac',
            'parentId' => null,
            'description' => 'Áo khoác dạ, áo vest, blazer thanh lịch.',
        ]);

        // 7. Lookbook
        Category::create([
            'id' => 'cat-lookbook',
            'name' => 'LOOKBOOK',
            'slug' => 'lookbook',
            'parentId' => null,
            'description' => 'Lookbook cảm hứng thời trang công sở thiết kế JM.',
        ]);

        // 8. BST Mới
        Category::create([
            'id' => 'cat-bst-moi',
            'name' => 'BST MỚI',
            'slug' => 'bst-moi',
            'parentId' => null,
            'description' => 'Các thiết kế mới nhất của thương hiệu thời trang JM.',
        ]);

        // Extra categories from category grid
        Category::create([
            'id' => 'cat-sale',
            'name' => 'SALE',
            'slug' => 'sale',
            'parentId' => null,
            'description' => 'Các sản phẩm giảm giá cực hấp dẫn.',
        ]);

        Category::create([
            'id' => 'cat-phu-kien',
            'name' => 'Phụ Kiện',
            'slug' => 'phu-kien',
            'parentId' => null,
            'description' => 'Túi xách, thắt lưng, phụ kiện thời trang tinh tế.',
        ]);
    }
}
