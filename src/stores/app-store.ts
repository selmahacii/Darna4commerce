import { create } from 'zustand';

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
  role: 'admin' | 'user';
  isAuthenticated: boolean;
}

interface AppState {
  view: View;
  previousView: View;
  selectedProductId: string | null;
  user: User | null;
  filters: FilterState;
  currency: string;
  language: string;

  setView: (view: View) => void;
  goBack: () => void;
  selectProduct: (id: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
}

const defaultFilters: FilterState = {
  search: '',
  category: 'all',
  minPrice: 0,
  maxPrice: 50000,
  sortBy: 'newest',
};

// Demo users for local authentication
const DEMO_USERS: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'admin@darna.dz',
    password: 'admin123',
    user: { id: '1', email: 'admin@darna.dz', name: 'Admin Darna', role: 'admin', isAuthenticated: true },
  },
  {
    email: 'amina@email.com',
    password: 'amina123',
    user: { id: '2', email: 'amina@email.com', name: 'Amina Benali', role: 'user', isAuthenticated: true },
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  view: 'home',
  previousView: 'home',
  selectedProductId: null,
  user: null,
  filters: defaultFilters,
  currency: 'USD',
  language: 'fr',

  setView: (view) => set({ previousView: get().view, view }),
  goBack: () => {
    const prev = get().previousView;
    set({ view: prev, previousView: 'home' });
  },
  selectProduct: (id) => set({ selectedProductId: id, view: 'product' }),

  login: (email: string, password: string) => {
    const found = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      set({ user: found.user });
      return true;
    }
    return false;
  },

  logout: () => set({ user: null }),

  isAdmin: () => get().user?.role === 'admin',

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  resetFilters: () => set({ filters: defaultFilters }),
  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
}));
