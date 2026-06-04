import React from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle, Package, Truck, MapPin, Home, ClipboardList, Phone, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

export function OrderConfirmationPage() {
  const { language, isRTL, products, getCurrencySymbol } = useApp();
  const navigate = useNavigate();
  const currencySymbol = getCurrencySymbol();

  // Read order from sessionStorage (set by PaymentPage after successful order POST)
  const lastOrder = (() => {
    try { return JSON.parse(sessionStorage.getItem('lastOrder') || '{}'); } catch { return {}; }
  })();
  const checkoutData = (() => {
    try { return JSON.parse(sessionStorage.getItem('checkoutData') || '{}'); } catch { return {}; }
  })();

  const orderNumber = lastOrder?._id
    ? `#KS-${lastOrder._id.slice(-6).toUpperCase()}`
    : '#KS-10240';

  const total = lastOrder?.total ?? checkoutData?.total ?? '129.98';
  const paymentMethod = lastOrder?.paymentMethod ?? 'cod';

  const paymentLabels: Record<string, { en: string; ar: string }> = {
    cod: { en: 'Cash on Delivery', ar: 'الدفع عند الاستلام' },
    instapay: { en: 'InstaPay', ar: 'إنستاباي' },
    vodafone_cash: { en: 'Vodafone Cash', ar: 'فودافون كاش' },
    orange_cash: { en: 'Orange Cash', ar: 'أورنج كاش' },
    etisalat_cash: { en: 'Etisalat Cash', ar: 'اتصالات كاش' },
  };

  const recommendations = products.filter((_, i) => i < 4);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--ks-bg-secondary)', minHeight: '100vh' }}>
      <div className="max-w-[900px] mx-auto px-4 py-16">

        {/* ── Success Hero ── */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(34,197,94,0.15)' }}
            />
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}
            >
              <CheckCircle size={52} className="text-[#22c55e]" strokeWidth={2} />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--ks-text)' }}>
            {language === 'ar' ? 'شكراً لطلبك! 🎉' : 'Thank you for your order! 🎉'}
          </h1>
          <p className="text-base font-medium" style={{ color: 'var(--ks-text-secondary)' }}>
            {language === 'ar'
              ? 'تم تأكيد طلبك وسيتم التواصل معك قريباً لتأكيد الشحن.'
              : 'Your order is confirmed. We\'ll contact you soon to confirm shipment.'}
          </p>
        </div>

        {/* ── Order Info Card ── */}
        <div
          className="p-6 rounded-3xl mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', boxShadow: 'var(--ks-shadow-sm)' }}
        >
          {[
            {
              label: language === 'ar' ? 'رقم الطلب' : 'Order Number',
              value: orderNumber,
              color: 'var(--ks-blue)',
            },
            {
              label: language === 'ar' ? 'الإجمالي' : 'Total',
              value: `${currencySymbol} ${parseFloat(String(total)).toFixed(2)}`,
              color: 'var(--ks-blue)',
            },
            {
              label: language === 'ar' ? 'طريقة الدفع' : 'Payment',
              value: language === 'ar'
                ? paymentLabels[paymentMethod]?.ar ?? paymentMethod
                : paymentLabels[paymentMethod]?.en ?? paymentMethod,
              color: 'var(--ks-text)',
            },
            {
              label: language === 'ar' ? 'التوصيل المتوقع' : 'Est. Delivery',
              value: language === 'ar' ? '١–٣ أيام عمل' : '1–3 Business Days',
              color: '#22c55e',
            },
          ].map((item, i, arr) => (
            <div key={item.label} className="text-center flex flex-col items-center gap-1">
              {i > 0 && <div className="hidden md:block absolute h-10 w-px" style={{ background: 'var(--ks-border)' }} />}
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--ks-text-muted)' }}>
                {item.label}
              </p>
              <p className="font-extrabold text-sm" style={{ color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Order Timeline ── */}
        <div
          className="p-6 rounded-3xl mb-8"
          style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
        >
          <h3 className="text-base font-extrabold mb-6" style={{ color: 'var(--ks-text)' }}>
            {language === 'ar' ? 'حالة الطلب' : 'Order Status'}
          </h3>
          <div className="flex items-center justify-between">
            {[
              { icon: CheckCircle, en: 'Order Placed', ar: 'تم الطلب', done: true },
              { icon: Package, en: 'Processing', ar: 'جاري التجهيز', done: true },
              { icon: Truck, en: 'Shipped', ar: 'تم الشحن', done: false },
              { icon: MapPin, en: 'Delivered', ar: 'تم التوصيل', done: false },
            ].map((step, i, arr) => (
              <React.Fragment key={step.en}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: step.done ? 'rgba(34,197,94,0.12)' : 'var(--ks-bg-secondary)',
                      border: step.done ? '2px solid #22c55e' : '2px solid var(--ks-border)',
                    }}
                  >
                    <step.icon size={20} style={{ color: step.done ? '#22c55e' : 'var(--ks-text-muted)' }} />
                  </div>
                  <span
                    className="text-xs text-center font-semibold"
                    style={{ color: step.done ? 'var(--ks-text)' : 'var(--ks-text-muted)' }}
                  >
                    {language === 'ar' ? step.ar : step.en}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-2 rounded-full"
                    style={{ background: step.done && arr[i + 1].done ? '#22c55e' : 'var(--ks-border)' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Customer Info (if available) ── */}
        {(checkoutData.fullName || checkoutData.phone) && (
          <div
            className="p-6 rounded-3xl mb-8"
            style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}
          >
            <h3 className="text-base font-extrabold mb-4" style={{ color: 'var(--ks-text)' }}>
              {language === 'ar' ? 'تفاصيل التوصيل' : 'Delivery Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {checkoutData.fullName && (
                <div className="flex items-center gap-2.5" style={{ color: 'var(--ks-text-secondary)' }}>
                  <Home size={14} style={{ color: 'var(--ks-blue)' }} />
                  <span><strong>{checkoutData.fullName}</strong></span>
                </div>
              )}
              {checkoutData.phone && (
                <a
                  href={`tel:${checkoutData.phone}`}
                  className="flex items-center gap-2.5 hover:text-[var(--ks-blue)] transition-colors"
                  style={{ color: 'var(--ks-text-secondary)' }}
                >
                  <Phone size={14} style={{ color: 'var(--ks-blue)' }} />
                  <span>{checkoutData.phone}</span>
                </a>
              )}
              {checkoutData.email && (
                <a
                  href={`mailto:${checkoutData.email}`}
                  className="flex items-center gap-2.5 hover:text-[var(--ks-blue)] transition-colors"
                  style={{ color: 'var(--ks-text-secondary)' }}
                >
                  <Mail size={14} style={{ color: 'var(--ks-blue)' }} />
                  <span>{checkoutData.email}</span>
                </a>
              )}
              {(checkoutData.address || checkoutData.city) && (
                <div className="flex items-center gap-2.5" style={{ color: 'var(--ks-text-secondary)' }}>
                  <MapPin size={14} style={{ color: 'var(--ks-blue)' }} />
                  <span>
                    {[checkoutData.address, checkoutData.city, checkoutData.governorate]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Recommendations ── */}
        {recommendations.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-extrabold mb-6" style={{ color: 'var(--ks-text)' }}>
              {language === 'ar' ? 'قد يعجبك أيضاً' : 'You might also love these'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map(p => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3.5 rounded-2xl text-white font-extrabold text-sm transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: 'var(--ks-blue)' }}
          >
            {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-8 py-3.5 rounded-2xl font-extrabold text-sm transition-all hover:bg-opacity-80"
            style={{
              background: 'var(--ks-bg)',
              border: '2px solid var(--ks-border)',
              color: 'var(--ks-text)',
            }}
          >
            <ClipboardList size={15} className="inline mr-2" />
            {language === 'ar' ? 'عرض جميع الطلبات' : 'View All Orders'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
