'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  ShoppingBag,
  Inbox
} from 'lucide-react';
import { fetchStorefront } from '../../storefrontApi';
import { useStore } from '../layout';

export default function OrdersPage() {
  const router = useRouter();
  const { customer } = useStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!customer) {
      router.push('/login?redirect=orders');
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await fetchStorefront('/orders');
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [customer]);

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-600 border border-amber-200">Chờ duyệt</span>;
      case 'processing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">Đang đóng gói</span>;
      case 'shipping':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-cyan-50 text-cyan-600 border border-cyan-200">Đang giao</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Hoàn thành</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-600 border border-rose-200">Đã hủy</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-zinc-50 text-zinc-600 border border-zinc-200">Không rõ</span>;
    }
  };

  // Filter orders by active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const tabs = [
    { key: 'all', label: 'Tất cả đơn' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'processing', label: 'Đóng gói' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' }
  ];

  if (loading) {
    return (
      <div className="flex flex-1 h-[60vh] items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6.5 w-6.5 text-indigo-500" /> Lịch sử mua hàng
        </h1>
        <p className="text-zinc-500 text-xs">Theo dõi tiến trình vận chuyển và quản lý các đơn hàng bạn đã mua</p>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto pb-1.5 border-b border-zinc-200 gap-1 sm:gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white p-5 rounded-2xl border border-zinc-200 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-zinc-100 pb-3.5">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-zinc-800">Mã đơn: {order.id}</span>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-bold">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                    <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> {order.paymentMethod}</span>
                  </div>
                </div>
                <div className="shrink-0">{getStatusLabel(order.status)}</div>
              </div>

              {/* Order items preview (displays the first one and mentions others if any) */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={order.items[0]?.image || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&q=80'}
                    alt=""
                    className="h-12 w-12 object-cover rounded-xl border border-zinc-150 shrink-0 bg-zinc-50"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 truncate pr-6">
                      {order.items[0]?.productName || 'Sản phẩm đã bị xóa'}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                      {order.items[0]?.variantName && `Phân loại: ${order.items[0]?.variantName} | `}
                      Số lượng: {order.items[0]?.quantity || 1}
                    </p>
                    {order.items.length > 1 && (
                      <span className="text-[9px] font-bold text-indigo-500 mt-1 block">
                        + và {order.items.length - 1} sản phẩm khác
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold block">Tổng tiền</span>
                    <span className="text-sm font-black text-indigo-600 block">{formatVND(order.total)}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-zinc-200 text-center space-y-3">
          <Inbox className="h-10 w-10 text-zinc-300 animate-pulse" />
          <h4 className="text-xs font-bold text-zinc-700">Chưa có đơn hàng nào ở mục này</h4>
          <p className="text-[10px] text-zinc-400 max-w-xs">Bắt đầu mua sắm để lưu lịch sử đặt hàng của bạn nhé!</p>
          <Link
            href="/shop"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-block"
          >
            Đến cửa hàng
          </Link>
        </div>
      )}
    </div>
  );
}
