'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from './api';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Percent,
  XCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('daily'); // 'daily' or 'monthly'

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchApi('/dashboard/stats');
      setData(result);
    } catch (err) {
      setError(err.message || 'Lỗi tải dữ liệu thống kê từ server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm text-zinc-400 font-medium">Đang tính toán số liệu thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center max-w-xl mx-auto mt-10">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Đã xảy ra lỗi</h3>
        <p className="text-sm text-zinc-400 mb-6">{error}</p>
        <button
          onClick={loadData}
          className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition-all"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { stats, topProducts, overstockItems, charts } = data;

  // Custom SVG Line Chart Generator for Daily/Monthly Revenue
  const renderRevenueChart = () => {
    const chartSource = chartType === 'daily' ? charts.daily : charts.monthly;
    if (!chartSource || chartSource.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
          Chưa có dữ liệu giao dịch trong khoảng thời gian này.
        </div>
      );
    }

    const values = chartSource.map(d => d.revenue);
    const maxVal = Math.max(...values, 100000);
    const minVal = 0;
    const count = chartSource.length;

    // SVG parameters
    const width = 600;
    const height = 220;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Generate path points
    const points = chartSource.map((d, index) => {
      const x = padding + (index / (count - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((d.revenue - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, ...d };
    });

    // Create Path Strings
    let linePath = '';
    let areaPath = '';

    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    }

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + chartHeight * ratio;
            const gridVal = maxVal - (maxVal - minVal) * ratio;
            return (
              <g key={idx}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#27272a"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding + 5}
                  y={y - 5}
                  fill="#71717a"
                  fontSize="10"
                  className="font-mono font-semibold"
                >
                  {formatVND(gridVal)}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

          {/* The line itself */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Highlight circles on data points */}
          {points.map((p, idx) => (
            <g key={idx} className="group/dot cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#6366f1"
                stroke="#09090b"
                strokeWidth="2"
                className="transition-all duration-200 group-hover/dot:r-6"
              />
              {/* Tooltip trigger details */}
              <title>{`${p.date || 'Tháng ' + p.month}: ${formatVND(p.revenue)}`}</title>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // Custom SVG bar chart for customer growth
  const renderCustomerGrowthChart = () => {
    const chartSource = charts.customerGrowth;
    if (!chartSource || chartSource.length === 0) {
      return (
        <div className="flex h-36 items-center justify-center text-sm text-zinc-500">
          Chưa có lượt đăng ký mới nào.
        </div>
      );
    }

    const maxCount = Math.max(...chartSource.map(d => d.count), 5);
    const count = chartSource.length;
    const width = 500;
    const height = 120;
    const padding = 15;
    const barWidth = ((width - padding * 2) / count) * 0.7;
    const spacing = ((width - padding * 2) / count) * 0.3;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
        {chartSource.map((d, index) => {
          const x = padding + index * (barWidth + spacing);
          const barHeight = ((height - padding * 2) * d.count) / maxCount;
          const y = height - padding - barHeight;

          return (
            <g key={index} className="group/bar cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill="#f43f5e"
                className="opacity-80 transition-all hover:opacity-100"
              />
              <text
                x={x + barWidth / 2}
                y={y - 4}
                fill="#fda4af"
                fontSize="8"
                textAnchor="middle"
                className="opacity-0 group-hover/bar:opacity-100 transition-opacity font-mono"
              >
                {d.count}
              </text>
              <title>{`${d.date}: ${d.count} Khách hàng mới`}</title>
            </g>
          );
        })}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#3f3f46"
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Trang Tổng Quan Analytics</h2>
          <p className="text-zinc-400 text-sm mt-1">Đo lường doanh thu, kiểm kho và thống kê chiến dịch marketing</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-semibold text-zinc-300 py-2.5 px-4 transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* KPI: Doanh thu */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-white truncate">{formatVND(stats.totalRevenue)}</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Hệ thống SQLite DB
            </p>
          </div>
        </div>

        {/* KPI: Đơn hàng */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-white">{stats.totalOrders}</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-1">
              Đơn đặt hàng ghi nhận
            </p>
          </div>
        </div>

        {/* KPI: Khách hàng */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Khách Hàng</span>
            <div className="h-8 w-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-white">{stats.totalCustomers}</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-1">
              Khách hàng đã đăng ký
            </p>
          </div>
        </div>

        {/* KPI: Tỷ lệ chuyển đổi */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tỷ Lệ Chuyển Đổi</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-white">{stats.conversionRate}%</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-1">
              Chỉ số tỷ lệ chuyển đổi
            </p>
          </div>
        </div>

        {/* KPI: Tỷ lệ hủy đơn */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tỷ Lệ Hủy Đơn</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-white">{stats.cancelRate}%</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-1">
              Đơn hàng bị từ chối/hủy
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white">Biểu Đồ Doanh Thu Doanh Nghiệp</h4>
              <p className="text-zinc-500 text-xs">Biểu đồ biểu thị tăng trưởng doanh số bán lẻ</p>
            </div>
            <div className="flex rounded-lg bg-zinc-850 p-1 border border-zinc-800">
              <button
                onClick={() => setChartType('daily')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  chartType === 'daily' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                30 Ngày
              </button>
              <button
                onClick={() => setChartType('monthly')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  chartType === 'monthly' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Các Tháng
              </button>
            </div>
          </div>

          <div className="pt-2">{renderRevenueChart()}</div>
        </div>

        {/* Customer Registration growth */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white">Chỉ Số Tăng Trưởng Khách Hàng</h4>
            <p className="text-zinc-500 text-xs">Số lượng khách hàng mới đăng ký tài khoản 30 ngày qua</p>
          </div>
          <div className="py-4">{renderCustomerGrowthChart()}</div>
          <div className="text-center bg-zinc-950 border border-zinc-800/60 p-3 rounded-xl">
            <span className="text-xs font-semibold text-zinc-400">
              Hệ thống ghi nhận tăng trưởng tốt, khách hàng mới giúp tăng chỉ số LTV (Lifetime Value) tổng thể.
            </span>
          </div>
        </div>
      </div>

      {/* Lists Section: Top Sellers & Overstock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top selling products */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
          <h4 className="text-base font-bold text-white mb-4">Sản Phẩm Bán Chạy Nhất (Top Sellers)</h4>
          <div className="divide-y divide-zinc-800/80">
            {topProducts.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">Chưa ghi nhận số liệu bán hàng thực tế.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.productId} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 h-7 w-7 rounded-lg flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&q=80'}
                      alt={p.productName}
                      className="h-10 w-10 object-cover rounded-lg bg-zinc-800 border border-zinc-700/50 shrink-0"
                    />
                    <span className="text-sm font-semibold text-zinc-200 truncate pr-4">{p.productName}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-white block">{p.totalSold} đã bán</span>
                    <span className="text-xs font-medium text-zinc-500">{formatVND(p.revenue)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overstock items alert */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-amber-500 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <h4 className="text-base font-bold text-white">Sản Phẩm Tồn Kho Vượt Định Mức</h4>
          </div>
          <div className="overflow-y-auto max-h-64 divide-y divide-zinc-800/80 pr-2">
            {overstockItems.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">Không có sản phẩm nào có lượng tồn kho vượt quá giới hạn an toàn.</p>
            ) : (
              overstockItems.map((item) => {
                let attrs = '';
                try {
                  const parsed = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : item.attributes;
                  attrs = Object.entries(parsed).map(([k, v]) => `${v}`).join(' / ');
                } catch (e) {
                  attrs = '';
                }

                return (
                  <div key={item.sku} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-sm font-semibold text-zinc-200 block">{item.productName}</span>
                      <span className="text-xs font-semibold text-zinc-500 font-mono mt-0.5 inline-block">
                        SKU: {item.sku} {attrs && `(${attrs})`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full inline-block">
                        Tồn: {item.stock}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
