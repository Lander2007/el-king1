import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, ShoppingCart, Trash2, ArrowRight, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function WishlistPage() {
  const { wishlist, toggleWishlist, products, addToCart, language, isRTL } = useApp();
  const navigate = useNavigate();
  const [addStates, setAddStates] = useState<Record<string, 'idle' | 'loading' | 'done'>>({});

  const wishlistItems = products.filter(p => wishlist.includes(p._id || p.id));

  const handleAddToCart = (productId: string, product: any) => {
    setAddStates(prev => ({ ...prev, [productId]: 'loading' }));
    
    const name = product.name?.[language] || product.name?.en || product.name || '';
    const image = product.images?.[0]?.url || product.image || '';
    const price = product.pricing?.EG ?? product.pricing?.default ?? product.price ?? 0;

    setTimeout(() => {
      addToCart({
        productId,
        name,
        price,
        image,
        color: product.colors?.[0] || 'Default',
        quantity: 1,
        brand: product.brand || 'Generic',
        compatibility: product.compatibility?.[0] || product.model || 'Universal',
      });
      setAddStates(prev => ({ ...prev, [productId]: 'done' }));
      setTimeout(() => {
        setAddStates(prev => ({ ...prev, [productId]: 'idle' }));
      }, 2000);
    }, 600);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--ks-bg-secondary)', minHeight: '100vh' }}>
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--ks-text-muted)', fontWeight: 500 }}>
          <button onClick={() => navigate('/')} className="hover:text-[var(--ks-blue)]">
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </button>
          <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
          <span style={{ color: 'var(--ks-text)', fontWeight: 700 }}>
            {language === 'ar' ? 'المفضلة' : 'Wishlist'}
          </span>
        </nav>

        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart size={24} className="text-[#E84040]" fill="#E84040" />
            <h1 className="text-3xl" style={{ color: 'var(--ks-text)', fontWeight: 800 }}>
              {language === 'ar' ? 'قائمة المفضلة' : 'My Wishlist'}
            </h1>
            <span
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'var(--ks-text-secondary)' }}
            >
              {wishlistItems.length} {language === 'ar' ? 'منتج' : 'items'}
            </span>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty wishlist state */
          <div className="flex flex-col items-center py-20 text-center gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[rgba(232,64,64,0.06)] mb-2">
              <Heart size={40} className="text-[#E84040]" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--ks-text)' }}>
              {language === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
            </h2>
            <p className="text-sm max-w-sm" style={{ color: 'var(--ks-text-muted)' }}>
              {language === 'ar'
                ? 'استكشف منتجاتنا وأضف المنتجات المفضلة لديك هنا لحفظها لاحقاً.'
                : 'Explore our products and add your favorite items here to save them for later.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-8 py-3 rounded-xl text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: 'var(--ks-blue)' }}
            >
              {language === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
              <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </div>
        ) : (
          /* Wishlist grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map(p => {
              const productId = p._id || p.id;
              const name = p.name?.[language] || p.name?.en || p.name || '';
              const image = p.images?.[0]?.url || p.image || '';
              const price = p.pricing?.EG ?? p.pricing?.default ?? p.price ?? 0;
              const state = addStates[productId] || 'idle';

              return (
                <div
                  key={productId}
                  className="group relative rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-[var(--ks-border)] flex flex-col justify-between"
                  style={{ background: 'var(--ks-bg)' }}
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative aspect-square overflow-hidden bg-[var(--ks-bg-secondary)] border-b border-[var(--ks-border)]">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Remove Button */}
                      <button
                        onClick={() => toggleWishlist(productId)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--ks-border)] transition-transform hover:scale-105 active:scale-95 shadow-sm"
                        style={{ background: 'var(--ks-bg)' }}
                        aria-label={language === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist'}
                      >
                        <Trash2 size={16} className="text-[#E84040]" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide" style={{ background: 'var(--ks-bg-secondary)', color: 'var(--ks-blue)' }}>
                        {p.brand}
                      </span>
                      <h3
                        className="mt-3 text-sm font-extrabold line-clamp-2 cursor-pointer hover:text-[var(--ks-blue)] transition-colors"
                        style={{ color: 'var(--ks-text)', lineHeight: 1.3 }}
                        onClick={() => navigate(`/product/${productId}`)}
                      >
                        {name}
                      </h3>
                      <p className="mt-2 text-xs font-black" style={{ color: 'var(--ks-blue)' }}>
                        {price.toLocaleString()} EGP
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-5 pt-2">
                    <button
                      onClick={() => handleAddToCart(productId, p)}
                      disabled={p.stock === 0}
                      className="w-full py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                      style={{
                        background: state === 'done' ? '#22c55e' : p.stock === 0 ? 'var(--ks-text-muted)' : 'var(--ks-blue)',
                      }}
                    >
                      {state === 'loading' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : state === 'done' ? (
                        <>
                          <Check size={16} />
                          {language === 'ar' ? 'تمت الإضافة!' : 'Added!'}
                        </>
                      ) : p.stock === 0 ? (
                        language === 'ar' ? 'نفذ المخزون' : 'Out of Stock'
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          {language === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
