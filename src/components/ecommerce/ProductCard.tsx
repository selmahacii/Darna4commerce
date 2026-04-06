'use client';

import { useState, useRef, useCallback, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Eye, ShoppingBag, Sparkles, Truck as TruckIcon, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { useAppStore } from '@/stores/app-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { formatPrice, safeJSONParse } from '@/lib/format';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  images: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  colors: string;
  materials: string;
  stock: number;
  tags: string;
  category?: { name: string; slug: string };
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [tiltStyle, setTiltStyle] = useState({});
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();
  const { selectProduct, currency } = useAppStore();
  const { toggleItem, hasItem } = useWishlistStore();

  const isLiked = hasItem(product.id);
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  const images = safeJSONParse<string[]>(product.images, []);
  const primaryImage = images[0];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const colors = safeJSONParse<string[]>(product.colors, []);

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage,
      quantity: 1,
      color: colors[0] || '',
      material: safeJSONParse<string[]>(product.materials, [])[0] || '',
      engraving: '',
    });
    toast.success('Ajouté au panier !');
  };

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 0.1s ease-out',
    });

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out',
    });
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        ref={cardRef}
        style={{
          ...(isTouchDevice ? {} : tiltStyle),
          transformStyle: 'preserve-3d',
          willChange: isTouchDevice ? 'auto' : 'transform',
        }}
        onMouseMove={isTouchDevice ? undefined : handleMouseMove}
        onMouseLeave={isTouchDevice ? undefined : handleMouseLeave}
      >
        <Card
          className="group border border-[var(--border)] bg-card shadow-sm hover:shadow-2xl hover:shadow-[var(--color-terracotta)]/10 transition-shadow duration-500 cursor-pointer overflow-hidden rounded-2xl"
          onClick={() => selectProduct(product.id)}
        >
          {/* Glare effect (desktop only) */}
          {!isTouchDevice && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none z-20"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.12), transparent 60%)`,
                opacity: glarePos.opacity,
                transition: glarePos.opacity ? 'opacity 0.1s' : 'opacity 0.4s',
              }}
            />
          )}

          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-sand)]">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ transform: 'translateZ(20px)' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--color-sand)]">
                <ShoppingBag className="w-12 h-12 text-[var(--color-gold)] opacity-40" />
              </div>
            )}

            {/* Overlay — always visible on mobile, hover-reveal on desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500">
              <div className="absolute bottom-4 left-4 right-4 flex gap-2" style={{ transform: 'translateZ(40px)' }}>
                <Button
                  size="sm"
                  className="flex-1 bg-white/95 text-[var(--color-charcoal)] hover:bg-white backdrop-blur-sm shadow-lg rounded-xl text-xs font-medium transition-all duration-300 hover:scale-105"
                  onClick={quickAdd}
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                  Ajouter au panier
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-white/95 hover:bg-white backdrop-blur-sm shadow-lg h-9 w-9 rounded-xl transition-all duration-300 hover:scale-110"
                  onClick={(e) => { e.stopPropagation(); selectProduct(product.id); }}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5" style={{ transform: 'translateZ(30px)' }}>
              {discount > 0 && (
                <motion.div
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05, type: 'spring' }}
                >
                  <Badge className="bg-[var(--color-terracotta)] text-white border-none text-[10px] px-2.5 py-0.5 rounded-lg font-semibold shadow-md">
                    -{discount}%
                  </Badge>
                </motion.div>
              )}
              {product.isNew && (
                <motion.div
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05, type: 'spring' }}
                >
                  <Badge className="bg-[var(--color-olive)] text-white border-none text-[10px] px-2.5 py-0.5 rounded-lg font-semibold shadow-md">
                    Nouveau
                  </Badge>
                </motion.div>
              )}
              {product.rating >= 4.8 && (
                <motion.div
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05, type: 'spring' }}
                >
                  <Badge className="bg-gold text-charcoal border-none text-[10px] px-2.5 py-0.5 rounded-lg font-semibold shadow-md flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Best Seller
                  </Badge>
                </motion.div>
              )}
              {product.price >= 15000 && (
                <motion.div
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05, type: 'spring' }}
                >
                  <Badge className="bg-blue-600/90 text-white border-none text-[9px] px-2.5 py-0.5 rounded-lg font-bold shadow-md flex items-center gap-1">
                    <TruckIcon className="w-2.5 h-2.5" /> Livraison Offerte
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Like — always visible on mobile, hover-reveal on desktop */}
            <motion.button
              className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
              onClick={(e) => { e.stopPropagation(); toggleItem(product.id); }}
              style={{ transform: 'translateZ(30px)' }}
              whileTap={{ scale: 0.85 }}
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-[var(--color-terracotta)] text-[var(--color-terracotta)]' : 'text-gray-400'}`} />
              </motion.div>
            </motion.button>
          </div>

          <CardContent className="p-5">
            {/* Stock Alert */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-terracotta-dark animate-pulse">
                <Flame className="w-3 h-3" />
                PLUS QUE {product.stock} RESTANTS
              </div>
            )}
            {/* Category */}
            {product.category && (
              <p className="text-[11px] uppercase tracking-wider text-[var(--color-gold)] font-semibold mb-1.5">
                {product.category.name}
              </p>
            )}

            {/* Name */}
            <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[var(--color-terracotta)] transition-colors text-foreground">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-foreground">{product.rating}</span>
              <span className="text-[11px] text-muted-foreground">
                ({product.reviewCount} avis)
              </span>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                {colors.slice(0, 4).map((color, i) => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  />
                ))}
                {colors.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">+{colors.length - 4}</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <motion.span
                className="text-lg font-bold text-foreground"
                whileHover={{ scale: 1.05 }}
              >
                {formatPrice(product.price, currency)}
              </motion.span>
              {product.comparePrice && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.comparePrice!, currency)}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
