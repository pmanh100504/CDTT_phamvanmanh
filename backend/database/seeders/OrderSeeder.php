<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $c1 = User::where('email', 'customer1@example.com')->first();
        $c2 = User::where('email', 'customer2@example.com')->first();
        $c3 = User::where('email', 'customer3@example.com')->first();
        $c4 = User::where('email', 'customer4@example.com')->first();

        $damJasmine = Product::find('prod-dam-jasmine');
        $aoSomi = Product::find('prod-ao-somi-v');
        $quanTay = Product::find('prod-quan-tay-dung');

        $vDamJ = ProductVariant::where('productId', 'prod-dam-jasmine')->first();
        $vAo = ProductVariant::where('productId', 'prod-ao-somi-v')->first();
        $vQuan = ProductVariant::where('productId', 'prod-quan-tay-dung')->first();

        // Order 1: Completed order for Customer 1
        if ($c1 && $damJasmine && $aoSomi && $vDamJ && $vAo) {
            $shippingAddress = $c1->addressBook[0];
            $orderId = 'HD' . date('ymd', strtotime('-12 days')) . '0001';

            $order = Order::create([
                'id' => $orderId,
                'userId' => $c1->id,
                'createdAt' => now()->subDays(12),
                'status' => 'completed',
                'shippingAddress' => $shippingAddress,
                'shippingMethod' => 'Standard',
                'shippingFee' => 30000.00,
                'paymentMethod' => 'VNPAY',
                'paymentStatus' => 'paid',
                'couponCode' => 'VOUCHER50',
                'pointsUsed' => 0,
                'subtotal' => $vDamJ->price + $vAo->price,
                'discountAmount' => 50000.00,
                'total' => $vDamJ->price + $vAo->price - 50000.00 + 30000.00,
                'pointsEarned' => 12,
                'timeline' => [
                    ['time' => date('d-m-Y H:i', strtotime('-12 days')), 'note' => 'Đơn hàng được đặt thành công.'],
                    ['time' => date('d-m-Y H:i', strtotime('-12 days + 2 hours')), 'note' => 'Đã xác nhận thanh toán qua VNPAY.'],
                    ['time' => date('d-m-Y H:i', strtotime('-11 days')), 'note' => 'Đơn hàng đã đóng gói xong và bàn giao cho đối tác vận chuyển.'],
                    ['time' => date('d-m-Y H:i', strtotime('-10 days')), 'note' => 'Đang giao hàng.'],
                    ['time' => date('d-m-Y H:i', strtotime('-9 days')), 'note' => 'Đã giao hàng thành công.'],
                ],
            ]);

            OrderItem::create([
                'id' => (string) Str::uuid(),
                'orderId' => $order->id,
                'productId' => $damJasmine->id,
                'productName' => $damJasmine->name,
                'sku' => $vDamJ->sku,
                'variantName' => 'Trắng / S',
                'image' => $damJasmine->images[0],
                'price' => $vDamJ->price,
                'quantity' => 1,
            ]);

            OrderItem::create([
                'id' => (string) Str::uuid(),
                'orderId' => $order->id,
                'productId' => $aoSomi->id,
                'productName' => $aoSomi->name,
                'sku' => $vAo->sku,
                'variantName' => 'White / S',
                'image' => $aoSomi->images[0],
                'price' => $vAo->price,
                'quantity' => 1,
            ]);
        }

        // Order 2: Pending order for Customer 2
        if ($c2 && $quanTay && $vQuan) {
            $shippingAddress = $c2->addressBook[0];
            $orderId = 'HD' . date('ymd', strtotime('-1 days')) . '0002';

            $order = Order::create([
                'id' => $orderId,
                'userId' => $c2->id,
                'createdAt' => now()->subDays(1),
                'status' => 'pending',
                'shippingAddress' => $shippingAddress,
                'shippingMethod' => 'Standard',
                'shippingFee' => 30000.00,
                'paymentMethod' => 'COD',
                'paymentStatus' => 'unpaid',
                'couponCode' => null,
                'pointsUsed' => 10, // used 10 points
                'subtotal' => $vQuan->price,
                'discountAmount' => 10000.00, // 10k off
                'total' => $vQuan->price - 10000.00 + 30000.00,
                'pointsEarned' => 5,
                'timeline' => [
                    ['time' => date('d-m-Y H:i', strtotime('-1 days')), 'note' => 'Đơn hàng được đặt thành công và đang chờ xét duyệt.'],
                ],
            ]);

            OrderItem::create([
                'id' => (string) Str::uuid(),
                'orderId' => $order->id,
                'productId' => $quanTay->id,
                'productName' => $quanTay->name,
                'sku' => $vQuan->sku,
                'variantName' => 'Black / M',
                'image' => $quanTay->images[0],
                'price' => $vQuan->price,
                'quantity' => 1,
            ]);
        }
    }
}
