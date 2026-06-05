import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config';

const socket = io(SOCKET_URL, {
  path: '/ws',
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export interface Product {
  _id: string;
  name: { en: string; ar: string };
  slug: string;
  description: { en: string; ar: string };
  category: 'apple' | 'samsung' | 'accessories';
  brand: string;
  model: string;
  images: { url: string; alt: { en: string; ar: string } }[];
  pricing: {
    EG: number;
    SA: number;
    AE: number;
    US: number;
    default: number;
  };
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  specs: any;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  setProducts: (products: Product[]) => void;
}

export const useProductStore = create<ProductStore>((set) => {
  socket.on('product:updated', (updated: Product) => {
    set((state) => ({
      products: state.products.map((p) => (p._id === updated._id ? updated : p)),
    }));
  });

  socket.on('product:added', (newProduct: Product) => {
    set((state) => {
      if (state.products.some((p) => p._id === newProduct._id)) return state;
      return { products: [newProduct, ...state.products] };
    });
  });

  socket.on('product:created', (newProduct: Product) => {
    set((state) => {
      if (state.products.some((p) => p._id === newProduct._id)) return state;
      return { products: [newProduct, ...state.products] };
    });
  });

  socket.on('product:deleted', ({ id }: { id: string }) => {
    set((state) => ({
      products: state.products.filter((p) => p._id !== id),
    }));
  });

  return {
    products: [],
    loading: false,
    error: null,
    setProducts: (products) => set({ products }),
    fetchProducts: async () => {
      set({ loading: true, error: null });
      try {
        const response = await axios.get(`${API_URL}/products?limit=100`);
        set({ products: response.data.products || [], loading: false });
      } catch (err: any) {
        set({ error: err.message || 'Failed to fetch products', loading: false });
      }
    },
  };
});
