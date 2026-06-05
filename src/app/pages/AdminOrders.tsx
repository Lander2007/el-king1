import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, ChevronRight, Package, Truck, CheckCircle, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';

import { API_URL } from '../../config';

const statusColors: Record<string, { bg: string; text: string }> = {
  delivered: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
  shipped: { bg: 'rgba(59,111,232,0.1)', text: '#3B6FE8' },
  processing: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  confirmed: { bg: 'rgba(59,111,232,0.1)', text: '#3B6FE8' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  paid: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
  pending: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  failed: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  refunded: { bg: 'rgba(139,92,246,0.1)', text: '#8b5cf6' },
};

function StatusBadge({ label }: { label: string }) {
  const normalizedLabel = label.toLowerCase();
  const c = statusColors[normalizedLabel] || { bg: 'var(--ks-bg-secondary)', text: 'var(--ks-text-muted)' };
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize" style={{ background: c.bg, color: c.text }}>
      {label}
    </span>
  );
}

const TIMELINE_STEPS = [
  { key: 'created', labelEn: 'Order Created', labelAr: 'تم الطلب', icon: Package },
  { key: 'paid', labelEn: 'Payment Confirmed', labelAr: 'تم الدفع', icon: CreditCard },
  { key: 'processing', labelEn: 'Processing', labelAr: 'قيد المعالجة', icon: Package },
  { key: 'shipped', labelEn: 'Shipped', labelAr: 'تم الشحن', icon: Truck },
  { key: 'delivered', labelEn: 'Delivered', labelAr: 'تم التوصيل', icon: CheckCircle },
];

function getStepsDone(order: any): number {
  if (order.orderStatus === 'cancelled') return 0;
  let steps = 1;
  if (order.paymentStatus === 'paid') steps = 2;
  if (['processing', 'shipped', 'delivered'].includes(order.orderStatus)) steps = 3;
  if (['shipped', 'delivered'].includes(order.orderStatus)) steps = 4;
  if (order.orderStatus === 'delivered') steps = 5;
  return steps;
}

// Helper function to handle authenticated fetches using the stored admin token
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('admin_token');
  const headers: HeadersInit = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  return fetch(url, { ...options, headers });
};

export function AdminOrders() {
  const { language, isRTL, socket } = useApp();
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch orders from database
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/admin/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrdersList(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Sync with Socket.IO in real-time
  useEffect(() => {
    if (!socket) return;

    const handleOrderCreated = (newOrder: any) => {
      setOrdersList(prev => {
        if (prev.find(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    };

    const handleOrderUpdated = (updatedOrder: any) => {
      setOrdersList(prev => prev.map(o => (o._id === updatedOrder._id ? updatedOrder : o)));
      setSelectedOrder((prev: any) => {
        if (prev && prev._id === updatedOrder._id) {
          return updatedOrder;
        }
        return prev;
      });
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:updated', handleOrderUpdated);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:updated', handleOrderUpdated);
    };
  }, [socket]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update order status');
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`${API_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update payment status');
      }
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
      alert(err.message || 'Failed to update payment status');
    }
  };

  const filtered = ordersList.filter(o => {
    const orderNumber = o.orderNumber || o._id || o.id || '';
    const name = o.customer?.name || '';
    const email = o.customer?.email || '';
    return (
      (orderNumber.toLowerCase().includes(search.toLowerCase()) ||
       name.toLowerCase().includes(search.toLowerCase()) ||
       email.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || o.orderStatus === statusFilter || o.paymentStatus === statusFilter)
    );
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--ks-bg-secondary)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl" style={{ color: 'var(--ks-text)', fontWeight: 800 }}>
            {language === 'ar' ? 'الطلبات' : 'Orders'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ks-text-muted)' }}>
            {ordersList.length} {language === 'ar' ? 'طلب إجمالي' : 'total orders'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div
            className="flex items-center gap-2 px-3 rounded-xl flex-1 max-w-full sm:max-w-xs"
            style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
          >
            <Search size={15} style={{ color: 'var(--ks-text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالرقم أو العميل...' : 'Search by order ID or customer...'}
              className="bg-transparent outline-none text-sm py-2.5 flex-1"
              style={{ color: 'var(--ks-text)' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm outline-none px-3 py-2.5 rounded-xl capitalize"
            style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'var(--ks-text)' }}
          >
            <option value="">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'paid', 'failed', 'refunded'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'var(--ks-text-secondary)' }}
          >
            <Calendar size={15} />
            {language === 'ar' ? 'نطاق التاريخ' : 'Date Range'}
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ks-border)' }}>
                  {[
                    { en: 'Order ID', ar: 'رقم الطلب' },
                    { en: 'Date', ar: 'التاريخ' },
                    { en: 'Customer', ar: 'العميل' },
                    { en: 'Items', ar: 'العناصر' },
                    { en: 'Total', ar: 'المجموع' },
                    { en: 'Payment', ar: 'الدفع' },
                    { en: 'Delivery', ar: 'التوصيل' },
                    { en: 'Actions', ar: 'الإجراءات' },
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-xs"
                      style={{ color: 'var(--ks-text-muted)', fontWeight: 700, background: 'var(--ks-bg-secondary)', whiteSpace: 'nowrap' }}
                    >
                      {language === 'ar' ? h.ar : h.en}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-sm" style={{ color: 'var(--ks-text-secondary)' }}>
                      {language === 'ar' ? 'جاري التحميل...' : 'Loading orders...'}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-sm" style={{ color: 'var(--ks-text-secondary)' }}>
                      {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, i) => {
                    const id = order._id || order.id;
                    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
                    const itemCount = order.items?.reduce((s: number, item: any) => s + (item.quantity || 0), 0) || 0;
                    
                    return (
                      <tr
                        key={id}
                        className="hover:bg-[var(--ks-bg-secondary)] transition-colors cursor-pointer"
                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--ks-border)' : 'none' }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm" style={{ color: 'var(--ks-blue)', fontWeight: 700 }}>{order.orderNumber}</span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--ks-text-secondary)' }}>{date}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: 'var(--ks-text)', fontWeight: 600 }}>{order.customer?.name}</p>
                          <p className="text-xs" style={{ color: 'var(--ks-text-muted)' }}>{order.customer?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--ks-text-secondary)' }}>{itemCount}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold animate-fade-in" style={{ color: 'var(--ks-text)' }}>
                            {(order.total || 0).toLocaleString()} EGP
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge label={order.paymentStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge label={order.orderStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg text-xs hover:bg-[var(--ks-bg-tertiary)] transition-colors flex items-center gap-1"
                              style={{ color: 'var(--ks-blue)', fontWeight: 600 }}
                            >
                              <ChevronRight size={14} /> {language === 'ar' ? 'عرض' : 'View'}
                            </button>
                            <select
                              className="text-xs px-2 py-1 rounded-lg outline-none"
                              style={{ background: 'var(--ks-bg-secondary)', border: '1px solid var(--ks-border)', color: 'var(--ks-text)' }}
                              onClick={e => e.stopPropagation()}
                              value={order.orderStatus}
                              onChange={e => handleUpdateStatus(id, e.target.value)}
                            >
                              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Order detail panel */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedOrder(null)} />
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[480px] flex flex-col shadow-2xl overflow-y-auto"
            style={{ background: 'var(--ks-bg)', borderLeft: '1px solid var(--ks-border)' }}
          >
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--ks-border)' }}>
              <h2 className="text-lg" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
                {selectedOrder.orderNumber}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-[var(--ks-bg-secondary)]">
                <X size={20} style={{ color: 'var(--ks-text-secondary)' }} />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {/* Status timeline */}
              <div>
                <h3 className="text-sm mb-4" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
                  {language === 'ar' ? 'مراحل الطلب' : 'Order Timeline'}
                </h3>
                <div className="space-y-4">
                  {TIMELINE_STEPS.map((step, i) => {
                    const done = i < getStepsDone(selectedOrder);
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background: done ? 'rgba(34,197,94,0.15)' : 'var(--ks-bg-secondary)',
                              border: done ? '2px solid #22c55e' : '2px solid var(--ks-border)',
                            }}
                          >
                            <step.icon size={14} style={{ color: done ? '#22c55e' : 'var(--ks-text-muted)' }} />
                          </div>
                          {i < TIMELINE_STEPS.length - 1 && (
                            <div className="w-0.5 h-6 mt-1" style={{ background: done ? '#22c55e' : 'var(--ks-border)' }} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: done ? 'var(--ks-text)' : 'var(--ks-text-muted)', fontWeight: done ? 600 : 400 }}>
                            {language === 'ar' ? step.labelAr : step.labelEn}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer info */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--ks-bg-secondary)' }}>
                <h3 className="text-sm mb-3" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
                  {language === 'ar' ? 'معلومات العميل' : 'Customer'}
                </h3>
                <p className="text-sm" style={{ color: 'var(--ks-text)', fontWeight: 600 }}>{selectedOrder.customer?.name}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ks-text-muted)' }}>{selectedOrder.customer?.email}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ks-text-muted)' }}>{selectedOrder.customer?.phone}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ks-text-muted)' }}>
                  {selectedOrder.customer?.address?.street}, {selectedOrder.customer?.address?.city}, {selectedOrder.customer?.address?.governorate}, {selectedOrder.customer?.address?.country}
                </p>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-sm mb-3" style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
                  {language === 'ar' ? 'المنتجات' : 'Items'}
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, i: number) => {
                    const prodName = item.product?.name?.[language] || item.product?.name?.en || item.product?.name || 'Product';
                    const prodImg = item.product?.images?.[0]?.url || item.product?.image || '';
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <img src={prodImg} alt={prodName} className="w-12 h-12 rounded-lg object-cover border border-[var(--ks-border)]" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: 'var(--ks-text)' }}>{prodName}</p>
                          <p className="text-xs" style={{ color: 'var(--ks-text-muted)' }}>×{item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold animate-fade-in" style={{ color: 'var(--ks-blue)' }}>
                          {(item.priceAtPurchase * item.quantity).toLocaleString()} EGP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statuses */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl flex flex-col justify-between" style={{ background: 'var(--ks-bg-secondary)' }}>
                  <p className="text-xs mb-1.5" style={{ color: 'var(--ks-text-muted)' }}>{language === 'ar' ? 'حالة الدفع' : 'Payment'}</p>
                  <select
                    className="text-xs px-2 py-1 rounded-lg outline-none"
                    style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'var(--ks-text)' }}
                    value={selectedOrder.paymentStatus}
                    onChange={e => handleUpdatePaymentStatus(selectedOrder._id, e.target.value)}
                  >
                    {['pending', 'paid', 'failed', 'refunded'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="p-3 rounded-xl flex flex-col justify-between" style={{ background: 'var(--ks-bg-secondary)' }}>
                  <p className="text-xs mb-1.5" style={{ color: 'var(--ks-text-muted)' }}>{language === 'ar' ? 'حالة التوصيل' : 'Delivery'}</p>
                  <select
                    className="text-xs px-2 py-1 rounded-lg outline-none"
                    style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'var(--ks-text)' }}
                    value={selectedOrder.orderStatus}
                    onChange={e => handleUpdateStatus(selectedOrder._id, e.target.value)}
                  >
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 p-3 rounded-xl" style={{ background: 'var(--ks-bg-secondary)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--ks-text-muted)' }}>{language === 'ar' ? 'الإجمالي' : 'Order Total'}</p>
                  <p className="text-xl font-bold animate-fade-in" style={{ color: 'var(--ks-blue)' }}>
                    {(selectedOrder.total || 0).toLocaleString()} EGP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
