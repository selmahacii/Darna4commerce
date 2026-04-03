'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Grid3X3, List, ArrowUpDown, X,
  Star, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight,
  ShoppingBag, Package, Award, TrendingUp, Users, DollarSign,
  BarChart3, Bell, Settings, Boxes, Eye, Edit3, Trash2, Plus,
  Download, ArrowUpRight, ArrowDownRight, Sparkles, Zap, Gift,
  Crown, Target, Flame, LayoutGrid, Megaphone, FileText, Palette,
  BoxSelect, Store, AlertTriangle, CheckCircle2, Clock, ChevronLeft, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, type View } from '@/stores/app-store';
import { useCartStore } from '@/stores/cart-store';
import Navbar from '@/components/ecommerce/Navbar';
import ProductCard from '@/components/ecommerce/ProductCard';
import dynamic from 'next/dynamic';
const ProductViewer3D = dynamic(() => import('@/components/three/ProductViewer3D'), {
  ssr: false,
  loading: () => <div className="h-[400px] md:h-[500px] w-full rounded-xl bg-gray-900 animate-pulse flex items-center justify-center text-gray-500 text-sm">Loading 3D viewer...</div>,
});
import ProductViewerFallback from '@/components/three/ProductViewerFallback';
import { toast } from 'sonner';
import React from 'react';

// Types
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  images: string;
  colors: string;
  materials: string;
  dimensions?: string;
  weight?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  tags: string;
  category?: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
}

// ===== HOME VIEW =====
function HomeView() {
  const { setView, selectProduct } = useAppStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?featured=true&limit=4').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([prodData, catData]) => {
      setFeaturedProducts(prodData.products || []);
      setCategories(catData || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-[url('/images/products/hero.png')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-44">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" /> New Collection 2025
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Premium Products,
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Curated for You
              </span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Discover our exclusive collection of luxury goods with 3D visualization, real-time customization, and smart recommendations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 px-8"
                onClick={() => setView('catalog')}
              >
                Shop Now <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8"
                onClick={() => setView('admin')}
              >
                Admin Panel
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BoxSelect, title: '3D Preview', desc: 'View products in 3D' },
              { icon: Palette, title: 'Customize', desc: 'Colors & materials' },
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $500' },
              { icon: Shield, title: 'Secure', desc: 'Encrypted payments' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3 p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Categories</h2>
              <p className="text-muted-foreground">Browse by category</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Card
                  className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  onClick={() => {
                    useAppStore.getState().setFilters({ category: cat.slug });
                    setView('catalog');
                  }}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {cat.slug === 'electronics' && <Zap className="w-7 h-7 text-amber-600" />}
                      {cat.slug === 'furniture' && <LayoutGrid className="w-7 h-7 text-amber-600" />}
                      {cat.slug === 'accessories' && <Gift className="w-7 h-7 text-amber-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-amber-600 transition-colors">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat._count?.products || 0} products</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked for you</p>
            </div>
            <Button variant="ghost" onClick={() => setView('catalog')}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Rewards CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-600 overflow-hidden">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-6 h-6 text-white" />
                  <Badge className="bg-white/20 text-white border-none">Loyalty Program</Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Earn Points, Get Rewards</h2>
                <p className="text-amber-100 mb-6">
                  Every purchase earns you points. Unlock badges, get exclusive discounts, and climb the leaderboard.
                </p>
                <Button size="lg" variant="secondary" className="shadow-lg" onClick={() => setView('profile')}>
                  View Rewards <Award className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="flex gap-4">
                {[
                  { icon: Sparkles, label: '2,500+ Points', desc: 'Earn per order' },
                  { icon: Flame, label: '6 Badges', desc: 'To unlock' },
                  { icon: Trophy, label: 'Leaderboard', desc: 'Compete' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <item.icon className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-amber-100">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-white font-bold">LUXESTORE</span>
              </div>
              <p className="text-sm">Premium products curated for the modern lifestyle.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Shop</h4>
              <div className="space-y-2 text-sm">
                <p className="hover:text-amber-400 cursor-pointer transition-colors">All Products</p>
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Electronics</p>
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Furniture</p>
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Accessories</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
              <div className="space-y-2 text-sm">
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Help Center</p>
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Shipping</p>
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Returns</p>
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Contact</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
              <div className="space-y-2 text-sm">
                <p className="hover:text-amber-400 cursor-pointer transition-colors">About Us</p>
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Careers</p>
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Blog</p>
                <p className="hover:text-amber-400 cursor-pointer transition-colors">Press</p>
              </div>
            </div>
          </div>
          <Separator className="bg-gray-800 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>2025 LUXESTORE. All rights reserved.</p>
            <div className="flex gap-4">
              <p className="hover:text-amber-400 cursor-pointer transition-colors">Privacy</p>
              <p className="hover:text-amber-400 cursor-pointer transition-colors">Terms</p>
              <p className="hover:text-amber-400 cursor-pointer transition-colors">Cookies</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ===== CATALOG VIEW =====
function CatalogView() {
  const { filters, setFilters, resetFilters } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: filters.search,
        category: filters.category,
        minPrice: String(filters.minPrice),
        maxPrice: String(filters.maxPrice),
        sortBy: filters.sortBy,
        page: String(page),
        limit: '12',
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts().catch(() => {});
  }, [fetchProducts]);

  const activeFilterCount = [
    filters.search,
    filters.category !== 'all' ? filters.category : '',
    filters.minPrice > 0 ? 'price' : '',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Shop All Products</h1>
            <p className="text-muted-foreground">{total} products found</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="relative"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Select value={filters.sortBy} onValueChange={(v) => setFilters({ sortBy: v as typeof filters.sortBy })}>
              <SelectTrigger className="w-40">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 256 }}
                exit={{ opacity: 0, width: 0 }}
                className="hidden lg:block flex-shrink-0 overflow-hidden"
              >
                <Card className="border-0 shadow-sm sticky top-24">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={resetFilters}>
                        <X className="w-3 h-3 mr-1" /> Clear
                      </Button>
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Category</Label>
                      <div className="space-y-2">
                        <button
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === 'all' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                          onClick={() => setFilters({ category: 'all' })}
                        >
                          All Categories
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${filters.category === cat.slug ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            onClick={() => setFilters({ category: cat.slug })}
                          >
                            {cat.name}
                            <span className="text-muted-foreground text-xs">{cat._count?.products || 0}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Price Range</Label>
                      <Slider
                        min={0}
                        max={5000}
                        step={50}
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={([min, max]) => setFilters({ minPrice: min, maxPrice: max })}
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>${filters.minPrice}</span>
                        <span>${filters.maxPrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No products found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
                {/* Pagination */}
                {total > 12 && (
                  <div className="flex justify-center mt-10 gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 text-sm">Page {page} of {Math.ceil(total / 12)}</span>
                    <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== PRODUCT DETAIL VIEW =====
function ProductDetailView() {
  const { selectedProductId, goBack } = useAppStore();
  const { addItem, openCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('3d');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [engraving, setEngraving] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showViewer, setShowViewer] = useState(true);

  useEffect(() => {
    if (!selectedProductId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`/api/products/${selectedProductId}`).then(r => r.json()),
      fetch(`/api/ai/recommendations?productId=${selectedProductId}`).then(r => r.json()),
    ]).then(([prodData, recData]) => {
      if (!cancelled) {
        setProduct(prodData.product);
        setRecommendations(recData.recommendations || []);
        if (prodData.product) {
          const colors = JSON.parse(prodData.product.colors || '[]');
          const materials = JSON.parse(prodData.product.materials || '[]');
          if (colors.length > 0) setSelectedColor(colors[0]);
          if (materials.length > 0) setSelectedMaterial(materials[0]);
        }
        setLoading(false);
      }
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedProductId]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Button onClick={() => goBack()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const images = JSON.parse(product.images || '[]') as string[];
  const colors = JSON.parse(product.colors || '[]') as string[];
  const materials = JSON.parse(product.materials || '[]') as string[];
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const productType = product.slug.split('-')[0] === 'aura' ? 'headphones'
    : product.slug.includes('chair') ? 'chair'
    : product.slug.includes('watch') ? 'watch'
    : product.slug.includes('lamp') ? 'lamp'
    : product.slug.includes('backpack') ? 'backpack'
    : product.slug.includes('speaker') || product.slug.includes('echo') ? 'speaker'
    : product.slug.includes('vase') ? 'vase'
    : product.slug.includes('ultrabook') || product.slug.includes('vertex') ? 'ultrabook'
    : 'headphones';

  const addToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || '',
      quantity,
      color: selectedColor,
      material: selectedMaterial,
      engraving,
    });
    openCart();
    toast.success('Added to cart!', {
      description: `${quantity}x ${product.name}`,
    });
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={goBack} className="hover:text-amber-600 transition-colors">Shop</button>
          <ChevronRight className="w-3 h-3" />
          {product.category && <span className="hover:text-amber-600 cursor-pointer transition-colors">{product.category.name}</span>}
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate max-w-48">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: 3D Viewer / Image */}
          <div className="space-y-4">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="3d">
                  <BoxSelect className="w-4 h-4 mr-1.5" /> 3D View
                </TabsTrigger>
                <TabsTrigger value="photo">
                  <Eye className="w-4 h-4 mr-1.5" /> Photos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="3d">
                <div className="relative">
                  {showViewer ? (
                    <ErrorBoundary fallback={<ProductViewerFallback productType={productType} color={selectedColor} material={selectedMaterial} engraving={engraving} />}>
                      <ProductViewer3D
                        productName={product.name}
                        productType={productType}
                        color={selectedColor}
                        material={selectedMaterial}
                        engraving={engraving}
                        className="h-[400px] md:h-[500px] w-full"
                      />
                    </ErrorBoundary>
                  ) : (
                    <ProductViewerFallback productType={productType} color={selectedColor} material={selectedMaterial} engraving={engraving} className="h-[400px] md:h-[500px] w-full" />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="photo">
                <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3 mt-3">
                    {images.map((img, i) => (
                      <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer ring-2 ring-amber-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge variant="secondary" className="mb-2">{product.category.name}</Badge>
              )}
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                {product.stock <= 10 && product.stock > 0 && (
                  <Badge variant="destructive" className="text-[10px]">Only {product.stock} left</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</span>
                  <Badge className="bg-red-100 text-red-600 border-none">-{discount}%</Badge>
                </>
              )}
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color</Label>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === color ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-gray-300 dark:border-gray-600'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Material Selection */}
            {materials.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Material</Label>
                <div className="flex flex-wrap gap-2">
                  {materials.map((mat) => (
                    <button
                      key={mat}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedMaterial === mat ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                      onClick={() => setSelectedMaterial(mat)}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Engraving */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Custom Engraving (optional)</Label>
              <Input
                placeholder="Enter text for engraving..."
                value={engraving}
                onChange={(e) => setEngraving(e.target.value.slice(0, 30))}
                maxLength={30}
              />
              {engraving && (
                <p className="text-xs text-muted-foreground">{engraving.length}/30 characters</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="w-10 h-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <Button variant="outline" size="icon" className="w-10 h-10" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/25 text-base"
                onClick={addToCart}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </Button>
              <Button size="lg" variant="outline" className="h-14 w-14" onClick={() => toast.info('Added to wishlist!')}>
                <Heart className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 w-14" onClick={() => toast.info('Link copied!')}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'Orders $500+' },
                { icon: RotateCcw, label: '30-Day Return', desc: 'Easy returns' },
                { icon: Shield, label: '2-Year Warranty', desc: 'Full coverage' },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <f.icon className="w-5 h-5 text-amber-600 mb-1" />
                  <p className="text-xs font-medium">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Specs */}
            {product.dimensions && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Specifications</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {product.dimensions && (
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span className="font-medium">{product.dimensions}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="font-medium">{product.weight} kg</span>
                      </div>
                    )}
                    <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-muted-foreground">In Stock</span>
                      <span className="font-medium text-green-600">{product.stock} units</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            <Separator />
            <div>
              <h3 className="font-semibold text-sm mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Error Boundary for 3D viewer
class ErrorBoundary extends React.Component<{ fallback: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ===== CHECKOUT VIEW =====
function CheckoutView() {
  const { goBack } = useAppStore();
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', address: '', city: '', country: 'US', zipCode: '',
    cardNumber: '', expiry: '', cvv: '', nameOnCard: '',
  });

  const subtotal = getTotal();
  const shipping = subtotal > 500 ? 0 : 29.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully!', {
      description: `Order total: $${total.toFixed(2)}. You earned ${Math.floor(total * 10)} points!`,
    });
    clearCart();
    setTimeout(() => goBack(), 2000);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-800/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {['Shipping', 'Payment', 'Review'].map((label, i) => (
            <div key={i} className="flex items-center">
              <button
                className={`w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'}`}
                onClick={() => setStep(i + 1)}
              >
                {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </button>
              <span className={`ml-2 text-sm font-medium mr-6 ${step === i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
              {i < 2 && <div className={`w-12 h-0.5 mr-6 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold">Shipping Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>First Name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" /></div>
                      <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" /></div>
                    </div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" /></div>
                    <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" /></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
                      <div className="space-y-2"><Label>ZIP Code</Label><Input value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} /></div>
                    </div>
                    <Button className="w-full" onClick={() => setStep(2)}>Continue to Payment</Button>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold">Payment Method</h2>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['Credit Card', 'PayPal', 'Crypto'].map((m, i) => (
                        <button key={i} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${i === 0 ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2"><Label>Name on Card</Label><Input value={form.nameOnCard} onChange={(e) => setForm({ ...form, nameOnCard: e.target.value })} placeholder="John Doe" /></div>
                    <div className="space-y-2"><Label>Card Number</Label><Input value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} placeholder="4242 4242 4242 4242" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Expiry</Label><Input value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} placeholder="MM/YY" /></div>
                      <div className="space-y-2"><Label>CVV</Label><Input value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} placeholder="123" /></div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                      <Button className="flex-1" onClick={() => setStep(3)}>Review Order</Button>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold">Review Order</h2>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Shipping to</span><span>{form.city}, {form.country}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>•••• {form.cardNumber.slice(-4)}</span></div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                        onClick={handlePlaceOrder}
                      >
                        Place Order - ${total.toFixed(2)}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-4">{item.name} x{item.quantity}</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Earn {Math.floor(total * 10)} loyalty points!</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== PROFILE / REWARDS VIEW =====
function ProfileView() {
  const { goBack, setView } = useAppStore();
  const [userPoints] = useState(2500);
  const [userLevel] = useState(5);
  const nextLevelPoints = 5000;
  const progress = (userPoints / nextLevelPoints) * 100;

  const badges = [
    { name: 'First Purchase', icon: '🛍️', earned: true, desc: 'Made first purchase' },
    { name: 'Review Writer', icon: '✍️', earned: true, desc: 'Wrote 5 reviews' },
    { name: 'Loyal Customer', icon: '⭐', earned: false, desc: 'Make 10 purchases' },
    { name: 'Big Spender', icon: '💰', earned: false, desc: 'Spend over $1,000' },
    { name: 'Trendsetter', icon: '🔥', earned: true, desc: 'Reviewed a new product' },
    { name: 'VIP Member', icon: '👑', earned: false, desc: 'Earn 5,000 points' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah K.', points: 12500, level: 12 },
    { rank: 2, name: 'Mike T.', points: 10200, level: 10 },
    { rank: 3, name: 'Emma R.', points: 8900, level: 9 },
    { rank: 4, name: 'Alex P.', points: 5400, level: 7 },
    { rank: 5, name: 'You', points: userPoints, level: userLevel },
  ];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-amber-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <Card className="border-0 shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                J
              </div>
              <div>
                <h2 className="text-xl font-bold">John Doe</h2>
                <p className="text-amber-100">Level {userLevel} Member</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
                <p className="text-amber-100 text-sm">Total Points</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level {userLevel}</span>
                <span className="font-medium">{nextLevelPoints - userPoints} points to Level {userLevel + 1}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badges */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" /> Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center p-3 rounded-xl text-center transition-all ${badge.earned ? 'bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-200 dark:ring-amber-800' : 'bg-gray-50 dark:bg-gray-800/50 opacity-50'}`}
                  >
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <p className="text-xs font-medium">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" /> Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${entry.name === 'You' ? 'bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-200 dark:ring-amber-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'}`}>
                      {entry.rank}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${entry.name === 'You' ? 'text-amber-600' : ''}`}>{entry.name}</p>
                      <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                    </div>
                    <span className="text-sm font-semibold">{entry.points.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Package, label: 'My Orders', action: () => setView('orders') },
                { icon: Heart, label: 'Wishlist', action: () => toast.info('Wishlist coming soon!') },
                { icon: Settings, label: 'Settings', action: () => toast.info('Settings coming soon!') },
                { icon: Megaphone, label: 'Refer a Friend', action: () => toast.info('Referral program coming soon!') },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-6 h-6 text-amber-600" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===== ORDERS VIEW =====
function OrdersView() {
  const { goBack } = useAppStore();
  const orders = [
    { id: 'ORD-001', date: '2025-01-15', total: 1299.98, status: 'Delivered', items: 2 },
    { id: 'ORD-002', date: '2025-01-10', total: 349.99, status: 'Shipped', items: 1 },
    { id: 'ORD-003', date: '2024-12-28', total: 899.99, status: 'Delivered', items: 1 },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Shipped': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Processing': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-amber-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColor(order.status)}>{order.status}</Badge>
                    <p className="font-bold mt-1">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{order.items} item(s)</p>
                  <Button variant="ghost" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== ADMIN DASHBOARD VIEW =====
function AdminDashboard() {
  const { goBack, setView } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/summary').then(r => r.json()),
      fetch('/api/products?limit=50').then(r => r.json()),
    ]).then(([analyticsData, productsData]) => {
      setAnalytics(analyticsData);
      setProducts(productsData.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your store</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" /> Alerts (3)
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {[
            { icon: AlertTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-900/20', msg: 'Low stock: Vertex Ultrabook Pro (15 left)', time: '2h ago' },
            { icon: TrendingUp, color: 'text-green-500 bg-green-50 dark:bg-green-900/20', msg: 'Sales up 23% this week', time: '5h ago' },
            { icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', msg: '12 new customer sign-ups today', time: '8h ago' },
          ].map((alert, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${alert.color}`}>
              <alert.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.msg}</p>
                <p className="text-xs opacity-70">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1.5" /> Overview</TabsTrigger>
            <TabsTrigger value="products"><Boxes className="w-4 h-4 mr-1.5" /> Products</TabsTrigger>
            <TabsTrigger value="inventory"><Package className="w-4 h-4 mr-1.5" /> Inventory</TabsTrigger>
            <TabsTrigger value="reports"><FileText className="w-4 h-4 mr-1.5" /> Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Revenue', value: `$${((summary.totalRevenue || 0)).toLocaleString()}`, icon: DollarSign, change: '+12.5%', up: true, color: 'from-emerald-500 to-green-600' },
                { label: 'Total Orders', value: String(summary.totalOrders || 0), icon: ShoppingBag, change: '+8.3%', up: true, color: 'from-blue-500 to-indigo-600' },
                { label: 'Total Products', value: String(summary.totalProducts || 0), icon: Boxes, change: '+2', up: true, color: 'from-amber-500 to-orange-600' },
                { label: 'Avg Rating', value: (summary.avgRating || 0).toFixed(1), icon: Star, change: '+0.2', up: true, color: 'from-purple-500 to-pink-600' },
              ].map((kpi, i) => (
                <Card key={i} className="border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                        <kpi.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {kpi.change}
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Sales Trend */}
              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sales Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end gap-3 pt-4">
                    {(analytics?.monthlySales || []).map((m: { month: string; sales: number }, i: number) => {
                      const maxSales = Math.max(...(analytics?.monthlySales || []).map((d: { sales: number }) => d.sales));
                      const height = (m.sales / maxSales) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-xs font-medium">${(m.sales / 1000).toFixed(1)}k</span>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg relative" style={{ height: '100%' }}>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-lg"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.salesByCategory || []).map((cat: { name: string; sales: number }, i: number) => {
                      const maxSales = Math.max(...(analytics?.salesByCategory || []).map((c: { sales: number }) => c.sales));
                      const width = (cat.sales / maxSales) * 100;
                      const colors = ['from-amber-500 to-orange-500', 'from-blue-500 to-indigo-500', 'from-emerald-500 to-green-500'];
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{cat.name}</span>
                            <span className="text-sm text-muted-foreground">${(cat.sales / 1000).toFixed(1)}k</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${width}%` }}
                              transition={{ duration: 0.8, delay: i * 0.15 }}
                              className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analytics?.recentOrders || []).map((order: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {order.user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{order.user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{order.status || 'pending'}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analytics?.topProducts || []).map((product: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-muted-foreground">
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs text-muted-foreground ml-1">{product.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">${product.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">All Products ({products.length})</h3>
                  <div className="flex gap-2">
                    <Input placeholder="Search products..." className="w-64 h-9" />
                    <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Product</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Category</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Price</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Stock</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Rating</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                {product.images !== '[]' ? (
                                  <img src={(JSON.parse(product.images) as string[])[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Boxes className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.shortDesc}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="secondary">{product.category?.name || 'N/A'}</Badge>
                          </td>
                          <td className="py-3 px-3 font-medium">${product.price.toFixed(2)}</td>
                          <td className="py-3 px-3">
                            <span className={`font-medium ${product.stock <= 10 ? 'text-red-500' : product.stock <= 30 ? 'text-amber-500' : 'text-green-500'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{product.rating}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { useAppStore.getState().selectProduct(product.id); setView('product'); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Inventory Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const stockPercent = Math.min((product.stock / 100) * 100, 100);
                    return (
                      <div key={product.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                            {product.images !== '[]' ? (
                              <img src={(JSON.parse(product.images) as string[])[0]} alt="" className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">${product.price}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Stock Level</span>
                            <span className={`font-medium ${product.stock <= 10 ? 'text-red-500' : product.stock <= 30 ? 'text-amber-500' : 'text-green-500'}`}>
                              {product.stock} units
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stockPercent}%` }}
                              transition={{ duration: 0.5 }}
                              className={`h-full rounded-full ${product.stock <= 10 ? 'bg-red-500' : product.stock <= 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                            />
                          </div>
                        </div>
                        {product.stock <= 10 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
                            <AlertTriangle className="w-3 h-3" />
                            Low stock - consider restocking
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visitor Stats */}
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base">Visitor Analytics</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[
                      { label: 'Total Visitors', value: analytics?.visitorStats?.totalVisitors?.toLocaleString() },
                      { label: 'Unique Visitors', value: analytics?.visitorStats?.uniqueVisitors?.toLocaleString() },
                      { label: 'Bounce Rate', value: `${analytics?.visitorStats?.bounceRate}%` },
                      { label: 'Avg Session', value: analytics?.visitorStats?.avgSessionDuration },
                    ].map((stat, i) => (
                      <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" /> AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { text: 'Consider running a 15% promotion on Ergonix Chair to boost Q2 sales', priority: 'high' },
                      { text: 'Vertex Ultrabook Pro is low on stock - recommend restocking 50 units', priority: 'high' },
                      { text: 'Aura Pro Headphones trending - increase ad spend by 20%', priority: 'medium' },
                      { text: 'Nomad Backpack could benefit from a bundle deal with Lamp', priority: 'low' },
                    ].map((suggestion, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px] mt-0.5">
                          {suggestion.priority}
                        </Badge>
                        <p className="text-sm">{suggestion.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card className="border-0 shadow-sm md:col-span-2">
                <CardHeader><CardTitle className="text-base">Export Reports</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: FileText, label: 'Sales Report', format: 'PDF' },
                      { icon: FileText, label: 'Inventory Report', format: 'CSV' },
                      { icon: Users, label: 'Customer Report', format: 'PDF' },
                      { icon: BarChart3, label: 'Analytics Report', format: 'CSV' },
                    ].map((report, i) => (
                      <button
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                        onClick={() => toast.success(`${report.label} exported as ${report.format}!`)}
                      >
                        <report.icon className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-sm">{report.label}</p>
                          <p className="text-xs text-muted-foreground">{report.format}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function EcommercePage() {
  const { view } = useAppStore();

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView />;
      case 'catalog': return <CatalogView />;
      case 'product': return <ProductDetailView />;
      case 'checkout': return <CheckoutView />;
      case 'profile': return <ProfileView />;
      case 'orders': return <OrdersView />;
      case 'admin': return <AdminDashboard />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


