import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[]; // product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clearAll: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => set({ items: [...new Set([...get().items, productId])] }),
      removeItem: (productId) => set({ items: get().items.filter(id => id !== productId) }),
      toggleItem: (productId) => {
        const has = get().items.includes(productId);
        if (has) {
          set({ items: get().items.filter(id => id !== productId) });
        } else {
          set({ items: [...get().items, productId] });
        }
      },
      hasItem: (productId) => get().items.includes(productId),
      clearAll: () => set({ items: [] }),
    }),
    { name: 'darna-wishlist' }
  )
);
