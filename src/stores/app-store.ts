import { create } from 'zustand';

export type View = 'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'admin' | 'profile' | 'orders';

interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating';
  colors: string[];
  materials: string[];
}

interface AppState {
  view: View;
  previousView: View;
  selectedProductId: string | null;
  isAdmin: boolean;
  filters: FilterState;
  currency: string;
  language: string;

  setView: (view: View) => void;
  goBack: () => void;
  selectProduct: (id: string) => void;
  setAdmin: (admin: boolean) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
}

const defaultFilters: FilterState = {
  search: '',
  category: 'all',
  minPrice: 0,
  maxPrice: 10000,
  sortBy: 'newest',
  colors: [],
  materials: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  view: 'home',
  previousView: 'home',
  selectedProductId: null,
  isAdmin: false,
  filters: defaultFilters,
  currency: 'USD',
  language: 'en',

  setView: (view) => set({ previousView: get().view, view }),
  goBack: () => {
    const prev = get().previousView;
    set({ view: prev, previousView: 'home' });
  },
  selectProduct: (id) => set({ selectedProductId: id, view: 'product' }),
  setAdmin: (admin) => set({ isAdmin: admin }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  resetFilters: () => set({ filters: defaultFilters }),
  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
}));
