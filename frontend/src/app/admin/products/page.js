'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import {
  FolderPlus,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Eye,
  X,
  Package,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  
  // Category states
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', parentId: '', description: '' });

  // Product states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form states for Product
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    brand: '',
    description: '',
    status: 'active',
    images: [''],
    specifications: [{ key: '', value: '' }],
    variants: [{ sku: '', attributes: { color: '', size: '' }, price: 0, promoPrice: '', stock: 0 }]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        fetchApi('/products'),
        fetchApi('/categories')
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      setError(err.message || 'Lỗi kết nối API.');
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

  // --- CATEGORIES LOGIC ---
  const toggleExpandCategory = (id) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId || '',
        description: cat.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', parentId: '', description: '' });
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (savingCategory) return;
    setSavingCategory(true);
    try {
      const payload = {
        ...categoryForm,
        id: editingCategory ? editingCategory.id : undefined,
        parentId: categoryForm.parentId || null
      };
      await fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setCategoryModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi lưu danh mục.');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả danh mục con và sản phẩm liên quan sẽ bị ảnh hưởng.')) return;
    try {
      await fetchApi(`/categories/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi xóa danh mục.');
    }
  };

  // Build root & children list for Category Tree
  const getSubcategories = (parentId) => categories.filter(c => c.parentId === parentId);

  const renderCategoryNode = (category, depth = 0) => {
    const children = getSubcategories(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories[category.id];

    return (
      <div key={category.id} className="space-y-1">
        <div 
          className="group flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-zinc-800/60 transition-all border border-transparent hover:border-zinc-800"
          style={{ marginLeft: `${depth * 16}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button onClick={() => toggleExpandCategory(category.id)} className="text-zinc-500 hover:text-white shrink-0">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <div className="w-4 h-4 shrink-0"></div>
            )}
            <span className="text-sm font-semibold text-zinc-200 truncate">{category.name}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
            <button 
              onClick={() => handleOpenCategoryModal(category)}
              className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-indigo-400 rounded-md transition-all"
              title="Chỉnh sửa"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => handleDeleteCategory(category.id)}
              className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 rounded-md transition-all"
              title="Xóa"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {children.map(child => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // --- PRODUCTS LOGIC ---
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      // Specs key-value reconstruction
      const specs = prod.specifications 
        ? Object.entries(prod.specifications).map(([key, value]) => ({ key, value }))
        : [{ key: '', value: '' }];
      
      setProductForm({
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        categoryId: prod.categoryId || '',
        brand: prod.brand,
        description: prod.description || '',
        status: prod.status || 'active',
        images: prod.images || [''],
        specifications: specs.length > 0 ? specs : [{ key: '', value: '' }],
        variants: prod.variants && prod.variants.length > 0 
          ? prod.variants.map(v => ({
              sku: v.sku,
              attributes: {
                color: v.attributes?.color || '',
                size: v.attributes?.size || ''
              },
              price: v.price,
              promoPrice: v.promoPrice || '',
              stock: v.stock
            }))
          : [{ sku: '', attributes: { color: '', size: '' }, price: 0, promoPrice: '', stock: 0 }]
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        slug: '',
        categoryId: categories[0]?.id || '',
        brand: '',
        description: '',
        status: 'active',
        images: [''],
        specifications: [{ key: '', value: '' }],
        variants: [{ sku: '', attributes: { color: '', size: '' }, price: 0, promoPrice: '', stock: 0 }]
      });
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (savingProduct) return;
    
    // Map specs array back to key-value object
    const specsObject = {};
    productForm.specifications.forEach(spec => {
      if (spec.key.trim()) {
        specsObject[spec.key.trim()] = spec.value;
      }
    });

    // Clean image array
    const cleanImages = productForm.images.filter(img => img.trim());

    // Clean variants mapping
    const cleanVariants = productForm.variants.map(v => ({
      sku: v.sku,
      attributes: {
        color: v.attributes.color || null,
        size: v.attributes.size || null
      },
      price: parseFloat(v.price) || 0,
      promoPrice: v.promoPrice ? parseFloat(v.promoPrice) : null,
      stock: parseInt(v.stock) || 0
    }));

    setSavingProduct(true);
    try {
      const payload = {
        ...productForm,
        specifications: specsObject,
        images: cleanImages.length > 0 ? cleanImages : ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80'],
        variants: cleanVariants
      };

      await fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setProductModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi lưu sản phẩm.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này cùng tất cả biến thể của nó?')) return;
    try {
      await fetchApi(`/products/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi xóa sản phẩm.');
    }
  };

  // Specs helper actions
  const addSpecField = () => {
    setProductForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const removeSpecField = (index) => {
    setProductForm(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSpecChange = (index, field, val) => {
    const updated = [...productForm.specifications];
    updated[index][field] = val;
    setProductForm(prev => ({ ...prev, specifications: updated }));
  };

  // Image helpers
  const addImageField = () => {
    setProductForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    setProductForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleImageChange = (index, val) => {
    const updated = [...productForm.images];
    updated[index] = val;
    setProductForm(prev => ({ ...prev, images: updated }));
  };

  // Variants helpers
  const addVariantField = () => {
    setProductForm(prev => ({
      ...prev,
      variants: [...prev.variants, { sku: '', attributes: { color: '', size: '' }, price: 0, promoPrice: '', stock: 0 }]
    }));
  };

  const removeVariantField = (index) => {
    setProductForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index, field, subfield, val) => {
    const updated = [...productForm.variants];
    if (subfield) {
      updated[index][field][subfield] = val;
    } else {
      updated[index][field] = val;
    }
    setProductForm(prev => ({ ...prev, variants: updated }));
  };

  // Filtered Products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.brand.toLowerCase().includes(search.toLowerCase()) ||
                          p.variants.some(v => v.sku.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter ? p.categoryId === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
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
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Sản Phẩm & Danh Mục</h2>
          <p className="text-zinc-400 text-sm mt-1">Cấu trúc cây danh mục đa cấp, quản lý biến thể SKU và giá sản phẩm</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCategoryModal()}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-semibold text-zinc-300 py-2.5 px-4 transition-all"
          >
            <FolderPlus className="h-4 w-4 text-indigo-400" /> Thêm Danh mục
          </button>
          <button
            onClick={() => handleOpenProductModal()}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white py-2.5 px-4 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" /> Thêm Sản phẩm
          </button>
        </div>
      </div>

      {/* Grid structure: Left tree view, Right products view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Category tree Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Layers className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Cây Danh Mục Đa Cấp</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-normal">
            Nhấp chuột vào biểu tượng mũi tên để mở danh mục con. Di chuột để hiển thị các tùy chọn Sửa & Xóa.
          </p>

          <div className="space-y-1.5 mt-4 max-h-[500px] overflow-y-auto pr-1">
            {categories.filter(c => !c.parentId).map(rootCat => renderCategoryNode(rootCat))}
            {categories.length === 0 && (
              <p className="text-xs text-zinc-500 py-4 text-center">Chưa có danh mục nào được khởi tạo.</p>
            )}
          </div>
        </div>

        {/* Right: Products catalog Table */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl lg:col-span-2 space-y-4">
          {/* Table Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 pointer-events-none">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm sản phẩm, thương hiệu, SKU..."
                className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none sm:text-xs"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full sm:w-auto rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-zinc-300 focus:border-indigo-500 focus:outline-none text-xs"
            >
              <option value="">Lọc theo danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Products List Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-850">
            <table className="min-w-full divide-y divide-zinc-850 text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/35 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Thông tin sản phẩm</th>
                  <th scope="col" className="px-4 py-3.5">Thương hiệu</th>
                  <th scope="col" className="px-4 py-3.5">Danh mục</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Số SKU</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Tồn kho</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Trạng thái</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                {filteredProducts.map((p) => {
                  const totalStock = p.variants.reduce((acc, curr) => acc + curr.stock, 0);
                  const displayPrice = p.variants.length > 0
                    ? formatVND(p.variants[0].price)
                    : 'N/A';

                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&q=80'}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover bg-zinc-800 border border-zinc-700/50"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate max-w-[180px]">{p.name}</span>
                            <span className="text-[10px] text-indigo-400 font-semibold">{displayPrice}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-400">{p.brand}</td>
                      <td className="px-4 py-3 text-zinc-400 font-medium">
                        {p.category?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-zinc-300">
                        {p.variants?.length || 0} SKU
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          totalStock > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                            <CheckCircle className="h-3 w-3" /> Đang bán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-zinc-500">
                            <XCircle className="h-3 w-3" /> Tạm dừng
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenProductModal(p)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 rounded-lg transition-all"
                            title="Sửa"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 rounded-lg transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-zinc-500">
                      Không tìm thấy sản phẩm nào khớp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- CATEGORY MODAL --- */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1.5 font-semibold">Tên Danh mục</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
                    setCategoryForm(prev => ({ ...prev, name, slug }));
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="Ví dụ: Bàn phím cơ"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5 font-semibold">Slug danh mục</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none font-mono"
                  placeholder="Ví dụ: ban-phim-co"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5 font-semibold">Danh mục cha (Mặc định: Gốc)</label>
                <select
                  value={categoryForm.parentId}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-300 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Không có (Danh mục gốc)</option>
                  {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5 font-semibold">Mô tả ngắn</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none resize-none"
                  placeholder="Viết mô tả ngắn gọn về danh mục..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition-all border border-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className={`px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20 ${savingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {savingCategory ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PRODUCT MODAL --- */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProductModalOpen(false)}
              className="absolute top-6 right-6 p-1 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-all z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-6">
              {editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs text-zinc-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left col: Core info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 mb-1.5 font-semibold">Tên Sản phẩm</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
                        setProductForm(prev => ({ ...prev, name, slug }));
                      }}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                      placeholder="Ví dụ: Bàn phím Keychron K2"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1.5 font-semibold">Đường dẫn thân thiện (Slug)</label>
                    <input
                      type="text"
                      required
                      value={productForm.slug}
                      onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none font-mono"
                      placeholder="Ví dụ: ban-phim-keychron-k2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1.5 font-semibold">Thương hiệu</label>
                      <input
                        type="text"
                        required
                        value={productForm.brand}
                        onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none"
                        placeholder="Keychron, Apple, Logitech..."
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1.5 font-semibold">Danh mục</label>
                      <select
                        value={productForm.categoryId}
                        onChange={(e) => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-350 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">Lọc theo danh mục</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1.5 font-semibold">Mô tả sản phẩm</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      rows="4"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-indigo-500 focus:outline-none resize-none"
                      placeholder="Thông tin giới thiệu chi tiết về sản phẩm..."
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1.5 font-semibold">Trạng thái bán</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={productForm.status === 'active'}
                          onChange={() => setProductForm(prev => ({ ...prev, status: 'active' }))}
                          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-zinc-950 border-zinc-800"
                        />
                        <span>Bán trực tiếp (Active)</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={productForm.status === 'inactive'}
                          onChange={() => setProductForm(prev => ({ ...prev, status: 'inactive' }))}
                          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-zinc-950 border-zinc-800"
                        />
                        <span>Tạm ngừng bán (Inactive)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right col: Images & Specs */}
                <div className="space-y-5">
                  {/* Images Manager */}
                  <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Danh sách Ảnh (URL)</span>
                      <button
                        type="button"
                        onClick={addImageField}
                        className="text-indigo-400 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <Plus className="h-3 w-3" /> Thêm ảnh
                      </button>
                    </div>
                    {productForm.images.map((img, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          value={img}
                          onChange={(e) => handleImageChange(idx, e.target.value)}
                          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                        {productForm.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(idx)}
                            className="p-2 bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-rose-400 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Specifications */}
                  <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Thông số kỹ thuật</span>
                      <button
                        type="button"
                        onClick={addSpecField}
                        className="text-indigo-400 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <Plus className="h-3 w-3" /> Thêm thông số
                      </button>
                    </div>
                    {productForm.specifications.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          value={spec.key}
                          onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                          className="w-1/3 rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="Key (VD: Kết nối)"
                        />
                        <input
                          type="text"
                          required
                          value={spec.value}
                          onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="Value (VD: USB, Bluetooth)"
                        />
                        {productForm.specifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecField(idx)}
                            className="p-2 bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-rose-400 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-indigo-400" />
                    <span className="font-bold text-white text-sm">Danh sách các biến thể của sản phẩm</span>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantField}
                    className="text-indigo-400 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Thêm biến thể
                  </button>
                </div>

                <div className="space-y-3">
                  {productForm.variants.map((variant, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end bg-zinc-900/60 p-3 rounded-xl border border-zinc-850 relative">
                      <div className="sm:col-span-1">
                        <label className="block text-zinc-500 mb-1 font-semibold">Màu sắc</label>
                        <input
                          type="text"
                          value={variant.attributes.color || ''}
                          onChange={(e) => handleVariantChange(idx, 'attributes', 'color', e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="Đen, Trắng..."
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-zinc-500 mb-1 font-semibold">Kích thước</label>
                        <input
                          type="text"
                          value={variant.attributes.size || ''}
                          onChange={(e) => handleVariantChange(idx, 'attributes', 'size', e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-indigo-500 focus:outline-none"
                          placeholder="S, M, L, XL..."
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-zinc-500 mb-1 font-semibold">Mã SKU</label>
                        <input
                          type="text"
                          required
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', null, e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-indigo-500 focus:outline-none font-mono"
                          placeholder="Mã SKU định dạng"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-zinc-500 mb-1 font-semibold">Giá bán (VND)</label>
                        <input
                          type="number"
                          required
                          value={variant.price}
                          onChange={(e) => handleVariantChange(idx, 'price', null, e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-zinc-500 mb-1 font-semibold">Giá KM (VND)</label>
                        <input
                          type="number"
                          value={variant.promoPrice}
                          onChange={(e) => handleVariantChange(idx, 'promoPrice', null, e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-1 flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="block text-zinc-500 mb-1 font-semibold">Tồn kho</label>
                          <input
                            type="number"
                            required
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', null, e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        {productForm.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariantField(idx)}
                            className="p-2 bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-rose-400 rounded-lg shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className={`px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20 ${savingProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {savingProduct ? 'Đang lưu...' : 'Lưu Sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
