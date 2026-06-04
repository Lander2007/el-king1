import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Loader2, X, Smartphone, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { useProductStore } from '../../store/useProductStore';

export function SearchBar() {
  const { language, isRTL, t, selectedCountry } = useApp();
  const storeProducts = useProductStore((state) => state.products);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (query.trim().length <= 1) {
      setLiveResults([]);
      setFocusedIndex(-1);
      return;
    }

    setSearchLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/products/search?q=${encodeURIComponent(query)}`);
        setLiveResults(res.data || []);
      } catch (err) {
        console.error('Search error:', err);
        setLiveResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < liveResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : liveResults.length - 1));
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && liveResults[focusedIndex]) {
        navigate(`/product/${liveResults[focusedIndex]._id}`);
        setSearchFocused(false);
        setQuery('');
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setSearchFocused(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setSearchFocused(false);
    }
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchFocused(false);
      setQuery('');
    }
  };

  // Get dynamic suggestions (featured/active products from store)
  const suggestedProducts = storeProducts
    .filter((p) => p.isFeatured && p.isActive)
    .slice(0, 4);

  return (
    <div ref={searchRef} className="flex-1 max-w-xl mx-auto relative z-50">
      {/* Search Input Container */}
      <div
        className="flex items-center rounded-2xl px-4 gap-3 transition-all duration-300"
        style={{
          background: searchFocused ? 'var(--ks-bg)' : 'var(--ks-bg-secondary)',
          border: searchFocused ? '2px solid var(--ks-blue)' : '2px solid transparent',
          height: '44px',
          boxShadow: searchFocused ? 'var(--ks-shadow-md)' : 'none',
        }}
      >
        <Search size={18} className="text-[var(--ks-text-muted)] shrink-0 cursor-pointer" onClick={handleSearchSubmit} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('navbar.search')}
          className="flex-1 bg-transparent outline-none text-sm font-medium w-full"
          style={{ color: 'var(--ks-text)', direction: /[\u0600-\u06FF]/.test(query) ? 'rtl' : 'ltr' }}
          aria-label="Search"
        />
        {searchLoading && (
          <Loader2 size={16} className="animate-spin text-[var(--ks-blue)] shrink-0" />
        )}
        {query && !searchLoading && (
          <button
            onClick={() => {
              setQuery('');
              setLiveResults([]);
            }}
            className="p-1 rounded-full hover:bg-[var(--ks-bg-secondary)]"
          >
            <X size={14} className="text-[var(--ks-text-secondary)]" />
          </button>
        )}
      </div>

      {/* Live Search Results Dropdown */}
      {searchFocused && (query.trim().length > 1 || liveResults.length > 0) && (
        <div
          className="absolute top-full mt-3 w-full rounded-2xl overflow-hidden shadow-2xl z-50 border border-[var(--ks-border)] transition-all duration-300"
          style={{ background: 'var(--ks-bg)' }}
        >
          {liveResults.length > 0 ? (
            <div className="p-2 space-y-1">
              {liveResults.slice(0, 5).map((p, idx) => {
                const nameEn = p.name?.en || p.name || '';
                const nameAr = p.name?.ar || '';
                const primaryName = language === 'ar' ? (nameAr || nameEn) : nameEn;
                const secondaryName = language === 'ar' ? nameEn : nameAr;
                return (
                  <button
                    key={p._id}
                    onClick={() => {
                      navigate(`/product/${p._id}`);
                      setSearchFocused(false);
                      setQuery('');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                      idx === focusedIndex ? 'bg-[var(--ks-bg-tertiary)]' : 'hover:bg-[var(--ks-bg-secondary)]'
                    } ${isRTL ? 'text-right' : 'text-left'}`}
                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                  >
                    <img
                      src={p.images?.[0]?.url || p.image}
                      alt={primaryName}
                      className="w-10 h-10 rounded-lg object-cover border border-[var(--ks-border)]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--ks-text)' }}>
                        {primaryName} {secondaryName && <span className="text-xs text-[var(--ks-text-muted)] font-normal">({secondaryName})</span>}
                      </p>
                      <p className="text-xs text-[var(--ks-text-muted)] truncate capitalize">
                        {p.brand} - {p.model}
                      </p>
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: 'var(--ks-blue)' }}>
                      {(p.pricing?.[selectedCountry] || p.pricing?.default || p.price || 0).toLocaleString()} EGP
                    </span>
                  </button>
                );
              })}
              <div className="p-2 border-t border-[var(--ks-border)] bg-[var(--ks-bg-secondary)]">
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setSearchFocused(false);
                    setQuery('');
                  }}
                  className="w-full text-center py-2 text-xs font-bold text-[var(--ks-blue)] hover:underline block"
                >
                  {language === 'ar' ? `مشاهدة جميع النتائج لـ "${query}"` : `See all results for "${query}"`}
                </button>
              </div>
            </div>
          ) : (
            // "No results found" Friendly UI with Suggested/Related Products below it
            <div className="p-4 text-center">
              <p className="text-base font-bold mb-1" style={{ color: 'var(--ks-text)' }}>
                🔍 {language === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--ks-text-muted)' }}>
                {language === 'ar' 
                  ? `عذراً، لم نجد أي إكسسوارات مطابقة لـ "${query}"` 
                  : `Sorry, we couldn't find any accessories matching "${query}"`}
              </p>

              {/* Suggestions Section */}
              {suggestedProducts.length > 0 && (
                <div className="border-t border-[var(--ks-border)] pt-4 text-left" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                  <p className="text-xs font-black uppercase tracking-wider mb-2.5 px-1" style={{ color: 'var(--ks-blue)' }}>
                    ✨ {language === 'ar' ? 'المنتجات المقترحة لك' : 'Suggested Products'}
                  </p>
                  <div className="space-y-2">
                    {suggestedProducts.map((p) => {
                      const name = p.name?.[language] || p.name?.en || '';
                      return (
                        <button
                          key={p._id}
                          onClick={() => {
                            navigate(`/product/${p._id}`);
                            setSearchFocused(false);
                            setQuery('');
                          }}
                          className="w-full flex items-center gap-3 p-1.5 rounded-lg hover:bg-[var(--ks-bg-secondary)] transition-all text-left"
                          style={{ textAlign: isRTL ? 'right' : 'left' }}
                        >
                          <img
                            src={p.images?.[0]?.url || p.image}
                            alt={name}
                            className="w-8 h-8 rounded-md object-cover border border-[var(--ks-border)]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate text-[var(--ks-text)]">
                              {name}
                            </p>
                            <p className="text-[10px] text-[var(--ks-text-muted)] truncate">
                              {p.brand} - {p.model}
                            </p>
                          </div>
                          <ArrowRight size={12} className="text-[var(--ks-blue)] opacity-60 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
