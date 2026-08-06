'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, Key } from 'lucide-react';
import { fetchStorefront } from '../../storefrontApi';
import { useStore } from '../layout';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCustomer } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchStorefront('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Save customer to local storage
      localStorage.setItem('customer_user', JSON.stringify(data.user));
      setCustomer(data.user);
      
      // Redirect
      router.push(`/${redirectUrl === '/' ? '' : redirectUrl}`);
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-50">
      {/* Background visual shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-rose-500/5 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 bg-white border border-zinc-200 p-8 rounded-2xl shadow-xl relative z-10">
        <div>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight">Đăng nhập tài khoản</h2>
          <p className="mt-2 text-center text-xs text-zinc-400 font-semibold uppercase tracking-wider">Chào mừng bạn trở lại cửa hàng</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-200 font-semibold">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email hoặc Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mật khẩu</label>
                <span className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">Quên mật khẩu?</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow shadow-indigo-600/10 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-zinc-500 font-semibold">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-black">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 h-[60vh] items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
