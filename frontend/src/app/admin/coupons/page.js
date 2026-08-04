'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Ticket,
  Percent,
  DollarSign,
  Truck,
  X,
  Clock,
  Sparkles,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    minOrderValue: 0,
    maxDiscount: '',
    maxUses: 100,
    startDate: '',
    endDate: '',
    status: 'active'
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/coupons');
      setCoupons(data);
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách mã giảm giá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setForm({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue || 0,
        maxDiscount: coupon.maxDiscount || '',
        maxUses: coupon.maxUses || 100,
        startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
        endDate: new Date(coupon.endDate).toISOString().slice(0, 16),
        status: coupon.status || 'active'
      });
    } else {
      setEditingCoupon(null);
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(now.getDate() + 30);

      setForm({
        code: '',
        type: 'percentage',
        value: 10,
        minOrderValue: 0,
        maxDiscount: '',
        maxUses: 100,
        startDate: now.toISOString().slice(0, 16),
        endDate: nextMonth.toISOString().slice(0, 16),
        status: 'active'
      });
    }
    setModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value) || 0,
        minOrderValue: parseFloat(form.minOrderValue) || 0,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
        maxUses: parseInt(form.maxUses) || 100
      };

      await fetchApi('/coupons', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setModalOpen(false);
      loadCoupons();
    } catch (err) {
      alert(err.message || 'Lỗi lưu thông tin mã giảm giá.');
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code}" không?`)) return;
    try {
      await fetchApi(`/coupons/${code}`, { method: 'DELETE' });
      loadCoupons();
    } catch (err) {
      alert(err.message || 'Lỗi xóa mã giảm giá.');
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getCouponIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      case 'freeship':
        return <Truck className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  const getCouponTypeText = (type) => {
    switch (type) {
      case 'percentage':
        return 'Giảm theo %';
      case 'fixed':
        return 'Giảm tiền mặt';
      case 'freeship':
        return 'Miễn phí giao hàng';
      default:
        return 'Mã giảm giá';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Mã Giảm Giá & Khuyến Mãi</h2>
          <p className="text-zinc-400 text-sm mt-1">Cấu hình voucher giảm giá, giới hạn số lần sử dụng và đặt điều kiện giá trị đơn hàng tối thiểu</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white py-2.5 px-4 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" /> Thêm Mã Mới
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => {
          const isExpired = new Date(c.endDate) < new Date();
          const progressPercent = Math.min(((c.usedCount / c.maxUses) * 100), 100);

          return (
            <div 
              key={c.code} 
              className={`bg-zinc-900/40 border rounded-2xl overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all flex relative ${
                isExpired || c.status === 'inactive' ? 'border-zinc-800 opacity-60' : 'border-zinc-800/80'
              }`}
            >
              {/* Ticket Left Edge (styled like a real cut voucher) */}
              <div className="w-16 bg-gradient-to-br from-indigo-600 to-indigo-850 flex flex-col items-center justify-center text-white shrink-0 relative border-r border-dashed border-zinc-850/80">
                <div className="absolute top-[-8px] right-[-8px] w-4 h-4 bg-zinc-950 rounded-full"></div>
                <div className="absolute bottom-[-8px] right-[-8px] w-4 h-4 bg-zinc-950 rounded-full"></div>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  {getCouponIcon(c.type)}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider mt-2.5 rotate-270 whitespace-nowrap">
                  {c.type === 'percentage' ? `${c.value}% OFF` : c.type === 'freeship' ? 'FREE SHIP' : 'VOUCHER'}
                </span>
              </div>

              {/* Ticket Right Body */}
              <div className="flex-1 p-5 space-y-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">
                    {c.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isExpired 
                        ? 'text-rose-400 bg-rose-500/10'
                        : c.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 bg-zinc-850'
                    }`}>
                      {isExpired ? 'Hết hạn' : c.status === 'active' ? 'Đang chạy' : 'Dừng'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white block truncate">{getCouponTypeText(c.type)}</h3>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5 leading-normal">
                    {c.type === 'percentage' 
                      ? `Giảm ${c.value}% đơn hàng${c.maxDiscount ? ` (Tối đa ${formatVND(c.maxDiscount)})` : ''}`
                      : c.type === 'fixed'
                        ? `Giảm trực tiếp ${formatVND(c.value)}`
                        : `Miễn phí vận chuyển (Trị giá ${formatVND(c.value)})`
                    }
                  </p>
                </div>

                {/* Progress usages */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-zinc-500 font-bold">
                    <span>Đã dùng: {c.usedCount}/{c.maxUses} lượt</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850/50">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Conditions info */}
                <div className="space-y-1.5 text-[10px] text-zinc-500 font-medium border-t border-zinc-850 pt-2.5 mt-2.5">
                  <div className="flex justify-between">
                    <span>Đơn tối thiểu:</span>
                    <span className="font-bold text-zinc-300">{formatVND(c.minOrderValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Có hiệu lực từ:</span>
                    <span>{new Date(c.startDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hết hạn:</span>
                    <span className={isExpired ? 'text-rose-400 font-semibold' : ''}>{new Date(c.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Card footer CRUD */}
                <div className="flex justify-end gap-1.5 pt-2 border-t border-zinc-850/60 mt-1">
                  <button
                    onClick={() => handleOpenModal(c)}
                    className="p-1 hover:bg-zinc-850 text-zinc-400 hover:text-indigo-400 rounded-lg transition-all"
                    title="Sửa"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(c.code)}
                    className="p-1 hover:bg-zinc-850 text-zinc-400 hover:text-rose-400 rounded-lg transition-all"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && (
          <div className="col-span-3 text-center py-16 text-zinc-500 bg-zinc-900/20 border border-zinc-800 border-dashed rounded-2xl">
            Chưa thiết lập bất kỳ mã giảm giá nào. Nhấp chuột vào nút ở góc phải để thêm mới.
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingCoupon ? 'Chỉnh sửa Mã giảm giá' : 'Tạo Mã Giảm Giá Mới'}
            </h3>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs text-zinc-300">
              <div>
                <label className="block text-zinc-400 mb-1.5 font-semibold">Mã voucher (Tự động Viết hoa)</label>
                <input
                  type="text"
                  required
                  disabled={editingCoupon !== null}
                  value={form.code}
                  onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase().trim() }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Ví dụ: TECH2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Loại giảm giá</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-300 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="percentage">Phần trăm (% đơn)</option>
                    <option value="fixed">Tiền cố định (VND)</option>
                    <option value="freeship">Miễn phí giao hàng (Freeship)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">
                    {form.type === 'percentage' ? 'Giá trị giảm (%)' : 'Số tiền giảm / Trị giá (VND)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={form.value}
                    onChange={(e) => setForm(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Đơn tối thiểu áp dụng (VND)</label>
                  <input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) => setForm(prev => ({ ...prev, minOrderValue: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Giảm tối đa (Chỉ áp dụng với %)</label>
                  <input
                    type="number"
                    disabled={form.type !== 'percentage'}
                    value={form.maxDiscount}
                    onChange={(e) => setForm(prev => ({ ...prev, maxDiscount: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none font-mono disabled:opacity-50"
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Tổng lượt dùng tối đa</label>
                  <input
                    type="number"
                    required
                    value={form.maxUses}
                    onChange={(e) => setForm(prev => ({ ...prev, maxUses: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Trạng thái phát hành</label>
                  <div className="flex gap-4 mt-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={form.status === 'active'}
                        onChange={() => setForm(prev => ({ ...prev, status: 'active' }))}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-zinc-950 border-zinc-800"
                      />
                      <span>Đang phát (Active)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={form.status === 'inactive'}
                        onChange={() => setForm(prev => ({ ...prev, status: 'inactive' }))}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-zinc-950 border-zinc-800"
                      />
                      <span>Tạm ẩn (Inactive)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Ngày bắt đầu</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Ngày hết hạn</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition-all border border-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
