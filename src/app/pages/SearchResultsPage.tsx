import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { recentSearches } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { FilterSidebar, FilterState, DEFAULT_FILTERS } from '../components/FilterSidebar';

const PER_PAGE = 15;

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { language, isRTL, products: appProducts, selectedCountry } = useApp();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState('recommended');
  const [page, setPage] = useState(1);

  const results = useMemo(() => {
    if (!query) return [];
    
    // Map products to include their local price for correct filtering/sorting
    let list = appProducts.map(p => {
      const price = p.pricing?.[selectedCountry] ?? p.pricing?.default ?? p.price ?? 0;
      return { ...p, price };
    });

    list = list.filter(p => {
      const nameEn = p.name?.en || p.name || '';
      const nameAr = p.name?.ar || '';
      const descEn = p.description?.en || p.description || '';
      const descAr = p.description?.ar || '';
      const brand = p.brand || '';
      const category = p.category || '';
      const model = p.model || '';
      const compat = Array.isArray(p.compatibility) ? p.compatibility : [p.compatibility || ''];
      
      return (
        nameEn.toLowerCase().includes(query.toLowerCase()) ||
        nameAr.includes(query) ||
        brand.toLowerCase().includes(query.toLowerCase()) ||
        category.toLowerCase().includes(query.toLowerCase()) ||
        model.toLowerCase().includes(query.toLowerCase()) ||
        descEn.toLowerCase().includes(query.toLowerCase()) ||
        descAr.includes(query) ||
        compat.some(c => c.toLowerCase().includes(query.toLowerCase()))
      );
    });

    if (filters.categories.length) list = list.filter(p => filters.categories.includes(p.category));
    if (filters.brands.length) list = list.filter(p => filters.brands.includes(p.brand));
    list = list.filter(p => p.price <= filters.priceMax);
    if (filters.rating > 0) list = list.filter(p => p.rating >= (p.rating || 4.7));

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list = [...list].sort((a, b) => (b.rating || 4.7) - (a.rating || 4.7));

    return list;
  }, [query, appProducts, selectedCountry, filters, sort]);

  const totalPages = Math.ceil(results.length / PER_PAGE);
  const paginated = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const popularSearches = ['Galaxy S25 case', 'iPhone 16 charger', 'Spigen', 'USB-C cable', 'Anker'];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--ks-bg-secondary)', minHeight: '100vh' }}>
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm mb-3" style={{ color: 'var(--ks-text-muted)' }}>
            <button onClick={() => navigate('/')} className="hover:text-[var(--ks-blue)]">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </button>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--ks-text)' }}>
              {language === 'ar' ? 'نتائج البحث' : 'Search Results'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Search size={20} style={{ color: 'var(--ks-text-muted)' }} />
            <h1 className="text-2xl" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
              {language === 'ar' ? `نتائج "` : `Results for "`}<span style={{ color: 'var(--ks-blue)' }}>{query}</span>"
            </h1>
            <span
              className="px-3 py-1 rounded-full text-sm"
              style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'var(--ks-text-secondary)', fontWeight: 600 }}
            >
              {results.length} {language === 'ar' ? 'منتج' : 'results'}
            </span>
          </div>
        </div>

        {results.length === 0 && query ? (
          /* No results */
          <div className="flex flex-col items-center py-24 text-center gap-4">
            <div className="text-8xl mb-4">🔍</div>
            <h2 className="text-2xl" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
              {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
            </h2>
            <p className="text-base" style={{ color: 'var(--ks-text-secondary)' }}>
              {language === 'ar' ? `لم نجد أي منتجات لـ "${query}"` : `We couldn't find any products for "${query}"`}
            </p>
            <div className="mt-6">
              <p className="text-sm mb-3" style={{ color: 'var(--ks-text-muted)', fontWeight: 600 }}>
                {language === 'ar' ? 'جرب هذه البحثات الشائعة' : 'Try these popular searches'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {popularSearches.map(s => (
                  <button
                    key={s}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                    className="px-4 py-2 rounded-full text-sm transition-colors hover:bg-[var(--ks-blue)] hover:text-white"
                    style={{
                      background: 'var(--ks-bg)',
                      border: '1px solid var(--ks-border)',
                      color: 'var(--ks-text-secondary)',
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Filter sidebar */}
            <FilterSidebar
              filters={filters}
              onChange={f => { setFilters(f); setPage(1); }}
              onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
              totalResults={results.length}
            />

            {/* Results grid */}
            <div className="flex-1 min-w-0">
              {/* Sort bar */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
                style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--ks-text-secondary)' }}>
                  {language === 'ar'
                    ? `عرض ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, results.length)} من ${results.length}`
                    : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, results.length)} of ${results.length} results`}
                </p>
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                  className="text-sm outline-none cursor-pointer px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--ks-bg-secondary)', border: '1px solid var(--ks-border)', color: 'var(--ks-text)' }}
                >
                  <option value="recommended">{language === 'ar' ? 'مقترح' : 'Recommended'}</option>
                  <option value="price-asc">{language === 'ar' ? 'السعر: الأقل أولاً' : 'Price: Low to High'}</option>
                  <option value="price-desc">{language === 'ar' ? 'السعر: الأعلى أولاً' : 'Price: High to Low'}</option>
                  <option value="rating">{language === 'ar' ? 'الأعلى تقييماً' : 'Top Rated'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paginated.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg"
                    style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'var(--ks-text)', opacity: page === 1 ? 0.4 : 1 }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-sm"
                      style={{
                        background: page === i + 1 ? 'var(--ks-blue)' : 'var(--ks-bg)',
                        border: page === i + 1 ? 'none' : '1px solid var(--ks-border)',
                        color: page === i + 1 ? '#fff' : 'var(--ks-text)',
                        fontWeight: page === i + 1 ? 700 : 400,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg"
                    style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'var(--ks-text)', opacity: page === totalPages ? 0.4 : 1 }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
