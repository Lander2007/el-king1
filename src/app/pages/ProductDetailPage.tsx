import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronRight, Heart, ShoppingCart, Star, Truck, Shield, Award, RotateCcw, Check, Plus, Minus, ZoomIn, ChevronLeft, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

const MOCK_REVIEWS = [
  { id: 1, name: 'Ahmed R.', rating: 5, date: '2026-05-28', text: 'Excellent quality! The case fits perfectly and feels premium. Dropped my phone twice and no damage whatsoever.', avatar: 'A' },
  { id: 2, name: 'Sarah J.', rating: 5, date: '2026-05-20', text: 'Worth every penny. The material feels high-end and the color matches exactly as shown. Fast delivery too!', avatar: 'S' },
  { id: 3, name: 'Mohammed K.', rating: 4, date: '2026-05-15', text: 'Great product overall. Took 1 star off because the packaging could be better, but the product itself is fantastic.', avatar: 'M' },
];

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { 
    language, isRTL, addToCart, toggleWishlist, wishlist, setCartOpen, 
    products, selectedCountry, getCurrencySymbol, t 
  } = useApp();
  
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addState, setAddState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [hovering, setHovering] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // If products are not loaded yet
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3" style={{ background: 'var(--ks-bg)' }}>
        <Loader2 size={36} className="animate-spin text-[var(--ks-blue)]" />
        <span className="text-sm font-semibold text-[var(--ks-text-secondary)]">{t('checkout.processing')}</span>
      </div>
    );
  }

  const product = products.find(p => p._id === productId || p.slug === productId) || products[0];
  const idToUse = product._id || product.id;
  const isWishlisted = wishlist.includes(idToUse);

  // Filter related and also viewed products
  const related = products.filter(p => p._id !== idToUse && p.category === product.category).slice(0, 4);
  const alsoViewed = products.filter(p => p._id !== idToUse).slice(0, 6);

  // Field extraction
  const name = product.name?.[language] || product.name?.en || product.name || '';
  const description = product.description?.[language] || product.description?.en || product.description || '';
  const image = product.images?.[0]?.url || product.image || '';
  const pricingVal = product.pricing?.[selectedCountry] ?? product.pricing?.default ?? product.price ?? 0;
  const currencySymbol = getCurrencySymbol();

  const handleAddToCart = () => {
    setAddState('loading');
    setTimeout(() => {
      addToCart({
        productId: idToUse,
        name,
        price: pricingVal,
        image,
        color: product.colors?.[selectedColor] || 'Default',
        quantity,
        brand: product.brand || 'Generic',
        compatibility: product.compatibility?.[0] || product.model || 'Universal',
      });
      setAddState('done');
      setTimeout(() => { setAddState('idle'); setCartOpen(true); }, 1500);
    }, 700);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const brand = product.category === 'samsung' ? 'samsung' : 'iphone';

  // Extract specs into an array
  const rawSpecs = product.specs instanceof Map 
    ? Array.from(product.specs.entries()) 
    : Object.entries(product.specs || {});

  const specsList = [
    { icon: Award, label: t('products.material'), value: product.specs?.get?.('Material') || product.material || 'Premium TPU' },
    { icon: Shield, label: t('products.compatibility'), value: product.model || 'Universal' },
    { icon: Truck, label: t('products.weight'), value: product.specs?.get?.('Weight') || product.weight || '30g' },
    { icon: RotateCcw, label: t('products.warranty'), value: product.specs?.get?.('Warranty') || product.warranty || '1 Year' },
  ];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "image": image,
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": product.brand || 'Generic'
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": selectedCountry === 'US' ? 'USD' : selectedCountry === 'EG' ? 'EGP' : selectedCountry === 'SA' ? 'SAR' : 'AED',
      "price": pricingVal,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": language === 'ar' ? 'الرئيسية' : 'Home',
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": product.brand || brand,
        "item": `${window.location.origin}/${brand}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": name,
        "item": window.location.href
      }
    ]
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--ks-bg)', minHeight: '100vh' }}>
      <script type="application/ld+json">
        {JSON.stringify(productJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbsJsonLd)}
      </script>
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--ks-text-muted)', fontWeight: 500 }}>
          <button onClick={() => navigate('/')} className="hover:text-[var(--ks-blue)]">{language === 'ar' ? 'الرئيسية' : 'Home'}</button>
          <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
          <button onClick={() => navigate(`/${brand}`)} className="hover:text-[var(--ks-blue)] capitalize">{product.brand || brand}</button>
          <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
          <span style={{ color: 'var(--ks-text)', fontWeight: 700 }}>{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Images Gallery */}
          <div className="space-y-4">
            {/* Main image with zoom effect */}
            <div
              className="relative rounded-3xl overflow-hidden aspect-square cursor-zoom-in border border-[var(--ks-border)]"
              style={{ background: 'var(--ks-bg-secondary)' }}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={product.images?.[selectedImg]?.url || image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: hovering ? 'scale(1.6)' : 'scale(1)',
                }}
              />
              {hovering && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <ZoomIn size={16} color="white" />
                </div>
              )}
              {selectedImg > 0 && (
                <button
                  onClick={() => setSelectedImg(i => i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
                  style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}
                >
                  <ChevronLeft size={20} color="white" />
                </button>
              )}
              {product.images?.length > 1 && selectedImg < product.images.length - 1 && (
                <button
                  onClick={() => setSelectedImg(i => i + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
                  style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}
                >
                  <ChevronRight size={20} color="white" />
                </button>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 shrink-0"
                    style={{
                      border: selectedImg === i ? '2.5px solid var(--ks-blue)' : '2px solid var(--ks-border)',
                    }}
                  >
                    <img src={img.url} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Product Details & Purchase Controls */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ background: 'var(--ks-bg-secondary)', color: 'var(--ks-blue)', border: '1px solid var(--ks-border)' }}>
                {product.brand}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(59,111,232,0.08)', color: 'var(--ks-blue)' }}>
                {product.model}
              </span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ks-text)', lineHeight: 1.2 }}>
              {name}
            </h1>

            {/* Star ratings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < 5 ? '#F59E0B' : 'none'} style={{ color: i < 5 ? '#F59E0B' : 'var(--ks-border)' }} />
                ))}
              </div>
              <span style={{ color: 'var(--ks-text)', fontWeight: 700 }}>4.9</span>
              <button className="text-sm font-semibold" style={{ color: 'var(--ks-blue)' }}>
                ({MOCK_REVIEWS.length} {language === 'ar' ? 'تقييمات' : 'reviews'})
              </button>
            </div>

            {/* Currency Price Display */}
            <div className="flex items-baseline gap-3">
              <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--ks-blue)' }}>
                {pricingVal.toLocaleString()} EGP
              </span>
            </div>

            {/* Colors Selection (Mocked from array or default) */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-bold mb-2.5" style={{ color: 'var(--ks-text-secondary)' }}>
                  {t('products.colors')}: <span style={{ color: 'var(--ks-text)' }}>{product.colors[selectedColor]}</span>
                </p>
                <div className="flex items-center gap-3">
                  {product.colors.map((colorName: string, i: number) => {
                    const code = product.colorCodes?.[i] || '#A1A1A1';
                    return (
                      <button
                        key={i}
                        title={colorName}
                        onClick={() => setSelectedColor(i)}
                        className="w-9 h-9 rounded-full transition-all duration-200 border hover:scale-105"
                        style={{
                          background: code,
                          border: selectedColor === i ? '3px solid var(--ks-blue)' : '2px solid var(--ks-border)',
                          transform: selectedColor === i ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: code === '#FFFFFF' ? 'inset 0 0 0 1px var(--ks-border)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Controller */}
            <div className="flex items-center gap-4 py-2">
              <p className="text-sm font-bold animate-fade-in" style={{ color: 'var(--ks-text-secondary)' }}>
                {t('products.quantity')}:
              </p>
              <div className="flex items-center rounded-xl overflow-hidden border border-[var(--ks-border)]">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-[var(--ks-bg-secondary)] transition-colors"
                >
                  <Minus size={16} style={{ color: 'var(--ks-text)' }} />
                </button>
                <span className="w-12 text-center" style={{ color: 'var(--ks-text)', fontWeight: 800, fontSize: '16px' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-[var(--ks-bg-secondary)] transition-colors"
                >
                  <Plus size={16} style={{ color: 'var(--ks-text)' }} />
                </button>
              </div>
              <span className="text-xs font-bold" style={{ color: product.stock < 10 ? '#E84040' : 'var(--ks-text-muted)' }}>
                {product.stock === 0
                  ? t('products.outOfStock')
                  : product.stock < 10
                  ? t('products.onlyLeft', { count: product.stock })
                  : t('products.inStock')}
              </span>
            </div>

            {/* CTAs */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-extrabold transition-all duration-300 min-h-[44px]"
                style={{
                  background: addState === 'done' ? '#22c55e' : product.stock === 0 ? 'var(--ks-text-muted)' : 'var(--ks-blue)',
                }}
              >
                {addState === 'loading' ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : addState === 'done' ? (
                  <><Check size={20} /> {t('products.added')}</>
                ) : (
                  <><ShoppingCart size={20} /> {t('products.addToCart')}</>
                )}
              </button>
              <button
                onClick={() => toggleWishlist(idToUse)}
                className="w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-200 border border-[var(--ks-border)] min-h-[44px] min-w-[44px]"
                style={{
                  background: isWishlisted ? 'rgba(232,64,64,0.08)' : 'var(--ks-bg)',
                }}
              >
                <Heart
                  size={22}
                  fill={isWishlisted ? '#E84040' : 'none'}
                  style={{ color: isWishlisted ? '#E84040' : 'var(--ks-text-secondary)' }}
                />
              </button>
            </div>

            {/* Stats badges */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {specsList.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-[var(--ks-border)] bg-[var(--ks-bg-secondary)]"
                >
                  <s.icon size={18} style={{ color: 'var(--ks-blue)' }} />
                  <div>
                    <p className="text-[11px] font-bold text-[var(--ks-text-muted)] uppercase tracking-wide">{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ks-text)', fontWeight: 800 }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical details Tabs */}
        <div className="mt-16">
          <div className="flex gap-4 border-b border-[var(--ks-border)]">
            {['description', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-4 text-sm font-bold capitalize transition-all duration-200 relative"
                style={{
                  color: activeTab === tab ? 'var(--ks-blue)' : 'var(--ks-text-secondary)',
                }}
              >
                {tab === 'description' ? t('products.description')
                  : tab === 'specifications' ? t('products.specifications')
                  : t('products.reviews', { count: MOCK_REVIEWS.length })}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--ks-blue)' }} />
                )}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <p className="text-sm sm:text-base leading-relaxed max-w-3xl text-[var(--ks-text-secondary)] font-medium">
                {description}
              </p>
            )}
            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {[
                  [t('products.material'), product.specs?.get?.('Material') || product.material || 'Premium TPU'],
                  [t('products.compatibility'), product.model || 'Universal'],
                  [t('products.weight'), product.specs?.get?.('Weight') || product.weight || '30g'],
                  [t('products.warranty'), product.specs?.get?.('Warranty') || product.warranty || '1 Year'],
                  ['Brand', product.brand],
                  ['Stock Available', product.stock.toString()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between p-4 rounded-2xl border border-[var(--ks-border)] bg-[var(--ks-bg-secondary)]">
                    <span className="text-xs font-bold text-[var(--ks-text-muted)]">{k}</span>
                    <span className="text-xs font-extrabold text-[var(--ks-text)]">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4 max-w-2xl">
                {MOCK_REVIEWS.map(r => (
                  <div key={r.id} className="p-5 rounded-3xl border border-[var(--ks-border)] bg-[var(--ks-bg-secondary)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ background: 'var(--ks-blue)', fontWeight: 800 }}
                      >
                        {r.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[var(--ks-text)]">{r.name}</p>
                        <p className="text-[10px] font-semibold text-[var(--ks-text-muted)] mt-0.5">{r.date}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < r.rating ? '#F59E0B' : 'none'} style={{ color: i < r.rating ? '#F59E0B' : 'var(--ks-border)' }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--ks-text-secondary)] font-medium leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Frequently Bought Together (Dynamic) */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-[var(--ks-border)] pt-12">
            <h2 className="text-2xl font-extrabold mb-8" style={{ color: 'var(--ks-text)' }}>
              {t('products.frequentlyBought')}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              {related.slice(0, 3).map((p, i) => {
                const rName = p.name?.[language] || p.name?.en || '';
                const rPrice = p.pricing?.[selectedCountry] ?? p.pricing?.default ?? p.price ?? 0;
                return (
                  <React.Fragment key={p._id}>
                    <div
                      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all border border-[var(--ks-border)] bg-[var(--ks-bg-secondary)] max-w-sm"
                      onClick={() => navigate(`/product/${p._id}`)}
                    >
                      <img src={p.images?.[0]?.url || p.image} alt={rName} className="w-16 h-16 rounded-xl object-cover border border-[var(--ks-border)]" />
                      <div>
                        <p className="text-xs font-extrabold truncate max-w-[180px]" style={{ color: 'var(--ks-text)' }}>{rName}</p>
                        <p className="text-xs font-black mt-1" style={{ color: 'var(--ks-blue)' }}>{rPrice.toLocaleString()} EGP</p>
                      </div>
                    </div>
                    {i < 2 && <Plus size={18} className="text-[var(--ks-text-muted)] shrink-0" />}
                  </React.Fragment>
                );
              })}
              <button
                onClick={handleAddToCart}
                className="px-6 py-3.5 rounded-xl text-white text-xs font-extrabold transition-all duration-300 min-h-[44px]"
                style={{ background: 'var(--ks-blue)' }}
              >
                {t('products.addAllToCart', { count: Math.min(related.length, 3) })} — {(pricingVal + related.slice(0, 3).reduce((s, p) => s + (p.pricing?.[selectedCountry] ?? p.pricing?.default ?? p.price ?? 0), 0)).toLocaleString()} EGP
              </button>
            </div>
          </div>
        )}

        {/* Customers Also Viewed */}
        <div className="mt-20 border-t border-[var(--ks-border)] pt-12">
          <h2 className="text-2xl font-extrabold mb-8" style={{ color: 'var(--ks-text)' }}>
            {t('products.alsoViewed')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {alsoViewed.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
