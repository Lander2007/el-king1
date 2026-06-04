import { create } from 'zustand';
import axios from 'axios';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  verify: () => Promise<boolean>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('admin_token'),
  isAuthenticated: !!localStorage.getItem('admin_token'),
  loading: false,
  error: null,
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { token } = response.data;
      localStorage.setItem('admin_token', token);
      set({ token, isAuthenticated: true, loading: false });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    set({ token: null, isAuthenticated: false });
  },
  verify: async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      set({ isAuthenticated: false, token: null });
      return false;
    }
    try {
      await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ isAuthenticated: true });
      return true;
    } catch (err) {
      localStorage.removeItem('admin_token');
      set({ isAuthenticated: false, token: null });
      return false;
    }
  }
}));
