<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $damJasmine = Product::find('prod-dam-jasmine');
        $aoSomi = Product::find('prod-ao-somi-v');
        $quanTay = Product::find('prod-quan-tay-dung');
        $blazer = Product::find('prod-ao-blazer');

        $c1 = User::where('email', 'customer1@example.com')->first();
        $c2 = User::where('email', 'customer2@example.com')->first();
        $c3 = User::where('email', 'customer3@example.com')->first();
        $c4 = User::where('email', 'customer4@example.com')->first();

        // Dam Jasmine Reviews
        if ($damJasmine) {
            if ($c1) {
                Review::create([
                    'id' => (string) Str::uuid(),
                    'productId' => $damJasmine->id,
                    'userId' => $c1->id,
                    'userName' => $c1->fullName,
                    'userAvatar' => $c1->avatar,
                    'rating' => 5,
                    'comment' => 'Váy mặc siêu xinh và mát mẻ luôn ạ! Chất voan lụa mềm mượt, tay bồng mặc lên giấu bắp tay rất khéo. Đóng gói hộp giấy JM cực kỳ xịn sò sang chảnh.',
                    'images' => [
                        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300'
                    ],
                    'createdAt' => now()->subDays(5),
                ]);
            }
            if ($c2) {
                Review::create([
                    'id' => (string) Str::uuid(),
                    'productId' => $damJasmine->id,
                    'userId' => $c2->id,
                    'userName' => $c2->fullName,
                    'userAvatar' => $c2->avatar,
                    'rating' => 4,
                    'comment' => 'Vải đẹp, mặc nhẹ, form dáng chuẩn công sở thiết kế. Tuy nhiên eo bo hơi ôm một chút so với bảng size chuẩn, ai muốn mặc thoải mái thì nên chọn tăng 1 size.',
                    'images' => null,
                    'createdAt' => now()->subDays(4),
                ]);
            }
        }

        // Ao Somi Reviews
        if ($aoSomi) {
            if ($c3) {
                Review::create([
                    'id' => (string) Str::uuid(),
                    'productId' => $aoSomi->id,
                    'userId' => $c3->id,
                    'userName' => $c3->fullName,
                    'userAvatar' => $c3->avatar,
                    'rating' => 5,
                    'comment' => 'Sơ mi chất lụa satin mặc rất mát và không bị nhăn sau khi giặt. Cổ V khoét nông vừa phải, mặc đi làm thanh lịch tuyệt đối. Rất ưng ý!',
                    'images' => null,
                    'createdAt' => now()->subDays(3),
                ]);
            }
        }

        // Quan Tay Reviews
        if ($quanTay) {
            if ($c4) {
                Review::create([
                    'id' => (string) Str::uuid(),
                    'productId' => $quanTay->id,
                    'userId' => $c4->id,
                    'userName' => $c4->fullName,
                    'userAvatar' => $c4->avatar,
                    'rating' => 5,
                    'comment' => 'Dáng quần đứng mặc lên hack chân dài dã man. Vải tuyết mưa dày dặn nhưng co giãn nhẹ nên ngồi làm việc cả ngày thoải mái vô cùng. Đường chỉ may kỹ lưỡng.',
                    'images' => null,
                    'createdAt' => now()->subDays(6),
                ]);
            }
        }

        // Blazer Reviews
        if ($blazer) {
            if ($c1) {
                Review::create([
                    'id' => (string) Str::uuid(),
                    'productId' => $blazer->id,
                    'userId' => $c1->id,
                    'userName' => $c1->fullName,
                    'userAvatar' => $c1->avatar,
                    'rating' => 5,
                    'comment' => 'Form áo blazer dáng suông Hàn Quốc khoác thu đông siêu chất lượng. Vải dày dặn 2 lớp ấm áp, mặc khoác hờ hay cài cúc đều đẹp ngất ngây.',
                    'images' => [
                        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300'
                    ],
                    'createdAt' => now()->subDays(2),
                ]);
            }
        }
    }
}
