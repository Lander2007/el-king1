import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Package, Users, DollarSign, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { orders, revenueData, products } from '../data/mockData';

const PERIOD_OPTIONS = ['7D', '30D', '3M', '1Y'];

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: number;
  iconColor: string;
  iconBg: string;
}

function KpiCard({ icon: Icon, label, value, trend, iconColor, iconBg }: KpiCardProps) {
  const positive = trend >= 0;
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', boxShadow: 'var(--ks-shadow-sm)' }}
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <span
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
          style={{
            background: positive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: positive ? '#22c55e' : '#ef4444',
            fontWeight: 700,
          }}
        >
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {positive ? '+' : ''}{trend}%
        </span>
      </div>
      <p className="mt-4 text-2xl" style={{ color: 'var(--ks-text)', fontWeight: 800 }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: 'var(--ks-text-muted)' }}>{label}</p>
    </div>
  );
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Delivered: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
  Shipped: { bg: 'rgba(59,111,232,0.1)', text: '#3B6FE8' },
  Processing: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  Cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  Paid: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
  Pending: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  Refunded: { bg: 'rgba(139,92,246,0.1)', text: '#8b5cf6' },
};

export function AdminDashboard() {
  const { language, isRTL } = useApp();
  const [period, setPeriod] = useState('30D');
  const recentOrders = orders.slice(0, 5);
  const topProducts = products.sort((a, b) => b.reviews - a.reviews).slice(0, 5);

  const kpis = [
    {
      icon: DollarSign,
      label: language === 'ar' ? 'الإيرادات الكلية' : 'Total Revenue',
      value: '$128,450',
      trend: 12,
      iconColor: '#22c55e',
      iconBg: 'rgba(34,197,94,0.1)',
    },
    {
      icon: ShoppingCart,
      label: language === 'ar' ? 'طلبات اليوم' : 'Orders Today',
      value: '64',
      trend: 8,
      iconColor: 'var(--ks-blue)',
      iconBg: 'rgba(59,111,232,0.1)',
    },
    {
      icon: Package,
      label: language === 'ar' ? 'المنتجات النشطة' : 'Active Products',
      value: `${products.length}`,
      trend: -3,
      iconColor: '#F59E0B',
      iconBg: 'rgba(245,158,11,0.1)',
    },
    {
      icon: Users,
      label: language === 'ar' ? 'عملاء جدد' : 'New Customers',
      value: '1,284',
      trend: 24,
      iconColor: '#8b5cf6',
      iconBg: 'rgba(139,92,246,0.1)',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--ks-bg-secondary)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl" style={{ color: 'var(--ks-text)', fontWeight: 800 }}>
              {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--ks-text-muted)' }}>
              {language === 'ar' ? 'مرحباً بعودتك! إليك ملخص اليوم.' : "Welcome back! Here's what's happening today."}
            </p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map(kpi => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          {/* Revenue chart */}
          <div
            className="p-6 rounded-2xl mb-8"
            style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
                  {language === 'ar' ? 'الإيرادات' : 'Revenue'}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ks-text-muted)' }}>
                  {language === 'ar' ? 'آخر ٣٠ يوم' : 'Last 30 days'}
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--ks-bg-secondary)' }}>
                {PERIOD_OPTIONS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: period === p ? 'var(--ks-blue)' : 'transparent',
                      color: period === p ? '#fff' : 'var(--ks-text-muted)',
                      fontWeight: period === p ? 700 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B6FE8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B6FE8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ks-border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--ks-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--ks-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', borderRadius: '12px', color: 'var(--ks-text)' }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3B6FE8" strokeWidth={2.5} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Recent Orders */}
            <div
              className="lg:col-span-3 p-6 rounded-2xl"
              style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
            >
              <h3 className="text-base mb-5" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
                {language === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}
              </h3>
              <div className="space-y-0">
                <div
                  className="grid grid-cols-5 gap-3 py-2 text-xs mb-2"
                  style={{ color: 'var(--ks-text-muted)', fontWeight: 600 }}
                >
                  <span>{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</span>
                  <span>{language === 'ar' ? 'العميل' : 'Customer'}</span>
                  <span>{language === 'ar' ? 'المنتجات' : 'Items'}</span>
                  <span>{language === 'ar' ? 'المجموع' : 'Total'}</span>
                  <span>{language === 'ar' ? 'الحالة' : 'Status'}</span>
                </div>
                {recentOrders.map(order => (
                  <div
                    key={order.id}
                    className="grid grid-cols-5 gap-3 py-3 items-center"
                    style={{ borderTop: '1px solid var(--ks-border)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--ks-blue)', fontWeight: 700 }}>{order.id}</span>
                    <span className="text-xs truncate" style={{ color: 'var(--ks-text)', fontWeight: 500 }}>{order.customer}</span>
                    <span className="text-xs" style={{ color: 'var(--ks-text-secondary)' }}>{order.items}</span>
                    <span className="text-xs" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>${order.total}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs inline-block"
                      style={{
                        background: statusColors[order.deliveryStatus]?.bg,
                        color: statusColors[order.deliveryStatus]?.text,
                        fontWeight: 700,
                      }}
                    >
                      {order.deliveryStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div
              className="lg:col-span-2 p-6 rounded-2xl"
              style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
            >
              <h3 className="text-base mb-5" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
                {language === 'ar' ? 'أفضل المنتجات' : 'Top Products'}
              </h3>
              <div className="space-y-4">
                {topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                      style={{
                        background: i === 0 ? 'var(--ks-gold)' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : 'var(--ks-bg-secondary)',
                        color: i <= 2 ? '#fff' : 'var(--ks-text-muted)',
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: 'var(--ks-text)', fontWeight: 600 }}>{p.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ks-text-muted)' }}>{p.reviews} {language === 'ar' ? 'مبيعاً' : 'sold'}</p>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--ks-blue)', fontWeight: 700 }}>${(p.price * p.reviews).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
