'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore, type CartItem } from '@/stores/cart-store';
import { useAppStore } from '@/stores/app-store';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const { setView } = useAppStore();

  const subtotal = getTotal();
  const shipping = subtotal > 500 ? 0 : 29.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    closeCart();
    setView('checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold">Your Cart</h2>
                <span className="text-sm text-muted-foreground">({items.length})</span>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-500">Cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">Add some items to get started</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => { closeCart(); setView('catalog'); }}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQty={(q) => updateQuantity(item.id, q)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 space-y-4">
                {/* Points earned */}
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Earn {Math.floor(total * 10)} points with this order!
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/25"
                  onClick={handleCheckout}
                >
                  Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartItemCard({ item, onUpdateQty, onRemove }: {
  item: CartItem;
  onUpdateQty: (q: number) => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="flex gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 group"
    >
      <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{item.name}</h3>
        {item.color && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground capitalize">{item.color === '#1a1a1a' ? 'Black' : item.color === '#c8c8c8' ? 'Silver' : item.color === '#8B4513' ? 'Brown' : 'Custom'}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQty(item.quantity - 1)}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQty(item.quantity + 1)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <span className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
