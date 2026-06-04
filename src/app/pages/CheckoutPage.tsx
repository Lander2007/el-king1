import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, MapPin, Check, Phone, User, Mail, Globe, FileText, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { orderFormSchema } from '../../lib/validations/order';

const STEPS = [
  { en: 'Cart', ar: 'السلة' },
  { en: 'Shipping', ar: 'الشحن' },
  { en: 'Payment', ar: 'الدفع' },
  { en: 'Confirm', ar: 'التأكيد' },
];

const COUNTRY_OPTIONS = [
  { code: 'EG', en: 'Egypt', ar: 'مصر', pricingKey: 'EG' },
  { code: 'SA', en: 'Saudi Arabia', ar: 'المملكة العربية السعودية', pricingKey: 'SA' },
  { code: 'AE', en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة', pricingKey: 'AE' },
  { code: 'US', en: 'United States', ar: 'الولايات المتحدة', pricingKey: 'US' },
];

const EG_PHONE_REGEX = /^\+20[0-9]{10}$/;

export function CheckoutPage() {
  const { cart, cartTotal, isRTL, language, discount, selectedCountry, setSelectedCountry, getCurrencySymbol, t } = useApp();
  const navigate = useNavigate();
  const phoneRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'EG',
    city: '',
    governorate: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartTotal;
  const discountAmt = subtotal * discount;
  const shippingCost = selectedCountry === 'EG' ? 50 : selectedCountry === 'SA' ? 20 : selectedCountry === 'AE' ? 15 : 10;
  const total = subtotal - discountAmt + shippingCost;
  const currencySymbol = getCurrencySymbol();

  // Auto-prefix +20 on phone focus
  const handlePhoneFocus = () => {
    if (!form.phone) {
      setForm(f => ({ ...f, phone: '+20' }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Always ensure +20 prefix is kept
    if (!val.startsWith('+')) val = '+' + val;
    if (val.length < 3) val = '+20';
    setForm(f => ({ ...f, phone: val }));
  };

  const handleCountryChange = (code: string) => {
    setForm(f => ({ ...f, country: code }));
    setSelectedCountry(code as 'EG' | 'SA' | 'AE' | 'US');
  };

  const validate = () => {
    const result = orderFormSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as string;
        errs[path] = t(`errors.${issue.message}`);
      });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    // Small delay to show processing state, then navigate
    setTimeout(() => {
      setIsSubmitting(false);
      // Store checkout data in session storage for payment page
      sessionStorage.setItem('checkoutData', JSON.stringify({ ...form, subtotal, discountAmt, shippingCost, total, currencySymbol, selectedCountry }));
      navigate('/payment');
    }, 600);
  };

  const inputStyle = (field: string) => ({
    background: 'var(--ks-bg)',
    border: errors[field] ? '2px solid #E84040' : '2px solid var(--ks-border)',
    color: 'var(--ks-text)',
    padding: '12px 16px',
    borderRadius: '14px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--ks-bg-secondary)', minHeight: '100vh' }}>
      {/* Step Progress Bar */}
      <div style={{ background: 'var(--ks-bg)', borderBottom: '1px solid var(--ks-border)' }}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-5">
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.en}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300"
                    style={{
                      background: i <= 1 ? 'var(--ks-blue)' : 'var(--ks-bg-secondary)',
                      color: i <= 1 ? '#fff' : 'var(--ks-text-muted)',
                      border: i <= 1 ? 'none' : '2px solid var(--ks-border)',
                      boxShadow: i === 1 ? '0 0 0 4px rgba(59,111,232,0.15)' : 'none',
                    }}
                  >
                    {i < 1 ? <Check size={15} /> : i + 1}
                  </div>
                  <span
                    className="text-sm hidden md:block font-semibold"
                    style={{ color: i <= 1 ? 'var(--ks-blue)' : 'var(--ks-text-muted)', fontWeight: i === 1 ? 800 : 500 }}
                  >
                    {language === 'ar' ? step.ar : step.en}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="w-10 md:w-20 h-0.5 mx-2 rounded-full transition-all duration-500"
                    style={{ background: i < 1 ? 'var(--ks-blue)' : 'var(--ks-border)' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Billing Details Card */}
            <div className="p-7 rounded-3xl" style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', boxShadow: 'var(--ks-shadow-sm)' }}>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,111,232,0.1)' }}>
                  <MapPin size={20} style={{ color: 'var(--ks-blue)' }} />
                </div>
                <h2 className="text-lg font-extrabold" style={{ color: 'var(--ks-text)' }}>
                  {t('checkout.billingDetails')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--ks-text-secondary)' }}>
                    <User size={12} className="inline mr-1" /> {t('checkout.fullName')} *
                  </label>
                  <input
                    id="checkout-fullname"
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    style={inputStyle('fullName')}
                    onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,111,232,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.fullName ? '#E84040' : 'var(--ks-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {errors.fullName && <p className="text-xs mt-1.5 font-semibold" style={{ color: '#E84040' }}>{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--ks-text-secondary)' }}>
                    <Mail size={12} className="inline mr-1" /> {t('checkout.email')} *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    style={inputStyle('email')}
                    onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,111,232,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.email ? '#E84040' : 'var(--ks-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {errors.email && <p className="text-xs mt-1.5 font-semibold" style={{ color: '#E84040' }}>{errors.email}</p>}
                </div>

                {/* Phone — Egyptian Format */}
                <div>
                  <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--ks-text-secondary)' }}>
                    <Phone size={12} className="inline mr-1" /> {t('checkout.phone')} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-extrabold select-none z-10" style={{ color: 'var(--ks-blue)' }}>
                      +20
                    </span>
                    <input
                      id="checkout-phone"
                      ref={phoneRef}
                      type="tel"
                      value={form.phone}
                      onFocus={e => { handlePhoneFocus(); e.currentTarget.style.borderColor = 'var(--ks-blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,111,232,0.15)'; }}
                      onChange={handlePhoneChange}
                      placeholder="+20 10 XXXX XXXX"
                      style={{ ...inputStyle('phone'), paddingLeft: '52px' }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.phone ? '#E84040' : 'var(--ks-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                      aria-describedby="phone-hint"
                    />
                  </div>
                  <p id="phone-hint" className="text-[11px] mt-1 font-medium" style={{ color: 'var(--ks-text-muted)' }}>
                    {language === 'ar' ? 'التنسيق: +20 10/11/12 XXXX XXXX' : 'Format: +20 10/11/12 XXXX XXXX'}
                  </p>
                  {errors.phone && <p className="text-xs mt-1 font-semibold" style={{ color: '#E84040' }}>{errors.phone}</p>}
                </div>

                {/* Country + Pricing Switcher */}
                <div>
                  <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--ks-text-secondary)' }}>
                    <Globe size={12} className="inline mr-1" /> {t('checkout.country')} *
                  </label>
                  <select
                    id="checkout-country"
                    value="EG"
                    disabled
                    style={{ ...inputStyle('country'), appearance: 'none', cursor: 'not-allowed', opacity: 0.6 }}
                  >
                    <option value="EG">{language === 'ar' ? 'مصر' : 'Egypt'}</option>
                  </select>
                </div>

                {/* Governorate */}
                <div>
                  <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--ks-text-secondary)' }}>
                    {t('checkout.governorate')} *
                  </label>
                  <input
                    id="checkout-governorate"
                    value={form.governorate}
                    onChange={e => setForm(f => ({ ...f, governorate: e.target.value }))}
                    placeholder={language === 'ar' ? 'المحافظة' : 'Governorate / Region'}
                    style={inputStyle('governorate')}
                    onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,111,232,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.governorate ? '#E84040' : 'var(--ks-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {errors.governorate && <p className="text-xs mt-1.5 font-semibold" style={{ color: '#E84040' }}>{errors.governorate}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--ks-text-secondary)' }}>
                    {t('checkout.city')} *
                  </label>
                  <input
                    id="checkout-city"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder={language === 'ar' ? 'المدينة' : 'City'}
                    style={inputStyle('city')}
                    onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,111,232,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.city ? '#E84040' : 'var(--ks-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {errors.city && <p className="text-xs mt-1.5 font-semibold" style={{ color: '#E84040' }}>{errors.city}</p>}
                </div>

                {/* Street Address (NO ZIP CODE) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--ks-text-secondary)' }}>
                    {t('checkout.address')} *
                  </label>
                  <input
                    id="checkout-address"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder={language === 'ar' ? 'الشارع، المبنى، الطابق' : 'Street, Building, Floor Number'}
                    style={inputStyle('address')}
                    onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,111,232,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.address ? '#E84040' : 'var(--ks-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {errors.address && <p className="text-xs mt-1.5 font-semibold" style={{ color: '#E84040' }}>{errors.address}</p>}
                </div>

                {/* Order Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold mb-2 uppercase tracking-wide" style={{ color: 'var(--ks-text-secondary)' }}>
                    <FileText size={12} className="inline mr-1" /> {t('checkout.notes')}
                  </label>
                  <textarea
                    id="checkout-notes"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={t('checkout.notesPlaceholder')}
                    rows={3}
                    style={{
                      ...inputStyle('notes'),
                      resize: 'vertical',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,111,232,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--ks-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={isSubmitting}
                className="mt-7 w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg active:scale-98 min-h-[52px] font-extrabold text-base"
                style={{ background: 'var(--ks-blue)' }}
              >
                {isSubmitting ? (
                  <><Loader2 size={20} className="animate-spin" /> {t('checkout.processing')}</>
                ) : (
                  <>{t('checkout.placeOrder')} <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} /></>
                )}
              </button>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 p-6 rounded-3xl" style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', boxShadow: 'var(--ks-shadow-sm)' }}>
              <h3 className="text-base font-extrabold mb-5" style={{ color: 'var(--ks-text)' }}>
                {t('checkout.orderSummary')}
              </h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-5">
                {cart.length === 0 ? (
                  <p className="text-sm text-center py-4 text-[var(--ks-text-muted)]">{t('cart.empty')}</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-[var(--ks-border)]" />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center" style={{ background: 'var(--ks-blue)' }}>
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--ks-text)' }}>{item.name}</p>
                        <p className="text-[11px] font-medium" style={{ color: 'var(--ks-text-muted)' }}>{item.color}</p>
                      </div>
                      <span className="text-xs font-extrabold" style={{ color: 'var(--ks-text)' }}>
                        {(item.price * item.quantity).toLocaleString()} EGP
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 pt-5 border-t border-[var(--ks-border)]">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold" style={{ color: 'var(--ks-text-secondary)' }}>{t('cart.subtotal')}</span>
                  <span className="font-bold" style={{ color: 'var(--ks-text)' }}>{subtotal.toLocaleString()} EGP</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#22c55e]">{language === 'ar' ? 'خصم' : 'Discount'}</span>
                    <span className="font-bold text-[#22c55e]">- {discountAmt.toLocaleString()} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="font-semibold" style={{ color: 'var(--ks-text-secondary)' }}>{t('cart.shipping')}</span>
                  <span className="font-bold" style={{ color: 'var(--ks-text)' }}>{shippingCost.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[var(--ks-border)]">
                  <span className="text-sm font-extrabold" style={{ color: 'var(--ks-text)' }}>{t('cart.total')}</span>
                  <span className="font-black" style={{ color: 'var(--ks-blue)', fontSize: '20px' }}>{total.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
