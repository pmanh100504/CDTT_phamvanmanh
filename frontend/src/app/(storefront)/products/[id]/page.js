'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  Info,
  Calendar,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react';
import { fetchStorefront } from '../../../storefrontApi';
import { useStore } from '../../layout';

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const { updateCartState, toggleWishlist, wishlist, customer } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection states
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', images: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const loadProductDetails = async () => {
    try {
      const data = await fetchStorefront(`/products/${productId}`);
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0]);
      }
      
      // Auto-select first variant's attributes
      if (data.variants && data.variants.length > 0) {
        const firstVar = data.variants[0];
        setSelectedVariant(firstVar);
        if (firstVar.attributes) {
          setSelectedColor(firstVar.attributes.color || '');
          setSelectedSize(firstVar.attributes.size || '');
        }
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải chi tiết sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  // Update variant when color or size selections change
  useEffect(() => {
    if (!product || !product.variants) return;
    
    const matched = product.variants.find(v => {
      const colorMatch = !v.attributes.color || v.attributes.color === selectedColor;
      const sizeMatch = !v.attributes.size || v.attributes.size === selectedSize;
      return colorMatch && sizeMatch;
    });

    if (matched) {
      setSelectedVariant(matched);
    } else {
      // If no exact match, keep previous or set to null
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize, product]);

  const handleAddToCart = async (directBuy = false) => {
    if (!selectedVariant) {
      alert('Vui lòng chọn đầy đủ phân loại (Màu sắc / Kích thước).');
      return;
    }

    if (selectedVariant.stock <= 0) {
      alert('Sản phẩm tạm thời hết hàng.');
      return;
    }

    try {
      await fetchStorefront('/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          sku: selectedVariant.sku,
          quantity: quantity
        })
      });
      updateCartState();
      
      if (directBuy) {
        router.push('/cart');
      } else {
        alert('Đã thêm sản phẩm vào giỏ hàng thành công!');
      }
    } catch (err) {
      alert(err.message || 'Lỗi thêm vào giỏ hàng.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!customer) {
      setReviewError('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }

    try {
      const imagesArr = reviewForm.images.trim() ? [reviewForm.images.trim()] : [];
      await fetchStorefront(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          images: imagesArr
        })
      });
      
      setReviewSuccess('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
      setReviewForm({ rating: 5, comment: '', images: '' });
      loadProductDetails(); // Reload page reviews & rating averages
    } catch (err) {
      setReviewError(err.message || 'Đánh giá thất bại. Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận được hàng (Trạng thái Completed).');
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-1 h-[60vh] items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-md p-12 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-zinc-800">Đã xảy ra lỗi</h3>
        <p className="text-xs text-zinc-500">{error || 'Không tìm thấy sản phẩm này'}</p>
        <Link href="/shop" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  // Get unique colors and sizes from variants list
  const availableColors = Array.from(new Set(
    product.variants.map(v => v.attributes.color).filter(Boolean)
  ));
  const availableSizes = Array.from(new Set(
    product.variants.map(v => v.attributes.size).filter(Boolean)
  ));

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
        <Link href="/" className="hover:text-indigo-600">Trang chủ</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-indigo-600">Cửa hàng</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-600 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Showcase section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200">
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          <div className="relative pt-[100%] rounded-2xl bg-zinc-50 overflow-hidden border border-zinc-200">
            <img
              src={selectedImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border shrink-0 bg-zinc-50 transition-all ${
                    selectedImage === img ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{product.brand}</span>
            <h1 className="text-lg sm:text-2xl font-black text-zinc-950 leading-tight">{product.name}</h1>
            
            {/* Stars */}
            <div className="flex items-center gap-1.5 text-amber-400">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4.5 w-4.5 ${i < Math.round(product.ratingAverage) ? 'fill-amber-400' : 'text-zinc-200'}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-800">{product.ratingAverage}</span>
              <span className="text-xs text-zinc-400">({product.ratingCount || 0} Đánh giá người dùng)</span>
            </div>
          </div>

          {/* Pricing Panel */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150">
            {selectedVariant ? (
              <div className="space-y-1">
                {selectedVariant.promoPrice ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-black text-rose-600">{formatVND(selectedVariant.promoPrice)}</span>
                    <span className="text-sm text-zinc-400 line-through font-medium">{formatVND(selectedVariant.price)}</span>
                  </div>
                ) : (
                  <span className="text-xl font-black text-zinc-950">{formatVND(selectedVariant.price)}</span>
                )}
                
                {/* Stock alert */}
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-1">
                  Trạng thái: {' '}
                  {selectedVariant.stock > 10 ? (
                    <span className="text-emerald-600 font-extrabold">Còn hàng ({selectedVariant.stock})</span>
                  ) : selectedVariant.stock > 0 ? (
                    <span className="text-amber-500 font-extrabold">Sắp hết hàng (Chỉ còn {selectedVariant.stock} sản phẩm)</span>
                  ) : (
                    <span className="text-rose-500 font-extrabold">Tạm hết hàng</span>
                  )}
                </p>
              </div>
            ) : (
              <span className="text-xs text-rose-500 font-semibold">Tổ hợp phân loại hiện tại không tồn tại.</span>
            )}
          </div>

          {/* Variant Selectors */}
          <div className="space-y-4">
            {/* Color selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Màu sắc</span>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 ring-1 ring-indigo-500'
                          : 'border-zinc-200 hover:border-zinc-400 text-zinc-700 bg-white'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kích thước (Size)</span>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 ring-1 ring-indigo-500'
                          : 'border-zinc-200 hover:border-zinc-400 text-zinc-700 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity selector */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Số lượng mua</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 overflow-hidden w-fit">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="p-2.5 hover:bg-zinc-200/50 disabled:opacity-50 text-zinc-600 transition-all cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-5 text-sm font-bold text-zinc-800">{quantity}</span>
                <button
                  type="button"
                  disabled={selectedVariant && quantity >= selectedVariant.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 hover:bg-zinc-200/50 disabled:opacity-50 text-zinc-600 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => handleAddToCart(false)}
              className="flex-1 py-3.5 rounded-xl bg-white border border-indigo-600 hover:bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm shadow-indigo-600/5 cursor-pointer"
            >
              <ShoppingCart className="h-4.5 w-4.5" /> Thêm giỏ hàng
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow shadow-indigo-600/10 cursor-pointer"
            >
              Mua ngay
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3.5 rounded-xl border flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer ${
                isWishlisted 
                  ? 'bg-rose-50 border-rose-200 text-rose-500' 
                  : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400'
              }`}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Guarantee specs */}
          <div className="border-t border-zinc-150 pt-4 flex gap-4 text-[10px] text-zinc-500 font-semibold">
            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-500" /> 100% Chính hãng</span>
            <span className="flex items-center gap-1"><Info className="h-4 w-4 text-indigo-500" /> Bảo hành 12 tháng</span>
          </div>
        </div>
      </section>

      {/* Specifications table */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Specs */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-3 uppercase tracking-wider">Thông số kỹ thuật</h3>
          {product.specifications && Object.keys(product.specifications).length > 0 ? (
            <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200 text-xs">
              {Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 p-3.5">
                  <span className="font-bold text-zinc-500">{k}</span>
                  <span className="col-span-2 text-zinc-800 font-medium pl-4">{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic">Không có thông số kỹ thuật chi tiết cho sản phẩm này.</p>
          )}
        </div>

        {/* Product description summary */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
          <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-3 uppercase tracking-wider">Mô tả sản phẩm</h3>
          <p className="text-xs text-zinc-600 leading-6 font-medium whitespace-pre-line">{product.description || 'Không có mô tả chi tiết.'}</p>
        </div>
      </section>

      {/* Reviews list & Write Review form */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-8">
        <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-3 uppercase tracking-wider">Đánh giá từ khách hàng</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-150 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={rev.userAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(rev.userName)}
                        alt="" 
                        className="h-8 w-8 rounded-full border bg-zinc-200" 
                      />
                      <div>
                        <span className="text-xs font-bold text-zinc-800 block">{rev.userName}</span>
                        <div className="flex text-amber-400 pt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-amber-400' : 'text-zinc-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 font-medium pl-10 leading-5">{rev.comment}</p>
                  
                  {/* Attached images */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2 pl-10 pt-1">
                      {rev.images.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer">
                          <img src={img} alt="" className="h-16 w-16 object-cover rounded-lg border border-zinc-200 hover:opacity-85" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 italic">Chưa có lượt đánh giá nào cho sản phẩm này.</p>
            )}
          </div>

          {/* Form to Submit review */}
          <div className="bg-zinc-50/70 border border-zinc-200 p-6 rounded-2xl h-fit space-y-4">
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Viết đánh giá của bạn</h4>
            
            {reviewSuccess && (
              <div className="p-3 text-xs bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 font-semibold">
                {reviewSuccess}
              </div>
            )}
            {reviewError && (
              <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-200 font-semibold">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Đánh giá (Số sao)</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs font-bold text-amber-500 focus:outline-none"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Sao</option>
                  <option value="4">⭐⭐⭐⭐ 4 Sao</option>
                  <option value="3">⭐⭐⭐ 3 Sao</option>
                  <option value="2">⭐⭐ 2 Sao</option>
                  <option value="1">⭐ 1 Sao</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nhận xét</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Nhập nội dung nhận xét của bạn về chất lượng sản phẩm..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs focus:outline-none focus:border-indigo-500 resize-none font-medium text-zinc-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ảnh minh họa (Link ảnh)</label>
                <input
                  type="text"
                  placeholder="Dán URL ảnh minh họa sản phẩm (nếu có)..."
                  value={reviewForm.images}
                  onChange={(e) => setReviewForm({ ...reviewForm, images: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Gửi đánh giá
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
