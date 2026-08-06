'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  Sparkles, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle,
  QrCode,
  X
} from 'lucide-react';
import { fetchStorefront } from '../../storefrontApi';
import { useStore } from '../layout';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, updateCartState, customer, setCustomer } = useStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Addresses selection / adding
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: ''
  });

  // Shipping & Payment selections
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Point rewards redemption
  const [usePoints, setUsePoints] = useState(false);
  
  // Applied coupon code
  const [activeCoupon, setActiveCoupon] = useState(null);

  // Payment gate simulations
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentGatewayName, setPaymentGatewayName] = useState('');
  const [simulatedOrderStatus, setSimulatedOrderStatus] = useState(null); // success screen

  // Fetch address book
  useEffect(() => {
    if (!customer) {
      router.push('/login?redirect=checkout');
      return;
    }
    
    // Address book from user model
    if (customer.addressBook) {
      setAddresses(customer.addressBook);
    }
    
    // Read applied coupon
    const storedCoupon = localStorage.getItem('checkout_coupon');
    if (storedCoupon) {
      try {
        setActiveCoupon(JSON.parse(storedCoupon));
      } catch (e) {
        localStorage.removeItem('checkout_coupon');
      }
    }
  }, [customer]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.district || !newAddress.ward || !newAddress.detailAddress) {
      alert('Vui lòng điền đầy đủ thông tin địa chỉ.');
      return;
    }

    const updatedAddresses = [...addresses, newAddress];
    setLoading(true);
    try {
      const data = await fetchStorefront('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          fullName: customer.fullName,
          phone: customer.phone,
          addressBook: updatedAddresses
        })
      });

      // Update context and state
      setCustomer(data.user);
      localStorage.setItem('customer_user', JSON.stringify(data.user));
      setAddresses(data.user.addressBook);
      setSelectedAddressIndex(data.user.addressBook.length - 1);
      setShowNewAddressForm(false);
      setNewAddress({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        detailAddress: ''
      });
    } catch (err) {
      alert(err.message || 'Lỗi thêm địa chỉ mới.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (addresses.length === 0) {
      setError('Vui lòng thêm địa chỉ nhận hàng để tiếp tục.');
      return;
    }

    const currentAddress = addresses[selectedAddressIndex];
    const pointsToUse = usePoints ? Math.min(customer.points || 0, Math.floor((subtotal - discountAmount) / 1000)) : 0;

    const payload = {
      shippingAddress: currentAddress,
      shippingMethod,
      shippingFee,
      paymentMethod,
      couponCode: activeCoupon ? activeCoupon.code : null,
      pointsUsed: pointsToUse
    };

    // If Momo/VNPay, show checkout simulated gateway modal first
    if (paymentMethod === 'MOMO' || paymentMethod === 'VNPAY') {
      setPaymentGatewayName(paymentMethod);
      setShowPaymentModal(true);
      return;
    }

    // Otherwise place immediately (COD)
    await submitOrderPayload(payload);
  };

  const submitOrderPayload = async (payload) => {
    setLoading(true);
    try {
      const result = await fetchStorefront('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      // Cleanup locally stored coupons
      localStorage.removeItem('checkout_coupon');
      setActiveCoupon(null);
      
      // Update global context
      updateCartState();
      
      // Reload profile to update point balances
      const profile = await fetchStorefront('/auth/profile');
      setCustomer(profile);
      localStorage.setItem('customer_user', JSON.stringify(profile));

      // Trigger success page
      setSimulatedOrderStatus(result);
    } catch (err) {
      setError(err.message || 'Lỗi xảy ra khi đặt hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSimulatedPayment = async () => {
    setShowPaymentModal(false);
    
    const currentAddress = addresses[selectedAddressIndex];
    const pointsToUse = usePoints ? Math.min(customer.points || 0, Math.floor((subtotal - discountAmount) / 1000)) : 0;

    const payload = {
      shippingAddress: currentAddress,
      shippingMethod,
      shippingFee,
      paymentMethod,
      couponCode: activeCoupon ? activeCoupon.code : null,
      pointsUsed: pointsToUse
    };

    await submitOrderPayload(payload);
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
  
  // Shipping calculation (standard free > 500k, express free > 1M)
  let shippingFee = 30000;
  if (shippingMethod === 'express') {
    shippingFee = subtotal > 1000000 ? 0 : 50000;
  } else {
    shippingFee = subtotal > 500000 ? 0 : 30000;
  }

  // Point deduction (1 point = 1,000 VND)
  const maxPossiblePointsRedeemed = Math.min(customer?.points || 0, Math.floor((subtotal - discountAmount) / 1000));
  const pointsRedeemedAmount = usePoints ? maxPossiblePointsRedeemed * 1000 : 0;

  const total = subtotal - discountAmount - pointsRedeemedAmount + shippingFee;

  if (simulatedOrderStatus) {
    // Success View
    return (
      <div className="mx-auto max-w-xl py-16 px-4 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
        <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight">Đặt hàng thành công!</h2>
          <p className="text-xs text-zinc-500 font-medium">
            Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là <span className="text-indigo-600 font-extrabold">{simulatedOrderStatus.orderId}</span>.
          </p>
          <p className="text-xs text-zinc-400">
            Hóa đơn điện tử và email xác nhận đã được gửi đến hòm thư của bạn.
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl text-left w-full space-y-2.5 text-xs font-semibold text-zinc-500">
          <div className="flex justify-between">
            <span>Tổng thanh toán:</span>
            <span className="text-indigo-600 font-black">{formatVND(simulatedOrderStatus.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phương thức thanh toán:</span>
            <span className="text-zinc-800 uppercase font-bold">{simulatedOrderStatus.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Tích lũy điểm thưởng:</span>
            <span className="text-emerald-600 font-bold">+{simulatedOrderStatus.pointsEarned} Điểm</span>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <button
            onClick={() => router.push(`/orders`)}
            className="flex-1 py-3 bg-white hover:bg-zinc-100 text-zinc-700 font-bold rounded-xl border border-zinc-200 text-xs uppercase transition-all cursor-pointer"
          >
            Theo dõi đơn hàng
          </button>
          <button
            onClick={() => router.push(`/`)}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase transition-all cursor-pointer"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      <h1 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight">Thanh toán đặt hàng</h1>

      {error && (
        <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-200 font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Address, Shipping, Payment options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping Address book selection */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <MapPin className="h-4.5 w-4.5 text-indigo-500" /> 1. Địa chỉ nhận hàng
            </h3>

            {addresses.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        selectedAddressIndex === idx
                          ? 'border-indigo-600 bg-indigo-50/10 text-indigo-900 shadow-sm'
                          : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-zinc-800">{addr.fullName}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">{addr.phone}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-5">
                        {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                  ))}
                </div>
                {!showNewAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    + Thêm địa chỉ mới
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-400 italic text-xs">
                Sổ địa chỉ trống. Vui lòng thêm địa chỉ nhận hàng bên dưới.
              </div>
            )}

            {/* Address add form */}
            {(addresses.length === 0 || showNewAddressForm) && (
              <form onSubmit={handleAddNewAddress} className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-150">
                <h4 className="text-xs font-bold text-zinc-800">Thêm địa chỉ nhận hàng</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Họ và tên người nhận</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Số điện thoại liên lạc</label>
                    <input
                      type="tel"
                      required
                      placeholder=""
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Tỉnh / Thành phố</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={newAddress.province}
                      onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Quận / Huyện</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={newAddress.district}
                      onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Phường / Xã</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={newAddress.ward}
                      onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Địa chỉ chi tiết (Số nhà, ngõ ngách...)</label>
                  <input
                    type="text"
                    required
                    placeholder=""
                    value={newAddress.detailAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, detailAddress: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 rounded-lg bg-zinc-200 text-zinc-600 font-bold text-xs cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-all cursor-pointer"
                  >
                    Lưu địa chỉ
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Shipping Methods options */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <Truck className="h-4.5 w-4.5 text-indigo-500" /> 2. Phương thức vận chuyển
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Standard */}
              <div
                onClick={() => setShippingMethod('standard')}
                className={`p-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex justify-between items-center ${
                  shippingMethod === 'standard'
                    ? 'border-indigo-600 bg-indigo-50/10 text-indigo-900 shadow-sm'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <div>
                  <span className="font-bold text-zinc-800 block">Giao hàng Tiêu chuẩn</span>
                  <span className="text-[10px] text-zinc-400 font-medium">Nhận hàng trong 2-3 ngày</span>
                </div>
                <span className="font-black text-indigo-600">
                  {subtotal > 500000 ? 'Miễn phí' : formatVND(30000)}
                </span>
              </div>

              {/* Express */}
              <div
                onClick={() => setShippingMethod('express')}
                className={`p-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex justify-between items-center ${
                  shippingMethod === 'express'
                    ? 'border-indigo-600 bg-indigo-50/10 text-indigo-900 shadow-sm'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <div>
                  <span className="font-bold text-zinc-800 block">Giao hàng Hỏa tốc (Express)</span>
                  <span className="text-[10px] text-zinc-400 font-medium">Nhận hàng trong 2 giờ nội thành</span>
                </div>
                <span className="font-black text-indigo-600">
                  {subtotal > 1000000 ? 'Miễn phí' : formatVND(50000)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment gateways selection */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <CreditCard className="h-4.5 w-4.5 text-indigo-500" /> 3. Phương thức thanh toán
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* COD */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all text-center space-y-1.5 ${
                  paymentMethod === 'COD'
                    ? 'border-indigo-600 bg-indigo-50/10 text-indigo-900 shadow-sm'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <span className="font-bold text-zinc-800 block">Thanh toán COD</span>
                <span className="text-[9px] text-zinc-400 font-medium block">Thanh toán tiền mặt khi nhận hàng</span>
              </div>

              {/* MOMO */}
              <div
                onClick={() => setPaymentMethod('MOMO')}
                className={`p-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all text-center space-y-1.5 ${
                  paymentMethod === 'MOMO'
                    ? 'border-indigo-600 bg-indigo-50/10 text-indigo-900 shadow-sm'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <span className="font-bold text-zinc-800 block">Ví điện tử MoMo</span>
                <span className="text-[9px] text-zinc-400 font-medium block">Quét QR ví điện tử MoMo</span>
              </div>

              {/* VNPAY */}
              <div
                onClick={() => setPaymentMethod('VNPAY')}
                className={`p-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all text-center space-y-1.5 ${
                  paymentMethod === 'VNPAY'
                    ? 'border-indigo-600 bg-indigo-50/10 text-indigo-900 shadow-sm'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <span className="font-bold text-zinc-800 block">Cổng VNPAY</span>
                <span className="text-[9px] text-zinc-400 font-medium block">Thanh toán thẻ ngân hàng / VNPay QR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Order totals summary & rewards points redemption */}
        <div className="space-y-6">
          {/* Point rewards deduction panel */}
          {customer && customer.points > 0 && (
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-500" /> Tích lũy điểm thưởng
              </h4>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-600">
                <span>Số điểm khả dụng:</span>
                <span className="text-indigo-600 font-bold">{customer.points} Điểm ({formatVND(customer.points * 1000)})</span>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                <input
                  type="checkbox"
                  id="points-checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-zinc-50 border-zinc-200 cursor-pointer"
                />
                <label htmlFor="points-checkbox" className="text-xs text-zinc-700 font-bold cursor-pointer">
                  Dùng điểm thanh toán (Giảm tối đa {formatVND(maxPossiblePointsRedeemed * 1000)})
                </label>
              </div>
            </div>
          )}

          {/* Checkout summary bill */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">Tóm tắt thanh toán</h4>

            <div className="space-y-3 text-xs font-semibold text-zinc-500">
              <div className="flex justify-between">
                <span>Tạm tính tiền hàng:</span>
                <span className="text-zinc-800">{formatVND(subtotal)}</span>
              </div>
              
              {activeCoupon && (
                <div className="flex justify-between text-rose-600">
                  <span>Giảm giá Coupon ({activeCoupon.code}):</span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}

              {usePoints && pointsRedeemedAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Khấu trừ điểm ({maxPossiblePointsRedeemed} điểm):</span>
                  <span>-{formatVND(pointsRedeemedAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Phí giao hàng ({shippingMethod === 'express' ? 'Hỏa tốc' : 'Tiêu chuẩn'}):</span>
                <span className="text-zinc-800">
                  {shippingFee === 0 ? <span className="text-emerald-600">Miễn phí</span> : formatVND(shippingFee)}
                </span>
              </div>

              <div className="border-t border-zinc-100 pt-3 flex justify-between text-sm text-zinc-950 font-black">
                <span>Tổng chi phí thanh toán:</span>
                <span className="text-indigo-600">{formatVND(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrderSubmit}
              disabled={loading || cart.length === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow shadow-indigo-600/15 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'}
            </button>

            <div className="border-t border-zinc-100 pt-4 flex gap-2 text-[10px] text-zinc-400 font-semibold justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Hệ thống thanh toán bảo mật 256-bit SSL
            </div>
          </div>
        </div>
      </div>

      {/* Payment simulated gateway Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <QrCode className="h-12 w-12 text-indigo-600 mx-auto" />
              <h3 className="text-md font-extrabold text-zinc-950">
                Thanh toán qua cổng {paymentGatewayName}
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử của bạn để hoàn tất giao dịch.
              </p>
            </div>

            {/* Simulating QR code image */}
            <div className="flex justify-center bg-zinc-50 p-6 rounded-xl border border-zinc-200 w-fit mx-auto">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=StorefrontPaymentSimulated" 
                alt="Simulated Payment QR" 
                className="h-32 w-32 object-cover bg-white p-1.5 rounded-lg border border-zinc-100" 
              />
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border text-xs font-semibold text-zinc-500 space-y-1.5">
              <div className="flex justify-between">
                <span>Số tiền thanh toán:</span>
                <span className="text-indigo-600 font-black">{formatVND(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Nhà bán hàng:</span>
                <span className="text-zinc-800 font-bold">STOREFRONT RETAIL</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs uppercase transition-all"
              >
                Hủy giao dịch
              </button>
              <button
                onClick={handleConfirmSimulatedPayment}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-1.5 shadow shadow-indigo-600/10"
              >
                Xác nhận đã chuyển khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
