import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Truck, Shield, Award, RotateCcw, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

// Headline typewriter animations
function Typewriter({ words }: { words: string[] }) {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIdx];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, 40);
    } else {
      timer = setTimeout(() => {
        setCurrentText((prev) => word.slice(0, prev.length + 1));
      }, 80);
    }

    if (!isDeleting && currentText === word) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIdx((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIdx, words]);

  return (
    <span className="border-r-3 border-[var(--ks-blue)] pr-1 animate-pulse font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--ks-blue)] to-[var(--ks-gold)]">
      {currentText}
    </span>
  );
}

// Micro-animations for counter stats
function AnimatedCounter({ end, duration = 1500, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function TrustBadge({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ background: 'var(--ks-bg-secondary)', border: '1px solid var(--ks-border)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--ks-bg-tertiary)' }}>
        <Icon size={22} style={{ color: 'var(--ks-blue)' }} />
      </div>
      <div>
        <p style={{ fontWeight: 700, color: 'var(--ks-text)', fontSize: '15px' }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--ks-text-muted)' }}>{desc}</p>
      </div>
    </div>
  );
}

export function HomePage() {
  const { language, isRTL, t, products, getCurrencySymbol, selectedCountry } = useApp();
  const navigate = useNavigate();

  const typewriterWords = language === 'en'
    ? ["Accessories Built for Greatness.", "Sleek Designs. Ultimate Protection.", "Elevate Your Premium Tech."]
    : ["إكسسوارات صُنعت للعظمة.", "تصاميم أنيقة. حماية فائقة.", "ارتقِ بأجهزتك التقنية الفاخرة."];

  // Retrieve featured and new arrivals dynamically from MongoDB
  const featured = products.filter(p => p.isFeatured).slice(0, 8);
  const newArrivals = products.slice(0, 8); // Seeding sorted by latest createdAt

  // Get distinct phone models for list
  const featuredModels = products
    .filter(p => p.isActive)
    .map(p => ({ model: p.model, category: p.category, brand: p.brand }))
    .filter((value, index, self) => self.findIndex(v => v.model === value.model) === index)
    .slice(0, 10);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-[var(--ks-bg)] min-h-screen">
      {/* Hero Section with premium mesh gradient */}
      <section className="relative overflow-hidden min-h-[580px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=1200')" }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-[#0a0f2c] via-[#101950] to-[#1e2a78] opacity-95"
        />
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--ks-blue)] blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--ks-gold)] blur-3xl animate-pulse" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-4 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <span
              className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold mb-5 shadow-sm"
              style={{ background: 'rgba(59,111,232,0.15)', border: '1px solid rgba(59,111,232,0.3)', color: '#7AAFFF' }}
            >
              {t('hero.tag')}
            </span>
            <h1 className="mb-6 text-white text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight min-h-[120px] sm:min-h-[auto]">
              <Typewriter words={typewriterWords} />
            </h1>
            <p className="mb-10 text-base sm:text-lg leading-relaxed text-slate-300 font-medium">{t('hero.subtitle')}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => navigate('/samsung')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{ background: 'var(--ks-blue)' }}
              >
                {t('hero.shopSamsung')}
                <ChevronRight size={18} className={`transition-transform duration-300 ${isRTL ? 'rotate-185 hover:-translate-x-1' : 'hover:translate-x-1'}`} />
              </button>
              <button
                onClick={() => navigate('/iphone')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 text-white"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {t('hero.shopIphone')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Counter Stats Section */}
      <section className="relative -mt-10 z-10 max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-3 gap-4 p-6 sm:p-8 rounded-3xl shadow-xl border border-[var(--ks-border)]" style={{ background: 'var(--ks-bg)' }}>
          <div className="text-center">
            <h3 className="text-xl sm:text-3xl font-black text-[var(--ks-blue)]">
              <AnimatedCounter end={56} suffix="+" />
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[var(--ks-text-secondary)] mt-1">{t('admin.activeProducts')}</p>
          </div>
          <div className="text-center border-x border-[var(--ks-border)]">
            <h3 className="text-xl sm:text-3xl font-black text-[var(--ks-blue)]">
              <AnimatedCounter end={1280} suffix="+" />
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[var(--ks-text-secondary)] mt-1">{t('admin.newCustomers')}</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl sm:text-3xl font-black text-[var(--ks-blue)]">
              <AnimatedCounter end={9500} suffix="+" />
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[var(--ks-text-secondary)] mt-1">
              {language === 'ar' ? 'طلبات مُوصلة' : 'Orders Delivered'}
            </p>
          </div>
        </div>
      </section>

      {/* Shop by Brand */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20">
        <h2 className="text-3xl font-extrabold mb-10" style={{ color: 'var(--ks-text)' }}>
          {t('products.brandTitle')}
          <span className="block mt-2 w-16 h-1 rounded-full" style={{ background: 'var(--ks-blue)' }} />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Samsung */}
          <div
            onClick={() => navigate('/samsung')}
            className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ minHeight: '300px' }}
          >
            <img src="https://images.unsplash.com/photo-1773414422164-eefdc240da58?w=800" alt="Samsung" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-slate-900/40" />
            <div className="relative p-8 h-full flex flex-col justify-between" style={{ minHeight: '300px' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white">S</div>
              <div>
                <h3 className="text-white text-2xl font-bold mb-1">{t('navbar.samsung')}</h3>
                <p className="text-sm text-slate-300 mb-5">{t('products.samsungDesc')}</p>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold" style={{ background: 'var(--ks-blue)' }}>
                  {t('products.viewAll')} <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
                </span>
              </div>
            </div>
          </div>

          {/* iPhone */}
          <div
            onClick={() => navigate('/iphone')}
            className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ minHeight: '300px' }}
          >
            <img src="https://images.unsplash.com/photo-1726587912121-ea21fcc57ff8?w=800" alt="iPhone" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-slate-900/40" />
            <div className="relative p-8 h-full flex flex-col justify-between" style={{ minHeight: '300px' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white">A</div>
              <div>
                <h3 className="text-white text-2xl font-bold mb-1">{t('navbar.iphone')}</h3>
                <p className="text-sm text-slate-300 mb-5">{t('products.iphoneDesc')}</p>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold" style={{ background: 'var(--ks-blue)' }}>
                  {t('products.viewAll')} <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Models */}
      {featuredModels.length > 0 && (
        <section className="py-16 bg-[var(--ks-bg-secondary)] border-y border-[var(--ks-border)]">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-extrabold mb-10" style={{ color: 'var(--ks-text)' }}>
              {t('products.featuredModels')}
              <span className="block mt-2 w-16 h-1 rounded-full" style={{ background: 'var(--ks-blue)' }} />
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {featuredModels.map((model) => (
                <button
                  key={model.model}
                  onClick={() => navigate(`/${model.category}/${model.model.toLowerCase().replace(/ /g, '-')}`)}
                  className="shrink-0 flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 bg-[var(--ks-bg)] hover:shadow-lg border border-[var(--ks-border)] hover:border-[var(--ks-blue)] w-44"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--ks-bg-tertiary)]">
                    <Smartphone size={24} className="text-[var(--ks-blue)]" />
                  </div>
                  <div className="text-center w-full">
                    <p className="text-xs font-extrabold text-[var(--ks-text)] truncate">{model.model}</p>
                    <p className="text-[10px] font-bold text-[var(--ks-blue)] mt-1.5 uppercase tracking-wide">{t('products.viewAccessories')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-20">
          <h2 className="text-3xl font-extrabold mb-10" style={{ color: 'var(--ks-text)' }}>
            {language === 'ar' ? 'المنتجات المميزة' : 'Featured Products'}
            <span className="block mt-2 w-16 h-1 rounded-full" style={{ background: 'var(--ks-blue)' }} />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--ks-text)' }}>
              {t('products.newArrivals')}
              <span className="block mt-2 w-16 h-1 rounded-full" style={{ background: 'var(--ks-blue)' }} />
            </h2>
            <button
              onClick={() => navigate('/samsung')}
              className="flex items-center gap-1.5 text-sm font-bold text-[var(--ks-blue)] hover:underline"
            >
              {t('products.viewAllProducts')} <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Why King-Store */}
      <section className="py-20 bg-[var(--ks-bg-secondary)] border-t border-[var(--ks-border)]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-extrabold mb-12 text-center" style={{ color: 'var(--ks-text)' }}>
            {t('products.why')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <TrustBadge icon={Truck} title={t('products.trust1Title')} desc={t('products.trust1Desc')} />
            <TrustBadge icon={Shield} title={t('products.trust2Title')} desc={t('products.trust2Desc')} />
            <TrustBadge icon={Award} title={t('products.trust3Title')} desc={t('products.trust3Desc')} />
            <TrustBadge icon={RotateCcw} title={t('products.trust4Title')} desc={t('products.trust4Desc')} />
          </div>
        </div>
      </section>
    </div>
  );
}
