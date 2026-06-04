import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { ChevronRight, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { phoneModels } from '../data/mockData';

const t = {
  en: {
    sortLabel: 'Sort by:',
    sortNewest: 'Newest',
    sortPopular: 'Popular',
    sortPrice: 'Price',
    viewAll: 'View all accessories →',
    models: 'Models',
    accessories: 'Accessories',
  },
  ar: {
    sortLabel: 'الترتيب:',
    sortNewest: 'الأحدث',
    sortPopular: 'الأكثر شيوعاً',
    sortPrice: 'السعر',
    viewAll: 'عرض جميع الاكسسوارات ←',
    models: 'الموديلات',
    accessories: 'الاكسسوارات',
  },
};

const brandConfig: Record<string, { name: string; nameAr: string; desc: string; descAr: string; gradient: string }> = {
  samsung: {
    name: 'Samsung Accessories',
    nameAr: 'اكسسوارات سامسونج',
    desc: 'Discover premium accessories for the full Samsung Galaxy lineup.',
    descAr: 'اكتشف اكسسوارات فاخرة لجميع موديلات سامسونج جالاكسي.',
    gradient: 'linear-gradient(135deg, #1a2a4a, #3B6FE8)',
  },
  iphone: {
    name: 'iPhone Accessories',
    nameAr: 'اكسسوارات آيفون',
    desc: 'Find the perfect accessories for your iPhone.',
    descAr: 'اعثر على الاكسسوارات المثالية لآيفونك.',
    gradient: 'linear-gradient(135deg, #1a1a1a, #4a4a4a)',
  },
};

export function BrandPage() {
  const params = useParams<{ brand?: string }>();
  const location = useLocation();
  const brand = params.brand || (location.pathname.includes('samsung') ? 'samsung' : 'iphone');
  const { language, isRTL } = useApp();
  const navigate = useNavigate();
  const tx = t[language];
  const [sort, setSort] = useState('popular');

  const currentBrand = brand === 'samsung' ? 'Samsung' : 'Apple';
  const config = brandConfig[brand || 'samsung'];
  const models = phoneModels.filter(m => m.brand === currentBrand);
  const brandName = language === 'ar' ? config.nameAr : config.name;
  const brandDesc = language === 'ar' ? config.descAr : config.desc;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero banner */}
      <div
        className="py-16 px-4 lg:px-8"
        style={{ background: config.gradient }}
      >
        <div className="max-w-[1440px] mx-auto">
          <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </button>
            <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
            <span style={{ color: '#fff', fontWeight: 600 }}>{brandName}</span>
          </nav>
          <h1 className="text-4xl text-white mb-3" style={{ fontWeight: 800 }}>{brandName}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>{brandDesc}</p>
          <div className="mt-2 w-16 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>

      {/* Models grid */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
            {models.length} {tx.models}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--ks-text-secondary)' }}>{tx.sortLabel}</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg outline-none"
              style={{
                background: 'var(--ks-bg-secondary)',
                border: '1px solid var(--ks-border)',
                color: 'var(--ks-text)',
              }}
            >
              <option value="popular">{tx.sortPopular}</option>
              <option value="newest">{tx.sortNewest}</option>
              <option value="price">{tx.sortPrice}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => navigate(`/${brand}/${model.slug}`)}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl transition-all group"
              style={{
                background: 'var(--ks-bg)',
                border: '1px solid var(--ks-border)',
                boxShadow: 'var(--ks-shadow-sm)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--ks-blue)';
                e.currentTarget.style.boxShadow = 'var(--ks-shadow-md)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--ks-border)';
                e.currentTarget.style.boxShadow = 'var(--ks-shadow-sm)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: model.color }}
              >
                <Smartphone size={36} color="rgba(255,255,255,0.85)" />
              </div>
              <div className="text-center">
                <p style={{ color: 'var(--ks-text)', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>{model.name}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ks-text-muted)' }}>{model.year}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--ks-blue)', fontWeight: 600 }}>{tx.viewAll}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
