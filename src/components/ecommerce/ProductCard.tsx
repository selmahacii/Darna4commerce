'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Eye, ShoppingBag, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { useAppStore } from '@/stores/app-store';

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
  tags: string;
  category?: { name: string; slug: string };
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

function formatDZD(price: number) {
  return price.toLocaleString('fr-DZ');
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { addItem } = useCartStore();
  const { selectProduct } = useAppStore();

  const images = JSON.parse(product.images || '[]') as string[];
  const primaryImage = images[0];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const colors = JSON.parse(product.colors || '[]') as string[];

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage,
      quantity: 1,
      color: colors[0] || '',
      material: JSON.parse(product.materials || '[]')[0] || '',
      engraving: '',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Card
        className="group border border-[var(--border)] bg-card shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden"
        onMouseEnter={() => {}}
        onClick={() => selectProduct(product.id)}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-sand)]">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--color-sand)]">
              <ShoppingBag className="w-12 h-12 text-[var(--color-gold)] opacity-40" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400">
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-white/95 text-[var(--color-charcoal)] hover:bg-white backdrop-blur-sm shadow-lg rounded-lg text-xs font-medium"
                onClick={quickAdd}
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                Ajouter au panier
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/95 hover:bg-white backdrop-blur-sm shadow-lg h-8 w-8 rounded-lg"
                onClick={(e) => { e.stopPropagation(); selectProduct(product.id); }}
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <Badge className="bg-[var(--color-terracotta)] text-white border-none text-[10px] px-2 py-0.5 rounded-md font-medium">
                -{discount}%
              </Badge>
            )}
            {product.isNew && (
              <Badge className="bg-[var(--color-olive)] text-white border-none text-[10px] px-2 py-0.5 rounded-md font-medium">
                Nouveau
              </Badge>
            )}
          </div>

          {/* Like */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          >
            <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-[var(--color-terracotta)] text-[var(--color-terracotta)]' : 'text-gray-400'}`} />
          </button>
        </div>

        <CardContent className="p-5">
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
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
              {colors.length > 4 && (
                <span className="text-[10px] text-muted-foreground">+{colors.length - 4}</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">{formatDZD(product.price)} DA</span>
            {product.comparePrice && (
              <span className="text-sm text-muted-foreground line-through">{formatDZD(product.comparePrice)} DA</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
