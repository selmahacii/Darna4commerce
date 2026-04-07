import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type View = 'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'admin' | 'profile' | 'orders';

interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  avatar?: string;
  points: number;
  level: number;
  isActive: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AppState {
  view: View;
  previousView: View;
  selectedProductId: string | null;
  auth: AuthState;
  filters: FilterState;
  currency: string;
  language: string;

  setView: (view: View) => void;
  goBack: () => void;
  selectProduct: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
}

const BACKEND_URL = 'http://127.0.0.1:3003';
const authApi = (path: string, options?: RequestInit) =>
  fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

const defaultFilters: FilterState = {
  search: '',
  category: 'all',
  minPrice: 0,
  maxPrice: 50000,
  sortBy: 'popular',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'home',
      previousView: 'home',
      selectedProductId: null,
      auth: { user: null, token: null, isLoading: false },
      filters: defaultFilters,
      currency: 'DZD',
      language: 'fr',

      setView: (view) => set({ previousView: get().view, view }),
      goBack: () => {
        const prev = get().previousView;
        set({ view: prev, previousView: 'home' });
      },
      selectProduct: (id) => set({ selectedProductId: id, view: 'product' }),

      login: async (email: string, password: string): Promise<boolean> => {
        set((s) => ({ auth: { ...s.auth, isLoading: true } }));
        try {
          const res = await authApi('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (res.ok && data.token) {
            set({
              auth: { user: data.user, token: data.token, isLoading: false },
            });
            return true;
          }
          set((s) => ({ auth: { ...s.auth, isLoading: false } }));
          return false;
        } catch {
          set((s) => ({ auth: { ...s.auth, isLoading: false } }));
          return false;
        }
      },

      register: async (email: string, name: string, password: string): Promise<boolean> => {
        set((s) => ({ auth: { ...s.auth, isLoading: true } }));
        try {
          const res = await authApi('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, name, password }),
          });
          const data = await res.json();
          if (res.ok && data.token) {
            set({
              auth: { user: data.user, token: data.token, isLoading: false },
            });
            return true;
          }
          set((s) => ({ auth: { ...s.auth, isLoading: false } }));
          return false;
        } catch {
          set((s) => ({ auth: { ...s.auth, isLoading: false } }));
          return false;
        }
      },

      logout: () => {
        set({ auth: { user: null, token: null, isLoading: false }, view: 'home' });
      },

      restoreSession: async () => {
        const { token } = get().auth;
        if (!token) return;
        try {
          const res = await authApi('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.user) {
            set((s) => ({ auth: { ...s.auth, user: data.user } }));
          } else {
            set({ auth: { user: null, token: null, isLoading: false } });
          }
        } catch {
          // Token might be expired, silently clear
        }
      },

      isAdmin: () => get().auth.user?.role === 'admin',
      isAuthenticated: () => !!get().auth.user && !!get().auth.token,

      setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
      resetFilters: () => set({ filters: defaultFilters }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'darna-app-store',
      partialize: (state) => ({
        auth: { user: state.auth.user, token: state.auth.token },
        currency: state.currency,
        language: state.language,
      }),
    }
  )
);
