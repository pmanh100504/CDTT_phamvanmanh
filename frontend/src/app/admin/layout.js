'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Image as ImageIcon,
  Users,
  Ticket,
  LogOut,
  Shield,
  Menu,
  X,
  User,
  Key,
  Database,
  Sun,
  Moon
} from 'lucide-react';
import { API_URL } from './api';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // Login states
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Check authentication status & theme on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('admin_user');
      }
    }
    const storedTheme = localStorage.getItem('admin_theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('admin_theme', newTheme);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sai thông tin đăng nhập.');
      }

      localStorage.setItem('admin_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      setLoginError(err.message || 'Lỗi kết nối tới Laravel server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    setUser(null);
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 ${
        theme === 'light' ? 'admin-light bg-slate-50' : 'bg-zinc-900'
      }`}>
        {/* Theme Toggle Button on Login Screen */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-md"
            title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>

        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md space-y-8 bg-zinc-950/70 border border-zinc-800 p-8 rounded-2xl backdrop-blur-xl shadow-2xl relative z-10">
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
              ADMIN PANEL
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-400">
              Vui lòng đăng nhập bằng tài khoản quản trị viên
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {loginError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-400">
                {loginError}
              </div>
            )}
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email đăng nhập</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-10 pr-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-10 pr-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginLoading}
                className="group relative flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/30"
              >
                {loginLoading ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-xs text-zinc-500 bg-zinc-900/80 py-1 px-3.5 rounded-full border border-zinc-800/80 inline-flex items-center gap-1.5">
                <Database className="h-3 w-3 text-emerald-500" /> Connecting to SQLite DB
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Navigation Links
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Sản phẩm & Danh mục', href: '/admin/products', icon: ShoppingBag },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Banner Marketing', href: '/admin/banners', icon: ImageIcon },
    { name: 'Khách hàng & Quyền', href: '/admin/customers', icon: Users },
    { name: 'Mã giảm giá', href: '/admin/coupons', icon: Ticket },
  ];

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${
      theme === 'light' ? 'admin-light bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'
    }`}>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-zinc-900/50 border-r border-zinc-800/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6 border-b border-zinc-800/80 gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            AP
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wider">ADMIN PANEL</h1>
            <p className="text-[10px] text-zinc-400 font-medium font-semibold uppercase tracking-wider">HỆ THỐNG QUẢN TRỊ</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/20">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
            <img
              className="h-9 w-9 rounded-full ring-2 ring-indigo-500/20 bg-zinc-800 object-cover"
              src={user.avatar || 'https://ui-avatars.com/api/?name=Admin'}
              alt={user.fullName}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/10 hover:border-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-zinc-900 border-r border-zinc-800">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex h-16 items-center px-6 border-b border-zinc-800/80 gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                AP
              </div>
              <h1 className="text-sm font-bold text-white tracking-wider">ADMIN PANEL</h1>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
              <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
                <img
                  className="h-9 w-9 rounded-full ring-2 ring-indigo-500/20"
                  src={user.avatar}
                  alt={user.fullName}
                />
                <div>
                  <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
                  <p className="text-[10px] text-indigo-400 font-semibold uppercase">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none"></div>

        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-zinc-400 hover:text-white md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Khu vực quản trị: {user.role === 'admin' ? 'Quản trị tối cao' : 'Nhân viên'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 hidden sm:inline-flex items-center gap-1.5">
              <Database className="h-3 w-3 text-emerald-500 animate-pulse" /> SQLite Database Connected
            </span>
            <div className="h-8 w-px bg-zinc-800 hidden sm:block"></div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
              title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <div className="h-8 w-px bg-zinc-800 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <img
                className="h-7 w-7 rounded-full bg-zinc-800 object-cover"
                src={user.avatar}
                alt={user.fullName}
              />
              <span className="text-xs font-medium text-zinc-300 hidden md:block">{user.fullName}</span>
            </div>
          </div>
        </header>

        {/* Subpages Body */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 relative min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
