<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\StorefrontController;

Route::post('/admin/login', [AdminController::class, 'login']);

Route::prefix('admin')->group(function () {
    // Dashboard Stats
    Route::get('/dashboard/stats', [AdminController::class, 'getDashboardStats']);

    // Categories
    Route::get('/categories', [AdminController::class, 'getCategories']);
    Route::post('/categories', [AdminController::class, 'saveCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);

    // Products & Variants
    Route::get('/products', [AdminController::class, 'getProducts']);
    Route::post('/products', [AdminController::class, 'saveProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);

    // Orders
    Route::get('/orders', [AdminController::class, 'getOrders']);
    Route::get('/orders/{id}', [AdminController::class, 'getOrderDetails']);
    Route::post('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);

    // Banners
    Route::get('/banners', [AdminController::class, 'getBanners']);
    Route::post('/banners', [AdminController::class, 'saveBanner']);
    Route::delete('/banners/{id}', [AdminController::class, 'deleteBanner']);
    Route::post('/banners/{id}/track', [AdminController::class, 'trackBanner']);

    // Customers & Roles (RBAC)
    Route::get('/customers', [AdminController::class, 'getCustomers']);
    Route::post('/customers/{id}/status', [AdminController::class, 'updateCustomerStatus']);
    Route::post('/customers/{id}/role', [AdminController::class, 'updateCustomerRole']);

    // Coupons
    Route::get('/coupons', [AdminController::class, 'getCoupons']);
    Route::post('/coupons', [AdminController::class, 'saveCoupon']);
    Route::delete('/coupons/{code}', [AdminController::class, 'deleteCoupon']);
});

// STOREFRONT ROUTING (Public & Protected via simulated client X-User-Id header validation)
Route::prefix('storefront')->group(function () {
    Route::get('/banners', [StorefrontController::class, 'getBanners']);
    Route::post('/banners/{id}/track', [StorefrontController::class, 'trackBannerClick']);
    Route::get('/categories', [StorefrontController::class, 'getCategories']);
    Route::get('/products', [StorefrontController::class, 'getProducts']);
    Route::get('/products/{id}', [StorefrontController::class, 'getProductDetails']);
    Route::post('/products/{id}/reviews', [StorefrontController::class, 'submitReview']);
    
    Route::post('/auth/register', [StorefrontController::class, 'register']);
    Route::post('/auth/login', [StorefrontController::class, 'login']);
    Route::get('/auth/profile', [StorefrontController::class, 'getProfile']);
    Route::post('/auth/profile', [StorefrontController::class, 'updateProfile']);
    
    Route::get('/cart', [StorefrontController::class, 'getCart']);
    Route::post('/cart', [StorefrontController::class, 'addToCart']);
    Route::post('/cart/update', [StorefrontController::class, 'updateCartItem']);
    Route::delete('/cart', [StorefrontController::class, 'removeCartItem']);
    
    Route::post('/coupons/verify', [StorefrontController::class, 'verifyCoupon']);
    
    Route::get('/orders', [StorefrontController::class, 'getOrders']);
    Route::post('/orders', [StorefrontController::class, 'placeOrder']);
    Route::get('/orders/{id}', [StorefrontController::class, 'getOrderDetails']);
    Route::post('/orders/{id}/cancel', [StorefrontController::class, 'cancelOrder']);
});
