<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Coupon;
use App\Models\CartItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Get Admin Orders List (Admin)
     */
    public function getAdminOrders(Request $request)
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $query = Order::with(['items', 'user']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('shippingAddress', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('fullName', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->orderBy('createdAt', 'desc')->get();
        return response()->json($orders);
    }

    /**
     * Get Admin Order Details (Admin)
     */
    public function getAdminOrderDetails($id)
    {
        $order = Order::with(['items', 'user'])->find($id);
        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng.'], 404);
        }
        return response()->json($order);
    }

    /**
     * Update Order Status & Timeline (Admin)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'required|string|in:pending,processing,shipping,completed,cancelled',
            'note' => 'nullable|string'
        ]);

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng.'], 404);
        }

        DB::beginTransaction();
        try {
            $oldStatus = $order->status;
            $newStatus = $data['status'];

            $order->status = $newStatus;

            // Handle payment status adjustments
            if ($newStatus === 'completed') {
                $order->paymentStatus = 'paid';
            } elseif ($newStatus === 'cancelled' && $order->paymentStatus === 'paid') {
                $order->paymentStatus = 'refunded';
            }

            // Append to timeline
            $timeline = $order->timeline ?? [];
            $note = $data['note'] ?? '';
            if (empty($note)) {
                switch ($newStatus) {
                    case 'processing':
                        $note = 'Đã duyệt đơn hàng và bắt đầu đóng gói';
                        break;
                    case 'shipping':
                        $note = 'Đã bàn giao cho đơn vị vận chuyển';
                        break;
                    case 'completed':
                        $note = 'Đơn hàng được giao thành công';
                        break;
                    case 'cancelled':
                        $note = 'Đơn hàng đã bị hủy';
                        break;
                }
            }

            $timeline[] = [
                'status' => $newStatus,
                'time' => now()->toDateTimeString(),
                'note' => $note
            ];
            $order->timeline = $timeline;

            $order->save();

            // Handle points logic for customer
            if ($newStatus === 'completed' && $oldStatus !== 'completed') {
                $user = User::find($order->userId);
                if ($user) {
                    // Earn points
                    $user->points = ($user->points ?? 0) + ($order->pointsEarned ?? 0);
                    $user->save();
                }
            } elseif ($newStatus === 'cancelled' && $oldStatus === 'completed') {
                // Revert points if completed order gets cancelled
                $user = User::find($order->userId);
                if ($user) {
                    $user->points = max(0, ($user->points ?? 0) - ($order->pointsEarned ?? 0));
                    $user->save();
                }
            }

            DB::commit();
            return response()->json(Order::with(['items', 'user'])->find($id));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi cập nhật đơn hàng: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get Customer Orders History (Storefront)
     */
    public function getStorefrontOrders(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $orders = Order::where('userId', $userId)
            ->with('items')
            ->orderBy('createdAt', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get Customer Order Details (Storefront)
     */
    public function getStorefrontOrderDetails(Request $request, $id)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $order = Order::with('items')->where('id', $id)->where('userId', $userId)->first();
        if (!$order) {
            return response()->json(['message' => 'Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn.'], 404);
        }

        return response()->json($order);
    }

    /**
     * Place Order (Storefront)
     */
    public function placeOrder(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $data = $request->validate([
            'shippingAddress' => 'required|array',
            'shippingAddress.fullName' => 'required|string',
            'shippingAddress.phone' => 'required|string',
            'shippingAddress.province' => 'required|string',
            'shippingAddress.district' => 'required|string',
            'shippingAddress.ward' => 'required|string',
            'shippingAddress.detailAddress' => 'required|string',
            'shippingMethod' => 'required|string',
            'shippingFee' => 'required|numeric',
            'paymentMethod' => 'required|string|in:COD,MOMO,VNPAY,CREDIT_CARD',
            'couponCode' => 'nullable|string',
            'pointsUsed' => 'nullable|integer|min:0'
        ]);

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        $cartItems = CartItem::where('userId', $userId)->get();
        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng của bạn đang trống.'], 400);
        }

        // Check variant details & stock
        $subtotal = 0.0;
        $orderItemsData = [];

        foreach ($cartItems as $item) {
            $product = Product::find($item->productId);
            $variant = ProductVariant::where('sku', $item->sku)->first();

            if (!$product || !$variant || $variant->stock < $item->quantity) {
                return response()->json([
                    'message' => 'Sản phẩm ' . ($product ? $product->name : '') . ' đã hết hàng hoặc không đủ tồn kho.'
                ], 400);
            }

            $price = $variant->promoPrice ?: $variant->price;
            $subtotal += $price * $item->quantity;

            // Generate variant display name
            $variantNameParts = [];
            foreach ($variant->attributes as $k => $v) {
                $variantNameParts[] = "{$v}";
            }
            $variantName = implode(' / ', $variantNameParts);

            $orderItemsData[] = [
                'productId' => $product->id,
                'productName' => $product->name,
                'sku' => $variant->sku,
                'variantName' => $variantName,
                'price' => $price,
                'quantity' => $item->quantity,
                'image' => !empty($product->images) ? $product->images[0] : ''
            ];
        }

        // Apply discount coupon
        $discountAmount = 0.0;
        if (!empty($data['couponCode'])) {
            $coupon = Coupon::find($data['couponCode']);
            if ($coupon && $coupon->status === 'active' && $subtotal >= $coupon->minOrderValue) {
                if ($coupon->type === 'percent') {
                    $discountAmount = ($subtotal * $coupon->value) / 100;
                    if ($coupon->maxDiscount && $discountAmount > $coupon->maxDiscount) {
                        $discountAmount = $coupon->maxDiscount;
                    }
                } else {
                    $discountAmount = $coupon->value;
                }
                $coupon->increment('usedCount');
            }
        }

        // Apply reward points (1 point = 1,000 VND)
        $pointsUsed = $data['pointsUsed'] ?? 0;
        if ($pointsUsed > 0) {
            if ($user->points < $pointsUsed) {
                return response()->json(['message' => 'Bạn không đủ điểm thưởng.'], 400);
            }
            $pointsDiscount = $pointsUsed * 1000;
            $discountAmount += $pointsDiscount;
            $user->decrement('points', $pointsUsed);
        }

        $total = $subtotal - $discountAmount + $data['shippingFee'];
        if ($total < 0) $total = 0;

        // Points earned (1 point for every 100,000 VND spent)
        $pointsEarned = (int) floor($total / 100000);

        // Payment status simulation
        $paymentStatus = 'unpaid';
        if (in_array($data['paymentMethod'], ['MOMO', 'VNPAY', 'CREDIT_CARD'])) {
            $paymentStatus = 'paid';
        }

        // Decrement variant stock
        foreach ($cartItems as $item) {
            ProductVariant::where('sku', $item->sku)->decrement('stock', $item->quantity);
        }

        DB::beginTransaction();
        try {
            // Generate order timeline logs
            $timeline = [
                [
                    'status' => 'pending',
                    'time' => now()->format('Y-m-d H:i:s'),
                    'note' => 'Đơn hàng đã được khởi tạo thành công.'
                ]
            ];
            if ($paymentStatus === 'paid') {
                $timeline[] = [
                    'status' => 'payment_paid',
                    'time' => now()->format('Y-m-d H:i:s'),
                    'note' => 'Thanh toán trực tuyến thành công qua ' . $data['paymentMethod']
                ];
            }

            // Create Order
            $order = Order::create([
                'id' => (string) 'HD' . date('ymd') . rand(1000, 9999),
                'userId' => $userId,
                'createdAt' => now(),
                'status' => 'pending',
                'shippingAddress' => $data['shippingAddress'],
                'shippingMethod' => $data['shippingMethod'],
                'shippingFee' => $data['shippingFee'],
                'paymentMethod' => $data['paymentMethod'],
                'paymentStatus' => $paymentStatus,
                'couponCode' => $data['couponCode'] ?? null,
                'discountAmount' => $discountAmount,
                'pointsUsed' => $pointsUsed,
                'pointsEarned' => $pointsEarned,
                'subtotal' => $subtotal,
                'total' => $total,
                'timeline' => $timeline
            ]);

            // Save order items
            foreach ($orderItemsData as $itemData) {
                $itemData['id'] = (string) Str::uuid();
                $itemData['orderId'] = $order->id;
                OrderItem::create($itemData);
            }

            // Clear Cart
            CartItem::where('userId', $userId)->delete();

            // Reward points add to profile
            if ($pointsEarned > 0) {
                $user->increment('points', $pointsEarned);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi xử lý đặt hàng: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'success' => true,
            'orderId' => $order->id,
            'total' => $order->total,
            'paymentMethod' => $order->paymentMethod,
            'pointsEarned' => $order->pointsEarned
        ]);
    }

    /**
     * Cancel Order (Storefront)
     */
    public function cancelOrder(Request $request, $id)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $order = Order::with('items')->where('id', $id)->where('userId', $userId)->first();
        if (!$order) {
            return response()->json(['message' => 'Đơn hàng không tồn tại'], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Đơn hàng đã chuyển sang trạng thái xử lý/vận chuyển, không thể hủy.'], 400);
        }

        DB::beginTransaction();
        try {
            $order->status = 'cancelled';
            
            // Add to timeline
            $timeline = $order->timeline ?? [];
            $timeline[] = [
                'status' => 'cancelled',
                'time' => now()->format('Y-m-d H:i:s'),
                'note' => 'Đơn hàng đã bị hủy bởi khách hàng.'
            ];
            $order->timeline = $timeline;
            $order->save();

            // Restore variant stock
            foreach ($order->items as $item) {
                ProductVariant::where('sku', $item->sku)->increment('stock', $item->quantity);
            }

            // Restore points used if any
            if ($order->pointsUsed > 0) {
                User::where('id', $userId)->increment('points', $order->pointsUsed);
            }
            
            // Deduct points earned if any
            if ($order->pointsEarned > 0) {
                User::where('id', $userId)->decrement('points', $order->pointsEarned);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi xử lý hủy đơn: ' . $e->getMessage()], 500);
        }

        return response()->json(['success' => true]);
    }
}
