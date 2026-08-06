'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Ticket, 
  Plus, 
  Minus,
  Sparkles,
  Heart
} from 'lucide-react';
import { fetchStorefront } from '../../storefrontApi';
import { useStore } from '../layout';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateCartState, customer } = useStore();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Apply Coupon logic
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá.');
      return;
    }

    try {
      const data = await fetchStorefront('/coupons/verify', {
        method: 'POST',
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartTotal: subtotal
        })
      });
      
      setActiveCoupon(data);
      setCouponSuccess(`Đã áp dụng mã "${data.code}" thành công!`);
      // Save code to local storage for checkout page
      localStorage.setItem('checkout_coupon', JSON.stringify(data));
    } catch (err) {
      setCouponError(err.message || 'Mã giảm giá không chính xác.');
      setActiveCoupon(null);
      localStorage.removeItem('checkout_coupon');
    }
  };

  // Sync applied coupon on cart load or update
  useEffect(() => {
    // If cart items change, recalculate and re-validate if coupon exists
    const storedCoupon = localStorage.getItem('checkout_coupon');
    if (storedCoupon) {
      try {
        const coupon = JSON.parse(storedCoupon);
        if (subtotal < coupon.minOrderValue) {
          // No longer valid
          localStorage.removeItem('checkout_coupon');
          setActiveCoupon(null);
          setCouponSuccess('');
          setCouponError('Giá trị giỏ hàng không đủ để duy trì mã giảm giá.');
        } else {
          setActiveCoupon(coupon);
        }
      } catch (e) {
        localStorage.removeItem('checkout_coupon');
      }
    }
  }, [cart]);

  // Adjust item quantity
  const handleQuantityChange = async (itemId, currentQty, amount, maxStock) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      alert(`Rất tiếc, kho chỉ còn ${maxStock} sản phẩm phân loại này.`);
      return;
    }

    try {
      await fetchStorefront('/cart/update', {
        method: 'POST',
        body: JSON.stringify({
          id: itemId,
          quantity: newQty
        })
      });
      updateCartState();
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật số lượng.');
    }
  };

  // Remove item
  const handleRemoveItem = async (itemId) => {
    if (!confirm('Bạn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

    try {
      await fetchStorefront('/cart', {
        method: 'DELETE',
        body: JSON.stringify({ id: itemId })
      });
      updateCartState();
    } catch (err) {
      alert(err.message || 'Lỗi xóa sản phẩm.');
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const price = item.variant ? (item.variant.promoPrice ?? item.variant.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = activeCoupon ? activeCoupon.discountAmount : 0;
  const shippingFee = subtotal > 500000 || subtotal === 0 ? 0 : 30000; // free shipping from 500k
  const total = subtotal - discountAmount + shippingFee;
  
  // Point rewards (1 point per 100,000 VND spent)
  const pointsEarned = Math.floor(total / 100000);

  const handleCheckoutRedirect = () => {
    if (!customer) {
      alert('Vui lòng đăng nhập để tiến hành đặt hàng.');
      router.push('/login?redirect=checkout');
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl p-12 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-800">Giỏ hàng của bạn đang trống</h3>
          <p className="text-xs text-zinc-400">Hãy lấp đầy giỏ hàng bằng những sản phẩm công nghệ tuyệt vời.</p>
        </div>
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 shadow transition-all cursor-pointer"
        >
          Quay lại mua sắm <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      <h1 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight">Giỏ hàng mua sắm</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="divide-y divide-zinc-200">
              {cart.map((item) => {
                const price = item.variant ? (item.variant.promoPrice ?? item.variant.price) : 0;
                const originalPrice = item.variant ? item.variant.price : 0;
                const hasDiscount = item.variant && item.variant.promoPrice !== null && item.variant.promoPrice < item.variant.price;

                const variantNameParts = [];
                if (item.variant && item.variant.attributes) {
                  Object.entries(item.variant.attributes).forEach(([k, v]) => {
                    variantNameParts.push(v);
                  });
                }
                const variantName = variantNameParts.join(' / ');

                return (
                  <div key={item.id} className="flex gap-4 p-5 items-start">
                    <img 
                      src={item.images[0] || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&q=80'}
                      alt="" 
                      className="h-16 w-16 object-cover rounded-xl border border-zinc-150 shrink-0 bg-zinc-50"
                    />

                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <Link href={`/products/${item.productId}`} className="text-xs font-bold text-zinc-800 hover:text-indigo-600 line-clamp-1">
                          {item.name}
                        </Link>
                        {variantName && (
                          <span className="text-[10px] font-bold text-zinc-400 mt-0.5 inline-block uppercase tracking-wider">
                            Phân loại: {variantName}
                          </span>
                        )}
                      </div>

                      {/* Pricing block */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black text-rose-600">{formatVND(price)}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-zinc-400 line-through font-medium">{formatVND(originalPrice)}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.variant?.stock || 999)}
                          className="p-1.5 hover:bg-zinc-200/50 text-zinc-500 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-zinc-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.variant?.stock || 999)}
                          className="p-1.5 hover:bg-zinc-200/50 text-zinc-500 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-zinc-400 hover:text-rose-500 transition-colors p-1"
                        title="Xóa mục"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Coupons & Checkout summary */}
        <div className="space-y-6">
          {/* Coupon verify code card */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="h-4.5 w-4.5 text-indigo-500" /> Nhập mã giảm giá (Coupon)
            </h4>

            {couponSuccess && (
              <div className="p-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 font-semibold">
                {couponSuccess}
              </div>
            )}
            {couponError && (
              <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-200 font-semibold">
                {couponError}
              </div>
            )}

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="MÃ GIẢM GIÁ (VD: VOUCHER50)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs font-semibold uppercase focus:outline-none focus:bg-white focus:border-indigo-500 flex-1"
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Áp dụng
              </button>
            </form>
          </div>

          {/* Checkout Summary panel */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">Tóm tắt đơn hàng</h4>

            <div className="space-y-3 text-xs font-semibold text-zinc-500">
              <div className="flex justify-between">
                <span>Tạm tính hàng</span>
                <span className="text-zinc-800">{formatVND(subtotal)}</span>
              </div>
              
              {activeCoupon && (
                <div className="flex justify-between text-rose-600">
                  <span>Giảm giá ({activeCoupon.code})</span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="text-zinc-800">
                  {shippingFee === 0 ? <span className="text-emerald-600">Miễn phí</span> : formatVND(shippingFee)}
                </span>
              </div>

              {shippingFee > 0 && (
                <p className="text-[9px] text-zinc-400 font-medium">Mua thêm {formatVND(500000 - subtotal)} sản phẩm để được miễn phí vận chuyển.</p>
              )}

              <div className="border-t border-zinc-100 pt-3 flex justify-between text-sm text-zinc-950 font-black">
                <span>Tổng cộng thanh toán</span>
                <span className="text-indigo-600">{formatVND(total)}</span>
              </div>
            </div>

            {/* Points earning projection */}
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
              <div className="text-[10px] font-bold text-indigo-700 leading-tight">
                Hoàn thành đơn hàng này giúp bạn tích lũy thêm <span className="text-indigo-900">{pointsEarned} điểm</span> thưởng!
              </div>
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow shadow-indigo-600/15 cursor-pointer active:scale-95"
            >
              Tiến hành thanh toán <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
