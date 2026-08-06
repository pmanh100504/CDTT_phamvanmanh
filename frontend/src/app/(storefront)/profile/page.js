'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  MapPin, 
  Sparkles, 
  Trash2, 
  ShieldCheck, 
  Phone, 
  Mail,
  UserCheck
} from 'lucide-react';
import { fetchStorefront } from '../../storefrontApi';
import { useStore } from '../layout';

export default function ProfilePage() {
  const router = useRouter();
  const { customer, setCustomer } = useStore();

  const [loading, setLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');
  const [addressBook, setAddressBook] = useState([]);

  // New Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    province: 'Hà Nội',
    district: '',
    ward: '',
    detailAddress: ''
  });

  useEffect(() => {
    if (!customer) {
      router.push('/login?redirect=profile');
      return;
    }

    setFullName(customer.fullName || '');
    setPhone(customer.phone || '');
    setAvatar(customer.avatar || '');
    setAddressBook(customer.addressBook || []);
  }, [customer]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setLoading(true);

    try {
      const data = await fetchStorefront('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          phone,
          avatar,
          addressBook,
          password: password || undefined
        })
      });

      setCustomer(data.user);
      localStorage.setItem('customer_user', JSON.stringify(data.user));
      setProfileSuccess('Cập nhật hồ sơ cá nhân thành công!');
      setPassword(''); // clear password field
    } catch (err) {
      setProfileError(err.message || 'Lỗi cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.district || !newAddress.ward || !newAddress.detailAddress) {
      alert('Vui lòng điền đầy đủ thông tin địa chỉ.');
      return;
    }

    const updatedAddresses = [...addressBook, newAddress];
    setLoading(true);
    try {
      const data = await fetchStorefront('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          phone,
          avatar,
          addressBook: updatedAddresses
        })
      });

      setCustomer(data.user);
      localStorage.setItem('customer_user', JSON.stringify(data.user));
      setAddressBook(data.user.addressBook);
      setShowAddressForm(false);
      setNewAddress({
        fullName: '',
        phone: '',
        province: 'Hà Nội',
        district: '',
        ward: '',
        detailAddress: ''
      });
      setProfileSuccess('Đã thêm địa chỉ mới vào sổ địa chỉ!');
    } catch (err) {
      alert(err.message || 'Lỗi thêm địa chỉ mới.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!confirm('Bạn có muốn xóa địa chỉ này?')) return;

    const updatedAddresses = addressBook.filter((_, i) => i !== index);
    setLoading(true);
    try {
      const data = await fetchStorefront('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          phone,
          avatar,
          addressBook: updatedAddresses
        })
      });

      setCustomer(data.user);
      localStorage.setItem('customer_user', JSON.stringify(data.user));
      setAddressBook(data.user.addressBook);
      setProfileSuccess('Đã xóa địa chỉ thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi xóa địa chỉ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      <h1 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight">Tài khoản cá nhân</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Profile edit form */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-2xl space-y-6">
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
            <User className="h-4.5 w-4.5 text-indigo-500" /> Thông tin cá nhân
          </h3>

          {profileSuccess && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 font-semibold">
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-200 font-semibold">
              {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs focus:outline-none focus:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Đường dẫn ảnh đại diện (Avatar URL)</label>
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Đổi mật khẩu (Bỏ trống nếu không thay đổi)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              Lưu thay đổi
            </button>
          </form>
        </div>

        {/* Right Side: Points & Address Book */}
        <div className="space-y-6">
          {/* Rewards points card */}
          {customer && (
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
                <Sparkles className="h-4.5 w-4.5 text-indigo-500" /> Tích lũy điểm thưởng
              </h4>
              <div className="text-center py-4 space-y-1 bg-indigo-50/55 border border-indigo-100 rounded-2xl">
                <span className="text-3xl font-black text-indigo-600 block">{customer.points || 0}</span>
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Điểm khả dụng</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                * Dùng điểm khi thanh toán: 1 điểm quy đổi thành 1,000 đ giảm trực tiếp trên đơn hàng.
              </p>
            </div>
          )}

          {/* Sổ địa chỉ */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <MapPin className="h-4.5 w-4.5 text-indigo-500" /> Sổ địa chỉ giao hàng
            </h4>

            {addressBook.length > 0 ? (
              <div className="space-y-3">
                {addressBook.map((addr, idx) => (
                  <div key={idx} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl relative text-xs font-semibold text-zinc-600 space-y-1">
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Xóa địa chỉ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="font-bold text-zinc-800">{addr.fullName}</div>
                    <div className="text-[10px] text-zinc-400 font-medium">{addr.phone}</div>
                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed pr-6">
                      {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic text-center py-2">Bạn chưa lưu địa chỉ giao hàng nào.</p>
            )}

            {!showAddressForm ? (
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs uppercase transition-all cursor-pointer text-center"
              >
                + Thêm địa chỉ mới
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="space-y-3 bg-zinc-50 p-4 border border-zinc-150 rounded-xl">
                <h5 className="text-xs font-bold text-zinc-800">Thêm địa chỉ nhận</h5>
                
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Họ tên người nhận"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Tỉnh/Thành phố"
                    value={newAddress.province}
                    onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Quận/Huyện"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Phường/Xã"
                    value={newAddress.ward}
                    onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Địa chỉ chi tiết (số nhà, ngõ...)"
                    value={newAddress.detailAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, detailAddress: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-600 font-bold text-[10px] cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-500 transition-all cursor-pointer"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
