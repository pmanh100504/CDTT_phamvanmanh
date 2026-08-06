'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Compass,
  ShoppingBag,
  Sparkles,
  UserCheck,
  ClipboardList
} from 'lucide-react';
import { fetchStorefront } from '../storefrontApi';

// Context to share cart and wishlist states across storefront pages
const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export default function StorefrontLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load customer, cart, wishlist, and categories on mount
  useEffect(() => {
    // 1. Customer
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      try {
        setCustomer(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('customer_user');
      }
    }

    // 2. Wishlist
    const storedWish = localStorage.getItem('wishlist');
    if (storedWish) {
      try {
        setWishlist(JSON.parse(storedWish));
      } catch (e) {
        setWishlist([]);
      }
    }

    // 3. Load categories
    fetchStorefront('/categories')
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  // Sync cart from server when customer login state changes
  const loadCart = async () => {
    if (customer) {
      try {
        const items = await fetchStorefront('/cart');
        setCart(items);
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    } else {
      // Guest cart from localStorage
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        try {
          setCart(JSON.parse(guestCart));
        } catch (e) {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
  };

  useEffect(() => {
    loadCart();
  }, [customer]);

  // Handle Search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const items = await fetchStorefront(`/products?search=${searchQuery}`);
        setSuggestions(items.slice(0, 5)); // show top 5 suggestions
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_user');
    setCustomer(null);
    setCart([]);
    router.push('/login');
  };

  // Add/Remove from Wishlist helper
  const toggleWishlist = (productId) => {
    let updated;
    if (wishlist.includes(productId)) {
      updated = wishlist.filter(id => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  // Trigger loadCart from anywhere
  const updateCartState = () => {
    loadCart();
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider value={{ customer, setCustomer, cart, cartCount, updateCartState, wishlist, toggleWishlist, categories }}>
      <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900">
        {/* Top announcement bar */}
        <div className="bg-zinc-950 px-4 py-2.5 text-center text-[10px] font-bold text-white uppercase tracking-wider">
          ✨ Miễn phí giao hàng cho đơn hàng từ 500.000đ | Tích điểm thưởng 1% nhận quà cực khủng!
        </div>

        {/* Sticky Header Navigation */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-150 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white font-extrabold transition-all shadow-md group-hover:scale-105">
                  JM
                </div>
                <span className="text-sm font-black tracking-widest text-zinc-950 uppercase font-serif">JM Dress Design</span>
              </Link>
              
              {/* Desktop Nav menu */}
              <nav className="hidden lg:flex items-center gap-6">
                <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-zinc-950 transition-all">
                  Cửa hàng
                </Link>
                {/* Main fashion categories */}
                {categories.filter(c => !c.parentId && c.id !== 'cat-phu-kien' && c.id !== 'cat-sale').map(category => (
                  <Link
                    key={category.id}
                    href={`/shop?categoryId=${category.id}`}
                    className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition-all"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Smart Search Bar */}
            <div className="hidden md:block flex-1 max-w-xs mx-8 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Bạn muốn tìm sản phẩm gì?..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-4 pr-10 text-xs font-semibold focus:border-zinc-400 focus:bg-white focus:outline-none transition-all placeholder-zinc-400"
                />
                <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-950">
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {/* Suggestions Popup */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-zinc-100 bg-white p-2 shadow-2xl z-50 animate-in fade-in duration-200">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-50">Sản phẩm gợi ý</div>
                  {suggestions.map(p => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 rounded-xl p-2 hover:bg-zinc-50 group transition-all"
                    >
                      <img src={p.images[0]} alt={p.name} className="h-9 w-9 rounded-lg object-cover bg-zinc-50 border border-zinc-200" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-800 truncate group-hover:text-indigo-600">{p.name}</p>
                        <p className="text-[10px] text-zinc-400 font-semibold">{p.brand}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Icons / Profile */}
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative p-2 text-zinc-700 hover:text-zinc-950 transition-all cursor-pointer">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/shop" className="p-2 text-zinc-700 hover:text-zinc-950 transition-all relative hidden xs:block">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </Link>

              {/* Profile dropdown */}
              {customer ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 cursor-pointer">
                    <img
                      src={customer.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(customer.fullName)}
                      alt={customer.fullName}
                      className="h-7 w-7 rounded-full border border-zinc-200 object-cover shadow-sm bg-zinc-50"
                    />
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-zinc-150 bg-white p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="border-b border-zinc-100 px-4 py-2.5">
                      <p className="text-xs font-bold text-zinc-800 truncate">{customer.fullName}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
                        ✨ {customer.points || 0} Điểm tích lũy
                      </p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-all mt-1">
                      <UserCheck className="h-4 w-4" /> Hồ sơ cá nhân
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-all">
                      <ClipboardList className="h-4 w-4" /> Lịch sử đơn hàng
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all text-left cursor-pointer">
                      <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-all shadow shadow-zinc-950/10"
                >
                  <User className="h-3.5 w-3.5" /> Đăng nhập
                </Link>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-zinc-700 hover:text-zinc-950 transition-all"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-zinc-200 bg-white px-4 py-6 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Bạn muốn tìm sản phẩm gì?..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-4 pr-10 text-xs font-semibold focus:border-zinc-400 focus:outline-none"
              />
              <button type="submit" className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <nav className="flex flex-col gap-3">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold uppercase tracking-wider text-zinc-800 hover:text-zinc-950 py-1"
              >
                Tất cả sản phẩm
              </Link>
              <div className="border-t border-zinc-100 pt-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Danh mục</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.filter(c => !c.parentId).map(category => (
                    <Link
                      key={category.id}
                      href={`/shop?categoryId=${category.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-zinc-600 hover:text-zinc-950 py-1"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}

        {/* Content body */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Beautiful Footer */}
        <footer className="bg-zinc-950 text-zinc-400 py-16 shrink-0 border-t border-zinc-900 font-sans">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-zinc-950 font-black">
                  JM
                </div>
                <span className="text-sm font-black tracking-widest text-white font-serif uppercase">JM DRESS DESIGN</span>
              </div>
              <p className="text-xs leading-6 text-zinc-500 font-medium">
                Chuỗi cửa hàng thời trang công sở nữ JM thanh lịch, hiện đại. Chất liệu cao cấp, mẫu mã thiết kế đa dạng: quần áo, váy đầm xuân hè, vest, blazer, áo khoác.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-5">Danh mục nổi bật</h4>
              <ul className="space-y-3 text-xs font-semibold text-zinc-500">
                {categories.filter(c => !c.parentId).slice(0, 5).map(c => (
                  <li key={c.id}>
                    <Link href={`/shop?categoryId=${c.id}`} className="hover:text-white transition-all">{c.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-5">Chăm sóc khách hàng</h4>
              <ul className="space-y-3 text-xs font-semibold text-zinc-500">
                <li><a href="/orders" className="hover:text-white transition-all">Thông tin vận chuyển</a></li>
                <li><span className="hover:text-white transition-all cursor-pointer">Chính sách tích điểm</span></li>
                <li><span className="hover:text-white transition-all cursor-pointer">Chính sách đổi trả hàng</span></li>
                <li><span className="hover:text-white transition-all cursor-pointer">Chính sách bảo mật</span></li>
                <li><span className="hover:text-white transition-all cursor-pointer">Chế độ bảo hành trọn đời</span></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-5">Đăng ký nhận ưu đãi</h4>
              <p className="text-xs leading-5 text-zinc-500 font-medium">
                Đăng ký nhận thông tin khuyến mãi và các bộ sưu tập thời trang thiết kế mới nhất từ JM.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 flex-1 font-semibold"
                />
                <button className="bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 pt-6 border-t border-zinc-900 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            © 2009-{new Date().getFullYear()} JM DRESS DESIGN. Tất cả quyền được bảo lưu.
          </div>
        </footer>
      </div>
    </StoreContext.Provider>
  );
}
