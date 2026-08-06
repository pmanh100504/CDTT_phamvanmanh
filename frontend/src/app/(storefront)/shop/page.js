'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Filter, 
  ChevronRight, 
  Star, 
  ShoppingBag, 
  SlidersHorizontal,
  XCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { fetchStorefront } from '../../storefrontApi';
import { useStore } from '../layout';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateCartState, toggleWishlist, wishlist } = useStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active filters in local state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [sort, setSort] = useState('newest');

  // Search keyword from query parameters
  const searchKeyword = searchParams.get('search') || '';

  // Options lists
  const brands = ['JM'];
  const colors = ['Black', 'White', 'Yellow', 'Blue', 'Red', 'Gray', 'Pink', 'Trắng', 'Đen', 'Kem', 'Hồng', 'Vàng'];
  const sizes = ['S', 'M', 'L', 'XL'];

  // Sync categoryId and search keyword from URL search params
  useEffect(() => {
    const catId = searchParams.get('categoryId') || '';
    setSelectedCategory(catId);
  }, [searchParams]);

  // Fetch products whenever filters or sort changes
  const loadFilteredProducts = async () => {
    setLoading(true);
    try {
      let queryParts = [];
      if (selectedCategory) queryParts.push(`categoryId=${selectedCategory}`);
      if (selectedBrand) queryParts.push(`brand=${selectedBrand}`);
      if (minPrice) queryParts.push(`minPrice=${minPrice}`);
      if (maxPrice) queryParts.push(`maxPrice=${maxPrice}`);
      if (selectedColor) queryParts.push(`color=${selectedColor}`);
      if (selectedSize) queryParts.push(`size=${selectedSize}`);
      if (selectedRating) queryParts.push(`rating=${selectedRating}`);
      if (searchKeyword) queryParts.push(`search=${encodeURIComponent(searchKeyword)}`);
      if (sort) queryParts.push(`sort=${sort}`);

      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const items = await fetchStorefront(`/products${queryString}`);
      setProducts(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilteredProducts();
  }, [selectedCategory, selectedBrand, minPrice, maxPrice, selectedColor, selectedSize, selectedRating, sort, searchKeyword]);

  // Load categories for sidebar on mount
  useEffect(() => {
    fetchStorefront('/categories')
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColor('');
    setSelectedSize('');
    setSelectedRating('');
    setSort('newest');
    router.push('/shop'); // clear URL parameters too
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
      {/* 1. Left Filters Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6 bg-white p-6 rounded-2xl border border-zinc-200 h-fit">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h4 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-indigo-500" /> Bộ lọc tìm kiếm
          </h4>
          <button 
            onClick={handleClearFilters}
            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer"
          >
            <X className="h-3 w-3" /> Xóa lọc
          </button>
        </div>

        {/* Category list */}
        <div className="space-y-2">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Danh mục</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Brand selection */}
        <div className="space-y-2">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Thương hiệu</span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  selectedBrand === b 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Price range inputs */}
        <div className="space-y-2">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Khoảng giá (VND)</span>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Từ"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs focus:outline-none"
            />
            <span className="text-zinc-400 text-xs">-</span>
            <input
              type="number"
              placeholder="Đến"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Colors filter */}
        <div className="space-y-2">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Màu sắc</span>
          <div className="flex flex-wrap gap-1.5">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  selectedColor === color 
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Sizes filter */}
        <div className="space-y-2">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kích thước (Size)</span>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  selectedSize === size 
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Star Rating filter */}
        <div className="space-y-2">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Đánh giá sao</span>
          <div className="space-y-1.5 pt-1">
            {[5, 4, 3].map(stars => (
              <button
                key={stars}
                onClick={() => setSelectedRating(selectedRating == stars ? '' : stars)}
                className={`flex w-full items-center gap-1.5 text-xs font-semibold p-1.5 rounded-lg border transition-all cursor-pointer ${
                  selectedRating == stars
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-transparent text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < stars ? 'fill-amber-400' : 'text-zinc-200'}`} />
                  ))}
                </div>
                <span>{stars === 5 ? '5 sao tuyệt đối' : `${stars}+ sao trở lên`}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 2. Products List Area */}
      <section className="flex-1 space-y-6">
        {/* Search header & sort bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200">
          <div>
            <h2 className="text-md font-extrabold text-zinc-950">
              {searchKeyword ? `Kết quả tìm kiếm cho: "${searchKeyword}"` : 'Tất cả sản phẩm'}
            </h2>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5 tracking-wider">
              {products.length} sản phẩm tìm thấy
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">Sắp xếp:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá tốt nhất</option>
            </select>
          </div>
        </div>

        {/* Loading / Empty states */}
        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-zinc-200 text-center space-y-4">
            <XCircle className="h-12 w-12 text-zinc-300" />
            <h4 className="text-sm font-bold text-zinc-800">Không tìm thấy sản phẩm tương thích</h4>
            <p className="text-xs text-zinc-400 max-w-sm">Hãy thử thay đổi từ khóa hoặc điều kiện lọc ở cột bên trái.</p>
            <button 
              onClick={handleClearFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          /* Grid of Products */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const primaryVariant = product.variants && product.variants[0];
              const price = primaryVariant ? primaryVariant.price : 0;
              const promoPrice = primaryVariant ? primaryVariant.promoPrice : null;
              const hasDiscount = promoPrice !== null && promoPrice < price;
              const discountPercent = hasDiscount ? Math.round(((price - promoPrice) / price) * 100) : 0;

              return (
                <div key={product.id} className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-indigo-500/50 transition-all flex flex-col h-full">
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

                  {/* Details */}
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
                      {/* Pricing */}
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
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow shadow-indigo-600/10 hover:shadow-indigo-500/20"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> Thêm giỏ hàng
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 h-[60vh] items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
