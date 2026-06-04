import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart2, Settings, LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { icon: LayoutDashboard, labelEn: 'Dashboard', labelAr: 'لوحة التحكم', path: '/admin' },
  { icon: Package, labelEn: 'Products', labelAr: 'المنتجات', path: '/admin/products' },
  { icon: ShoppingCart, labelEn: 'Orders', labelAr: 'الطلبات', path: '/admin/orders' },
  { icon: Users, labelEn: 'Customers', labelAr: 'العملاء', path: '/admin/customers' },
  { icon: BarChart2, labelEn: 'Analytics', labelAr: 'التحليلات', path: '/admin/analytics' },
  { icon: Settings, labelEn: 'Settings', labelAr: 'الإعدادات', path: '/admin/settings' },
];

export function AdminSidebar() {
  const { language, toggleLanguage, isRTL } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
  const [isOpen, setIsOpen] = React.useState(window.innerWidth >= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      {!isOpen && isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-6 z-40 p-2.5 rounded-xl shadow-lg"
          style={{
            background: 'var(--ks-navy)',
            color: 'white',
            [isRTL ? 'right' : 'left']: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`h-screen shrink-0 flex flex-col transition-all duration-300 z-50 ${
          isMobile ? 'fixed top-0 bottom-0' : 'sticky top-0'
        } ${isOpen ? 'w-[220px]' : isMobile ? 'w-[220px]' : 'w-[80px]'} ${
          isMobile && !isOpen ? (isRTL ? 'translate-x-full right-0' : '-translate-x-full left-0') : (isRTL ? 'translate-x-0 right-0' : 'translate-x-0 left-0')
        }`}
        style={{ background: 'var(--ks-navy)', direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Desktop Toggle */}
        {!isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute top-8 z-50 w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md"
            style={{ 
              background: 'var(--ks-blue)', 
              color: 'white',
              [isRTL ? 'left' : 'right']: '-12px',
            }}
          >
            <ChevronLeft size={14} className={`transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''} ${isRTL && isOpen ? 'rotate-180' : isRTL && !isOpen ? 'rotate-0' : ''}`} />
          </button>
        )}

        {/* Logo */}
        <div className={`px-5 py-6 flex items-center ${isOpen ? 'gap-2' : 'justify-center'} relative`} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--ks-blue)' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>K</span>
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="truncate" style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>King-Store</p>
              <p className="truncate" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Admin Panel</p>
            </div>
          )}
          {isMobile && isOpen && (
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 shrink-0">
              <X size={18} color="white" />
            </button>
          )}
        </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-sm transition-all`}
              style={{
                background: active ? 'rgba(59,111,232,0.2)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                fontWeight: active ? 700 : 400,
                borderLeft: isOpen && active && !isRTL ? '3px solid var(--ks-blue)' : '3px solid transparent',
                borderRight: isOpen && active && isRTL ? '3px solid var(--ks-blue)' : '3px solid transparent',
              }}
              title={!isOpen ? (language === 'ar' ? item.labelAr : item.labelEn) : undefined}
            >
              <item.icon size={17} className="shrink-0" />
              {isOpen && <span className="truncate">{language === 'ar' ? item.labelAr : item.labelEn}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={`px-3 py-4 space-y-2 ${!isOpen ? 'flex flex-col items-center' : ''}`} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={toggleLanguage}
          className={`w-full flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-sm transition-colors hover:bg-white/10`}
          style={{ color: 'rgba(255,255,255,0.5)' }}
          title={!isOpen ? (language === 'en' ? 'العربية' : 'English') : undefined}
        >
          <span className="shrink-0">🌐</span>
          {isOpen && <span className="truncate">{language === 'en' ? 'العربية' : 'English'}</span>}
        </button>
        <button
          onClick={() => navigate('/')}
          className={`w-full flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-sm transition-colors hover:bg-red-500/10`}
          style={{ color: 'rgba(255,255,255,0.5)' }}
          title={!isOpen ? (language === 'ar' ? 'خروج' : 'Logout') : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          {isOpen && <span className="truncate">{language === 'ar' ? 'خروج' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
