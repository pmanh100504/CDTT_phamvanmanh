<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;

class CartController extends Controller
{
    /**
     * Get Logged-in Customer's Cart List
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

    /**
     * Add Item to Customer's Cart
     */
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
                'id' => (string) \Illuminate\Support\Str::uuid(),
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

    /**
     * Update Quantity of Item in Cart
     */
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

    /**
     * Remove Item from Cart
     */
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
}
