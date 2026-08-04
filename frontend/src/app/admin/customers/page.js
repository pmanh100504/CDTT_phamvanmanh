'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import {
  Search,
  Users,
  Shield,
  Award,
  DollarSign,
  Lock,
  Unlock,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Phone
} from 'lucide-react';

export default function CustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const url = `/customers?${roleFilter ? `role=${roleFilter}&` : ''}${search ? `search=${search}` : ''}`;
      const data = await fetchApi(url);
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, search]);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const actionText = newStatus === 'blocked' ? 'KHÓA' : 'MỞ KHÓA';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản người dùng này không?`)) return;

    try {
      await fetchApi(`/customers/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus })
      });
      loadUsers();
    } catch (err) {
      alert(err.message || 'Lỗi thay đổi trạng thái tài khoản.');
    }
  };

  const handleChangeRole = async (id, newRole) => {
    if (!confirm(`Bạn có muốn thay đổi vai trò của tài khoản này sang "${newRole.toUpperCase()}" không?`)) return;

    try {
      await fetchApi(`/customers/${id}/role`, {
        method: 'POST',
        body: JSON.stringify({ role: newRole })
      });
      loadUsers();
    } catch (err) {
      alert(err.message || 'Lỗi thay đổi phân quyền.');
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading && users.length === 0) {
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
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Khách Hàng & Phân Quyền</h2>
          <p className="text-zinc-400 text-sm mt-1">Quản lý tài khoản người dùng, tích lũy điểm thưởng loyalty, Lifetime Value (LTV) và phân quyền vai trò (RBAC)</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, điện thoại..."
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none sm:text-xs"
          />
        </div>

        {/* Role filters */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="block w-full md:w-auto rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-zinc-300 focus:border-indigo-500 focus:outline-none text-xs"
        >
          <option value="">Tất cả vai trò</option>
          <option value="customer">Khách hàng (Customer)</option>
          <option value="staff">Nhân viên (Staff)</option>
          <option value="admin">Quản trị viên (Admin)</option>
        </select>
      </div>

      {/* Users table list */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
        <div className="overflow-x-auto rounded-xl border border-zinc-850">
          <table className="min-w-full divide-y divide-zinc-850 text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/35 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th scope="col" className="px-4 py-3.5">Người dùng</th>
                <th scope="col" className="px-4 py-3.5">Liên hệ</th>
                <th scope="col" className="px-4 py-3.5">Vai trò (RBAC)</th>
                <th scope="col" className="px-4 py-3.5 text-center">Tích điểm (Loyalty)</th>
                <th scope="col" className="px-4 py-3.5 text-center">Giá trị vòng đời LTV</th>
                <th scope="col" className="px-4 py-3.5 text-center">Trạng thái</th>
                <th scope="col" className="px-4 py-3.5 text-right">Khóa/Mở khóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        className="h-10 w-10 rounded-full ring-2 ring-zinc-800 bg-zinc-850 object-cover shrink-0"
                        src={u.avatar || 'https://ui-avatars.com/api/?name=User'}
                        alt={u.fullName}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate max-w-[180px]">{u.fullName}</span>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">ID: {u.id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                      <Mail className="h-3 w-3 text-zinc-500" />
                      <span>{u.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                      <Phone className="h-3 w-3 text-zinc-500" />
                      <span>{u.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-350 focus:border-indigo-500 focus:outline-none font-semibold text-[11px]"
                    >
                      <option value="customer">Khách hàng (Customer)</option>
                      <option value="staff">Nhân viên (Staff)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 rounded-full">
                      <Award className="h-3 w-3" /> {u.points} pts
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-indigo-400 font-mono">
                    {formatVND(u.ltv || 0)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {u.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px]">
                        <CheckCircle className="h-2.5 w-2.5" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px]">
                        <XCircle className="h-2.5 w-2.5" /> Bị khóa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      className={`p-2 border rounded-xl transition-all ${
                        u.status === 'active'
                          ? 'border-rose-500/25 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {u.status === 'active' ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-zinc-500">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
