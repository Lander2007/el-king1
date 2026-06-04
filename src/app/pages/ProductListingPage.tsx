import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { ChevronRight, Grid3X3, List, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { products, phoneModels } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { FilterSidebar, FilterState, DEFAULT_FILTERS } from '../components/FilterSidebar';

const SORT_OPTIONS = [
  { value: 'recommended', labelEn: 'Recommended', labelAr: 'مقترح' },
  { value: 'newest', labelEn: 'Newest', labelAr: 'الأحدث' },
  { value: 'price-asc', labelEn: 'Price Low → High', labelAr: 'السعر: من الأقل' },
  { value: 'price-desc', labelEn: 'Price High → Low', labelAr: 'السعر: من الأعلى' },
  { value: 'rating', labelEn: 'Top Rated', labelAr: 'الأعلى تقييماً' },
];

const PER_PAGE = 15;

export function ProductListingPage() {
  const { modelSlug } = useParams<{ modelSlug: string }>();
  const location = useLocation();
  const brand = location.pathname.startsWith('/samsung') ? 'samsung' : 'iphone';
  const { language, isRTL } = useApp();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState('recommended');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const phoneBrand = brand === 'samsung' ? 'Samsung' : 'Apple';
  const model = modelSlug ? phoneModels.find(m => m.slug === modelSlug) : null;

  const filtered = useMemo(() => {
    let list = products.filter(p => p.phoneBrand === phoneBrand);

    if (model) {
      list = list.filter(p => p.compatibility.includes(model.name) || p.compatibility.includes('Universal'));
    }
    if (filters.categories.length) {
      list = list.filter(p => filters.categories.includes(p.category));
    }
    if (filters.brands.length) {
      list = list.filter(p => filters.brands.includes(p.brand));
    }
    if (filters.colors.length) {
      list = list.filter(p => p.colors.some(c => filters.colors.includes(c)));
    }
    if (filters.rating > 0) {
      list = list.filter(p => p.rating >= filters.rating);
    }
    list = list.filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax);

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === 'newest') list = [...list].sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0));

    return list;
  }, [phoneBrand, model, filters, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const breadcrumb = [
    { label: language === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
    { label: phoneBrand === 'Samsung' ? (language === 'ar' ? 'سامسونج' : 'Samsung') : (language === 'ar' ? 'آيفون' : 'iPhone'), path: `/${brand}` },
    ...(model ? [{ label: model.name, path: `/${brand}/${modelSlug}` }] : []),
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--ks-bg-secondary)', minHeight: '100vh' }}>
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--ks-text-muted)' }}>
          {breadcrumb.map((b, i) => (
            <React.Fragment key={b.path}>
              {i > 0 && <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />}
              {i < breadcrumb.length - 1 ? (
                <button onClick={() => navigate(b.path)} className="hover:text-[var(--ks-blue)] transition-colors">{b.label}</button>
              ) : (
                <span style={{ color: 'var(--ks-text)', fontWeight: 600 }}>{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl" style={{ color: 'var(--ks-text)', fontWeight: 800 }}>
              {model ? model.name : (language === 'ar' ? (phoneBrand === 'Samsung' ? 'اكسسوارات سامسونج' : 'اكسسوارات آيفون') : `${phoneBrand} Accessories`)}
              {model && (
                <span className="block mt-1 w-16 h-1 rounded-full" style={{ background: 'var(--ks-blue)' }} />
              )}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--ks-text-muted)' }}>
              {language === 'ar' ? `عرض ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} من ${filtered.length} منتج` : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length} results`}
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar */}
          <FilterSidebar
            filters={filters}
            onChange={f => { setFilters(f); setPage(1); }}
            onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
            totalResults={filtered.length}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort/view bar */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
              style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: 'var(--ks-text-secondary)', fontWeight: 500 }}>
                  {language === 'ar' ? 'الترتيب:' : 'Sort by:'}
                </span>
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                  className="text-sm outline-none cursor-pointer"
                  style={{
                    background: 'var(--ks-bg-secondary)',
                    border: '1px solid var(--ks-border)',
                    color: 'var(--ks-text)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                  }}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {language === 'ar' ? o.labelAr : o.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setView('grid')}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    background: view === 'grid' ? 'var(--ks-blue)' : 'var(--ks-bg-secondary)',
                    color: view === 'grid' ? '#fff' : 'var(--ks-text-secondary)',
                  }}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    background: view === 'list' ? 'var(--ks-blue)' : 'var(--ks-bg-secondary)',
                    color: view === 'list' ? '#fff' : 'var(--ks-text-secondary)',
                  }}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Products */}
            {view === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paginated.map(p => (
                  <ProductCard key={p.id} product={p} view="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginated.map(p => (
                  <ProductCard key={p.id} product={p} view="list" />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                  style={{
                    background: page === 1 ? 'var(--ks-bg-secondary)' : 'var(--ks-bg)',
                    border: '1px solid var(--ks-border)',
                    color: page === 1 ? 'var(--ks-text-muted)' : 'var(--ks-text)',
                    opacity: page === 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors"
                      style={{
                        background: page === p ? 'var(--ks-blue)' : 'var(--ks-bg)',
                        border: page === p ? 'none' : '1px solid var(--ks-border)',
                        color: page === p ? '#fff' : 'var(--ks-text)',
                        fontWeight: page === p ? 700 : 400,
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                  style={{
                    background: 'var(--ks-bg)',
                    border: '1px solid var(--ks-border)',
                    color: page === totalPages ? 'var(--ks-text-muted)' : 'var(--ks-text)',
                    opacity: page === totalPages ? 0.5 : 1,
                  }}
                >
                  <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
