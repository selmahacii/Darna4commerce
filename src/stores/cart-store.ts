import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color: string;
  material: string;
  engraving: string;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find(
          (i) =>
            i.productId === item.productId &&
            i.color === item.color &&
            i.material === item.material &&
            i.engraving === item.engraving
        );

        const maxStock = item.maxStock || 999;

        if (existing) {
          const newQty = Math.min(existing.quantity + item.quantity, maxStock);
          set({
            items: get().items.map((i) =>
              i.id === existing.id ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          const qty = Math.min(item.quantity, maxStock);
          set({ items: [...get().items, { ...item, id: crypto.randomUUID(), quantity: qty }] });
        }
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        const item = get().items.find(i => i.id === id);
        const max = item?.maxStock || 999;
        const clampedQty = Math.min(Math.max(quantity, 1), max);
        
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity: clampedQty } : i)),
        });
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: 'ecommerce-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
