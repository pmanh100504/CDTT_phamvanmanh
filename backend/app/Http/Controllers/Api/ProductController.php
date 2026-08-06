<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Category;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Get All Products for Admin Panel
     */
    public function getAdminProducts()
    {
        $products = Product::with(['variants', 'category'])->orderBy('createdAt', 'desc')->get();
        return response()->json($products);
    }

    /**
     * Create or Update Product & Variants (Admin)
     */
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

    /**
     * Delete Product (Admin)
     */
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
     * Get Storefront Products with Filters & Search (Storefront)
     */
    public function getStorefrontProducts(Request $request)
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

    /**
     * Get Storefront Product Details (Storefront)
     */
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
     * Submit Customer Review (Storefront)
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
