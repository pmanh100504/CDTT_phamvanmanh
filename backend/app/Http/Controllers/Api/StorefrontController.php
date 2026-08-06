<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Banner;
use App\Models\Coupon;
use App\Models\Review;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StorefrontController extends Controller
{
    /**
     * Banners
     */
    public function getBanners()
    {
        $banners = Banner::where('status', 'active')
            ->orderBy('sortOrder', 'asc')
            ->get();
        return response()->json($banners);
    }

    public function trackBannerClick($id)
    {
        $banner = Banner::find($id);
        if ($banner) {
            $banner->increment('clicks');
            return response()->json(['success' => true]);
        }
        return response()->json(['message' => 'Không tìm thấy banner'], 404);
    }

    /**
     * Categories
     */
    public function getCategories()
    {
        $categories = Category::all();
        return response()->json($categories);
    }

    /**
     * Products with Filters & Search
     */
    public function getProducts(Request $request)
    {
        $query = Product::where('status', 'active')->with(['variants', 'category']);

        // Filter by Category (including child categories)
        if ($request->filled('categoryId')) {
            $catId = $request->categoryId;
            $categoryIds = [$catId];
            
            // Fetch subcategories
            $subCats = Category::where('parentId', $catId)->pluck('id')->toArray();
            $categoryIds = array_merge($categoryIds, $subCats);

            $query->whereIn('categoryId', $categoryIds);
        }

        // Filter by Brand
        if ($request->filled('brand')) {
            $query->where('brand', $request->brand);
        }

        // Fuzzy Keyword Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                if (config('database.default') === 'sqlite') {
                    $q->where(DB::raw('lower_utf8(name)'), 'like', mb_strtolower("%{$search}%"))
                      ->orWhere(DB::raw('lower_utf8(brand)'), 'like', mb_strtolower("%{$search}%"))
                      ->orWhere(DB::raw('lower_utf8(description)'), 'like', mb_strtolower("%{$search}%"));
                } else {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('brand', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                }
            });
        }

        // Filter by Star Rating (floor value)
        if ($request->filled('rating')) {
            $query->where('ratingAverage', '>=', (float) $request->rating);
        }

        // Filter by Price range on variants
        if ($request->filled('minPrice')) {
            $minPrice = (float) $request->minPrice;
            $query->whereHas('variants', function($q) use ($minPrice) {
                $q->where('price', '>=', $minPrice);
            });
        }
        if ($request->filled('maxPrice')) {
            $maxPrice = (float) $request->maxPrice;
            $query->whereHas('variants', function($q) use ($maxPrice) {
                $q->where('price', '<=', $maxPrice);
            });
        }

        // Filter by Size in attributes JSON
        if ($request->filled('size')) {
            $size = $request->size;
            $query->whereHas('variants', function($q) use ($size) {
                $q->where('attributes', 'like', '%"size":"' . $size . '"%')
                  ->orWhere('attributes', 'like', '%"size": "' . $size . '"%');
            });
        }

        // Filter by Color in attributes JSON
        if ($request->filled('color')) {
            $color = $request->color;
            $query->whereHas('variants', function($q) use ($color) {
                $q->where('attributes', 'like', '%"color":"' . $color . '"%')
                  ->orWhere('attributes', 'like', '%"color": "' . $color . '"%');
            });
        }

        // Fetch products
        $products = $query->get();

        // Sort results
        $sort = $request->input('sort', 'newest');
        if ($sort === 'price_asc') {
            $products = $products->sortBy(function($product) {
                return $product->variants->min('price');
            })->values();
        } elseif ($sort === 'price_desc') {
            $products = $products->sortByDesc(function($product) {
                return $product->variants->max('price');
            })->values();
        } elseif ($sort === 'rating') {
            $products = $products->sortByDesc('ratingAverage')->values();
        } else { // default to newest
            $products = $products->sortByDesc('createdAt')->values();
        }

        return response()->json($products);
    }

    public function getProductDetails($id)
    {
        $product = Product::with(['variants', 'category', 'reviews' => function($q) {
            $q->orderBy('createdAt', 'desc');
        }])->find($id);

        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        return response()->json($product);
    }

    /**
     * User Authentication (Customers)
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'fullName' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6'
        ], [
            'email.unique' => 'Email này đã được sử dụng.',
            'phone.unique' => 'Số điện thoại này đã được sử dụng.',
            'email.required' => 'Vui lòng nhập email.',
            'phone.required' => 'Vui lòng nhập số điện thoại.',
            'fullName.required' => 'Vui lòng nhập họ tên.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min' => 'Mật khẩu phải từ 6 ký tự trở lên.'
        ]);

        $userId = (string) Str::uuid();
        
        $user = User::create([
            'id' => $userId,
            'fullName' => $data['fullName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => $data['password'],
            'role' => 'customer',
            'status' => 'active',
            'points' => 0,
            'addressBook' => [],
            'createdAt' => now()
        ]);

        // Create initial cart in database for user
        Cart::create([
            'userId' => $userId,
            'updatedAt' => now()
        ]);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'fullName' => $user->fullName,
                'phone' => $user->phone,
                'points' => $user->points,
                'addressBook' => $user->addressBook,
                'role' => $user->role
            ]
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        // Support login by email or phone
        $user = User::where('email', $credentials['email'])
            ->orWhere('phone', $credentials['email'])
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Tài khoản hoặc mật khẩu không đúng.'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa.'
            ], 403);
        }

        // Ensure user has a cart
        if (!Cart::find($user->id)) {
            Cart::create([
                'userId' => $user->id,
                'updatedAt' => now()
            ]);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'fullName' => $user->fullName,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'points' => $user->points,
                'addressBook' => $user->addressBook ?? [],
                'role' => $user->role
            ]
        ]);
    }

    public function getProfile(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        $data = $request->validate([
            'fullName' => 'required|string|max:100',
            'phone' => 'required|string|max:20|unique:users,phone,' . $user->id,
            'avatar' => 'nullable|string',
            'addressBook' => 'nullable|array',
            'password' => 'nullable|string|min:6'
        ], [
            'phone.unique' => 'Số điện thoại này đã được đăng ký bởi tài khoản khác.',
            'phone.required' => 'Vui lòng nhập số điện thoại.',
            'fullName.required' => 'Vui lòng nhập họ tên.',
            'password.min' => 'Mật khẩu phải từ 6 ký tự trở lên.'
        ]);

        $user->fullName = $data['fullName'];
        $user->phone = $data['phone'];
        if (isset($data['avatar'])) {
            $user->avatar = $data['avatar'];
        }
        if (isset($data['addressBook'])) {
            $user->addressBook = $data['addressBook'];
        }
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'fullName' => $user->fullName,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'points' => $user->points,
                'addressBook' => $user->addressBook ?? [],
                'role' => $user->role
            ]
        ]);
    }

    /**
     * Shopping Cart
     */
    public function getCart(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json([]);
        }

        $cartItems = CartItem::where('userId', $userId)->with('product')->get();
        
        // Structure item with selected variant details
        $items = $cartItems->map(function($item) {
            $product = $item->product;
            $variant = ProductVariant::where('productId', $item->productId)
                ->where('sku', $item->sku)
                ->first();

            return [
                'id' => $item->id,
                'productId' => $item->productId,
                'sku' => $item->sku,
                'quantity' => $item->quantity,
                'addedAt' => $item->addedAt,
                'name' => $product ? $product->name : 'Sản phẩm đã bị xóa',
                'images' => $product ? $product->images : [],
                'variant' => $variant ? [
                    'price' => $variant->price,
                    'promoPrice' => $variant->promoPrice,
                    'attributes' => $variant->attributes,
                    'stock' => $variant->stock
                ] : null
            ];
        });

        return response()->json($items);
    }

    public function addToCart(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $data = $request->validate([
            'productId' => 'required|string|exists:products,id',
            'sku' => 'required|string|exists:product_variants,sku',
            'quantity' => 'required|integer|min:1'
        ]);

        $variant = ProductVariant::where('sku', $data['sku'])->first();
        if (!$variant || $variant->stock < $data['quantity']) {
            return response()->json(['message' => 'Số lượng tồn kho không đủ.'], 400);
        }

        // Ensure cart exists
        if (!Cart::find($userId)) {
            Cart::create(['userId' => $userId, 'updatedAt' => now()]);
        }

        // Check if item already exists in user's cart
        $existingItem = CartItem::where('userId', $userId)
            ->where('productId', $data['productId'])
            ->where('sku', $data['sku'])
            ->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $data['quantity'];
            if ($variant->stock < $newQuantity) {
                return response()->json(['message' => 'Số lượng tồn kho không đủ.'], 400);
            }
            $existingItem->quantity = $newQuantity;
            $existingItem->save();
        } else {
            CartItem::create([
                'id' => (string) Str::uuid(),
                'userId' => $userId,
                'productId' => $data['productId'],
                'sku' => $data['sku'],
                'quantity' => $data['quantity'],
                'addedAt' => now()
            ]);
        }

        Cart::where('userId', $userId)->update(['updatedAt' => now()]);

        return $this->getCart($request);
    }

    public function updateCartItem(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $data = $request->validate([
            'id' => 'required|string|exists:cart_items,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $item = CartItem::where('id', $data['id'])->where('userId', $userId)->first();
        if (!$item) {
            return response()->json(['message' => 'Mục giỏ hàng không tồn tại'], 404);
        }

        $variant = ProductVariant::where('sku', $item->sku)->first();
        if (!$variant || $variant->stock < $data['quantity']) {
            return response()->json(['message' => 'Số lượng tồn kho không đủ.'], 400);
        }

        $item->quantity = $data['quantity'];
        $item->save();

        Cart::where('userId', $userId)->update(['updatedAt' => now()]);

        return $this->getCart($request);
    }

    public function removeCartItem(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $data = $request->validate([
            'id' => 'required|string|exists:cart_items,id'
        ]);

        CartItem::where('id', $data['id'])->where('userId', $userId)->delete();
        Cart::where('userId', $userId)->update(['updatedAt' => now()]);

        return $this->getCart($request);
    }

    /**
     * Coupon Code Verification
     */
    public function verifyCoupon(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string',
            'cartTotal' => 'required|numeric'
        ]);

        $coupon = Coupon::find($data['code']);

        if (!$coupon || $coupon->status !== 'active') {
            return response()->json(['message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'], 400);
        }

        if (now()->lt($coupon->startDate) || now()->gt($coupon->endDate)) {
            return response()->json(['message' => 'Mã giảm giá chưa đến thời hạn hoặc đã hết hạn.'], 400);
        }

        if ($coupon->usedCount >= $coupon->maxUses) {
            return response()->json(['message' => 'Mã giảm giá đã đạt số lượt sử dụng tối đa.'], 400);
        }

        if ($data['cartTotal'] < $coupon->minOrderValue) {
            return response()->json([
                'message' => 'Giá trị đơn hàng chưa đạt tối thiểu (' . number_format($coupon->minOrderValue) . ' đ) để áp dụng mã này.'
            ], 400);
        }

        // Calculate discount
        $discount = 0.0;
        if ($coupon->type === 'percent') {
            $discount = ($data['cartTotal'] * $coupon->value) / 100;
            if ($coupon->maxDiscount && $discount > $coupon->maxDiscount) {
                $discount = $coupon->maxDiscount;
            }
        } else { // fixed value
            $discount = $coupon->value;
        }

        return response()->json([
            'success' => true,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discountAmount' => $discount
        ]);
    }

    /**
     * Checkout Place Order
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
     * Customer Orders History
     */
    public function getOrders(Request $request)
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

    public function getOrderDetails(Request $request, $id)
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

    /**
     * Submit Reviews
     */
    public function submitReview(Request $request, $productId)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'images' => 'nullable|array'
        ]);

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        $product = Product::find($productId);
        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại'], 404);
        }

        // Check if user has purchased this product before
        $hasPurchased = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.orderId')
            ->where('orders.userId', $userId)
            ->where('orders.status', 'completed')
            ->where('order_items.productId', $productId)
            ->exists();

        if (!$hasPurchased) {
            return response()->json(['message' => 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận được hàng.'], 400);
        }

        // Add Review
        $review = Review::create([
            'id' => (string) Str::uuid(),
            'productId' => $productId,
            'userId' => $userId,
            'userName' => $user->fullName,
            'userAvatar' => $user->avatar,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? '',
            'images' => $data['images'] ?? [],
            'createdAt' => now()
        ]);

        // Recalculate Product average rating
        $reviews = Review::where('productId', $productId)->get();
        $count = $reviews->count();
        $avg = $reviews->avg('rating');

        $product->ratingCount = $count;
        $product->ratingAverage = round($avg, 2);
        $product->save();

        return response()->json([
            'success' => true,
            'review' => $review,
            'product' => [
                'ratingAverage' => $product->ratingAverage,
                'ratingCount' => $product->ratingCount
            ]
        ]);
    }
}
