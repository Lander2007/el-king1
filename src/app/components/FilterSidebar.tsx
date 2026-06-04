import React, { useState } from 'react';
import { SlidersHorizontal, X, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface FilterState {
  categories: string[];
  brands: string[];
  priceMin: number;
  priceMax: number;
  colors: string[];
  rating: number;
  materials: string[];
  compatibility: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const CATEGORIES = ['Cases', 'Screen Protectors', 'Chargers', 'Cables', 'Stands', 'Audio', 'Bags'];
const BRANDS = ['Spigen', 'ESR', 'Belkin', 'Anker', 'OtterBox', 'Samsung', 'Apple', 'UAG', 'Ringke', 'Baseus'];
const COLORS = [
  { name: 'Black', code: '#1A1A1A' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Navy', code: '#1A2A5C' },
  { name: 'Red', code: '#8B1A1A' },
  { name: 'Green', code: '#1A4A1A' },
  { name: 'Blue', code: '#3B6FE8' },
  { name: 'Clear', code: '#E8E8E8' },
  { name: 'Gold', code: '#C9A84C' },
];
const MATERIALS = ['Silicone', 'Leather', 'TPU', 'Metal', 'Polycarbonate', 'Glass'];

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  brands: [],
  priceMin: 0,
  priceMax: 300,
  colors: [],
  rating: 0,
  materials: [],
  compatibility: '',
};

function CheckItem({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group">
      <div
        className="w-4 h-4 rounded flex items-center justify-center shrink-0"
        style={{
          border: checked ? 'none' : '1.5px solid var(--ks-border)',
          background: checked ? 'var(--ks-blue)' : 'transparent',
        }}
        onClick={() => onChange(!checked)}
      >
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span className="text-sm flex-1" style={{ color: 'var(--ks-text-secondary)' }}>{label}</span>
      {count !== undefined && (
        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--ks-bg-secondary)', color: 'var(--ks-text-muted)' }}>
          {count}
        </span>
      )}
    </label>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h4 className="text-sm mb-3 mt-5 first:mt-0" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>{title}</h4>
  );
}

export function FilterSidebar({ filters, onChange, onReset, totalResults, isMobileOpen, onMobileClose }: FilterSidebarProps) {
  const { language, isRTL } = useApp();

  const toggleItem = (key: 'categories' | 'brands' | 'colors' | 'materials', val: string) => {
    const arr = filters[key] as string[];
    onChange({
      ...filters,
      [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val],
    });
  };

  const content = (
    <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} style={{ color: 'var(--ks-blue)' }} />
          <span style={{ fontWeight: 700, color: 'var(--ks-text)', fontSize: '15px' }}>
            {language === 'ar' ? 'الفلاتر' : 'Filters'}
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs"
          style={{ color: 'var(--ks-blue)', fontWeight: 600 }}
        >
          {language === 'ar' ? 'مسح الكل' : 'Clear all'}
        </button>
      </div>

      {/* Price range */}
      <SectionTitle title={language === 'ar' ? 'نطاق السعر' : 'Price Range'} />
      <div className="space-y-3">
        <input
          type="range"
          min={0}
          max={300}
          value={filters.priceMax}
          onChange={e => onChange({ ...filters, priceMax: Number(e.target.value) })}
          className="w-full accent-blue-500"
          style={{ accentColor: 'var(--ks-blue)' }}
        />
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--ks-text-secondary)' }}>
          <span>${filters.priceMin}</span>
          <span>${filters.priceMax}</span>
        </div>
      </div>

      {/* Categories */}
      <SectionTitle title={language === 'ar' ? 'الفئة' : 'Category'} />
      {CATEGORIES.map(cat => (
        <CheckItem
          key={cat}
          label={cat}
          checked={filters.categories.includes(cat)}
          onChange={() => toggleItem('categories', cat)}
        />
      ))}

      {/* Brands */}
      <SectionTitle title={language === 'ar' ? 'الماركة' : 'Brand'} />
      {BRANDS.map(b => (
        <CheckItem
          key={b}
          label={b}
          checked={filters.brands.includes(b)}
          onChange={() => toggleItem('brands', b)}
        />
      ))}

      {/* Colors */}
      <SectionTitle title={language === 'ar' ? 'اللون' : 'Color'} />
      <div className="flex flex-wrap gap-2">
        {COLORS.map(c => (
          <button
            key={c.name}
            title={c.name}
            onClick={() => toggleItem('colors', c.name)}
            className="w-7 h-7 rounded-full transition-all"
            style={{
              background: c.code,
              border: filters.colors.includes(c.name) ? '2.5px solid var(--ks-blue)' : '2px solid var(--ks-border)',
              transform: filters.colors.includes(c.name) ? 'scale(1.15)' : 'scale(1)',
              boxShadow: c.code === '#FFFFFF' ? 'inset 0 0 0 1px var(--ks-border)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Rating */}
      <SectionTitle title={language === 'ar' ? 'التقييم' : 'Rating'} />
      <div className="space-y-1">
        {[4, 3, 2, 1].map(r => (
          <label key={r} className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={filters.rating === r}
              onChange={() => onChange({ ...filters, rating: filters.rating === r ? 0 : r })}
              className="accent-blue-500"
            />
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill={i < r ? '#F59E0B' : 'none'} style={{ color: i < r ? '#F59E0B' : 'var(--ks-border)' }} />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--ks-text-secondary)' }}>& up</span>
          </label>
        ))}
      </div>

      {/* Material */}
      <SectionTitle title={language === 'ar' ? 'المادة' : 'Material'} />
      {MATERIALS.map(m => (
        <CheckItem
          key={m}
          label={m}
          checked={filters.materials.includes(m)}
          onChange={() => toggleItem('materials', m)}
        />
      ))}

      {/* Apply button */}
      <button
        className="w-full mt-6 py-2.5 rounded-xl text-white text-sm transition-colors hover:opacity-90"
        style={{ background: 'var(--ks-blue)', fontWeight: 700 }}
      >
        {language === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
      </button>
    </div>
  );

  return (
    <aside
      className="w-[260px] shrink-0 sticky top-[120px] self-start p-5 rounded-2xl"
      style={{
        background: 'var(--ks-bg)',
        border: '1px solid var(--ks-border)',
        maxHeight: 'calc(100vh - 140px)',
        overflowY: 'auto',
      }}
    >
      {content}
    </aside>
  );
}
