<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Banner;
use App\Models\Coupon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Admin/Staff Login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác.'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa.'
            ], 403);
        }

        if (!in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập trang quản trị.'
            ], 403);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'fullName' => $user->fullName,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'phone' => $user->phone
            ]
        ]);
    }

    /**
     * Dashboard Statistics & Reports
     */
    public function getDashboardStats(Request $request)
    {
        // 1. Core aggregates
        $totalRevenue = (float) Order::where('status', '!=', 'cancelled')->sum('total');
        $totalOrders = Order::count();
        $totalCustomers = User::where('role', 'customer')->count();
        
        // Cancellation Rate
        $cancelledOrders = Order::where('status', 'cancelled')->count();
        $cancelRate = $totalOrders > 0 ? round(($cancelledOrders / $totalOrders) * 100, 2) : 0;
        
        // Simulated Conversion Rate (Orders / Unique Customer Actions or static logical value)
        $conversionRate = 3.45; // Static realistic conversion rate percentage

        // 2. Top Selling Products
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.orderId', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->select('order_items.productId', 'order_items.productName', 'order_items.image', DB::raw('SUM(order_items.quantity) as totalSold'), DB::raw('SUM(order_items.quantity * order_items.price) as revenue'))
            ->groupBy('order_items.productId', 'order_items.productName', 'order_items.image')
            ->orderBy('totalSold', 'desc')
            ->limit(5)
            ->get();

        // 3. Overstock items (Vượt định mức, e.g. stock > 50 in variants)
        $overstockItems = DB::table('product_variants')
            ->join('products', 'product_variants.productId', '=', 'products.id')
            ->select('product_variants.sku', 'products.name as productName', 'product_variants.attributes', 'product_variants.stock')
            ->where('product_variants.stock', '>', 50) // threshold is 50 for admin alerts
            ->orderBy('product_variants.stock', 'desc')
            ->get();

        // 4. Revenue chart data (by day, week, month)
        // Group by Date for the last 30 days
        $revenueDataDaily = DB::table('orders')
            ->where('status', '!=', 'cancelled')
            ->where('createdAt', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(createdAt) as date'), DB::raw('SUM(total) as revenue'), DB::raw('COUNT(id) as ordersCount'))
            ->groupBy(DB::raw('DATE(createdAt)'))
            ->orderBy('date', 'asc')
            ->get();

        // Group by Month for the current year (SQLite strftime uses %m format)
        $revenueDataMonthly = DB::table('orders')
            ->where('status', '!=', 'cancelled')
            ->where('createdAt', '>=', now()->startOfYear())
            ->select(DB::raw('strftime("%m", createdAt) as month'), DB::raw('SUM(total) as revenue'), DB::raw('COUNT(id) as ordersCount'))
            ->groupBy(DB::raw('strftime("%m", createdAt)'))
            ->orderBy('month', 'asc')
            ->get();

        // 5. Customer registration growth data
        $customerGrowth = DB::table('users')
            ->where('role', 'customer')
            ->where('createdAt', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(createdAt) as date'), DB::raw('COUNT(id) as count'))
            ->groupBy(DB::raw('DATE(createdAt)'))
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'totalOrders' => $totalOrders,
                'totalCustomers' => $totalCustomers,
                'cancelRate' => $cancelRate,
                'conversionRate' => $conversionRate
            ],
            'topProducts' => $topProducts,
            'overstockItems' => $overstockItems,
            'charts' => [
                'daily' => $revenueDataDaily,
                'monthly' => $revenueDataMonthly,
                'customerGrowth' => $customerGrowth
            ]
        ]);
    }

    /**
     * CATEGORIES CRUD
     */
    public function getCategories()
    {
        $categories = Category::all();
        return response()->json($categories);
    }

    public function saveCategory(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|string',
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100',
            'parentId' => 'nullable|string|exists:categories,id',
            'description' => 'nullable|string'
        ]);

        if (empty($data['id'])) {
            $data['id'] = (string) Str::uuid();
            $category = Category::create($data);
        } else {
            $category = Category::find($data['id']);
            if (!$category) {
                return response()->json(['message' => 'Không tìm thấy danh mục.'], 404);
            }
            $category->update($data);
        }

        return response()->json($category);
    }

    public function deleteCategory($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Không tìm thấy danh mục.'], 404);
        }

        // Set parentId of children to null to prevent foreign key errors
        Category::where('parentId', $id)->update(['parentId' => null]);
        
        // Delete all products in this category to prevent NOT NULL constraint violations
        Product::where('categoryId', $id)->delete();

        $category->delete();

        return response()->json(['success' => true]);
    }

    /**
     * PRODUCTS & VARIANTS CRUD
     */
    public function getProducts()
    {
        // Fetch products with variants and category
        $products = Product::with(['variants', 'category'])->orderBy('createdAt', 'desc')->get();
        return response()->json($products);
    }

    public function saveProduct(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|string',
            'categoryId' => 'nullable|string|exists:categories,id',
            'name' => 'required|string|max:200',
            'slug' => 'required|string|max:200|unique:products,slug,' . ($request->id ?? 'NULL'),
            'brand' => 'required|string|max:100',
            'description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'images' => 'required|array',
            'status' => 'nullable|string|in:active,inactive',
            'variants' => 'required|array',
            'variants.*.sku' => 'required|string',
            'variants.*.attributes' => 'required|array',
            'variants.*.price' => 'required|numeric',
            'variants.*.promoPrice' => 'nullable|numeric',
            'variants.*.stock' => 'required|integer'
        ]);

        DB::beginTransaction();
        try {
            $isNew = empty($data['id']);
            $productId = $isNew ? (string) Str::uuid() : $data['id'];

            $productData = [
                'id' => $productId,
                'categoryId' => $data['categoryId'] ?? null,
                'name' => $data['name'],
                'slug' => $data['slug'],
                'brand' => $data['brand'],
                'description' => $data['description'] ?? '',
                'specifications' => $data['specifications'] ?? [],
                'images' => $data['images'],
                'status' => $data['status'] ?? 'active',
            ];

            if ($isNew) {
                $productData['ratingAverage'] = 5.0;
                $productData['ratingCount'] = 0;
                $productData['createdAt'] = now();
                $product = Product::create($productData);
            } else {
                $product = Product::find($productId);
                if (!$product) {
                    return response()->json(['message' => 'Không tìm thấy sản phẩm.'], 404);
                }
                $product->update($productData);
            }

            // Sync variants
            $incomingSkus = [];
            foreach ($data['variants'] as $vData) {
                $incomingSkus[] = $vData['sku'];
                ProductVariant::updateOrCreate(
                    ['sku' => $vData['sku']],
                    [
                        'productId' => $productId,
                        'attributes' => $vData['attributes'],
                        'price' => $vData['price'],
                        'promoPrice' => $vData['promoPrice'] ?? null,
                        'stock' => $vData['stock'],
                    ]
                );
            }

            // Delete variants that were removed
            if (!$isNew) {
                ProductVariant::where('productId', $productId)
                    ->whereNotIn('sku', $incomingSkus)
                    ->delete();
            }

            DB::commit();

            return response()->json(Product::with(['variants', 'category'])->find($productId));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi lưu sản phẩm: ' . $e->getMessage()], 500);
        }
    }

    public function deleteProduct($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm.'], 404);
        }

        DB::beginTransaction();
        try {
            // Delete variants first
            ProductVariant::where('productId', $id)->delete();
            // Delete reviews
            DB::table('reviews')->where('productId', $id)->delete();
            // Delete product
            $product->delete();

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi xóa sản phẩm: ' . $e->getMessage()], 500);
        }
    }

    /**
     * ORDERS MANAGEMENT
     */
    public function getOrders(Request $request)
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

    public function getOrderDetails($id)
    {
        $order = Order::with(['items', 'user'])->find($id);
        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng.'], 404);
        }
        return response()->json($order);
    }

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
     * BANNERS CRUD
     */
    public function getBanners()
    {
        $banners = Banner::orderBy('sortOrder', 'asc')->get();
        return response()->json($banners);
    }

    public function saveBanner(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|string',
            'title' => 'required|string|max:150',
            'desktopImage' => 'required|string|max:255',
            'mobileImage' => 'required|string|max:255',
            'position' => 'required|string|in:HOME_SLIDER,SIDEBAR,POPUP',
            'targetUrl' => 'required|string|max:255',
            'startDate' => 'required|string',
            'endDate' => 'required|string',
            'status' => 'nullable|string|in:active,inactive',
            'sortOrder' => 'nullable|integer'
        ]);

        if (empty($data['id'])) {
            $data['id'] = (string) Str::uuid();
            $data['impressions'] = 0;
            $data['clicks'] = 0;
            $banner = Banner::create($data);
        } else {
            $banner = Banner::find($data['id']);
            if (!$banner) {
                return response()->json(['message' => 'Không tìm thấy banner.'], 404);
            }
            $banner->update($data);
        }

        return response()->json($banner);
    }

    public function deleteBanner($id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['message' => 'Không tìm thấy banner.'], 404);
        }
        $banner->delete();
        return response()->json(['success' => true]);
    }

    public function trackBanner(Request $request, $id)
    {
        $type = $request->validate([
            'type' => 'required|string|in:impression,click'
        ])['type'];

        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['message' => 'Không tìm thấy banner.'], 404);
        }

        if ($type === 'impression') {
            $banner->increment('impressions');
        } else {
            $banner->increment('clicks');
        }

        return response()->json(['success' => true]);
    }

    /**
     * CUSTOMERS & RBAC ROLES
     */
    public function getCustomers(Request $request)
    {
        $search = $request->query('search');
        $role = $request->query('role');

        $query = User::query();

        if ($role) {
            $query->where('role', $role);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('fullName', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('createdAt', 'desc')->get();

        // Calculate LTV (Lifetime Value) for customers based on completed orders
        $users = $users->map(function ($u) {
            $ltv = (float) Order::where('userId', $u->id)
                ->where('status', 'completed')
                ->sum('total');
            $u->ltv = $ltv;
            return $u;
        });

        return response()->json($users);
    }

    public function updateCustomerStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'required|string|in:active,blocked'
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
        }

        $user->status = $data['status'];
        $user->save();

        return response()->json($user);
    }

    public function updateCustomerRole(Request $request, $id)
    {
        $data = $request->validate([
            'role' => 'required|string|in:customer,admin,staff'
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
        }

        $user->role = $data['role'];
        $user->save();

        return response()->json($user);
    }

    /**
     * COUPONS CRUD
     */
    public function getCoupons()
    {
        $coupons = Coupon::orderBy('startDate', 'desc')->get();
        return response()->json($coupons);
    }

    public function saveCoupon(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50',
            'type' => 'required|string|in:percentage,fixed,freeship',
            'value' => 'required|numeric',
            'minOrderValue' => 'nullable|numeric',
            'maxDiscount' => 'nullable|numeric',
            'maxUses' => 'nullable|integer',
            'startDate' => 'required|string',
            'endDate' => 'required|string',
            'status' => 'nullable|string|in:active,inactive'
        ]);

        // Code must be uppercase
        $data['code'] = strtoupper($data['code']);
        
        $coupon = Coupon::find($data['code']);
        if ($coupon) {
            // Edit mode (Note: code is primary key, so we update details)
            $coupon->update($data);
        } else {
            // New mode
            $data['usedCount'] = 0;
            $coupon = Coupon::create($data);
        }

        return response()->json($coupon);
    }

    public function deleteCoupon($code)
    {
        $coupon = Coupon::find($code);
        if (!$coupon) {
            return response()->json(['message' => 'Không tìm thấy mã giảm giá.'], 404);
        }
        $coupon->delete();
        return response()->json(['success' => true]);
    }
}
