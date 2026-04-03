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

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
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
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card
        className="group border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden bg-white dark:bg-gray-900"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => selectProduct(product.id)}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
          )}

          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm shadow-lg"
                onClick={quickAdd}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg h-9 w-9"
                onClick={(e) => { e.stopPropagation(); selectProduct(product.id); }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <Badge className="bg-red-500 text-white border-none text-[10px] px-2 py-0.5">
                -{discount}%
              </Badge>
            )}
            {product.isNew && (
              <Badge className="bg-emerald-500 text-white border-none text-[10px] px-2 py-0.5">
                NEW
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-amber-500 text-white border-none text-[10px] px-2 py-0.5">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Featured
              </Badge>
            )}
          </div>

          {/* Like */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          >
            <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              {product.category.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1 mb-3">
              {colors.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"
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
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
