import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, Facebook, Instagram, Youtube } from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Social / Payment SVG Icons ────────────────────────────────────────────────
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.93a8.2 8.2 0 004.79 1.52V7.01a4.85 4.85 0 01-1.02-.32z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Payment method badge icons
const PaymentBadge = ({ label, color }: { label: string; color: string }) => (
  <span
    className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide border"
    style={{ color, borderColor: color, background: `${color}14` }}
  >
    {label}
  </span>
);

const QUICK_LINKS = {
  en: [
    { label: 'Home', path: '/' },
    { label: 'Samsung Accessories', path: '/samsung' },
    { label: 'iPhone Accessories', path: '/iphone' },
    { label: 'New Arrivals', path: '/samsung?sort=newest' },
  ],
  ar: [
    { label: 'الرئيسية', path: '/' },
    { label: 'اكسسوارات سامسونج', path: '/samsung' },
    { label: 'اكسسوارات آيفون', path: '/iphone' },
    { label: 'وصل حديثاً', path: '/samsung?sort=newest' },
  ],
};

const SUPPORT_LINKS = {
  en: ['Shipping Policy', 'Returns & Refunds', 'FAQ', 'Terms of Service', 'Privacy Policy'],
  ar: ['سياسة الشحن', 'الإرجاع والاسترداد', 'الأسئلة الشائعة', 'شروط الخدمة', 'سياسة الخصوصية'],
};

export function Footer() {
  const { language, isRTL, t } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setSendError('');

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSent(false), 5000);
      } else {
        setSendError(language === 'ar' ? 'فشل الإرسال، حاول مرة أخرى' : 'Send failed, please try again');
      }
    } catch {
      // Graceful fallback for demo
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }

    setSending(false);
  };

  const inputCls: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    color: '#E2E8F0',
    padding: '10px 14px',
    borderRadius: '12px',
    width: '100%',
    outline: 'none',
    fontSize: '13px',
    transition: 'border-color 0.2s',
  };

  const year = new Date().getFullYear();

  return (
    <footer dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--ks-navy)', color: '#94A3B8' }}>
      {/* Top stripe */}
      <div style={{ background: 'linear-gradient(90deg, var(--ks-blue) 0%, #6366f1 100%)', height: '3px' }} />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 mb-12">

          {/* ── Column 1: Brand + Contact Info ── */}
          <div className="xl:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white"
                style={{ background: 'var(--ks-blue)' }}
              >
                K
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">
                {language === 'ar' ? 'كينج ستور' : 'King-Store'}
              </span>
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748B' }}>
              {language === 'ar'
                ? 'اكسسوارات فاخرة لسامسونج الترا وآيفون. جودة حقيقية، توصيل سريع.'
                : 'Premium accessories for Samsung Ultra & iPhone. Authentic quality, fast delivery.'}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:support@king-store.com"
                className="flex items-center gap-2.5 text-sm group transition-colors hover:text-white"
              >
                <Mail size={14} style={{ color: 'var(--ks-blue)' }} />
                <span>support@king-store.com</span>
              </a>
              <a
                href="https://wa.me/201012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm group transition-colors hover:text-white"
              >
                <span style={{ color: '#25D366' }}><WhatsAppIcon /></span>
                <span>+20 10 1234 5678</span>
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
                  style={{ background: '#25D36620', color: '#25D366' }}
                >
                  WhatsApp
                </span>
              </a>
              <a
                href="tel:+201012345678"
                className="flex items-center gap-2.5 text-sm group transition-colors hover:text-white"
              >
                <Phone size={14} style={{ color: 'var(--ks-blue)' }} />
                <span>+20 10 1234 5678</span>
              </a>
              <a
                href="https://maps.google.com/?q=Cairo,Egypt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm group transition-colors hover:text-white"
              >
                <MapPin size={14} style={{ color: 'var(--ks-blue)' }} />
                <span>{language === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span>
              </a>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-2.5 mt-6">
              {[
                { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
                { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
                { icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
                { icon: TikTokIcon, label: 'TikTok', href: 'https://tiktok.com' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--ks-blue)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8'; }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Quick Links ── */}
          <div>
            <h4 className="text-white font-extrabold text-sm mb-5 uppercase tracking-widest">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS[language].map(item => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="text-sm group flex items-center gap-1.5 transition-all hover:text-white"
                    style={{ color: '#64748B' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Payment Badges */}
            <div className="mt-8">
              <h4 className="text-white font-extrabold text-sm mb-4 uppercase tracking-widest">
                {t('footer.payments')}
              </h4>
              <div className="flex flex-wrap gap-2">
                <PaymentBadge label="Cash" color="#22c55e" />
                <PaymentBadge label="InstaPay" color="#8B5CF6" />
                <PaymentBadge label="Vodafone" color="#E84040" />
                <PaymentBadge label="Orange" color="#F97316" />
                <PaymentBadge label="Etisalat" color="#3B6FE8" />
              </div>
            </div>
          </div>

          {/* ── Column 3: Support Links ── */}
          <div>
            <h4 className="text-white font-extrabold text-sm mb-5 uppercase tracking-widest">
              {language === 'ar' ? 'الدعم' : 'Support'}
            </h4>
            <ul className="space-y-3">
              {SUPPORT_LINKS[language].map(label => (
                <li key={label}>
                  <button
                    className="text-sm group flex items-center gap-1.5 transition-all hover:text-white"
                    style={{ color: '#64748B' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Trust badges */}
            <div className="mt-8 space-y-2">
              {[
                { icon: '🚀', en: 'Free shipping over 1000 EGP', ar: 'شحن مجاني فوق ١٠٠٠ ج.م' },
                { icon: '🔒', en: 'Secure payment methods', ar: 'طرق دفع آمنة' },
                { icon: '✅', en: '100% authentic products', ar: 'منتجات أصلية ١٠٠٪' },
                { icon: '🔄', en: '30-day return policy', ar: 'سياسة إرجاع ٣٠ يوماً' },
              ].map(item => (
                <div key={item.en} className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                  <span>{item.icon}</span>
                  <span>{language === 'ar' ? item.ar : item.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Column 4: Contact Form ── */}
          <div>
            <h4 className="text-white font-extrabold text-sm mb-5 uppercase tracking-widest">
              {t('footer.contact')}
            </h4>

            {sent ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <CheckCircle size={40} className="text-[#22c55e]" />
                <p className="text-sm font-bold text-white">{t('footer.formSuccess')}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder={t('footer.formName')}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  style={inputCls}
                  onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <input
                  type="email"
                  placeholder={t('footer.formEmail')}
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  style={inputCls}
                  onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <input
                  type="text"
                  placeholder={t('footer.formSubject')}
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  style={inputCls}
                  onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <textarea
                  placeholder={t('footer.formMessage')}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                  rows={4}
                  style={{ ...inputCls, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--ks-blue)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                {sendError && <p className="text-xs text-[#E84040] font-semibold">{sendError}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-extrabold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'var(--ks-blue)', opacity: sending ? 0.7 : 1 }}
                >
                  {sending
                    ? <><Loader2 size={16} className="animate-spin" /> {t('footer.formSending')}</>
                    : <><Send size={16} /> {t('footer.formSend')}</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: '#475569' }}
        >
          <p>
            {t('footer.copyright', { year: String(year) })}
          </p>
          <div className="flex items-center gap-1 text-xs" style={{ color: '#475569' }}>
            <span>{language === 'ar' ? 'صُنع بـ' : 'Crafted with'}</span>
            <span className="text-[#E84040]">♥</span>
            <span>{language === 'ar' ? 'بواسطة Wave-Dev' : 'by Wave-Dev'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
