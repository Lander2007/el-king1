import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import en from '../../locales/en.json';
import ar from '../../locales/ar.json';

const translations: Record<string, any> = { en, ar };

export interface CartItem {
  id: string; // ci-[productId]-[color]
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  color: string;
  quantity: number;
  brand: string;
  compatibility: string;
}

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: 'en' | 'ar';
  toggleLanguage: () => void;
  isRTL: boolean;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  products: any[];
  settings: any;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'> & { productId: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartTotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  promoCode: string;
  setPromoCode: (c: string) => void;
  discount: number;
  socket: Socket | null;
  selectedCountry: 'EG' | 'SA' | 'AE' | 'US';
  setSelectedCountry: (c: 'EG' | 'SA' | 'AE' | 'US') => void;
  getCurrencySymbol: () => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Language state
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    return (localStorage.getItem('language') as 'en' | 'ar') || 'en';
  });

  // Real-time Database States
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Selected Country for localized pricing
  const [selectedCountry, setSelectedCountry] = useState<'EG' | 'SA' | 'AE' | 'US'>(() => {
    return (localStorage.getItem('selectedCountry') as 'EG' | 'SA' | 'AE' | 'US') || 'EG';
  });

  // Cart, Wishlist, Search
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Socket instance
  const [socket, setSocket] = useState<Socket | null>(null);

  // Sync theme to document element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Sync language and layout direction (RTL/LTR)
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  // Save selected country to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCountry', selectedCountry);
  }, [selectedCountry]);

  // Connect to Socket.IO Namespace
  useEffect(() => {
    const socketUrl = 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      path: '/ws',
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO backend at /ws');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch initial catalog data from Express REST API
  useEffect(() => {
    fetch('http://localhost:5000/api/products?limit=100')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
      })
      .catch(err => console.error('Failed to load products from API:', err));

    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
      })
      .catch(err => console.error('Failed to load settings from API:', err));
  }, []);

  // Socket.IO event registrations for real-time synchronization
  useEffect(() => {
    if (!socket) return;

    socket.on('product:created', (newProduct: any) => {
      setProducts(prev => {
        if (prev.find(p => p._id === newProduct._id)) return prev;
        return [newProduct, ...prev];
      });
    });

    socket.on('product:updated', (updatedProduct: any) => {
      setProducts(prev => prev.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
    });

    socket.on('product:deleted', (data: { id: string }) => {
      setProducts(prev => prev.filter(p => p._id !== data.id));
    });

    socket.on('settings:updated', (updatedSettings: any) => {
      setSettings(updatedSettings);
    });

    return () => {
      socket.off('product:created');
      socket.off('product:updated');
      socket.off('product:deleted');
      socket.off('settings:updated');
    };
  }, [socket]);

  // Promo discount logic
  useEffect(() => {
    if (promoCode.toUpperCase() === 'KING20') setDiscount(0.2);
    else if (promoCode.toUpperCase() === 'SAVE10') setDiscount(0.1);
    else setDiscount(0);
  }, [promoCode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const isRTL = language === 'ar';

  // Nested translation helper with replacements support
  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>) => {
      const keys = key.split('.');
      let result: any = translations[language];

      for (const k of keys) {
        if (result && result[k] !== undefined) {
          result = result[k];
        } else {
          // Fallback to English
          let enResult: any = translations['en'];
          for (const ek of keys) {
            if (enResult && enResult[ek] !== undefined) {
              enResult = enResult[ek];
            } else {
              return key;
            }
          }
          result = enResult;
          break;
        }
      }

      if (typeof result === 'string' && replacements) {
        let formatted = result;
        Object.entries(replacements).forEach(([k, v]) => {
          formatted = formatted.replace(new RegExp(`{${k}}`, 'g'), String(v));
        });
        return formatted;
      }

      return typeof result === 'string' ? result : key;
    },
    [language]
  );

  const getCurrencySymbol = useCallback(() => {
    return 'EGP';
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'id'> & { productId: string }) => {
    const id = `ci-${item.productId}-${item.color}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => (i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      const { productId, ...rest } = item;
      return [...prev, { ...rest, id, productId }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
    } else {
      setCart(prev => prev.map(i => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const resolvedCart = cart.map(item => {
    const product = products.find(p => p._id === item.productId);
    if (product) {
      const price = product.pricing[selectedCountry] !== undefined ? product.pricing[selectedCountry] : product.pricing.default;
      return {
        ...item,
        price,
      };
    }
    return item;
  });

  const cartItemCount = resolvedCart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = resolvedCart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  }, []);

  // Persist wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        language,
        toggleLanguage,
        isRTL,
        t,
        products,
        settings,
        setProducts,
        cart: resolvedCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartItemCount,
        cartTotal,
        cartOpen,
        setCartOpen,
        wishlist,
        toggleWishlist,
        searchQuery,
        setSearchQuery,
        promoCode,
        setPromoCode,
        discount,
        socket,
        selectedCountry,
        setSelectedCountry,
        getCurrencySymbol,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
