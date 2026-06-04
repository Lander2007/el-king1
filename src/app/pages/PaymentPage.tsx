import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, ChevronLeft, Check, Loader2, Truck, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── SVG Payment Icons ─────────────────────────────────────────────────────────
const CodIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" width={36} height={36}>
    <rect width="40" height="40" rx="10" fill="#22c55e" opacity="0.12" />
    <path d="M8 14h24v2H8zM8 24h24v2H8zM8 19h16v2H8z" fill="#22c55e" />
    <circle cx="30" cy="26" r="5" fill="#22c55e" />
    <path d="M28 26l1.5 1.5L32 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InstaPayIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" width={36} height={36}>
    <rect width="40" height="40" rx="10" fill="#8B5CF6" opacity="0.12" />
    <path d="M12 20h16M20 12l8 8-8 8" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VodafoneIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" width={36} height={36}>
    <rect width="40" height="40" rx="10" fill="#E84040" opacity="0.12" />
    <path d="M20 10c-5.52 0-10 4.48-10 10 0 3.89 2.22 7.26 5.47 8.96L20 30l4.53-1.04C27.78 27.26 30 23.89 30 20c0-5.52-4.48-10-10-10z" fill="#E84040" opacity="0.9" />
    <path d="M23 17l-5 6h3l-1 4 5-6h-3l1-4z" fill="white" />
  </svg>
);

const OrangeIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" width={36} height={36}>
    <rect width="40" height="40" rx="10" fill="#F97316" opacity="0.12" />
    <rect x="10" y="15" width="20" height="12" rx="3" fill="#F97316" />
    <path d="M14 19h4M14 23h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="26" cy="21" r="3" fill="white" />
  </svg>
);

const EtisalatIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" width={36} height={36}>
    <rect width="40" height="40" rx="10" fill="#3B6FE8" opacity="0.12" />
    <path d="M20 10a10 10 0 100 20A10 10 0 0020 10z" stroke="#3B6FE8" strokeWidth="2" />
    <path d="M15 20h10M20 15v10" stroke="#3B6FE8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Payment Methods Config ─────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'cod' as const,
    icon: CodIcon,
    en: 'Cash on Delivery',
    ar: 'الدفع عند الاستلام',
    descEn: 'Pay with cash when your order arrives at your doorstep.',
    descAr: 'ادفع نقداً عند وصول طلبك إلى باب منزلك.',
    badgeColor: '#22c55e',
  },
  {
    id: 'instapay' as const,
    icon: InstaPayIcon,
    en: 'InstaPay',
    ar: 'إنستاباي',
    descEn: 'Transfer instantly via InstaPay. Account: kingstore@instapay',
    descAr: 'حوّل فورياً عبر إنستاباي. الحساب: kingstore@instapay',
    badgeColor: '#8B5CF6',
  },
  {
    id: 'vodafone_cash' as const,
    icon: VodafoneIcon,
    en: 'Vodafone Cash',
    ar: 'فودافون كاش',
    descEn: 'Send to Vodafone Cash wallet: 010-1234-5678',
    descAr: 'حوّل على محفظة فودافون كاش: 010-1234-5678',
    badgeColor: '#E84040',
  },
  {
    id: 'orange_cash' as const,
    icon: OrangeIcon,
    en: 'Orange Cash',
    ar: 'أورنج كاش',
    descEn: 'Send to Orange Cash wallet: 012-1234-5678',
    descAr: 'حوّل على محفظة أورنج كاش: 012-1234-5678',
    badgeColor: '#F97316',
  },
  {
    id: 'etisalat_cash' as const,
    icon: EtisalatIcon,
    en: 'Etisalat Cash',
    ar: 'اتصالات كاش',
    descEn: 'Send to Etisalat Cash wallet: 011-1234-5678',
    descAr: 'حوّل على محفظة اتصالات كاش: 011-1234-5678',
    badgeColor: '#3B6FE8',
  },
];

export function PaymentPage() {
  const { cart, cartTotal, isRTL, language, discount, selectedCountry, getCurrencySymbol, clearCart, t } = useApp();
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState<string>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const checkoutData = (() => {
    try { return JSON.parse(sessionStorage.getItem('checkoutData') || '{}'); } catch { return {}; }
  })();

  const currencySymbol = getCurrencySymbol();
  const subtotal = cartTotal;
  const discountAmt = subtotal * discount;
  const shippingCost = checkoutData.shippingCost ?? (selectedCountry === 'EG' ? 50 : selectedCountry === 'SA' ? 20 : selectedCountry === 'AE' ? 15 : 10);
  const total = subtotal - discountAmt + shippingCost;

  const activeMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod)!;

  const handleConfirm = async () => {
    if (!agreed) return;
    setIsProcessing(true);

    const orderPayload = {
      customer: {
        name: checkoutData.fullName || 'Guest',
        email: checkoutData.email || 'guest@example.com',
        phone: checkoutData.phone || '+201000000000',
        address: {
          street: checkoutData.address || '',
          city: checkoutData.city || '',
          governorate: checkoutData.governorate || '',
          country: checkoutData.country || 'EG',
        },
      },
      items: cart.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
        currency: currencySymbol,
      })),
      subtotal,
      shipping: shippingCost,
      total,
      currency: selectedCountry,
      country: checkoutData.country || 'EG',
      paymentMethod: selectedMethod,
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const order = await res.json();
        clearCart();
        sessionStorage.setItem('lastOrder', JSON.stringify(order));
        navigate('/order-confirmation');
      } else {
        console.error('Order failed');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Order API error:', err);
      // Navigate anyway for demo purposes
      clearCart();
      navigate('/order-confirmation');
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--ks-bg-secondary)', minHeight: '100vh' }}>
      {/* Step progress */}
      <div style={{ background: 'var(--ks-bg)', borderBottom: '1px solid var(--ks-border)' }}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-5">
          <div className="flex items-center justify-center gap-3">
            {[
              { label: language === 'ar' ? 'السلة' : 'Cart', done: true },
              { label: language === 'ar' ? 'الشحن' : 'Shipping', done: true },
              { label: language === 'ar' ? 'الدفع' : 'Payment', active: true },
              { label: language === 'ar' ? 'التأكيد' : 'Confirm' },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all"
                    style={{
                      background: step.done || step.active ? 'var(--ks-blue)' : 'var(--ks-bg-secondary)',
                      color: step.done || step.active ? '#fff' : 'var(--ks-text-muted)',
                      border: step.done || step.active ? 'none' : '2px solid var(--ks-border)',
                      boxShadow: step.active ? '0 0 0 4px rgba(59,111,232,0.2)' : 'none',
                    }}
                  >
                    {step.done ? <Check size={15} /> : i + 1}
                  </div>
                  <span className="text-sm hidden md:block font-semibold" style={{ color: step.active ? 'var(--ks-blue)' : step.done ? 'var(--ks-blue)' : 'var(--ks-text-muted)', fontWeight: step.active ? 800 : 500 }}>
                    {step.label}
                  </span>
                </div>
                {i < 3 && <div className="w-10 md:w-16 h-0.5 rounded-full" style={{ background: step.done ? 'var(--ks-blue)' : 'var(--ks-border)' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Payment Method Selector */}
          <div className="lg:col-span-3 space-y-4">
            <button
              onClick={() => navigate('/checkout')}
              className="flex items-center gap-2 text-sm font-bold mb-2 hover:text-[var(--ks-blue)] transition-colors"
              style={{ color: 'var(--ks-text-secondary)' }}
            >
              <ChevronLeft size={16} className={isRTL ? 'rotate-180' : ''} />
              {language === 'ar' ? 'العودة للشحن' : 'Back to Shipping'}
            </button>

            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--ks-text)' }}>
              {t('payment.title')}
            </h2>
            <p className="text-sm font-medium mb-6" style={{ color: 'var(--ks-text-muted)' }}>
              {language === 'ar' ? 'اختر طريقة الدفع المناسبة لك' : 'Choose your preferred payment method'}
            </p>

            <div className="space-y-3">
              {PAYMENT_METHODS.map(method => {
                const isSelected = selectedMethod === method.id;
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${isRTL ? 'text-right' : 'text-left'}`}
                    style={{
                      background: isSelected ? 'rgba(59,111,232,0.04)' : 'var(--ks-bg)',
                      borderColor: isSelected ? 'var(--ks-blue)' : 'var(--ks-border)',
                      boxShadow: isSelected ? '0 0 0 3px rgba(59,111,232,0.1)' : 'var(--ks-shadow-sm)',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Radio indicator */}
                      <div
                        className="w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all"
                        style={{
                          borderColor: isSelected ? 'var(--ks-blue)' : 'var(--ks-border)',
                          background: isSelected ? 'var(--ks-blue)' : 'transparent',
                        }}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      <Icon />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm" style={{ color: 'var(--ks-text)' }}>
                            {language === 'ar' ? method.ar : method.en}
                          </span>
                          {method.id === 'cod' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: method.badgeColor }}>
                              {language === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular'}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <p className="text-xs mt-2 font-medium leading-relaxed" style={{ color: 'var(--ks-text-secondary)' }}>
                            {language === 'ar' ? method.descAr : method.descEn}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Agreement + Instructions */}
            {activeMethod.id !== 'cod' && (
              <div className="p-5 rounded-2xl border border-[var(--ks-border)] mt-2" style={{ background: 'rgba(59,111,232,0.03)' }}>
                <p className="text-xs font-bold mb-3" style={{ color: 'var(--ks-text-secondary)' }}>
                  {language === 'ar' ? '📋 تعليمات التحويل:' : '📋 Transfer Instructions:'}
                </p>
                <ol className="text-xs space-y-1.5 font-medium list-decimal list-inside" style={{ color: 'var(--ks-text-secondary)' }}>
                  <li>{language === 'ar' ? 'افتح تطبيق المحفظة الخاصة بك' : 'Open your wallet app'}</li>
                  <li>{language === 'ar' ? 'حوّل المبلغ الإجمالي' : `Transfer the total amount: ${total.toLocaleString()} EGP`}</li>
                  <li>{language === 'ar' ? 'أرسل إيصال التحويل' : 'Send the transfer receipt to us via WhatsApp'}</li>
                  <li>{language === 'ar' ? 'سيتم تأكيد طلبك خلال ٣٠ دقيقة' : 'Your order will be confirmed within 30 minutes'}</li>
                </ol>
              </div>
            )}

            <div className="flex items-start gap-3 mt-4">
              <input
                type="checkbox"
                id="payment-agree"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded mt-0.5 shrink-0 cursor-pointer"
                style={{ accentColor: 'var(--ks-blue)' }}
              />
              <label htmlFor="payment-agree" className="text-xs font-medium cursor-pointer leading-relaxed" style={{ color: 'var(--ks-text-secondary)' }}>
                {language === 'ar'
                  ? 'أوافق على الشروط والأحكام وسياسة الإرجاع والاسترداد الخاصة بكينج ستور'
                  : 'I agree to King-Store\'s Terms & Conditions and Return/Refund Policy'}
              </label>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isProcessing || !agreed}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-extrabold text-base transition-all duration-300 min-h-[52px] mt-4"
              style={{
                background: !agreed ? 'var(--ks-text-muted)' : isProcessing ? 'var(--ks-blue-dark)' : 'var(--ks-blue)',
                cursor: !agreed ? 'not-allowed' : 'pointer',
                opacity: !agreed ? 0.6 : 1,
              }}
            >
              {isProcessing ? (
                <><Loader2 size={20} className="animate-spin" /> {language === 'ar' ? 'جاري التأكيد...' : 'Processing Order...'}</>
              ) : (
                <>{t('payment.submit')} <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} /></>
              )}
            </button>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 p-6 rounded-3xl space-y-5" style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', boxShadow: 'var(--ks-shadow-sm)' }}>
              <h3 className="text-base font-extrabold" style={{ color: 'var(--ks-text)' }}>
                {t('checkout.orderSummary')}
              </h3>

              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-[var(--ks-border)]" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center" style={{ background: 'var(--ks-blue)' }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--ks-text)' }}>{item.name}</p>
                      <p className="text-[11px] font-medium text-[var(--ks-text-muted)]">{item.color}</p>
                    </div>
                    <span className="text-xs font-extrabold" style={{ color: 'var(--ks-text)' }}>
                      {(item.price * item.quantity).toLocaleString()} EGP
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--ks-border)]">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[var(--ks-text-secondary)]">{t('cart.subtotal')}</span>
                  <span className="font-bold" style={{ color: 'var(--ks-text)' }}>{subtotal.toLocaleString()} EGP</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#22c55e]">{language === 'ar' ? 'خصم' : 'Discount'}</span>
                    <span className="font-bold text-[#22c55e]">- {discountAmt.toLocaleString()} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[var(--ks-text-secondary)]">{t('cart.shipping')}</span>
                  <span className="font-bold" style={{ color: 'var(--ks-text)' }}>{shippingCost.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[var(--ks-border)]">
                  <span className="text-sm font-extrabold" style={{ color: 'var(--ks-text)' }}>{t('cart.total')}</span>
                  <span className="font-black text-xl" style={{ color: 'var(--ks-blue)' }}>{total.toLocaleString()} EGP</span>
                </div>
              </div>

              {/* Selected Payment Badge */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--ks-border)]" style={{ background: 'var(--ks-bg-secondary)' }}>
                {React.createElement(activeMethod.icon)}
                <div>
                  <p className="text-xs font-extrabold" style={{ color: 'var(--ks-text)' }}>
                    {language === 'ar' ? activeMethod.ar : activeMethod.en}
                  </p>
                  <p className="text-[11px] font-medium text-[var(--ks-text-muted)]">
                    {language === 'ar' ? 'طريقة الدفع المحددة' : 'Selected payment method'}
                  </p>
                </div>
              </div>

              {/* Delivery info */}
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--ks-text-secondary)' }}>
                <Truck size={16} className="text-[var(--ks-blue)] shrink-0" />
                <span className="font-semibold">
                  {language === 'ar' ? 'التوصيل خلال ١-٣ أيام عمل' : 'Delivered within 1-3 business days'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
