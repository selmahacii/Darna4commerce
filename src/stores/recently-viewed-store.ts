'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string;
  category?: { name: string };
}

interface RecentlyViewedState {
  items: Product[];
  addItem: (product: Product) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) => 
        set((state) => {
          const filtered = state.items.filter((item) => item.id !== product.id);
          return { items: [product, ...filtered].slice(0, 10) };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'darna-recently-viewed' }
  )
);
