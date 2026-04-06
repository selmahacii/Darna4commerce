'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, Truck as TruckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore, type CartItem } from '@/stores/cart-store';
import { useAppStore } from '@/stores/app-store';
import { formatPrice } from '@/lib/format';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const { currency, setView } = useAppStore();

  const subtotal = getTotal();
  const shipping = subtotal >= 15000 ? 0 : 800;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    closeCart();
    setView('checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-cream)] z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-gold)]/20 bg-[var(--color-sand)]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[var(--color-terracotta)]" />
                <h2 className="text-lg font-bold text-foreground">Votre Panier</h2>
                <span className="text-sm text-muted-foreground font-medium">({items.length})</span>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && (
              <div className="px-6 py-4 bg-white border-b border-sand">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className={subtotal >= 15000 ? 'text-olive' : 'text-charcoal/60'}>
                    {subtotal >= 15000 ? 'Livraison Gratuite Débloquée !' : `Encore ${formatPrice(15000 - subtotal, currency)} pour la livraison gratuite`}
                  </span>
                  <TruckIcon className={`w-4 h-4 ${subtotal >= 15000 ? 'text-olive' : 'text-charcoal/20'}`} />
                </div>
                <div className="h-1.5 w-full bg-sand rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min((subtotal / 15000) * 100, 100)}%` }}
                     className={`h-full ${subtotal >= 15000 ? 'bg-olive' : 'bg-terracotta'}`}
                   />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-[var(--color-sand)] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-[var(--color-gold)] opacity-50" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-1">Votre panier est vide</p>
                  <p className="text-sm text-muted-foreground mb-4">Découvrez nos produits artisanaux</p>
                  <Button
                    variant="outline"
                    className="border-[var(--color-gold)] text-[var(--color-charcoal)] hover:bg-[var(--color-sand)]"
                    onClick={() => { closeCart(); setView('catalog'); }}
                  >
                    Parcourir la boutique
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
              <div className="border-t border-[var(--color-gold)]/20 p-6 space-y-4 bg-[var(--color-sand)]">
                <div className="flex items-center gap-2 p-3 bg-[var(--color-gold)]/10 rounded-xl">
                  <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
                  <span className="text-sm font-medium text-[var(--color-charcoal)]">
                    Vous gagnerez {Math.floor(total * 2)} points fidélité !
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span className="font-medium">{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span className={shipping === 0 ? 'text-[var(--color-olive)] font-semibold' : 'font-medium'}>
                      {shipping === 0 ? 'Gratuite' : formatPrice(shipping, currency)}
                    </span>
                  </div>
                  <Separator className="bg-[var(--color-gold)]/20" />
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(total, currency)}</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-dark)] text-white font-semibold shadow-lg rounded-xl"
                  onClick={handleCheckout}
                >
                  Passer la commande <ArrowRight className="w-4 h-4 ml-2" />
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
  const { currency } = useAppStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="flex gap-4 p-3 rounded-xl bg-white border border-[var(--border)] group"
    >
      <div className="w-20 h-20 rounded-lg bg-[var(--color-sand)] overflow-hidden flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Image</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate text-foreground">{item.name}</h3>
        <p className="text-sm font-semibold text-[var(--color-terracotta)] mt-1">{formatPrice(item.price, currency)}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-md" onClick={() => onUpdateQty(item.quantity - 1)}>
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-md" onClick={() => onUpdateQty(item.quantity + 1)}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <span className="font-semibold text-sm text-foreground">{formatPrice(item.price * item.quantity, currency)}</span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 rounded-md"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
