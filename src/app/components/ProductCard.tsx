import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: any;
  view?: 'grid' | 'list';
}

export function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const { addToCart, toggleWishlist, wishlist, language, isRTL, selectedCountry, getCurrencySymbol } = useApp();
  const navigate = useNavigate();
  const [addState, setAddState] = useState<'idle' | 'loading' | 'done'>('idle');

  const productId = product._id || product.id;
  const isWishlisted = wishlist.includes(productId);

  // Translate fields
  const name = product.name?.[language] || product.name?.en || product.name || '';
  const description = product.description?.[language] || product.description?.en || product.description || '';
  const image = product.images?.[0]?.url || product.image || '';

  // Get country price
  const price = product.pricing?.[selectedCountry] ?? product.pricing?.default ?? product.price ?? 0;
  const currencySymbol = getCurrencySymbol();

  // Mock rating and reviews if not present in schema
  const rating = product.rating ?? 4.7;
  const reviews = product.reviews ?? 142;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddState('loading');
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
      setAddState('done');
      setTimeout(() => setAddState('idle'), 2000);
    }, 600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  if (view === 'list') {
    return (
      <div
        onClick={() => navigate(`/product/${productId}`)}
        className="flex gap-4 p-5 rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        style={{
          background: 'var(--ks-bg)',
          border: '1px solid var(--ks-border)',
          boxShadow: 'var(--ks-shadow-sm)',
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        <div className="relative w-28 sm:w-40 h-28 sm:h-40 shrink-0 rounded-2xl overflow-hidden bg-[var(--ks-bg-secondary)] border border-[var(--ks-border)]">
          <img src={image} alt={name} className="w-full h-full object-cover" />
          {product.isFeatured && (
            <span
              className="absolute top-2 left-2 px-3 py-1 rounded-full text-[10px] font-black text-white"
              style={{ background: 'var(--ks-gold)' }}
            >
              ★ Featured
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide" style={{ background: 'var(--ks-bg-secondary)', color: 'var(--ks-blue)' }}>
                  {product.brand}
                </span>
                <h3 className="mt-2 text-base font-extrabold" style={{ color: 'var(--ks-text)', lineHeight: 1.3 }}>{name}</h3>
              </div>
              <button 
                onClick={handleWishlist} 
                className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[var(--ks-bg-secondary)] transition-colors shrink-0"
                aria-label="Toggle Wishlist"
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? '#E84040' : 'none'}
                  style={{ color: isWishlisted ? '#E84040' : 'var(--ks-text-secondary)' }}
                />
              </button>
            </div>
            <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--ks-text-secondary)' }}>{description}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < Math.floor(rating) ? '#F59E0B' : 'none'}
                    style={{ color: i < Math.floor(rating) ? '#F59E0B' : 'var(--ks-border)' }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--ks-text-muted)' }}>{rating} ({reviews})</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ks-blue)' }}>
                {price.toLocaleString()} EGP
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all min-h-[44px] min-w-[44px] justify-center hover:opacity-90 active:scale-95"
              style={{
                background: addState === 'done' ? '#22c55e' : 'var(--ks-blue)',
              }}
            >
              {addState === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : addState === 'done' ? (
                <><Check size={16} /> Added!</>
              ) : (
                <><ShoppingCart size={16} /> Add to Cart</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/product/${productId}`)}
      className="group relative rounded-3xl cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      style={{
        background: 'var(--ks-bg)',
        border: '1px solid var(--ks-border)',
        boxShadow: 'var(--ks-shadow-sm)',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[var(--ks-bg-secondary)] border-b border-[var(--ks-border)]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.isFeatured && (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-sm"
            style={{ background: 'var(--ks-gold)' }}
          >
            ★ Featured
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-105 border border-[var(--ks-border)]"
          style={{ background: 'var(--ks-bg)', boxShadow: 'var(--ks-shadow-sm)' }}
          aria-label="Wishlist"
        >
          <Heart
            size={18}
            fill={isWishlisted ? '#E84040' : 'none'}
            style={{ color: isWishlisted ? '#E84040' : 'var(--ks-text-secondary)' }}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between h-[155px]">
        <div>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide" style={{ background: 'var(--ks-bg-secondary)', color: 'var(--ks-blue)' }}>
            {product.brand}
          </span>
          <h3
            className="mt-2 text-sm font-extrabold line-clamp-2"
            style={{ color: 'var(--ks-text)', lineHeight: 1.3 }}
          >
            {name}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Star size={11} fill="#F59E0B" className="text-[#F59E0B]" />
              <span className="text-[11px] font-bold" style={{ color: 'var(--ks-text)' }}>{rating}</span>
            </div>
            <span className="text-sm font-black mt-1" style={{ color: 'var(--ks-blue)' }}>
              {price.toLocaleString()} EGP
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 border border-[var(--ks-border)]"
            style={{
              background: addState === 'done' ? '#22c55e' : 'var(--ks-blue)',
            }}
            aria-label="Add to Cart"
          >
            {addState === 'loading' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : addState === 'done' ? (
              <Check size={16} color="white" />
            ) : (
              <ShoppingCart size={16} color="white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
