<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\CartController;

Route::post('/admin/login', [AuthController::class, 'adminLogin']);

Route::prefix('admin')->group(function () {
    // Dashboard Stats
    Route::get('/dashboard/stats', [DashboardController::class, 'getDashboardStats']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'getCategories']);
    Route::post('/categories', [CategoryController::class, 'saveCategory']);
    Route::delete('/categories/{id}', [CategoryController::class, 'deleteCategory']);

    // Products & Variants
    Route::get('/products', [ProductController::class, 'getAdminProducts']);
    Route::post('/products', [ProductController::class, 'saveProduct']);
    Route::delete('/products/{id}', [ProductController::class, 'deleteProduct']);

    // Orders
    Route::get('/orders', [OrderController::class, 'getAdminOrders']);
    Route::get('/orders/{id}', [OrderController::class, 'getAdminOrderDetails']);
    Route::post('/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);

    // Banners
    Route::get('/banners', [BannerController::class, 'getAdminBanners']);
    Route::post('/banners', [BannerController::class, 'saveBanner']);
    Route::delete('/banners/{id}', [BannerController::class, 'deleteBanner']);
    Route::post('/banners/{id}/track', [BannerController::class, 'trackBanner']);

    // Customers & Roles (RBAC)
    Route::get('/customers', [CustomerController::class, 'getCustomers']);
    Route::post('/customers/{id}/status', [CustomerController::class, 'updateCustomerStatus']);
    Route::post('/customers/{id}/role', [CustomerController::class, 'updateCustomerRole']);

    // Coupons
    Route::get('/coupons', [CouponController::class, 'getCoupons']);
    Route::post('/coupons', [CouponController::class, 'saveCoupon']);
    Route::delete('/coupons/{code}', [CouponController::class, 'deleteCoupon']);
});

// STOREFRONT ROUTING (Public & Protected via simulated client X-User-Id header validation)
Route::prefix('storefront')->group(function () {
    Route::get('/banners', [BannerController::class, 'getStorefrontBanners']);
    Route::post('/banners/{id}/track', [BannerController::class, 'trackBannerClick']);
    Route::get('/categories', [CategoryController::class, 'getCategories']);
    Route::get('/products', [ProductController::class, 'getStorefrontProducts']);
    Route::get('/products/{id}', [ProductController::class, 'getProductDetails']);
    Route::post('/products/{id}/reviews', [ProductController::class, 'submitReview']);
    
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/auth/profile', [CustomerController::class, 'getProfile']);
    Route::post('/auth/profile', [CustomerController::class, 'updateProfile']);
    
    Route::get('/cart', [CartController::class, 'getCart']);
    Route::post('/cart', [CartController::class, 'addToCart']);
    Route::post('/cart/update', [CartController::class, 'updateCartItem']);
    Route::delete('/cart', [CartController::class, 'removeCartItem']);
    
    Route::post('/coupons/verify', [CouponController::class, 'verifyCoupon']);
    
    Route::get('/orders', [OrderController::class, 'getStorefrontOrders']);
    Route::post('/orders', [OrderController::class, 'placeOrder']);
    Route::get('/orders/{id}', [OrderController::class, 'getStorefrontOrderDetails']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancelOrder']);
});
