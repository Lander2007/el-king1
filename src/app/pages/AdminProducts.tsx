import React, { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, Upload, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';

interface ProductFormState {
  name: string;
  nameAr: string;
  category: 'apple' | 'samsung' | 'accessories';
  brand: string;
  model: string;
  price: string;
  stock: string;
  status: 'Active' | 'Draft';
  description: string;
  descriptionAr: string;
}

const DEFAULT_FORM: ProductFormState = {
  name: '', nameAr: '', category: 'accessories', brand: '', model: '',
  price: '', stock: '', status: 'Active', description: '', descriptionAr: '',
};

// Helper function to handle authenticated fetches using the stored admin token
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('admin_token');
  const headers: HeadersInit = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  return fetch(url, { ...options, headers });
};

function Badge({ label }: { label: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Active: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
    Draft: { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' },
  };
  const c = colors[label] || { bg: 'var(--ks-bg-secondary)', text: 'var(--ks-text-muted)' };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: c.bg, color: c.text, fontWeight: 700 }}>
      {label}
    </span>
  );
}

export function AdminProducts() {
  const { language, isRTL, socket } = useApp();
  const [productList, setProductList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [previewImage, setPreviewImage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch products from database
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products?limit=100&isActive=true');
      if (res.ok) {
        const data = await res.json();
        setProductList(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Listen to Socket.IO events for real-time synchronization
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (newProduct: any) => {
      setProductList(prev => {
        if (prev.find(p => p._id === newProduct._id)) return prev;
        return [newProduct, ...prev];
      });
    };

    const handleUpdated = (updatedProduct: any) => {
      setProductList(prev => prev.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
    };

    const handleDeleted = (data: { id: string }) => {
      setProductList(prev => prev.filter(p => p._id !== data.id));
    };

    socket.on('product:created', handleCreated);
    socket.on('product:updated', handleUpdated);
    socket.on('product:deleted', handleDeleted);

    return () => {
      socket.off('product:created', handleCreated);
      socket.off('product:updated', handleUpdated);
      socket.off('product:deleted', handleDeleted);
    };
  }, [socket]);

  const filtered = productList.filter(p => {
    const name = p.name?.[language] || p.name?.en || p.name || '';
    const brand = p.brand || '';
    const category = p.category || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      brand.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase())
    );
  });

  const openAdd = () => {
    setForm(DEFAULT_FORM);
    setPreviewImage('');
    setEditId(null);
    setErrorMsg('');
    setDrawerOpen(true);
  };

  const openEdit = (p: any) => {
    setForm({
      name: p.name?.en || p.name || '',
      nameAr: p.name?.ar || '',
      category: p.category || 'accessories',
      brand: p.brand || '',
      model: p.model || '',
      price: (p.pricing?.EG ?? p.pricing?.default ?? p.price ?? 0).toString(),
      stock: (p.stock ?? p.stockCount ?? 0).toString(),
      status: p.isActive ? 'Active' : 'Draft',
      description: p.description?.en || p.description || '',
      descriptionAr: p.description?.ar || '',
    });
    setPreviewImage(p.images?.[0]?.url || p.image || '');
    setEditId(p._id || p.id);
    setErrorMsg('');
    setDrawerOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!form.name.trim() || !form.nameAr.trim()) {
      setErrorMsg('Product name is required in both English and Arabic');
      return;
    }
    if (!form.brand.trim()) {
      setErrorMsg('Brand is required');
      return;
    }
    if (!form.model.trim()) {
      setErrorMsg('Model is required');
      return;
    }
    const parsedPrice = parseFloat(form.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg('Price must be a positive number');
      return;
    }
    const parsedStock = parseInt(form.stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setErrorMsg('Stock must be a non-negative number');
      return;
    }
    if (!previewImage) {
      setErrorMsg('Product image is required');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const productPayload = {
        name: { en: form.name, ar: form.nameAr },
        slug,
        description: { 
          en: form.description || form.name, 
          ar: form.descriptionAr || form.nameAr 
        },
        category: form.category,
        brand: form.brand,
        model: form.model,
        images: [
          {
            url: previewImage,
            alt: { en: form.name, ar: form.nameAr },
          }
        ],
        pricing: {
          EG: parsedPrice,
          SA: Math.round(parsedPrice / 10),
          AE: Math.round(parsedPrice / 10),
          US: Math.round(parsedPrice / 50),
          default: Math.round(parsedPrice / 50),
        },
        stock: parsedStock,
        isActive: form.status === 'Active',
        isFeatured: false,
        seo: {
          metaTitle: { en: form.name, ar: form.nameAr },
          metaDescription: { en: form.description || form.name, ar: form.descriptionAr || form.nameAr },
        }
      };

      let url = 'http://localhost:5000/api/products';
      let method = 'POST';

      if (editId) {
        url = `http://localhost:5000/api/products/${editId}`;
        method = 'PUT';
      }

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save product');
      }

      setDrawerOpen(false);
      setForm(DEFAULT_FORM);
      setPreviewImage('');
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMsg(err.message || 'Error occurred while saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetchWithAuth(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete product');
      }
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert(err.message || 'Failed to delete product');
    }
  };

  const inputStyle = {
    background: 'var(--ks-bg-secondary)',
    border: '1px solid var(--ks-border)',
    color: 'var(--ks-text)',
    padding: '8px 12px',
    borderRadius: '8px',
    width: '100%',
    outline: 'none',
    fontSize: '13px',
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--ks-bg-secondary)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl" style={{ color: 'var(--ks-text)', fontWeight: 800 }}>
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ks-text-muted)' }}>
              {productList.length} {language === 'ar' ? 'منتج' : 'total products'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div
              className="flex items-center gap-2 px-3 rounded-xl"
              style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
            >
              <Search size={15} style={{ color: 'var(--ks-text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === 'ar' ? 'بحث عن منتج...' : 'Search products...'}
                className="bg-transparent outline-none text-sm py-2.5"
                style={{ color: 'var(--ks-text)', width: '100%', minWidth: '200px' }}
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-colors hover:opacity-90"
              style={{ background: 'var(--ks-blue)', fontWeight: 700 }}
            >
              <Plus size={16} />
              {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ks-border)' }}>
                  {[
                    { en: '', ar: '' },
                    { en: 'Product', ar: 'المنتج' },
                    { en: 'Category', ar: 'الفئة' },
                    { en: 'Model', ar: 'الموديل' },
                    { en: 'Price', ar: 'السعر' },
                    { en: 'Stock', ar: 'المخزون' },
                    { en: 'Status', ar: 'الحالة' },
                    { en: 'Actions', ar: 'الإجراءات' },
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-xs"
                      style={{ color: 'var(--ks-text-muted)', fontWeight: 700, background: 'var(--ks-bg-secondary)' }}
                    >
                      {language === 'ar' ? h.ar : h.en}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-sm" style={{ color: 'var(--ks-text-secondary)' }}>
                      {language === 'ar' ? 'جاري التحميل...' : 'Loading products...'}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-sm" style={{ color: 'var(--ks-text-secondary)' }}>
                      {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => {
                    const id = p._id || p.id;
                    const name = p.name?.[language] || p.name?.en || p.name || '';
                    const image = p.images?.[0]?.url || p.image || '';
                    const price = p.pricing?.EG ?? p.pricing?.default ?? p.price ?? 0;
                    const stock = p.stock ?? p.stockCount ?? 0;

                    return (
                      <tr
                        key={id}
                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--ks-border)' : 'none' }}
                        className="hover:bg-[var(--ks-bg-secondary)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input type="checkbox" style={{ accentColor: 'var(--ks-blue)' }} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={image} alt={name} className="w-10 h-10 rounded-lg object-cover border border-[var(--ks-border)]" />
                            <div>
                              <p className="text-sm" style={{ color: 'var(--ks-text)', fontWeight: 600 }}>{name}</p>
                              <p className="text-xs" style={{ color: 'var(--ks-text-muted)' }}>{p.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm capitalize" style={{ color: 'var(--ks-text-secondary)' }}>{p.category}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--ks-text-secondary)' }}>{p.model}</td>
                        <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--ks-blue)' }}>
                          {price.toLocaleString()} EGP
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm" style={{ color: 'var(--ks-text)', fontWeight: 600 }}>{stock}</span>
                            {stock < 10 && (
                              <AlertTriangle size={13} style={{ color: '#ef4444' }} />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={p.isActive !== false ? 'Active' : 'Draft'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg hover:bg-[var(--ks-bg-tertiary)] transition-colors"
                              style={{ color: 'var(--ks-blue)' }}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              style={{ color: '#ef4444' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[600px] flex flex-col shadow-2xl overflow-y-auto"
            style={{ background: 'var(--ks-bg)' }}
          >
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--ks-border)' }}>
              <h2 className="text-lg" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
                {editId ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (language === 'ar' ? 'إضافة منتج' : 'Add Product')}
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--ks-bg-secondary)]">
                <X size={20} style={{ color: 'var(--ks-text-secondary)' }} />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-[#ef4444] font-semibold">
                  <AlertTriangle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>
                    Product Name (EN) *
                  </label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Product name in English" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>
                    اسم المنتج (AR) *
                  </label>
                  <input value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} style={{ ...inputStyle, direction: 'rtl' }} placeholder="اسم المنتج بالعربية" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>Description (EN)</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ ...inputStyle, height: '80px', resize: 'none' }}
                    placeholder="Product description in English..."
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>الوصف (AR)</label>
                  <textarea
                    value={form.descriptionAr}
                    onChange={e => setForm(f => ({ ...f, descriptionAr: e.target.value }))}
                    style={{ ...inputStyle, height: '80px', resize: 'none', direction: 'rtl' }}
                    placeholder="وصف المنتج بالعربية..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))} style={{ ...inputStyle, appearance: 'none' }}>
                    <option value="apple">Apple Accessories</option>
                    <option value="samsung">Samsung Accessories</option>
                    <option value="accessories">General Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>Brand *</label>
                  <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} style={inputStyle} placeholder="Spigen, Anker, ESR..." />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>Model *</label>
                  <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} style={inputStyle} placeholder="iPhone 16 Pro Max, Universal..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>Price (EGP) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} placeholder="450" />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>Stock Qty *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} style={inputStyle} placeholder="100" />
                </div>
              </div>

              {/* Image upload field */}
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>Image File *</label>
                <div
                  className="relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer hover:bg-[var(--ks-bg-secondary)] transition-colors min-h-[140px]"
                  style={{ borderColor: 'var(--ks-border)' }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {previewImage ? (
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-[var(--ks-border)] bg-[var(--ks-bg-secondary)]">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPreviewImage('');
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} style={{ color: 'var(--ks-text-muted)' }} />
                      <p className="text-sm text-center" style={{ color: 'var(--ks-text-muted)' }}>
                        Click to select an image from your device
                      </p>
                      <p className="text-xs" style={{ color: 'var(--ks-text-muted)' }}>PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm" style={{ color: 'var(--ks-text-secondary)', fontWeight: 600 }}>Status</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--ks-text-secondary)' }}>{form.status}</span>
                  <button onClick={() => setForm(f => ({ ...f, status: f.status === 'Active' ? 'Draft' : 'Active' }))}>
                    {form.status === 'Active'
                      ? <ToggleRight size={28} style={{ color: '#22c55e' }} />
                      : <ToggleLeft size={28} style={{ color: 'var(--ks-text-muted)' }} />}
                  </button>
                </div>
              </div>
            </div>

            <div
              className="flex gap-3 px-6 py-5"
              style={{ borderTop: '1px solid var(--ks-border)' }}
            >
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--ks-blue)' }}
              >
                {isSubmitting ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save Product')}
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--ks-bg-secondary)', border: '1px solid var(--ks-border)', color: 'var(--ks-text)' }}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4"
            style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <Trash2 size={18} style={{ color: '#ef4444' }} />
              </div>
              <h3 className="text-base" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
                {language === 'ar' ? 'حذف المنتج؟' : 'Delete this product?'}
              </h3>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--ks-text-secondary)' }}>
              {language === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه.' : 'This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
                style={{ background: '#ef4444' }}
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--ks-bg-secondary)', border: '1px solid var(--ks-border)', color: 'var(--ks-text)' }}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
