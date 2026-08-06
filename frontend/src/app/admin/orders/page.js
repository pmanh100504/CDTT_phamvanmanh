'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import {
  Search,
  Eye,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  CreditCard,
  Calendar,
  AlertCircle,
  Truck,
  CheckSquare,
  PackageCheck,
  XCircle,
  Clock,
  User,
  X
} from 'lucide-react';

function parseCustomDate(dateStr) {
  if (!dateStr) return new Date();
  
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  const dmyRegex = /^(\d{2})[-/](\d{2})[-/](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/;
  const match = dateStr.match(dmyRegex);
  if (match) {
    const [_, day, month, year, hour = '00', minute = '00', second = '00'] = match;
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  }
  
  const ymdRegex = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/;
  const matchYmd = dateStr.match(ymdRegex);
  if (matchYmd) {
    const [_, year, month, day, hour = '00', minute = '00', second = '00'] = matchYmd;
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  }
  
  return new Date();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  
  // Selection states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printTemplate, setPrintTemplate] = useState(null); // 'invoice' or 'delivery'

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url = `/orders?${statusFilter ? `status=${statusFilter}&` : ''}${search ? `search=${search}` : ''}`;
      const data = await fetchApi(url);
      setOrders(data);
      if (selectedOrder) {
        const updated = data.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (id, newStatus, note = '') => {
    try {
      await fetchApi(`/orders/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus, note })
      });
      loadOrders();
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật trạng thái đơn hàng.');
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400">Chờ duyệt</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-400">Đóng gói</span>;
      case 'shipping':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-400">Đang giao</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 font-bold">Hoàn thành</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-400 font-bold">Đã hủy</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-zinc-500/10 text-zinc-400">Không rõ</span>;
    }
  };

  // Printable styles triggered by window.print()
  const handlePrint = (type, order) => {
    setPrintTemplate({ type, order });
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Quản Lý Đơn Hàng</h2>
          <p className="text-zinc-400 text-sm mt-1">Quản lý trạng thái xử lý đơn hàng, xuất hóa đơn tài chính và phiếu vận chuyển</p>
        </div>
      </div>

      {/* Main filter options */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          {['', 'pending', 'processing', 'shipping', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {status === '' ? 'Tất cả' : 
               status === 'pending' ? 'Chờ duyệt' :
               status === 'processing' ? 'Đóng gói' :
               status === 'shipping' ? 'Đang giao' :
               status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
            </button>
          ))}
        </div>

        {/* Searching field */}
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã HD, tên, số điện thoại..."
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none sm:text-xs"
          />
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:hidden">
        {/* Left: Orders list table */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl lg:col-span-2 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-zinc-850">
            <table className="min-w-full divide-y divide-zinc-850 text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/35 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Mã đơn hàng</th>
                  <th scope="col" className="px-4 py-3.5">Khách hàng</th>
                  <th scope="col" className="px-4 py-3.5">Ngày đặt</th>
                  <th scope="col" className="px-4 py-3.5">Tổng tiền</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Trạng thái</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                {orders.map((o) => (
                  <tr 
                    key={o.id} 
                    className={`hover:bg-zinc-900/30 transition-colors cursor-pointer ${
                      selectedOrder?.id === o.id ? 'bg-indigo-600/5 border-l-2 border-l-indigo-600' : ''
                    }`}
                    onClick={() => setSelectedOrder(o)}
                  >
                    <td className="px-4 py-4 font-mono font-bold text-white tracking-wider">{o.id}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-zinc-200">{o.user?.fullName || 'Khách vãng lai'}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{o.user?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 text-zinc-400">
                      {parseCustomDate(o.createdAt).toLocaleDateString('vi-VN')} {parseCustomDate(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-4 font-bold text-indigo-400">{formatVND(o.total)}</td>
                    <td className="px-4 py-4 text-center">{getStatusBadge(o.status)}</td>
                    <td className="px-4 py-4 text-right">
                      <ChevronRight className="h-4 w-4 text-zinc-500 ml-auto" />
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-zinc-500">
                      Không tìm thấy đơn hàng nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Order Detail sidebar panel */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="flex items-start justify-between border-b border-zinc-850 pb-4">
                <div>
                  <span className="text-[10px] text-indigo-400 font-mono font-bold block mb-1">ĐƠN HÀNG CHI TIẾT</span>
                  <h3 className="text-sm font-bold text-white font-mono">{selectedOrder.id}</h3>
                </div>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              {/* Action buttons based on status */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Thao tác duyệt đơn</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/10"
                      >
                        <PackageCheck className="h-3.5 w-3.5" /> Duyệt đơn
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition-all"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Hủy đơn
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'shipping')}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/10"
                      >
                        <Truck className="h-3.5 w-3.5" /> Giao hàng
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition-all"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Hủy đơn
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'shipping' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/10"
                      >
                        <CheckSquare className="h-3.5 w-3.5" /> Thành công
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition-all"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Hủy đơn
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'completed' && (
                    <div className="col-span-2 text-center py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold rounded-xl text-xs">
                      Đơn hàng đã hoàn thành và tích lũy điểm thưởng!
                    </div>
                  )}
                  {selectedOrder.status === 'cancelled' && (
                    <div className="col-span-2 text-center py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold rounded-xl text-xs">
                      Đơn hàng đã bị hủy.
                    </div>
                  )}
                </div>
              </div>

              {/* Document generation */}
              <div className="space-y-2 border-t border-zinc-850 pt-4">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Xuất tài liệu in ấn</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePrint('invoice', selectedOrder)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs transition-all"
                  >
                    <Printer className="h-3.5 w-3.5" /> In hóa đơn
                  </button>
                  <button
                    onClick={() => handlePrint('delivery', selectedOrder)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs transition-all"
                  >
                    <Printer className="h-3.5 w-3.5" /> Phiếu giao hàng
                  </button>
                </div>
              </div>

              {/* Shipping snapshot details */}
              <div className="space-y-3 border-t border-zinc-850 pt-4">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Thông tin giao nhận</span>
                
                <div className="space-y-2 bg-zinc-950/40 p-3 rounded-xl border border-zinc-850 text-xs">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <User className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="font-semibold">{selectedOrder.shippingAddress?.receiverName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Truck className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span>SĐT: {selectedOrder.shippingAddress?.receiverPhone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-400">
                    <MapPin className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {selectedOrder.shippingAddress?.detailAddress}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}
                    </span>
                  </div>
                  <div className="border-t border-zinc-850/80 pt-2 mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Đơn vị: {selectedOrder.shippingMethod}</span>
                    <span>Phí ship: {formatVND(selectedOrder.shippingFee)}</span>
                  </div>
                </div>
              </div>

              {/* Items Snapshot */}
              <div className="space-y-3 border-t border-zinc-850 pt-4">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Danh sách mặt hàng ({selectedOrder.items?.length || 0})</span>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex gap-3 justify-between items-start text-xs bg-zinc-950/20 p-2.5 rounded-xl border border-zinc-850/40">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-10 w-10 rounded-lg object-cover bg-zinc-800 border border-zinc-700/50 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-zinc-200 block truncate">{item.productName}</span>
                        <span className="text-[10px] text-zinc-500 block truncate mt-0.5">Biến thể: {item.variantName}</span>
                        <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">SL: {item.quantity} x {formatVND(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Costs summary */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2 text-xs font-semibold text-zinc-400">
                <div className="flex justify-between">
                  <span>Tạm tính (subtotal)</span>
                  <span className="text-zinc-200">{formatVND(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giảm giá Voucher</span>
                  <span className="text-rose-400">-{formatVND(selectedOrder.discountAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quy đổi điểm ({selectedOrder.pointsUsed} điểm)</span>
                  <span className="text-rose-400">-{formatVND(selectedOrder.pointsUsed * 1000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng</span>
                  <span className="text-zinc-200">+{formatVND(selectedOrder.shippingFee)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2.5 mt-2.5 flex justify-between text-sm font-bold text-white">
                  <span>TỔNG THANH TOÁN</span>
                  <span className="text-indigo-400 font-mono">{formatVND(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4 border-t border-zinc-850 pt-4">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lịch sử xử lý (Timeline)</span>
                <div className="relative border-l border-zinc-800 pl-4 space-y-4 ml-1.5 py-1 text-xs">
                  {selectedOrder.timeline?.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] mt-0.5 h-3.5 w-3.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                        <span>Trạng thái: {(evt.status || '').toUpperCase()}</span>
                        <span>{parseCustomDate(evt.time).toLocaleDateString('vi-VN')} {parseCustomDate(evt.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-zinc-300 font-semibold mt-1">{evt.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
              <AlertCircle className="h-8 w-8 text-zinc-700 mb-3 animate-pulse" />
              <p className="text-xs font-semibold">Chưa chọn đơn hàng</p>
              <p className="text-[10px] mt-1">Chọn một dòng đơn hàng ở bảng bên trái để theo dõi chi tiết và cập nhật tiến độ.</p>
            </div>
          )}
        </div>
      </div>

      {/* Printable template view (rendered out of sidebar and headers when printing) */}
      {printTemplate && (
        <div className="hidden print:block fixed inset-0 z-[100] bg-white text-black p-8 font-serif leading-relaxed text-xs">
          {/* Header */}
          <div className="border-b-2 border-black pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-wide">HỆ THỐNG CỬA HÀNG</h1>
              <p className="text-[10px]">Website: www.shop.vn | Hotline: 1900 1234</p>
              <p className="text-[10px]">Địa chỉ: Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội</p>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold uppercase">
                {printTemplate.type === 'invoice' ? 'HÓA ĐƠN BÁN HÀNG' : 'PHIẾU GIAO HÀNG / VẬN CHUYỂN'}
              </h2>
              <p className="font-mono text-[10px] font-bold mt-1">Số: {printTemplate.order.id}</p>
              <p className="text-[9px]">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-black">
            <div>
              <h3 className="font-bold underline uppercase text-[10px] mb-1">Thông tin giao nhận</h3>
              <p>Khách hàng: <strong>{printTemplate.order.shippingAddress?.receiverName}</strong></p>
              <p>Điện thoại: {printTemplate.order.shippingAddress?.receiverPhone}</p>
              <p>Địa chỉ: {printTemplate.order.shippingAddress?.detailAddress}, {printTemplate.order.shippingAddress?.ward}, {printTemplate.order.shippingAddress?.district}, {printTemplate.order.shippingAddress?.province}</p>
            </div>
            <div>
              <h3 className="font-bold underline uppercase text-[10px] mb-1">Chi tiết hóa đơn</h3>
              <p>Ngày đặt mua: {parseCustomDate(printTemplate.order.createdAt).toLocaleDateString('vi-VN')}</p>
              <p>Phương thức thanh toán: {printTemplate.order.paymentMethod}</p>
              <p>Đơn vị vận chuyển: {printTemplate.order.shippingMethod}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="min-w-full divide-y divide-black text-left text-xs mt-4">
            <thead>
              <tr className="font-bold border-b border-black">
                <th className="py-2">Tên sản phẩm</th>
                <th className="py-2">Biến thể</th>
                <th className="py-2 text-center">Đơn giá</th>
                <th className="py-2 text-center">Số lượng</th>
                <th className="py-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-250">
              {printTemplate.order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 font-semibold">{item.productName}</td>
                  <td className="py-2">{item.variantName}</td>
                  <td className="py-2 text-center font-mono">{formatVND(item.price)}</td>
                  <td className="py-2 text-center font-mono">{item.quantity}</td>
                  <td className="py-2 text-right font-mono">{formatVND(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Price details */}
          <div className="w-1/2 ml-auto space-y-1.5 py-4 text-xs font-semibold text-right">
            <div className="flex justify-between">
              <span>Cộng tiền hàng:</span>
              <span className="font-mono">{formatVND(printTemplate.order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Số tiền giảm Voucher:</span>
              <span className="font-mono">-{formatVND(printTemplate.order.discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Đổi điểm thưởng ({printTemplate.order.pointsUsed} điểm):</span>
              <span className="font-mono">-{formatVND(printTemplate.order.pointsUsed * 1000)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="font-mono">+{formatVND(printTemplate.order.shippingFee)}</span>
            </div>
            <div className="border-t border-black pt-2 flex justify-between text-sm font-bold">
              <span>TỔNG CỘNG PHẢI THU:</span>
              <span className="font-mono">{formatVND(printTemplate.order.total)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center mt-12 text-xs">
            <div>
              <p className="font-semibold">Người lập phiếu</p>
              <p className="text-[10px] text-gray-500 mt-0.5">(Ký, họ tên)</p>
            </div>
            <div>
              <p className="font-semibold">Người giao hàng</p>
              <p className="text-[10px] text-gray-500 mt-0.5">(Ký, họ tên)</p>
            </div>
            <div>
              <p className="font-semibold">Người mua hàng</p>
              <p className="text-[10px] text-gray-500 mt-0.5">(Ký, nhận hàng)</p>
            </div>
          </div>

          <div className="text-center text-[8px] text-gray-500 mt-16 print:hidden">
            <button
              onClick={() => setPrintTemplate(null)}
              className="py-1 px-4 bg-zinc-800 text-white rounded-lg"
            >
              Quay lại (Đóng bản in)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
