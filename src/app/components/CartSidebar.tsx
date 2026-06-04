import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';

const t = {
  en: {
    cart: 'Your Cart',
    items: 'items',
    item: 'item',
    empty: 'Your cart is empty',
    startShopping: 'Start Shopping',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    promo: 'Promo code',
    apply: 'Apply',
    total: 'Order Total',
    checkout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    applied: 'Code applied! You save',
    invalidCode: 'Invalid promo code',
  },
  ar: {
    cart: 'سلة التسوق',
    items: 'عناصر',
    item: 'عنصر',
    empty: 'سلتك فارغة',
    startShopping: 'ابدأ التسوق',
    subtotal: 'المجموع الفرعي',
    shipping: 'الشحن',
    free: 'مجاناً',
    promo: 'كود الخصم',
    apply: 'تطبيق',
    total: 'إجمالي الطلب',
    checkout: 'إتمام الشراء',
    continueShopping: 'متابعة التسوق',
    applied: 'تم تطبيق الكود! وفرت',
    invalidCode: 'كود خصم غير صالح',
  },
};

export function CartSidebar() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal, isRTL, language, discount, promoCode, setPromoCode } = useApp();
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const navigate = useNavigate();
  const tx = t[language];

  const handleApplyPromo = () => {
    setPromoCode(promoInput);
    if (promoInput.toUpperCase() === 'KING20' || promoInput.toUpperCase() === 'SAVE10') {
      const pct = promoInput.toUpperCase() === 'KING20' ? 20 : 10;
      setPromoMsg(`${tx.applied} ${pct}%!`);
    } else {
      setPromoMsg(tx.invalidCode);
      setTimeout(() => setPromoMsg(''), 2000);
    }
  };

  const subtotal = cartTotal;
  const discountAmt = subtotal * discount;
  const total = subtotal - discountAmt;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (!cartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
      />
      <div
        className="fixed top-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col shadow-2xl"
        style={{
          [isRTL ? 'left' : 'right']: 0,
          background: 'var(--ks-bg)',
          animation: `slideIn${isRTL ? 'Left' : 'Right'} 0.3s ease-out`,
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--ks-border)' }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: 'var(--ks-blue)' }} />
            <span style={{ fontWeight: 700, fontSize: '17px', color: 'var(--ks-text)' }}>
              {tx.cart}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--ks-bg-secondary)', color: 'var(--ks-text-secondary)', fontWeight: 600 }}
            >
              {itemCount} {itemCount === 1 ? tx.item : tx.items}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--ks-bg-secondary)] transition-colors"
            style={{ color: 'var(--ks-text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={64} style={{ color: 'var(--ks-border)' }} />
              <p style={{ color: 'var(--ks-text-muted)', fontSize: '15px' }}>{tx.empty}</p>
              <button
                onClick={() => setCartOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm text-white"
                style={{ background: 'var(--ks-blue)', fontWeight: 600 }}
              >
                {tx.startShopping}
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                className="flex gap-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--ks-text)', fontWeight: 600 }}>{item.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ks-text-muted)' }}>
                    {item.brand} · {item.compatibility}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ks-text-secondary)' }}>
                    Color: {item.color}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div
                      className="flex items-center rounded-lg overflow-hidden"
                      style={{ border: '1px solid var(--ks-border)' }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-[var(--ks-bg-secondary)] transition-colors"
                      >
                        <Minus size={12} style={{ color: 'var(--ks-text)' }} />
                      </button>
                      <span className="w-8 text-center text-sm" style={{ color: 'var(--ks-text)', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-[var(--ks-bg-secondary)] transition-colors"
                      >
                        <Plus size={12} style={{ color: 'var(--ks-text)' }} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, color: 'var(--ks-text)' }}>
                        {(item.price * item.quantity).toFixed(2)} EGP
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 size={14} style={{ color: '#E84040' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div
            className="px-5 py-4 space-y-3"
            style={{ borderTop: '1px solid var(--ks-border)' }}
          >
            {/* Promo code */}
            <div className="flex gap-2">
              <div
                className="flex-1 flex items-center gap-2 px-3 rounded-lg"
                style={{ background: 'var(--ks-bg-secondary)', border: '1px solid var(--ks-border)' }}
              >
                <Tag size={14} style={{ color: 'var(--ks-text-muted)' }} />
                <input
                  type="text"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  placeholder={tx.promo}
                  className="flex-1 bg-transparent text-sm outline-none py-2"
                  style={{ color: 'var(--ks-text)' }}
                />
              </div>
              <button
                onClick={handleApplyPromo}
                className="px-4 rounded-lg text-sm text-white"
                style={{ background: 'var(--ks-blue)', fontWeight: 600 }}
              >
                {tx.apply}
              </button>
            </div>
            {promoMsg && (
              <p className="text-xs" style={{ color: discount > 0 ? '#22c55e' : '#E84040' }}>
                {promoMsg}
              </p>
            )}

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--ks-text-secondary)' }}>{tx.subtotal}</span>
                <span style={{ color: 'var(--ks-text)', fontWeight: 500 }}>{subtotal.toFixed(2)} EGP</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#22c55e' }}>Discount ({Math.round(discount * 100)}%)</span>
                  <span style={{ color: '#22c55e', fontWeight: 500 }}>-{discountAmt.toFixed(2)} EGP</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--ks-text-secondary)' }}>{tx.shipping}</span>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>{tx.free}</span>
              </div>
              <div
                className="flex justify-between pt-2"
                style={{ borderTop: '1px solid var(--ks-border)' }}
              >
                <span style={{ color: 'var(--ks-text)', fontWeight: 700, fontSize: '15px' }}>{tx.total}</span>
                <span style={{ color: 'var(--ks-blue)', fontWeight: 700, fontSize: '18px' }}>{total.toFixed(2)} EGP</span>
              </div>
            </div>

            <button
              onClick={() => { setCartOpen(false); navigate('/checkout'); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white transition-colors hover:opacity-90"
              style={{ background: 'var(--ks-blue)', fontWeight: 700, fontSize: '15px' }}
            >
              {tx.checkout}
              <ChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />
            </button>
            <button
              onClick={() => setCartOpen(false)}
              className="w-full text-center text-sm"
              style={{ color: 'var(--ks-text-secondary)', fontWeight: 500 }}
            >
              {tx.continueShopping}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}
