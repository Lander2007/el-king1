import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart2, Settings, LogOut } from 'lucide-react';
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

  return (
    <aside
      className="w-[220px] h-screen shrink-0 flex flex-col sticky top-0"
      style={{ background: 'var(--ks-navy)', direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--ks-blue)' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>K</span>
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>King-Store</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Admin Panel</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: active ? 'rgba(59,111,232,0.2)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                fontWeight: active ? 700 : 400,
                borderLeft: active ? '3px solid var(--ks-blue)' : '3px solid transparent',
              }}
            >
              <item.icon size={17} />
              {language === 'ar' ? item.labelAr : item.labelEn}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <span>🌐</span>
          {language === 'en' ? 'العربية' : 'English'}
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-500/10"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <LogOut size={17} />
          {language === 'ar' ? 'خروج' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}
