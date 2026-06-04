import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Sun, Moon, Globe, Heart, ShoppingBag,
  ChevronDown, Clock, Smartphone, Menu, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SearchBar } from './SearchBar';

const CASE_IMG = 'https://images.unsplash.com/photo-1593830566460-2464575a9a24?w=600';

export function Navbar() {
  const {
    darkMode, toggleDarkMode,
    language, toggleLanguage, isRTL,
    cartItemCount, setCartOpen, wishlist,
    t, products, settings, selectedCountry, setSelectedCountry, getCurrencySymbol
  } = useApp();

  const [megaMenu, setMegaMenu] = useState<null | 'samsung' | 'iphone'>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const megaMenuRef = useRef<HTMLNavElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mega menu dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);



  // Static list for categories/brands
  const samsungModels = products
    .filter((p) => p.category === 'samsung')
    .map((p) => p.model)
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 6);

  const iphoneModels = products
    .filter((p) => p.category === 'apple')
    .map((p) => p.model)
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 6);

  return (
    <>


      <header
        className="sticky top-0 z-50 w-full backdrop-blur-md transition-colors duration-300"
        style={{
          background: 'var(--ks-bg)',
          borderBottom: '1px solid var(--ks-border)',
          boxShadow: 'var(--ks-shadow-sm)',
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3 lg:py-0 min-h-[4rem] flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-2 gap-y-3">
          
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl text-[var(--ks-text-secondary)] hover:bg-[var(--ks-bg-secondary)]"
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 shrink-0 group focus:outline-none"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--ks-blue) 0%, var(--ks-blue-dark) 100%)' }}
            >
              <span className="font-extrabold text-white text-lg">K</span>
            </div>
            <span className="font-extrabold tracking-tight text-xl hidden sm:inline-block" style={{ color: 'var(--ks-text)' }}>
              {settings?.siteName?.[language] || t('navbar.title')}
            </span>
          </button>

          {/* Search bar */}
          <div className="order-last lg:order-none w-full lg:w-auto flex-1 mt-1 lg:mt-0">
            <SearchBar />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 shrink-0">


            {/* Language Switcher Switch Toggle */}
            <div className="flex items-center gap-1.5 px-1 py-1 rounded-full border border-[var(--ks-border)] bg-[var(--ks-bg-secondary)]" dir="ltr">
              <button
                onClick={toggleLanguage}
                className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-1 border-transparent transition-colors duration-300 ease-in-out focus:outline-none"
                style={{ backgroundColor: language === 'en' ? 'var(--ks-blue)' : 'var(--ks-gold)' }}
                role="switch"
                aria-checked={language === 'ar'}
                aria-label="Switch language"
              >
                <span
                  className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
                    language === 'ar' ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="text-[10px] font-extrabold pr-2 text-[var(--ks-text-secondary)] uppercase">
                {language === 'en' ? 'EN' : 'AR'}
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl transition-all duration-300 hover:bg-[var(--ks-bg-secondary)] text-[var(--ks-text-secondary)] hover:text-[var(--ks-blue)]"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              className="p-2 rounded-xl transition-all duration-300 hover:bg-[var(--ks-bg-secondary)] text-[var(--ks-text-secondary)] hover:text-[var(--ks-blue)] relative"
              aria-label="Wishlist"
            >
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-extrabold"
                  style={{ background: '#E84040' }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 rounded-xl transition-all duration-300 hover:bg-[var(--ks-bg-secondary)] text-[var(--ks-text-secondary)] hover:text-[var(--ks-blue)] relative"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-extrabold"
                  style={{ background: 'var(--ks-blue)' }}
                >
                  {cartItemCount}
                </span>
              )}
            </button>


          </div>
        </div>

        {/* Category mega-menu bar */}
        <nav
          ref={megaMenuRef}
          className="border-t max-w-[1440px] mx-auto px-4 lg:px-8 hidden lg:flex items-center gap-2"
          style={{ borderColor: 'var(--ks-border)' }}
        >
          {(['samsung', 'iphone'] as const).map((brand) => (
            <div
              key={brand}
              className="relative"
              onMouseEnter={() => setMegaMenu(brand)}
              onMouseLeave={() => setMegaMenu(null)}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMegaMenu(prev => prev === brand ? null : brand);
                }}
                className="flex items-center gap-1 px-4 py-3.5 text-sm font-semibold transition-all duration-300"
                style={{
                  color: megaMenu === brand ? 'var(--ks-blue)' : 'var(--ks-text-secondary)',
                }}
              >
                <span>{brand === 'samsung' ? t('navbar.samsung') : t('navbar.iphone')}</span>
                <ChevronDown size={13} className={`transition-transform duration-300 ${megaMenu === brand ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Dropdown with smooth cubic-bezier height/scale transition */}
              <div
                className={`absolute ${
                  isRTL ? 'right-0' : 'left-0'
                } top-full w-[540px] rounded-2xl shadow-2xl z-50 p-5 border border-[var(--ks-border)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  megaMenu === brand ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                }`}
                style={{ background: 'var(--ks-bg)' }}
              >
                <div className="grid grid-cols-3 gap-2">
                  {(brand === 'samsung' ? samsungModels : iphoneModels).map((model) => {
                    const modelSlug = model.toLowerCase().replace(/\+/g, '-plus').replace(/ /g, '-');
                    return (
                      <button
                        key={model}
                        onClick={() => {
                          navigate(`/${brand}/${modelSlug}`);
                          setMegaMenu(null);
                        }}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 hover:bg-[var(--ks-bg-secondary)] border border-[var(--ks-border)] hover:border-[var(--ks-blue)] group text-center"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{ background: 'var(--ks-bg-tertiary)' }}
                        >
                          <Smartphone size={20} className="text-[var(--ks-blue)]" />
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--ks-text)' }}>
                          {model}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    navigate(`/${brand}`);
                    setMegaMenu(null);
                  }}
                  className="mt-4 text-xs font-bold text-[var(--ks-blue)] hover:underline block"
                >
                  {t('navbar.allModels')}
                </button>
              </div>
            </div>
          ))}
        </nav>
      </header>

      {/* Mobile Drawer (Slide-in) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

        {/* Panel with cubic-bezier slide transition */}
        <div
          className={`absolute top-0 bottom-0 w-80 max-w-[85vw] p-6 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isRTL
              ? mobileMenuOpen ? 'translate-x-0 right-0' : 'translate-x-full right-0'
              : mobileMenuOpen ? 'translate-x-0 left-0' : '-translate-x-full left-0'
          }`}
          style={{ background: 'var(--ks-bg)' }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="font-extrabold text-lg" style={{ color: 'var(--ks-text)' }}>
              {t('navbar.title')}
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg hover:bg-[var(--ks-bg-secondary)]"
            >
              <X size={20} style={{ color: 'var(--ks-text-secondary)' }} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-extrabold text-[var(--ks-text-muted)] uppercase tracking-widest mb-3">
                {t('footer.categories')}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/samsung');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right py-2 font-semibold hover:text-[var(--ks-blue)] transition-colors block"
                  style={{ color: 'var(--ks-text-secondary)', textAlign: isRTL ? 'right' : 'left' }}
                >
                  {t('navbar.samsung')}
                </button>
                <button
                  onClick={() => {
                    navigate('/iphone');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right py-2 font-semibold hover:text-[var(--ks-blue)] transition-colors block"
                  style={{ color: 'var(--ks-text-secondary)', textAlign: isRTL ? 'right' : 'left' }}
                >
                  {t('navbar.iphone')}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--ks-border)] space-y-4">
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-2 text-sm font-semibold"
                style={{ color: 'var(--ks-text-secondary)' }}
              >
                <span>{language === 'en' ? 'العربية' : 'English'}</span>
                <Globe size={16} />
              </button>

              <button
                onClick={() => {
                  toggleDarkMode();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-2 text-sm font-semibold"
                style={{ color: 'var(--ks-text-secondary)' }}
              >
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>


            </div>
          </div>
        </div>
      </div>
    </>
  );
}
