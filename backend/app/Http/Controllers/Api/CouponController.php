<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Coupon;

class CouponController extends Controller
{
    /**
     * Get Coupons List (Admin)
     */
    public function getCoupons()
    {
        $coupons = Coupon::orderBy('startDate', 'desc')->get();
        return response()->json($coupons);
    }

    /**
     * Create or Update Coupon (Admin)
     */
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

    /**
     * Delete Coupon (Admin)
     */
    public function deleteCoupon($code)
    {
        $coupon = Coupon::find($code);
        if (!$coupon) {
            return response()->json(['message' => 'Không tìm thấy mã giảm giá.'], 404);
        }
        $coupon->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Verify Coupon for Storefront Checkout (Storefront)
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
}
