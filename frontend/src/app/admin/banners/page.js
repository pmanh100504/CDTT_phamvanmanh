'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  MousePointerClick,
  Eye,
  Percent,
  X,
  TrendingUp,
  Monitor,
  Phone,
  Clock,
  Sparkles
} from 'lucide-react';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState({
    title: '',
    desktopImage: '',
    mobileImage: '',
    position: 'HOME_SLIDER',
    targetUrl: '',
    startDate: '',
    endDate: '',
    status: 'active',
    sortOrder: 0
  });

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/banners');
      setBanners(data);
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách banner.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setForm({
        id: banner.id,
        title: banner.title,
        desktopImage: banner.desktopImage,
        mobileImage: banner.mobileImage,
        position: banner.position,
        targetUrl: banner.targetUrl,
        startDate: new Date(banner.startDate).toISOString().slice(0, 16),
        endDate: new Date(banner.endDate).toISOString().slice(0, 16),
        status: banner.status || 'active',
        sortOrder: banner.sortOrder || 0
      });
    } else {
      setEditingBanner(null);
      // Mặc định ngày bắt đầu từ hôm nay và kết thúc sau 30 ngày
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(now.getDate() + 30);
      
      setForm({
        title: '',
        desktopImage: '',
        mobileImage: '',
        position: 'HOME_SLIDER',
        targetUrl: '',
        startDate: now.toISOString().slice(0, 16),
        endDate: nextMonth.toISOString().slice(0, 16),
        status: 'active',
        sortOrder: 0
      });
    }
    setModalOpen(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        id: editingBanner ? editingBanner.id : undefined,
        sortOrder: parseInt(form.sortOrder) || 0
      };

      await fetchApi('/banners', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setModalOpen(false);
      loadBanners();
    } catch (err) {
      alert(err.message || 'Lỗi lưu thông tin banner.');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này không?')) return;
    try {
      await fetchApi(`/banners/${id}`, { method: 'DELETE' });
      loadBanners();
    } catch (err) {
      alert(err.message || 'Lỗi xóa banner.');
    }
  };

  const calculateCTR = (clicks, impressions) => {
    if (!impressions) return '0.0%';
    return `${((clicks / impressions) * 100).toFixed(2)}%`;
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
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Quản Lý Banner Quảng Cáo</h2>
          <p className="text-zinc-400 text-sm mt-1">Cấu hình Slider trang chủ, Popup quảng cáo, thống kê lượt tiếp cận (Impressions) và Click-Through Rate (CTR)</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white py-2.5 px-4 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" /> Thêm Banner Mới
        </button>
      </div>

      {/* Grid List banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => {
          const ctr = calculateCTR(b.clicks, b.impressions);
          
          return (
            <div key={b.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all flex flex-col justify-between">
              {/* Cover Banner Mockup (Interactive toggle for Mobile/Desktop check) */}
              <div className="relative h-44 bg-zinc-950 overflow-hidden">
                <img
                  src={b.desktopImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80'}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">
                      {b.position}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 bg-zinc-800'
                    }`}>
                      {b.status === 'active' ? 'Đang bật' : 'Tắt'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5 truncate">{b.title}</h3>
                </div>
              </div>

              {/* Stats & Metadata summary */}
              <div className="p-5 space-y-4 flex-1">
                {/* Stats indicators row */}
                <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-850 text-center">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-semibold block uppercase">Xem (Imp)</span>
                    <span className="text-sm font-bold text-white font-mono">{b.impressions}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-semibold block uppercase">Nhấp (Click)</span>
                    <span className="text-sm font-bold text-white font-mono">{b.clicks}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-semibold block uppercase">Tỷ lệ CTR</span>
                    <span className="text-sm font-bold text-indigo-400 font-mono">{ctr}</span>
                  </div>
                </div>

                {/* Date constraints & properties */}
                <div className="space-y-2 text-xs text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium flex items-center gap-1"><Monitor className="h-3 w-3" /> Desktop Image</span>
                    <span className="text-zinc-300 font-mono truncate max-w-[160px]" title={b.desktopImage}>
                      {b.desktopImage ? 'Đã tải lên' : 'Chưa cài đặt'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium flex items-center gap-1"><Phone className="h-3 w-3" /> Mobile Image</span>
                    <span className="text-zinc-300 font-mono truncate max-w-[160px]" title={b.mobileImage}>
                      {b.mobileImage ? 'Đã tải lên' : 'Chưa cài đặt'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> Bắt đầu</span>
                    <span>{new Date(b.startDate).toLocaleDateString('vi-VN')} {new Date(b.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> Hết hạn</span>
                    <span>{new Date(b.endDate).toLocaleDateString('vi-VN')} {new Date(b.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-850 pt-2.5 mt-2.5">
                    <span className="text-zinc-500 font-medium">Thứ tự hiển thị:</span>
                    <span className="font-bold text-white font-mono">#{b.sortOrder}</span>
                  </div>
                </div>
              </div>

              {/* CRUD Actions Footer */}
              <div className="px-5 py-3 border-t border-zinc-850/80 bg-zinc-900/10 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(b)}
                  className="p-1.5 hover:bg-zinc-850 text-zinc-400 hover:text-indigo-400 rounded-lg transition-all"
                  title="Sửa"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBanner(b.id)}
                  className="p-1.5 hover:bg-zinc-850 text-zinc-400 hover:text-rose-400 rounded-lg transition-all"
                  title="Xóa"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {banners.length === 0 && (
          <div className="col-span-3 text-center py-16 text-zinc-500 bg-zinc-900/20 border border-zinc-800 border-dashed rounded-2xl">
            Chưa có chiến dịch banner nào được khởi chạy. Nhấp chuột vào nút ở góc phải để thêm mới.
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingBanner ? 'Chỉnh sửa Banner Marketing' : 'Thiết lập Chiến dịch Banner Mới'}
            </h3>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs text-zinc-300">
              <div>
                <label className="block text-zinc-400 mb-1.5 font-semibold">Tiêu đề chiến dịch</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="Ví dụ: Giảm giá mùa tựu trường 2026"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Ảnh Desktop (DesktopImage URL)</label>
                  <input
                    type="text"
                    required
                    value={form.desktopImage}
                    onChange={(e) => setForm(prev => ({ ...prev, desktopImage: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="https://domain.com/desktop-banner.jpg"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Ảnh Mobile (MobileImage URL)</label>
                  <input
                    type="text"
                    required
                    value={form.mobileImage}
                    onChange={(e) => setForm(prev => ({ ...prev, mobileImage: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="https://domain.com/mobile-banner.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Vị trí hiển thị</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-300 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="HOME_SLIDER">Slider Trang Chủ (HOME_SLIDER)</option>
                    <option value="SIDEBAR">Thanh Bên cạnh (SIDEBAR)</option>
                    <option value="POPUP">Cửa sổ Bật lên (POPUP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Đường dẫn khi click banner (Target URL)</label>
                  <input
                    type="text"
                    required
                    value={form.targetUrl}
                    onChange={(e) => setForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Ví dụ: /collections/ban-phim-co"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Thời điểm bắt đầu</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Thời điểm kết thúc</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Độ ưu tiên sắp xếp (Thứ tự)</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm(prev => ({ ...prev, sortOrder: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Ví dụ: 1"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-semibold">Trạng thái bật/tắt</label>
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
                      <span>Đang chạy (Active)</span>
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
