'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Star, 
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { fetchStorefront } from '../storefrontApi';
import { useStore } from './layout';

const categoryIcons = {
  'dam': 'https://pos.nvncdn.com/790194-223281/pc/20260421_AyyZrh0d.png?v=1776734769',
  'ao': 'https://pos.nvncdn.com/790194-223281/pc/20260421_Vx9zZG0E.png?v=1776734782',
  'quan': 'https://pos.nvncdn.com/790194-223281/pc/20260421_x3pT8ZKT.png?v=1776734797',
  'chan-vay': 'https://pos.nvncdn.com/790194-223281/pc/20260421_zxUVluNF.png?v=1776734835',
  'ao-khoac': 'https://pos.nvncdn.com/790194-223281/pc/20260421_1gMHeprx.png?v=1776734845',
  'sale': 'https://web.static.nvncdn.com/tp/T0356/img/001-dress1.png',
  'phu-kien': 'https://web.static.nvncdn.com/tp/T0356/img/001-dress1.png',
  'khoi-nguon-tinh-khoi': 'https://pos.nvncdn.com/790194-223281/pc/20260421_AyyZrh0d.png?v=1776734769',
  'lookbook': 'https://pos.nvncdn.com/790194-223281/pc/20260421_1gMHeprx.png?v=1776734845',
  'bst-moi': 'https://pos.nvncdn.com/790194-223281/pc/20260421_AyyZrh0d.png?v=1776734769'
};

export default function Homepage() {
  const router = useRouter();
  const { updateCartState, toggleWishlist, wishlist } = useStore();
  
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load home data
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [bannerData, catData, prodData] = await Promise.all([
          fetchStorefront('/banners'),
          fetchStorefront('/categories'),
          fetchStorefront('/products')
        ]);
        
        setBanners(bannerData);
        setCategories(catData.filter(c => !c.parentId).slice(0, 10)); // up to 10 parent categories
        setNewProducts(prodData.slice(0, 4)); // top 4 newest
        
        // sort by rating average for best sellers
        const sortedBest = [...prodData].sort((a, b) => b.ratingAverage - a.ratingAverage);
        setBestProducts(sortedBest.slice(0, 4));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Banner Auto-slider
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleBannerClick = async (banner) => {
    try {
      await fetchStorefront(`/banners/${banner.id}/track`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    if (banner.targetUrl) {
      router.push(banner.targetUrl);
    }
  };

  const handleQuickAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Choose the first variant automatically
    if (!product.variants || product.variants.length === 0) {
      alert('Sản phẩm đã hết hàng.');
      return;
    }
    
    const variant = product.variants[0];
    try {
      await fetchStorefront('/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          sku: variant.sku,
          quantity: 1
        })
      });
      updateCartState();
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      alert(err.message || 'Lỗi thêm vào giỏ hàng.');
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-1 h-[60vh] items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-zinc-500">Đang tải cửa hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Banner Slider Section */}
      {banners.length > 0 && (
        <div className="relative h-[250px] sm:h-auto sm:aspect-[1520/475] w-full overflow-hidden bg-zinc-900 shadow-lg">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              onClick={() => handleBannerClick(banner)}
              className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-95 pointer-events-none'
              }`}
            >
              <img
                src={banner.desktopImage}
                alt={banner.title}
                className="h-full w-full object-cover hidden sm:block"
              />
              <img
                src={banner.mobileImage || banner.desktopImage}
                alt={banner.title}
                className="h-full w-full object-cover sm:hidden"
              />
              {/* Slide text overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 flex items-end p-6 sm:p-12">
                <div className="max-w-xl text-white space-y-2 sm:space-y-4">
                  <span className="inline-block bg-zinc-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Khuyến mãi cực hot</span>
                  <h2 className="text-xl sm:text-4xl font-extrabold tracking-tight leading-tight">{banner.title}</h2>
                  <p className="text-xs sm:text-sm text-zinc-300 font-medium">Click ngay để nhận ưu đãi từ JM Dress Design!</p>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-indigo-600 hover:scale-105 transition-all z-20 cursor-pointer shadow"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(prev => (prev + 1) % banners.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-indigo-600 hover:scale-105 transition-all z-20 cursor-pointer shadow"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? 'w-6 bg-indigo-600' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <h3 className="text-xl font-extrabold text-zinc-950 tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> Danh mục nổi bật
            </h3>
            <Link href="/shop" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?categoryId=${c.id}`}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-zinc-200 hover:border-zinc-950 hover:shadow-xl hover:shadow-zinc-950/5 transition-all text-center group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-zinc-800 font-extrabold mb-3 group-hover:scale-110 transition-all border border-zinc-100 overflow-hidden p-2">
                  <img 
                    src={categoryIcons[c.slug] || 'https://web.static.nvncdn.com/tp/T0356/img/001-dress1.png'} 
                    alt={c.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-xs font-bold text-zinc-800 group-hover:text-zinc-950 transition-colors truncate w-full">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Selling Points banner */}
      <section className="bg-white border-y border-zinc-200 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <Zap className="h-6 w-6 text-indigo-600 mx-auto" />
            <h5 className="text-xs font-bold text-zinc-900">Giao hàng hỏa tốc</h5>
            <p className="text-[10px] text-zinc-500">Giao trong 2 giờ tại nội thành</p>
          </div>
          <div className="space-y-1">
            <ShieldCheck className="h-6 w-6 text-indigo-600 mx-auto" />
            <h5 className="text-xs font-bold text-zinc-900">Chất lượng tối cao</h5>
            <p className="text-[10px] text-zinc-500">100% sản phẩm chính hãng</p>
          </div>
          <div className="space-y-1">
            <RotateCcw className="h-6 w-6 text-indigo-600 mx-auto" />
            <h5 className="text-xs font-bold text-zinc-900">Dễ dàng đổi trả</h5>
            <p className="text-[10px] text-zinc-500">Hỗ trợ đổi mới trong 7 ngày</p>
          </div>
          <div className="space-y-1">
            <Zap className="h-6 w-6 text-indigo-600 mx-auto" />
            <h5 className="text-xs font-bold text-zinc-900">Mua sắm tích điểm</h5>
            <p className="text-[10px] text-zinc-500">Hoàn tiền 1% qua điểm thưởng</p>
          </div>
        </div>
      </section>

      {/* New Arrivals Product Grid */}
      {newProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-950 tracking-tight">Sản phẩm mới ra mắt</h3>
              <p className="text-zinc-500 text-xs mt-1">Khám phá các thiết kế thời trang nữ mới nhất thiết kế bởi JM</p>
            </div>
            <Link href="/shop?sort=newest" className="text-xs font-bold text-zinc-800 hover:text-zinc-950 flex items-center gap-1 shrink-0 border-b border-zinc-250 hover:border-zinc-950 transition-all">
              Xem thêm <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => {
              const primaryVariant = product.variants && product.variants[0];
              const price = primaryVariant ? primaryVariant.price : 0;
              const promoPrice = primaryVariant ? primaryVariant.promoPrice : null;
              const hasDiscount = promoPrice !== null && promoPrice < price;
              const discountPercent = hasDiscount ? Math.round(((price - promoPrice) / price) * 100) : 0;

              return (
                <div key={product.id} className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-zinc-950 transition-all flex flex-col h-full">
                  {/* Badge */}
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full z-10">
                      -{discountPercent}% OFF
                    </span>
                  )}

                  {/* Thumbnail */}
                  <Link href={`/products/${product.id}`} className="relative block pt-[100%] bg-zinc-100 overflow-hidden shrink-0">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80'}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                  </Link>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{product.brand}</span>
                      <Link href={`/products/${product.id}`} className="block">
                        <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 hover:text-indigo-600 transition-colors h-8">
                          {product.name}
                        </h4>
                      </Link>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-amber-400 pt-1">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span className="text-[10px] font-bold text-zinc-700">{product.ratingAverage || 5.0}</span>
                        <span className="text-[9px] text-zinc-400 font-medium">({product.ratingCount || 0})</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Price */}
                      <div>
                        {hasDiscount ? (
                          <div className="space-y-0.5">
                            <span className="text-xs text-zinc-400 line-through block font-medium">{formatVND(price)}</span>
                            <span className="text-sm font-black text-rose-600">{formatVND(promoPrice)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-black text-zinc-950 block">{formatVND(price)}</span>
                        )}
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={(e) => handleQuickAddToCart(e, product)}
                        className="w-full py-2 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-zinc-800 shadow-sm shadow-zinc-950/10 cursor-pointer active:scale-95 transition-all"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> Thêm giỏ hàng
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Best Sellers / Top Rated Section */}
      {bestProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-950 tracking-tight">Sản phẩm bán chạy nổi bật</h3>
              <p className="text-zinc-500 text-xs mt-1">Những thiết kế thời trang bán chạy nhất được yêu thích từ khách hàng của JM</p>
            </div>
            <Link href="/shop?sort=rating" className="text-xs font-bold text-zinc-800 hover:text-zinc-950 flex items-center gap-1 shrink-0 border-b border-zinc-250 hover:border-zinc-950 transition-all">
              Xem thêm <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestProducts.map((product) => {
              const primaryVariant = product.variants && product.variants[0];
              const price = primaryVariant ? primaryVariant.price : 0;
              const promoPrice = primaryVariant ? primaryVariant.promoPrice : null;
              const hasDiscount = promoPrice !== null && promoPrice < price;
              const discountPercent = hasDiscount ? Math.round(((price - promoPrice) / price) * 100) : 0;

              return (
                <div key={product.id} className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-zinc-950 transition-all flex flex-col h-full">
                  {/* Badge */}
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full z-10">
                      -{discountPercent}% OFF
                    </span>
                  )}

                  {/* Thumbnail */}
                  <Link href={`/products/${product.id}`} className="relative block pt-[100%] bg-zinc-100 overflow-hidden shrink-0">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80'}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                  </Link>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{product.brand}</span>
                      <Link href={`/products/${product.id}`} className="block">
                        <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 hover:text-indigo-600 transition-colors h-8">
                          {product.name}
                        </h4>
                      </Link>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-amber-400 pt-1">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span className="text-[10px] font-bold text-zinc-700">{product.ratingAverage || 5.0}</span>
                        <span className="text-[9px] text-zinc-400 font-medium">({product.ratingCount || 0})</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Price */}
                      <div>
                        {hasDiscount ? (
                          <div className="space-y-0.5">
                            <span className="text-xs text-zinc-400 line-through block font-medium">{formatVND(price)}</span>
                            <span className="text-sm font-black text-rose-600">{formatVND(promoPrice)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-black text-zinc-950 block">{formatVND(price)}</span>
                        )}
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={(e) => handleQuickAddToCart(e, product)}
                        className="w-full py-2 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-zinc-800 shadow-sm shadow-zinc-950/10 cursor-pointer active:scale-95 transition-all"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> Thêm giỏ hàng
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
