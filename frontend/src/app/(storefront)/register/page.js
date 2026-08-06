'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Key, User, Phone } from 'lucide-react';
import { fetchStorefront } from '../../storefrontApi';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await fetchStorefront('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password
        })
      });

      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...');
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Lỗi xảy ra trong quá trình đăng ký.');
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
          <h2 className="mt-6 text-center text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight">Đăng ký tài khoản</h2>
          <p className="mt-2 text-center text-xs text-zinc-400 font-semibold uppercase tracking-wider">Tạo tài khoản mua sắm tiện lợi</p>
        </div>

        {success && (
          <div className="p-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 font-semibold">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-200 font-semibold">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleRegisterSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Họ và tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Địa chỉ Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="09XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mật khẩu</label>
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
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow shadow-indigo-600/10 active:scale-95 cursor-pointer disabled:opacity-50 pt-2"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-zinc-500 font-semibold">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-black">
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
