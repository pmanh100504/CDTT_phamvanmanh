'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  Truck, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Inbox,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import { fetchStorefront } from '../../../storefrontApi';
import { useStore } from '../../layout';

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { customer } = useStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadOrderDetails = async () => {
    try {
      const data = await fetchStorefront(`/orders/${orderId}`);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Lỗi tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!customer) {
      router.push(`/login?redirect=orders/${orderId}`);
      return;
    }
    loadOrderDetails();
  }, [orderId, customer]);

  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Giao dịch hoàn trả điểm thưởng (nếu có) sẽ được tự động xử lý.')) return;
    
    setCancelling(true);
    try {
      await fetchStorefront(`/orders/${orderId}/cancel`, { method: 'POST' });
      alert('Đơn hàng đã được hủy thành công!');
      loadOrderDetails(); // reload order timeline & status
    } catch (err) {
      alert(err.message || 'Hủy đơn hàng thất bại.');
    } finally {
      setCancelling(false);
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-1 h-[60vh] items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md p-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-zinc-800">Đã xảy ra lỗi</h3>
        <p className="text-xs text-zinc-500">{error || 'Không tìm thấy thông tin đơn hàng này'}</p>
        <Link href="/orders" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // Determine timeline progress step
  const statusSteps = ['pending', 'processing', 'shipping', 'completed'];
  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
        <Link href="/" className="hover:text-indigo-600">Trang chủ</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/orders" className="hover:text-indigo-600">Đơn hàng</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600">Chi tiết đơn #{order.id}</span>
      </div>

      {/* Heading & Cancel Action */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight">Chi tiết đơn hàng #{order.id}</h1>
          <p className="text-zinc-500 text-xs mt-1">
            Đặt ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>

        {order.status === 'pending' && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shrink-0 cursor-pointer"
          >
            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
          </button>
        )}
      </div>

      {/* Progress Timeline Tracker */}
      {!isCancelled ? (
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl">
          <div className="relative flex justify-between items-center max-w-xl mx-auto py-4">
            {/* Background progress line */}
            <div className="absolute left-0 right-0 h-1 bg-zinc-150 -translate-y-1/2 top-1/2 z-0"></div>
            
            {/* Active progress line */}
            <div 
              className="absolute left-0 h-1 bg-indigo-600 -translate-y-1/2 top-1/2 z-0 transition-all duration-500"
              style={{ width: `${(currentStepIndex / 3) * 100}%` }}
            ></div>

            {/* Steps */}
            {[
              { status: 'pending', label: 'Chờ duyệt' },
              { status: 'processing', label: 'Đóng gói' },
              { status: 'shipping', label: 'Đang giao' },
              { status: 'completed', label: 'Hoàn thành' }
            ].map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              return (
                <div key={step.status} className="flex flex-col items-center relative z-10 space-y-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center border-4 text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-100 text-white shadow shadow-indigo-600/20 scale-110' 
                      : 'bg-white border-zinc-200 text-zinc-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    isActive ? 'text-indigo-600' : 'text-zinc-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-rose-500 shrink-0" />
          <div className="text-xs font-semibold leading-relaxed">
            Đơn hàng này đã bị hủy bỏ. Mọi giao dịch hoặc khấu trừ điểm thưởng đã được hoàn trả thành công.
          </div>
        </div>
      )}

      {/* Info grids: Addresses & Timeline Detail */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Delivery Details */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
            <MapPin className="h-4.5 w-4.5 text-indigo-500" /> Thông tin nhận hàng & vận chuyển
          </h3>
          
          <div className="space-y-3.5 text-xs font-semibold text-zinc-600">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Người nhận hàng</span>
              <p className="text-zinc-800 font-bold">{order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Địa chỉ nhận hàng</span>
              <p className="text-zinc-500 font-medium leading-relaxed">
                {order.shippingAddress.detailAddress}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Hình thức vận chuyển</span>
                <p className="text-zinc-800 uppercase font-bold flex items-center gap-1">
                  <Truck className="h-4 w-4 text-indigo-500" /> {order.shippingMethod === 'express' ? 'Hỏa tốc' : 'Tiêu chuẩn'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Hình thức thanh toán</span>
                <p className="text-zinc-800 uppercase font-bold flex items-center gap-1">
                  <CreditCard className="h-4 w-4 text-indigo-500" /> {order.paymentMethod} ({order.paymentStatus === 'paid' ? 'Đã trả' : 'Chưa trả'})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Status Logs */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
            <Clock className="h-4.5 w-4.5 text-indigo-500" /> Nhật ký trạng thái đơn hàng
          </h3>

          <div className="relative pl-6 border-l border-zinc-200 space-y-6 max-h-56 overflow-y-auto pr-2">
            {order.timeline && order.timeline.length > 0 ? (
              order.timeline.map((log, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Dot */}
                  <div className="absolute -left-[30px] mt-0.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-bold text-zinc-800">{log.note}</span>
                    <span className="text-[9px] text-zinc-400 font-bold tracking-wider">{log.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 italic">Không tìm thấy bản ghi nhật ký đơn hàng.</p>
            )}
          </div>
        </div>
      </section>

      {/* Items list */}
      <section className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">Danh sách sản phẩm mua</h3>
        
        <div className="divide-y divide-zinc-200">
          {order.items && order.items.map(item => (
            <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 justify-between items-center">
              <div className="flex gap-3 min-w-0 items-center">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&q=80'}
                  alt="" 
                  className="h-12 w-12 object-cover rounded-xl border border-zinc-150 shrink-0 bg-zinc-50"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-zinc-800 block truncate">{item.productName}</span>
                  <span className="text-[10px] text-zinc-400 font-bold block mt-0.5 uppercase tracking-wider">
                    Phân loại: {item.variantName || 'Mặc định'}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs font-bold text-zinc-800 block">{formatVND(item.price)}</span>
                  <span className="text-[10px] text-zinc-400 font-semibold block">SL: {item.quantity}</span>
                </div>
                
                {/* Review trigger for completed orders */}
                {order.status === 'completed' && (
                  <Link
                    href={`/products/${item.productId}`}
                    className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Viết Đánh giá
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Receipt pricing summaries */}
      <section className="bg-white border border-zinc-200 p-6 rounded-2xl max-w-md ml-auto">
        <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">Chi tiết thanh toán</h3>
        
        <div className="space-y-3 text-xs font-semibold text-zinc-500 pt-3">
          <div className="flex justify-between">
            <span>Tiền hàng tạm tính:</span>
            <span className="text-zinc-800">{formatVND(order.subtotal)}</span>
          </div>
          
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Mã giảm giá / Khấu trừ:</span>
              <span>-{formatVND(order.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span className="text-zinc-800">{order.shippingFee === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : formatVND(order.shippingFee)}</span>
          </div>

          <div className="border-t border-zinc-100 pt-3 flex justify-between text-sm text-zinc-950 font-black">
            <span>Thực tế thanh toán:</span>
            <span className="text-indigo-600">{formatVND(order.total)}</span>
          </div>
          
          {order.pointsEarned > 0 && (
            <div className="border-t border-zinc-100 pt-3 flex justify-between text-[10px] font-bold text-emerald-600 items-center">
              <span className="flex items-center gap-1"><Award className="h-4 w-4" /> Tích lũy điểm thưởng từ đơn:</span>
              <span>+{order.pointsEarned} Điểm</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
