'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Search, SlidersHorizontal, ArrowUpDown, X,
  Star, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight,
  ShoppingBag, Package, Award, TrendingUp, Users,
  BarChart3, Settings, Eye, Edit3, Trash2, Plus,
  Sparkles, Zap, Gift,
  Crown, Flame, LayoutGrid,
  Store, CheckCircle2, Clock, ChevronLeft, Trophy,
  HandMetal, TruckIcon, Menu, Globe, ChevronDown, BoxSelect,
  Instagram, Facebook, Mail, Phone, MapPin,
  CreditCard, Banknote, User, Map,
  Home, Calendar, ArrowUpRight, Percent,
  LogOut, LogIn, ArrowRight,
  Wallet, Layers, Gem
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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAppStore, type View } from '@/stores/app-store';
import { safeJSONParse } from '@/lib/format';
import AdminDashboard from '@/components/ecommerce/AdminDashboard';

// Backend API helper — routes all calls to Node.js backend on port 3003
const BACKEND_URL = 'http://127.0.0.1:3003';
const api = (path: string, options?: RequestInit) => {
  const token = useAppStore.getState().auth.token;
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
};
import { useCartStore } from '@/stores/cart-store';
import ProductCard from '@/components/ecommerce/ProductCard';
import CartDrawer from '@/components/ecommerce/CartDrawer';
import ProductViewerFallback from '@/components/three/ProductViewerFallback';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';
import { ScrollProgress, SectionReveal, AnimatedCounter, TextReveal, MagneticButton } from '@/components/ui/AnimatedElements';

// Dynamic import for 3D viewer
const ProductViewer3D = dynamic(() => import('@/components/three/ProductViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] md:h-[500px] w-full rounded-xl bg-charcoal/5 animate-pulse flex items-center justify-center text-muted-foreground text-sm">
      Chargement de la vue 3D...
    </div>
  ),
});

// Dynamic import for 3D Hero Scene
const HeroScene3D = dynamic(() => import('@/components/three/HeroScene3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-charcoal" />,
});

// Dynamic import for floating particles
const FloatingParticles = dynamic(() => import('@/components/ui/FloatingParticles'), {
  ssr: false,
});

// =============================================
// TYPES
// =============================================
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
  image?: string;
  _count?: { products: number };
}

// =============================================
// COLOR MAP (avoids dynamic Tailwind class issues)
// =============================================
const colorMap: Record<string, { bg: string; text: string }> = {
  terracotta: { bg: 'bg-terracotta/10', text: 'text-terracotta' },
  gold: { bg: 'bg-gold/10', text: 'text-gold' },
  olive: { bg: 'bg-olive/10', text: 'text-olive' },
  'terracotta-dark': { bg: 'bg-terracotta-dark/10', text: 'text-terracotta-dark' },
  charcoal: { bg: 'bg-charcoal/10', text: 'text-charcoal' },
};

const getColor = (name: string) => colorMap[name] || colorMap.charcoal;

// =============================================
// PRICE FORMATTING
// =============================================
function formatPrice(amount: number, currency: string): string {
  if (currency === 'EUR') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount * 0.007);
  }
  return amount.toLocaleString('fr-DZ') + ' DA';
}

const WILAYAS = [
  '01 - Adrar','02 - Chlef','03 - Laghouat','04 - Oum El Bouaghi','05 - Batna',
  '06 - Béja\u00efa','07 - Biskra','08 - Béchar','09 - Blida','10 - Bouira',
  '11 - Tamanrasset','12 - Tébessa','13 - Tlemcen','14 - Tiaret','15 - Tizi Ouzou',
  '16 - Alger','17 - Djelfa','18 - Jijel','19 - Sétif','20 - Sa\u00efda',
  '21 - Skikda','22 - Sidi Bel Abbès','23 - Annaba','24 - Guelma','25 - Constantine',
  '26 - Médéa','27 - Mostaganem','28 - M\'Sila','29 - Mascara','30 - Ouargla',
  '31 - Oran','32 - El Bayadh','33 - Illizi','34 - Bordj Bou Arréridj','35 - Boumerdès',
  '36 - El Tarf','37 - Tindouf','38 - Tissemsilt','39 - El Oued','40 - Khenchela',
  '41 - Souk Ahras','42 - Tipaza','43 - Mila','44 - A\u00efn Defla','45 - Na\u00e2ma',
  '46 - A\u00efn Témouchent','47 - Gharda\u00efa','48 - Relizane','49 - El M\'Ghair','50 - El Meniaa',
  '51 - Ouled Djellal','52 - Bordj Badji Mokhtar','53 - Béni Abbès','54 - Timimoun','55 - Touggourt',
  '56 - Djanet','57 - In Salah','58 - In Guezzam'
];

// =============================================
// ZELLIGE LOGO SVG
// =============================================
function DarnaLogo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="doorGrad" x1="0" y1="0" x2="0" y2="40">
          <stop offset="0%" stopColor="#A66835" />
          <stop offset="100%" stopColor="#7A4B24" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B48E2E" />
        </linearGradient>
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" />
          <feOffset dx="0" dy="0.5" result="offsetblur" />
          <feComponentTransfer><feFuncA type="linear" slope="0.2" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      
      {/* Outer Arch Shape */}
      <path d="M20 4 C14 4 8 10 8 18 L8 36 L12 36 L12 18 C12 14 16 12 20 12 C24 12 28 14 28 18 L28 36 L32 36 L32 18 C32 10 26 4 20 4 Z" fill="url(#doorGrad)" filter="url(#logoShadow)" />
      
      {/* Middle Arch Detail */}
      <path d="M20 7 C15 7 11 11 11 18 L11 36 L13 36 L13 18 C13 15 16 13 20 13 C24 13 27 15 27 18 L27 36 L29 36 L29 18 C29 11 25 7 20 7 Z" fill="#E8C37C" />
      
      {/* Inner Decorative Door / Lattice Area */}
      <path d="M20 10 C16 10 14 14 14 18 L14 36 L26 36 L26 18 C26 14 24 10 20 10 Z" fill="url(#goldGrad)" opacity="0.9" />
      
      {/* Keyhole Shape */}
      <path d="M20 20 C18.895 20 18 20.895 18 22 C18 22.845 18.528 23.567 19.261 23.854 L18.5 27 L21.5 27 L20.739 23.854 C21.472 23.567 22 22.845 22 22 C22 20.895 21.105 20 20 20 Z" fill="white" />
    </svg>
  );
}

// =============================================
// DECORATIVE ZELLIGE PATTERN
// =============================================
function ZelligePattern({ className = '', id = 'zellige' }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <pattern id={id} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <path d="M20 8L32 20L20 32L8 20Z" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />
      </pattern>
      <rect width="200" height="200" fill={`url(#${id})`} />
    </svg>
  );
}

// =============================================
// ERROR BOUNDARY (simple)
// =============================================
import React from 'react';

class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// =============================================
// AUTH DIALOG (Login / Register)
// =============================================
function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      onOpenChange(false);
      toast.success('Bienvenue !');
    } else {
      toast.error('Identifiants incorrects');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const name = fd.get('name') as string;
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    if (password.length < 6) {
      setLoading(false);
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    const success = await register(email, name, password);
    setLoading(false);
    if (success) {
      onOpenChange(false);
      toast.success('Compte créé avec succès !');
    } else {
      toast.error('Erreur lors de la création du compte');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setMode('login'); }}>
      <DialogContent className="sm:max-w-md bg-white border-terracotta/10">
        <DialogHeader>
          <DialogTitle className="text-charcoal">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Entrez vos identifiants pour accéder à votre compte'
              : 'Rejoignez Darna et découvrez nos produits artisanaux'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" placeholder="email@exemple.com" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <Input name="password" type="password" placeholder="••••••" required className="rounded-xl" />
            </div>
            <div className="bg-sand/50 rounded-xl p-3 text-xs text-charcoal/60 space-y-1">
              <p className="font-semibold text-charcoal/80">Comptes de démonstration :</p>
              <p>Admin : admin@darna.dz / admin123</p>
              <p>Client : amina@email.com / amina123</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-terracotta hover:bg-terracotta-dark text-white rounded-xl">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Se connecter
            </Button>
            <p className="text-center text-sm text-charcoal/50">
              Pas encore de compte ?{' '}
              <button type="button" onClick={() => setMode('register')} className="text-terracotta hover:underline font-medium">
                Créer un compte
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input name="name" type="text" placeholder="Votre nom" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input name="email" type="email" placeholder="email@exemple.com" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe *</Label>
              <Input name="password" type="password" placeholder="Min. 6 caractères" required minLength={6} className="rounded-xl" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-terracotta hover:bg-terracotta-dark text-white rounded-xl">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer mon compte
            </Button>
            <p className="text-center text-sm text-charcoal/50">
              Déjà un compte ?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-terracotta hover:underline font-medium">
                Se connecter
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// NAVBAR
// =============================================
function DarnaNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const { view, setView, isAdmin: isAdminFn, isAuthenticated: isAuthenticatedFn, setCurrency, currency, filters, setFilters, resetFilters, auth, login, register, logout } = useAppStore();
  const isAdmin = isAdminFn();
  const isLoggedIn = isAuthenticatedFn();
  const user = auth.user;
  const { toggleCart, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile menu/admin dropdown are closed in click handlers directly

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
    setView('catalog');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'DZD' ? 'EUR' : 'DZD');
  };

  const navLinks = [
    { label: 'Boutique', view: 'catalog' as View, icon: ShoppingBag },
    { label: 'Nouveautés', view: 'catalog' as View, filter: { sortBy: 'newest' as const }, icon: Sparkles },
    { label: 'Fidélité', view: 'profile' as View, icon: Trophy },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-cream/90 backdrop-blur-xl shadow-md border-b border-terracotta/10'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2.5 group"
            >
              <DarnaLogo className="w-9 h-9 group-hover:scale-105 transition-transform" />
              <div className="hidden sm:block">
                <span className="text-xl font-serif font-bold tracking-tight text-charcoal">
                  Darna <span className="text-terracotta">for commerce</span>
                </span>
                <span className="block text-[10px] text-terracotta -mt-0.5 tracking-widest uppercase">
                  دارنا للاعمال
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    if (link.view === 'catalog' && !link.filter) resetFilters();
                    if (link.filter) setFilters(link.filter);
                    setView(link.view);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    view === link.view
                      ? 'text-terracotta bg-terracotta/8 font-semibold'
                      : 'text-charcoal/70 hover:text-terracotta hover:bg-terracotta/5'
                  }`}
                >
                  {link.label}
                  {view === link.view && (
                    <motion.div
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-terracotta rounded-full"
                      layoutId="darnaNav"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}

              {/* Auth / Admin */}
              {isLoggedIn && user?.role === 'admin' ? (
                <button
                  onClick={() => setView('admin')}
                  className="px-3 py-2 rounded-xl text-sm text-charcoal/60 hover:text-charcoal hover:bg-terracotta/5 flex items-center gap-1.5 transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  Tableau de bord
                </button>
              ) : isLoggedIn ? (
                <button
                  onClick={() => { setView('orders'); }}
                  className="px-3 py-2 rounded-xl text-sm text-charcoal/60 hover:text-charcoal hover:bg-terracotta/5 flex items-center gap-1.5 transition-all"
                >
                  <Package className="w-4 h-4" />
                  Mes Commandes
                </button>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-3 py-2 rounded-xl text-sm text-charcoal/60 hover:text-charcoal hover:bg-terracotta/5 flex items-center gap-1.5 transition-all"
                >
                  <User className="w-4 h-4" />
                  Connexion
                </button>
              )}
              {isLoggedIn && (
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-xl text-sm text-charcoal/40 hover:text-terracotta hover:bg-terracotta/5 flex items-center gap-1.5 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: window?.innerWidth < 640 ? 160 : 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSearch}
                    className="hidden sm:block overflow-hidden"
                  >
                    <Input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 text-sm bg-sand border-terracotta/10 focus:border-terracotta/30 rounded-xl"
                      autoFocus
                    />
                  </motion.form>
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) setSearchQuery('');
                }}
                className="text-charcoal/60 hover:text-terracotta hover:bg-terracotta/5 rounded-xl"
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </Button>

              {/* Currency Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-xs font-semibold text-charcoal/50 hover:text-terracotta hover:bg-terracotta/5 gap-1 rounded-xl"
                onClick={toggleCurrency}
              >
                <Globe className="w-3.5 h-3.5" />
                {currency}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative text-charcoal/60 hover:text-terracotta hover:bg-terracotta/5 rounded-xl"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terracotta text-cream text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-charcoal/60 hover:text-terracotta hover:bg-terracotta/5 rounded-xl"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 bg-cream/95 backdrop-blur-xl border-b border-terracotta/10 md:hidden"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    if (link.view === 'catalog' && !link.filter) resetFilters();
                    if (link.filter) setFilters(link.filter as any);
                    setView(link.view);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-3 transition-colors ${
                    view === link.view
                      ? 'text-terracotta bg-terracotta/8'
                      : 'text-charcoal/70 hover:bg-sand'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <Separator className="my-2 bg-terracotta/10" />
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal/70">
                    <User className="w-4 h-4 text-terracotta" />
                    <span className="font-medium">{user?.name || user?.email}</span>
                  </div>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => { setView('admin'); setIsMobileOpen(false); }}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-3 text-charcoal/70 hover:bg-sand transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-terracotta" />
                      Tableau de bord
                    </button>
                  )}
                  <button
                    onClick={() => { setView('orders'); setIsMobileOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-3 text-charcoal/70 hover:bg-sand transition-colors"
                  >
                    <Package className="w-4 h-4 text-olive" />
                    Mes Commandes
                  </button>
                  <button
                    onClick={() => { logout(); setIsMobileOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-3 text-terracotta/60 hover:bg-sand transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setLoginOpen(true); setIsMobileOpen(false); }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-3 text-charcoal/70 hover:bg-sand transition-colors"
                >
                  <User className="w-4 h-4 text-terracotta" />
                  Connexion
                </button>
              )}
              <Separator className="my-2 bg-terracotta/10" />
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-charcoal/50">Devise</span>
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={toggleCurrency}>
                  {currency === 'DZD' ? 'DZD \u2192 EUR' : 'EUR \u2192 DZD'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Dialog (Login / Register) */}
      <AuthDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}

// =============================================
// FOOTER
// =============================================
function DarnaFooter() {
  const { setView, resetFilters } = useAppStore();
  return (
    <footer className="bg-charcoal text-cream/70 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <DarnaLogo className="w-9 h-9" />
              <div>
                <span className="text-xl font-serif font-bold text-cream">Darna <span className="text-gold font-sans">for commerce</span></span>
                <span className="block text-[10px] text-gold -mt-0.5 tracking-widest uppercase">
                  دارنا للاعمال
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              L&apos;artisanat algérien, fait avec le c\u0153ur. Chaque pièce raconte une histoire de savoir-faire et de passion.
            </p>
            <div className="flex gap-3">
              <button className="w-9 h-9 rounded-xl bg-cream/10 hover:bg-terracotta flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-xl bg-cream/10 hover:bg-terracotta flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-xl bg-cream/10 hover:bg-terracotta flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* La Boutique */}
          <div>
            <h4 className="text-cream font-semibold mb-4 text-sm">La Boutique</h4>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Tous les produits', action: () => { resetFilters(); setView('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
                { label: 'Cuir & Artisanat', action: () => { useAppStore.getState().setFilters({ category: 'cuir-artisanat' }); setView('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
                { label: 'Luminaires', action: () => { useAppStore.getState().setFilters({ category: 'luminaires' }); setView('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
                { label: 'Textiles', action: () => { useAppStore.getState().setFilters({ category: 'textiles' }); setView('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
              ].map((item) => (
                <button key={item.label} onClick={item.action} className="block hover:text-gold transition-colors text-left w-full">
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notre Histoire */}
          <div>
            <h4 className="text-cream font-semibold mb-4 text-sm">Notre Histoire</h4>
            <div className="space-y-2.5 text-sm">
              <p className="hover:text-gold transition-colors cursor-pointer">\u00c0 propos de Darna</p>
              <p className="hover:text-gold transition-colors cursor-pointer">Nos Artisans</p>
              <p className="hover:text-gold transition-colors cursor-pointer">Engagement éthique</p>
              <p className="hover:text-gold transition-colors cursor-pointer">Blog</p>
            </div>
          </div>

          {/* Aide & Contact */}
          <div>
            <h4 className="text-cream font-semibold mb-4 text-sm">Aide & Contact</h4>
            <div className="space-y-2.5 text-sm">
              <p className="hover:text-gold transition-colors cursor-pointer">FAQ</p>
              <p className="hover:text-gold transition-colors cursor-pointer">Livraison & Retours</p>
              <p className="hover:text-gold transition-colors cursor-pointer">Guide des tailles</p>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gold" /> +213 555 123 456</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gold" /> bonjour@darna.dz</p>
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gold" /> Alger, Algérie</p>
            </div>
          </div>
        </div>

        <Separator className="bg-cream/10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/40">
          <p>&copy; 2025 Darna for commerce. Fait avec amour par Selma Haci. Licence : Selma Haci.</p>
          <div className="flex gap-6">
            <p className="hover:text-cream/70 cursor-pointer transition-colors">Confidentialité</p>
            <p className="hover:text-cream/70 cursor-pointer transition-colors">CGV</p>
            <p className="hover:text-cream/70 cursor-pointer transition-colors">Cookies</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// =============================================
// HOME VIEW
// =============================================
function HomeView() {
  const { setView } = useAppStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/products?featured=true&limit=4').then(r => r.json()),
      api('/api/categories').then(r => r.json()),
    ]).then(([prodData, catData]) => {
      setFeaturedProducts(prodData.products || []);
      setCategories(catData || []);
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
      toast.error('Erreur de chargement', { description: 'Veuillez réessayer' });
    });
  }, []);

  const categoryIcons: Record<string, any> = {
    'cuir-artisanat': HandMetal,
    'luminaires': Sparkles,
    'textiles': Layers,
    'cuisine': Home,
    'bijoux': Gem,
  };

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden min-h-screen flex items-center bg-charcoal">
        {/* 3D Interactive Background */}
        <HeroScene3D />

        {/* Animated scan line effect */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent pointer-events-none z-10"
          initial={{ top: '0%', opacity: 0 }}
          animate={{ top: ['0%', '100%', '0%'], opacity: [0, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 z-10">
          <div className="max-w-2xl">
            {/* Arabic decorative element with animated reveal */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex items-center gap-3 mb-8"
            >
              <motion.div className="h-px bg-gradient-to-r from-gold/0 via-gold/60 to-gold/60" initial={{ width: 0 }} animate={{ width: 48 }} transition={{ delay: 0.5, duration: 0.6 }} />
              <motion.span className="text-gold/80 text-sm tracking-[0.3em] font-light" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
                دارنا
              </motion.span>
              <motion.div className="h-px bg-gradient-to-r from-gold/60 via-gold/60 to-gold/0" initial={{ width: 0 }} animate={{ width: 48 }} transition={{ delay: 0.5, duration: 0.6 }} />
            </motion.div>

            {/* Animated badge */}
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.7, duration: 0.5, type: 'spring' }}>
              <Badge className="mb-8 bg-terracotta/20 text-terracotta-light border-terracotta/30 backdrop-blur-sm px-5 py-2 rounded-full text-sm">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                </motion.span>
                Collection Artisanale 2025
              </Badge>
            </motion.div>

            {/* Main title with staggered reveal */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-cream leading-[1.1] mb-8">
              <motion.span className="block" initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.8, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
                Bienvenue chez
              </motion.span>
              <motion.span className="block text-transparent bg-clip-text bg-gradient-to-r from-terracotta-light via-gold to-terracotta-light font-serif" initial={{ opacity: 0, y: 50, filter: 'blur(10px)', scale: 0.8 }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }} transition={{ delay: 1.0, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
                Darna <span className="text-sm font-sans tracking-wide">for commerce</span>
              </motion.span>
            </h1>

            <motion.p className="text-lg md:text-xl text-cream/80 mb-6 max-w-lg leading-relaxed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }}>
              D&eacute;couvrez l&apos;&acirc;me de l&apos;artisanat alg&eacute;rien &mdash; des pi&egrave;ces uniques fa&ccedil;onn&eacute;es &agrave; la main par nos artisans, avec tout l&apos;amour et le savoir-faire transmis de g&eacute;n&eacute;ration en g&eacute;n&eacute;ration.
            </motion.p>

            <motion.p className="text-sm text-gold/50 italic mb-10 font-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}>
              &laquo; L&apos;artisanat alg&eacute;rien, fait avec le c&oelig;ur &raquo;
            </motion.p>

            <motion.div className="flex flex-wrap gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.6 }}>
              <Button size="lg" className="bg-gradient-to-r from-terracotta to-terracotta-dark hover:from-terracotta-dark hover:to-terracotta text-cream shadow-lg shadow-terracotta/25 px-8 h-13 text-base rounded-xl transition-all duration-300" onClick={() => setView('catalog')}>
                Découvrir la Boutique
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </motion.span>
              </Button>
              <Button size="lg" variant="outline" className="border-cream/25 text-cream hover:bg-cream/10 backdrop-blur-sm px-8 h-13 text-base rounded-xl transition-all duration-300" onClick={() => { document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Notre Histoire
              </Button>
            </motion.div>
          </div>

          {/* Floating stats on the right */}
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }} className="absolute bottom-32 right-8 lg:right-16 hidden lg:flex flex-col gap-4">
            {[
              { value: 200, suffix: '+', label: 'Produits artisanaux' },
              { value: 58, suffix: '', label: 'Wilayas livrées' },
              { value: 4.9, suffix: '/5', label: 'Note moyenne' },
            ].map((stat, i) => (
              <motion.div key={stat.label} className="text-right" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.2 + i * 0.15, duration: 0.5 }} whileHover={{ scale: 1.05, x: -5 }}>
                <p className="text-2xl font-bold text-cream"><AnimatedCounter target={stat.value} suffix={stat.suffix} duration={2} /></p>
                <p className="text-xs text-cream/50">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Animated rotating rings */}
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2, duration: 1.5, ease: 'easeOut' }} className="absolute top-1/2 right-8 lg:right-24 -translate-y-1/2 hidden xl:block">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
              <div className="w-48 h-48 border border-gold/10 rounded-full flex items-center justify-center">
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                  <div className="w-36 h-36 border border-gold/15 rounded-full flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}>
                      <div className="w-24 h-24 border border-gold/20 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 rotate-45 bg-gold/15 border border-gold/25" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 0.5 }}>
            <span className="text-[10px] text-cream/30 uppercase tracking-widest">Découvrir</span>
            <div className="w-5 h-8 border border-cream/20 rounded-full flex justify-center pt-1.5">
              <motion.div className="w-1 h-2 bg-cream/40 rounded-full" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== POURQUOI DARNA ===== */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-terracotta text-sm font-medium tracking-wider uppercase">Nos Valeurs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mt-2">
              Pourquoi <span className="text-terracotta">Darna</span> ?
            </h2>
            <p className="text-charcoal/60 mt-3 max-w-2xl mx-auto leading-relaxed">
              Darna for commerce s&apos;engage à préserver et à valoriser le patrimoine artisanal algérien par une approche éthique, durable et d&apos;une qualité irréprochable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: HandMetal, title: 'Fait Main', desc: 'Chaque pièce est unique, fa\u00e7onnée avec patience par nos artisans', color: 'terracotta' },
              { icon: Heart, title: 'Artisans Algériens', desc: 'Nous connaissons chaque maker et son histoire personnelle', color: 'gold' },
              { icon: Award, title: 'Qualité Premium', desc: 'Aucun compromis sur la matière et la finition de nos produits', color: 'olive' },
              { icon: Truck, title: 'Livraison 58 Wilayas', desc: 'Nous livrons partout en Algérie, avec soin et rapidité', color: 'terracotta-dark' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
              >
                <Card className="group border-0 bg-white hover:shadow-xl transition-all duration-500 rounded-2xl h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl ${getColor(item.color).bg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-500`}>
                      <item.icon className={`w-8 h-8 ${getColor(item.color).text}`} />
                    </div>
                    <h3 className="font-bold text-charcoal text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-charcoal/55 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 bg-sand/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <span className="text-terracotta text-[10px] font-bold tracking-[0.3em] uppercase mb-1 block">Explorer</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal">Nos Catégories</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[cat.slug] || Store;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i, duration: 0.4 }}
                >
                  <Card
                    className="group cursor-pointer border-0 bg-white hover:shadow-lg hover:shadow-terracotta/5 hover:-translate-y-1 transition-all duration-500 rounded-2xl overflow-hidden h-full"
                    onClick={() => {
                      useAppStore.getState().setFilters({ category: cat.slug });
                      setView('catalog');
                    }}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-terracotta/8 flex items-center justify-center group-hover:bg-terracotta/15 group-hover:scale-110 transition-all duration-500">
                        <Icon className="w-7 h-7 text-terracotta" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal group-hover:text-terracotta transition-colors">{cat.name}</h3>
                        <p className="text-xs text-charcoal/45 mt-0.5">{cat._count?.products || 0} produits</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <span className="text-terracotta text-[10px] font-bold tracking-[0.3em] uppercase mb-1 block">Sélection</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-charcoal">Produits Vedettes</h2>
            </div>
            <Button variant="ghost" className="text-terracotta hover:text-terracotta-dark hover:bg-terracotta/5 rounded-xl" onClick={() => setView('catalog')}>
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIAL / STORY SECTION ===== */}
      <section id="story-section" className="py-20 bg-sand/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <ZelligePattern className="w-full h-full text-charcoal" id="zellige-story" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-16 bg-gold/40" />
              <DarnaLogo className="w-10 h-10 opacity-40" />
              <div className="h-px w-16 bg-gold/40" />
            </div>

            <blockquote className="text-xl md:text-2xl lg:text-3xl text-charcoal/80 font-serif leading-relaxed italic mb-8">
              &laquo; L&apos;artisanat n&apos;est pas qu&apos;un métier \u2014 c&apos;est un héritage vivant qui relie nos mains à celles de nos ancêtres. Chez Darna, chaque tresse, chaque point de couture, chaque coup de ciseau porte en lui la mémoire de notre terre. &raquo;
            </blockquote>

            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-0.5 bg-terracotta/30 rounded-full" />
              <p className="text-sm text-charcoal/50 font-medium">
                Amira B. &mdash; Fondatrice, Darna for commerce
              </p>
              <div className="w-12 h-0.5 bg-terracotta/30 rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== LOYALTY CTA ===== */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 bg-gradient-to-r from-terracotta via-terracotta to-terracotta-dark overflow-hidden rounded-3xl relative">
              <div className="absolute inset-0 opacity-10">
                <ZelligePattern className="w-full h-full text-cream" id="zellige-cta" />
              </div>
              <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-gold" />
                    </div>
                    <Badge className="bg-cream/20 text-cream border-none rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase">Programme Fidélité</Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-cream mb-3">
                    Gagnez des points, recevez des récompenses
                  </h2>
                  <p className="text-cream/80 mb-6 max-w-md leading-relaxed">
                    Notre programme de fidélité célèbre votre engagement envers l&apos;artisanat local. Cumulez des points à chaque commande et débloquez des privilèges réservés aux membres de notre communauté.
                  </p>
                  <Button
                    size="lg"
                    className="bg-cream text-terracotta hover:bg-cream/90 shadow-lg rounded-xl font-semibold transition-all duration-300"
                    onClick={() => setView('profile')}
                  >
                    Découvrir les récompenses
                    <Award className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="flex gap-4 flex-wrap justify-center">
                  {[
                    { icon: Sparkles, label: 'Avantages', desc: 'Dès votre inscription' },
                    { icon: Flame, label: 'Distinctions', desc: 'Badges de savoir-faire' },
                    { icon: Trophy, label: 'Privilèges', desc: 'Accès VIP & Offres' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-5 bg-cream/10 rounded-2xl backdrop-blur-sm min-w-[120px]">
                      <item.icon className="w-8 h-8 text-gold mx-auto mb-2" />
                      <p className="text-sm font-semibold text-cream">{item.label}</p>
                      <p className="text-xs text-cream/70 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// =============================================
// CATALOG VIEW
// =============================================
function CatalogView() {
  const { filters, setFilters, resetFilters } = useAppStore();
  const { currency } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api('/api/categories').then(r => r.json()).then(setCategories).catch((err) => {
      toast.error('Erreur de chargement', { description: 'Veuillez réessayer' });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
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
        const res = await api(`/api/products?${params}`);
        const data = await res.json();
        if (!cancelled) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filters, page]);

  const activeFilterCount = [
    filters.search,
    filters.category !== 'all' ? filters.category : '',
    filters.minPrice > 0 ? 'price' : '',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-charcoal/50 mb-6">
          <button onClick={() => useAppStore.getState().setView('home')} className="hover:text-terracotta transition-colors">
            Accueil
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-charcoal font-medium">Boutique</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="mb-2">
            <h1 className="text-3xl font-serif font-bold text-charcoal">La Boutique</h1>
            <p className="text-charcoal/50 mt-1 font-medium">{total} produits trouvés</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-9 bg-white border-terracotta/10 focus:border-terracotta/30 rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              className="relative border-terracotta/15 hover:border-terracotta/30 hover:bg-terracotta/5 rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-terracotta text-cream text-[10px] rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Select value={filters.sortBy} onValueChange={(v) => setFilters({ sortBy: v as typeof filters.sortBy })}>
              <SelectTrigger className="w-40 border-terracotta/15 rounded-xl">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="popular">Plus populaires</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button 
              variant="outline" 
              className="w-full border-terracotta/10 bg-white rounded-xl py-6"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2 text-terracotta" />
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-terracotta text-white rounded-full">{activeFilterCount}</Badge>
              )}
            </Button>
          </div>

          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="lg:w-64 flex-shrink-0 overflow-hidden lg:sticky lg:top-24 z-20"
              >
                <Card className="border-0 shadow-sm sticky top-24 bg-white rounded-2xl">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-charcoal">Filtres</h3>
                      <Button variant="ghost" size="sm" className="text-terracotta hover:text-terracotta-dark hover:bg-terracotta/5 rounded-lg" onClick={resetFilters}>
                        <X className="w-3 h-3 mr-1" /> Effacer
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-charcoal">Catégorie</Label>
                      <div className="space-y-1.5">
                        <button
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                            filters.category === 'all' ? 'bg-terracotta/10 text-terracotta font-medium' : 'text-charcoal/60 hover:bg-sand'
                          }`}
                          onClick={() => setFilters({ category: 'all' })}
                        >
                          Toutes les catégories
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-all ${
                              filters.category === cat.slug ? 'bg-terracotta/10 text-terracotta font-medium' : 'text-charcoal/60 hover:bg-sand'
                            }`}
                            onClick={() => setFilters({ category: cat.slug })}
                          >
                            {cat.name}
                            <span className="text-xs text-charcoal/40">{cat._count?.products || 0}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-charcoal">Budget</Label>
                      <Slider
                        min={0}
                        max={50000}
                        step={500}
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={([min, max]) => setFilters({ minPrice: min, maxPrice: max })}
                      />
                      <div className="flex items-center justify-between text-sm text-charcoal/50">
                        <span>{formatPrice(filters.minPrice, currency)}</span>
                        <span>{formatPrice(filters.maxPrice, currency)}</span>
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
                    <Skeleton className="aspect-square rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-sand flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-charcoal/20" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-1">Aucun produit trouvé</h3>
                <p className="text-charcoal/50 mb-4">Essayez d&apos;ajuster vos filtres ou votre recherche</p>
                <Button variant="outline" className="border-terracotta/20 text-terracotta hover:bg-terracotta/5 rounded-xl" onClick={resetFilters}>
                  Effacer les filtres
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
                {total > 12 && (
                  <div className="flex justify-center mt-10 gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-terracotta/15 hover:bg-terracotta/5 rounded-xl">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 text-sm text-charcoal/60">Page {page} sur {Math.ceil(total / 12)}</span>
                    <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(page + 1)} className="border-terracotta/15 hover:bg-terracotta/5 rounded-xl">
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

// =============================================
// PRODUCT DETAIL VIEW
// =============================================
function ProductDetailView() {
  const { selectedProductId, goBack } = useAppStore();
  const { addItem, openCart } = useCartStore();
  const { currency } = useAppStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('3d');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [engraving, setEngraving] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!selectedProductId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [prodRes, recRes] = await Promise.all([
          api(`/api/products/${selectedProductId}`).then(r => r.json()),
          api(`/api/smart/recommendations?productId=${selectedProductId}`).then(r => r.json()),
        ]);
        if (!cancelled) {
          setProduct(prodRes.product);
          setRecommendations(recRes.recommendations || []);
          if (prodRes.product) {
            const colors = safeJSONParse(prodRes.product.colors || '[]', []);
            const materials = safeJSONParse(prodRes.product.materials || '[]', []);
            if (colors.length > 0) setSelectedColor(colors[0]);
            if (materials.length > 0) setSelectedMaterial(materials[0]);
          }
        }
      } catch {
        // error handled silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    load();
    return () => { cancelled = true; };
  }, [selectedProductId]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-cream">
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
      <div className="pt-20 min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-2">Produit introuvable</h2>
          <Button onClick={goBack} className="bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl">Retour</Button>
        </div>
      </div>
    );
  }

  const images = safeJSONParse(product.images || '[]', []) as string[];
  const colors = safeJSONParse(product.colors || '[]', []) as string[];
  const materials = safeJSONParse(product.materials || '[]', []) as string[];
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const productType = product.slug.split('-')[0] === 'aura' ? 'headphones'
    : product.slug.includes('chair') ? 'chair'
    : product.slug.includes('watch') ? 'watch'
    : product.slug.includes('lamp') || product.slug.includes('lantern') ? 'lamp'
    : product.slug.includes('backpack') || product.slug.includes('basket') ? 'backpack'
    : product.slug.includes('speaker') || product.slug.includes('echo') ? 'speaker'
    : product.slug.includes('vase') || product.slug.includes('bokhour') ? 'vase'
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
    toast.success('Ajouté au panier !', {
      description: `${quantity}x ${product.name}`,
    });
  };

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-charcoal/50 mb-8">
          <button onClick={() => useAppStore.getState().setView('home')} className="hover:text-terracotta transition-colors">
            Accueil
          </button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={goBack} className="hover:text-terracotta transition-colors">
            Boutique
          </button>
          <ChevronRight className="w-3 h-3" />
          {product.category && (
            <>
              <span className="hover:text-terracotta cursor-pointer transition-colors">{product.category.name}</span>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-charcoal font-medium truncate max-w-48">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: 3D Viewer / Image */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-sand rounded-xl">
                <TabsTrigger value="3d" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-terracotta data-[state=active]:shadow-sm">
                  <BoxSelect className="w-4 h-4 mr-1.5" /> Vue 3D
                </TabsTrigger>
                <TabsTrigger value="photo" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-terracotta data-[state=active]:shadow-sm">
                  <Eye className="w-4 h-4 mr-1.5" /> Photos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="3d">
                <div className="relative rounded-2xl overflow-hidden">
                  <ErrorBoundary
                    fallback={
                      <ProductViewerFallback productType={productType} color={selectedColor} material={selectedMaterial} engraving={engraving} />
                    }
                  >
                    <ProductViewer3D
                      productName={product.name}
                      productType={productType}
                      color={selectedColor}
                      material={selectedMaterial}
                      engraving={engraving}
                      className="h-[400px] md:h-[500px] w-full"
                    />
                  </ErrorBoundary>
                </div>
              </TabsContent>

              <TabsContent value="photo">
                <div className="aspect-square rounded-2xl bg-sand overflow-hidden">
                  {images[0] ? (
                    <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal/30">
                      Aucune image disponible
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3 mt-3">
                    {images.map((img, i) => (
                      <div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-sand cursor-pointer ring-2 ring-terracotta/20 hover:ring-terracotta transition-all">
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
                <Badge variant="secondary" className="mb-3 bg-terracotta/10 text-terracotta border-terracotta/20 rounded-full">
                  {product.category.name}
                </Badge>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-3">{product.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-gold text-gold' : 'text-charcoal/15'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-charcoal">{product.rating}</span>
                <span className="text-sm text-charcoal/50">({product.reviewCount} avis)</span>
                {product.isNew && (
                  <Badge className="bg-olive/10 text-olive border-olive/20 rounded-full">Nouveau</Badge>
                )}
                {product.stock <= 10 && product.stock > 0 && (
                  <Badge variant="destructive" className="text-[10px] rounded-full">
                    Plus que {product.stock} en stock
                  </Badge>
                )}
              </div>
            </div>

            <Separator className="bg-terracotta/10" />

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-charcoal">{formatPrice(product.price, currency)}</span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-charcoal/40 line-through">{formatPrice(product.comparePrice, currency)}</span>
                  <Badge className="bg-terracotta/10 text-terracotta border-terracotta/20 rounded-full">-{discount}%</Badge>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-charcoal/60 leading-relaxed">
              {product.shortDesc || product.description.slice(0, 160) + '...'}
            </p>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-charcoal">Couleur</Label>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color ? 'border-terracotta ring-2 ring-terracotta/20' : 'border-charcoal/15'
                      }`}
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
                <Label className="text-sm font-medium text-charcoal">Matériau</Label>
                <div className="flex flex-wrap gap-2">
                  {materials.map((mat) => (
                    <button
                      key={mat}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedMaterial === mat
                          ? 'bg-terracotta text-cream shadow-md'
                          : 'bg-sand text-charcoal/70 hover:bg-terracotta/10 hover:text-terracotta'
                      }`}
                      onClick={() => setSelectedMaterial(mat)}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Engraving */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-charcoal">Gravure personnalisée (optionnel)</Label>
              <Input
                placeholder="Entrez votre texte..."
                value={engraving}
                onChange={(e) => setEngraving(e.target.value.slice(0, 30))}
                maxLength={30}
                className="bg-white border-terracotta/10 focus:border-terracotta/30 rounded-xl"
              />
              {engraving && (
                <p className="text-xs text-charcoal/40">{engraving.length}/30 caractères</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-charcoal">Quantité</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-terracotta/15 hover:bg-terracotta/5" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span className="w-12 text-center font-semibold text-lg text-charcoal">{quantity}</span>
                <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-terracotta/15 hover:bg-terracotta/5" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1 h-14 bg-gradient-to-r from-terracotta to-terracotta-dark hover:from-terracotta-dark hover:to-terracotta text-cream font-semibold shadow-lg shadow-terracotta/20 text-base rounded-xl transition-all duration-300"
                onClick={addToCart}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.stock === 0 ? 'Rupture de stock' : `Ajouter au panier \u2014 ${formatPrice(product.price * quantity, currency)}`}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-14 rounded-xl border-terracotta/15 hover:bg-terracotta/5 hover:text-terracotta"
                onClick={() => { setIsWishlisted(!isWishlisted); toast.info(isWishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris !'); }}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-terracotta text-terracotta' : ''}`} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-14 rounded-xl border-terracotta/15 hover:bg-terracotta/5 hover:text-terracotta"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.info('Lien copié !');
                }}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Livraison 58 Wilayas', desc: 'Partout en Algérie' },
                { icon: RotateCcw, label: 'Retour 14 jours', desc: 'Échange facile' },
                { icon: Shield, label: 'Paiement sécurisé', desc: 'Protection totale' },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-sand/70">
                  <f.icon className="w-5 h-5 text-terracotta mb-1.5" />
                  <p className="text-xs font-medium text-charcoal">{f.label}</p>
                  <p className="text-[10px] text-charcoal/40">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Specs */}
            <Separator className="bg-terracotta/10" />
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-charcoal">Caractéristiques</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.dimensions && (
                  <div className="flex justify-between p-3 bg-sand/70 rounded-xl">
                    <span className="text-charcoal/50">Dimensions</span>
                    <span className="font-medium text-charcoal">{product.dimensions}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between p-3 bg-sand/70 rounded-xl">
                    <span className="text-charcoal/50">Poids</span>
                    <span className="font-medium text-charcoal">{product.weight} kg</span>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-sand/70 rounded-xl">
                  <span className="text-charcoal/50">En stock</span>
                  <span className={`font-medium ${product.stock > 10 ? 'text-olive' : product.stock > 0 ? 'text-gold' : 'text-terracotta'}`}>
                    {product.stock > 0 ? `${product.stock} unités` : 'Rupture'}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-sand/70 rounded-xl">
                  <span className="text-charcoal/50">Note</span>
                  <span className="font-medium text-charcoal">{product.rating}/5</span>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <Separator className="bg-terracotta/10" />
            <div>
              <h3 className="font-semibold text-sm text-charcoal mb-2">Description</h3>
              <p className="text-sm text-charcoal/60 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-charcoal mb-6">Vous aimerez aussi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// =============================================
// CHECKOUT VIEW
// =============================================
function CheckoutView() {
  const { items, getTotal, clearCart } = useCartStore();
  const { setView, currency, auth } = useAppStore();
  const user = auth.user;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', address: '', wilaya: '', commune: '',
    paymentMethod: 'cod', note: '',
  });

  const subtotal = getTotal();
  const shipping = subtotal > 5000 ? 0 : 500;
  const total = subtotal + shipping;
  const pointsEarned = Math.floor(total / 10);

  const placeOrder = async () => {
    try {
      const res = await api('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo',
          total,
          subtotal,
          tax: 0,
          shipping,
          address: `${form.address}, ${form.commune}`,
          city: form.wilaya,
          country: 'Algérie',
          zipCode: form.wilaya.split(' ')[0],
          paymentMethod: form.paymentMethod,
          note: form.note,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            material: item.material,
            engraving: item.engraving,
          })),
        }),
      });
      if (res.ok) {
        clearCart();
        toast.success('Commande confirmée !', { description: `+${pointsEarned} points fidélité` });
        setView('orders');
      }
    } catch {
      toast.error('Erreur lors de la commande');
    }
  };

  const steps = [
    { num: 1, label: 'Livraison', icon: MapPin },
    { num: 2, label: 'Paiement', icon: CreditCard },
    { num: 3, label: 'Vérification', icon: CheckCircle2 },
  ];

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">Finaliser la commande</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-10">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  step >= s.num ? 'bg-terracotta text-cream shadow-md' : 'bg-sand text-charcoal/40'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? 'text-charcoal' : 'text-charcoal/40'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-colors duration-500 ${step > s.num ? 'bg-terracotta' : 'bg-charcoal/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Card className="border-0 shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-6 space-y-5">
                      <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-terracotta" />
                        Adresse de livraison
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-charcoal/70">Nom complet *</Label>
                          <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Mohamed Benali" className="bg-sand/50 border-terracotta/10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-charcoal/70">Téléphone *</Label>
                          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0555 123 456" className="bg-sand/50 border-terracotta/10 rounded-xl" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-sm text-charcoal/70">Email</Label>
                          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.dz" className="bg-sand/50 border-terracotta/10 rounded-xl" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-sm text-charcoal/70">Adresse *</Label>
                          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rue, numéro, quartier..." className="bg-sand/50 border-terracotta/10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-charcoal/70">Wilaya *</Label>
                          <Select value={form.wilaya} onValueChange={(v) => setForm({ ...form, wilaya: v })}>
                            <SelectTrigger className="bg-sand/50 border-terracotta/10 rounded-xl">
                              <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-64 overflow-y-auto">
                              {WILAYAS.map((w) => (
                                <SelectItem key={w} value={w}>{w}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-charcoal/70">Commune</Label>
                          <Input value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} placeholder="Commune..." className="bg-sand/50 border-terracotta/10 rounded-xl" />
                        </div>
                      </div>
                      <Button
                        className="w-full h-12 bg-terracotta hover:bg-terracotta-dark text-cream font-semibold rounded-xl mt-4"
                        onClick={() => {
                          if (form.fullName && form.phone && form.address && form.wilaya) {
                            setStep(2);
                          } else {
                            toast.error('Veuillez remplir tous les champs obligatoires');
                          }
                        }}
                      >
                        Continuer vers le paiement
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Card className="border-0 shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-6 space-y-5">
                      <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-terracotta" />
                        Mode de paiement
                      </h2>
                      <div className="space-y-3">
                        {[
                          { value: 'cod', label: 'Paiement à la livraison', desc: 'Payez en cash à la réception', icon: Banknote },
                          { value: 'credit_card', label: 'Carte bancaire (EDAHABIA / CIB)', desc: 'Paiement sécurisé en ligne', icon: CreditCard },
                          { value: 'transfer', label: 'Virement bancaire', desc: ' CCP ou virement', icon: Wallet },
                        ].map((p) => (
                          <button
                            key={p.value}
                            onClick={() => setForm({ ...form, paymentMethod: p.value })}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                              form.paymentMethod === p.value
                                ? 'border-terracotta bg-terracotta/5'
                                : 'border-terracotta/10 hover:border-terracotta/25 bg-white'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              form.paymentMethod === p.value ? 'bg-terracotta text-cream' : 'bg-sand text-charcoal/60'
                            }`}>
                              <p.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-charcoal text-sm">{p.label}</p>
                              <p className="text-xs text-charcoal/50">{p.desc}</p>
                            </div>
                            {form.paymentMethod === p.value && (
                              <CheckCircle2 className="w-5 h-5 text-terracotta ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1 h-12 border-terracotta/15 hover:bg-terracotta/5 rounded-xl" onClick={() => setStep(1)}>
                          <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                        </Button>
                        <Button className="flex-1 h-12 bg-terracotta hover:bg-terracotta-dark text-cream font-semibold rounded-xl" onClick={() => setStep(3)}>
                          Vérifier la commande
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Card className="border-0 shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-6 space-y-5">
                      <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-olive" />
                        Vérification
                      </h2>
                      <div className="space-y-4">
                        <div className="p-4 bg-sand/70 rounded-xl space-y-1">
                          <p className="text-xs text-charcoal/40 uppercase tracking-wider">Livraison</p>
                          <p className="text-sm font-medium text-charcoal">{form.fullName}</p>
                          <p className="text-sm text-charcoal/60">{form.address}, {form.commune}</p>
                          <p className="text-sm text-charcoal/60">{form.wilaya} \u2014 {form.phone}</p>
                        </div>
                        <div className="p-4 bg-sand/70 rounded-xl space-y-1">
                          <p className="text-xs text-charcoal/40 uppercase tracking-wider">Paiement</p>
                          <p className="text-sm font-medium text-charcoal">
                            {form.paymentMethod === 'cod' ? 'Paiement à la livraison' : form.paymentMethod === 'credit_card' ? 'Carte bancaire' : 'Virement bancaire'}
                          </p>
                        </div>
                        <div className="p-4 bg-sand/70 rounded-xl space-y-1">
                          <p className="text-xs text-charcoal/40 uppercase tracking-wider">Articles ({items.length})</p>
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-charcoal/70">{item.quantity}x {item.name}</span>
                              <span className="font-medium text-charcoal">{formatPrice(item.price * item.quantity, currency)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button variant="outline" className="flex-1 h-12 border-terracotta/15 hover:bg-terracotta/5 rounded-xl" onClick={() => setStep(2)}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                          </Button>
                          <Button
                            className="flex-1 h-12 bg-gradient-to-r from-terracotta to-terracotta-dark hover:from-terracotta-dark hover:to-terracotta text-cream font-semibold rounded-xl shadow-lg shadow-terracotta/20"
                            onClick={placeOrder}
                          >
                            Confirmer la commande
                            <CheckCircle2 className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm bg-white rounded-2xl sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-charcoal">Résumé</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-charcoal/60">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal/60">
                    <span>Livraison</span>
                    <span className={shipping === 0 ? 'text-olive font-medium' : ''}>
                      {shipping === 0 ? 'Gratuite' : formatPrice(shipping, currency)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-charcoal/40">Livraison gratuite dès {formatPrice(5000, currency)}</p>
                  )}
                  <Separator className="bg-terracotta/10" />
                  <div className="flex justify-between text-lg font-bold text-charcoal">
                    <span>Total</span>
                    <span>{formatPrice(total, currency)}</span>
                  </div>
                </div>

                {/* Points earned */}
                <div className="flex items-center gap-2 p-3 bg-gold/10 rounded-xl mt-2">
                  <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="text-sm font-medium text-charcoal/70">
                    +{pointsEarned} points fidélité avec cette commande !
                  </span>
                </div>

                {shipping > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-terracotta/5 rounded-xl">
                    <Truck className="w-4 h-4 text-terracotta flex-shrink-0" />
                    <span className="text-xs text-charcoal/50">
                      Ajoutez {formatPrice(5000 - subtotal, currency)} pour la livraison gratuite
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// PROFILE / REWARDS VIEW
// =============================================
function ProfileView() {
  const { setView, auth, isAuthenticated: isAuthenticatedFn } = useAppStore();
  const isLoggedIn = isAuthenticatedFn();
  const user = auth.user;
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '';

  const badges = [
    { name: 'Premier Achat', icon: Gift, desc: 'Première commande', earned: true, color: 'terracotta' },
    { name: 'Client Fidèle', icon: Heart, desc: '5 commandes passées', earned: true, color: 'gold' },
    { name: 'Artisan Lover', icon: HandMetal, desc: '10 articles achetés', earned: true, color: 'olive' },
    { name: 'Ambassadeur', icon: Crown, desc: 'Parrainer 3 amis', earned: false, color: 'terracotta' },
    { name: 'Collectionneur', icon: Gem, desc: 'Un article de chaque catégorie', earned: false, color: 'gold' },
    { name: 'Darna Elite', icon: Trophy, desc: 'Atteindre le niveau 5', earned: false, color: 'terracotta-dark' },
  ];

  const leaderboard = [
    { name: 'Karim M.', points: 5200, avatar: 'KM' },
    { name: 'Fatima Z.', points: 4100, avatar: 'FZ' },
    { name: 'Yacine B.', points: 3800, avatar: 'YB' },
    { name: 'Amira B.', points: 2450, avatar: 'AB', isUser: true },
    { name: 'Sofiane H.', points: 1900, avatar: 'SH' },
  ];

  const pointsToNextLevel = (user?.level || 1) * 1000 + 1000;
  const progressPercent = Math.min(100, ((user?.points || 0) / pointsToNextLevel) * 100);

  if (!isLoggedIn || !user) {
    return (
      <div className="pt-20 min-h-screen bg-cream flex items-center justify-center">
        <Card className="max-w-md mx-4 border-0 shadow-xl rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-terracotta/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-terracotta" />
            </div>
            <h2 className="text-xl font-bold text-charcoal mb-2">Connexion requise</h2>
            <p className="text-charcoal/50 text-sm mb-4">Connectez-vous pour accéder à votre espace fidélité.</p>
            <Button className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl" onClick={() => setView('home')}>
              Retour à l&apos;accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">Mon Espace Fidélité</h1>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-r from-terracotta to-terracotta-dark rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8 text-cream relative">
              <div className="absolute inset-0 opacity-5">
                <ZelligePattern className="w-full h-full text-cream" id="zellige-profile" />
              </div>
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-cream/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                  {initials}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-cream/70 text-sm">{user.email}</p>
                  {memberSince && <p className="text-cream/50 text-xs mt-1">Membre depuis {memberSince}</p>}
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold">{(user.points || 0).toLocaleString('fr-DZ')}</p>
                    <p className="text-xs text-cream/60">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Niv. {user.level || 1}</p>
                    <p className="text-xs text-cream/60">Niveau</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Points Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-charcoal">Progrès vers le Niveau {(user.level || 1) + 1}</h3>
                <span className="text-sm text-charcoal/50">{(user.points || 0).toLocaleString('fr-DZ')} / {pointsToNextLevel.toLocaleString('fr-DZ')} pts</span>
              </div>
              <div className="h-3 bg-sand rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-terracotta to-gold rounded-full"
                />
              </div>
              <p className="text-xs text-charcoal/40 mt-2">Encore {Math.max(0, pointsToNextLevel - (user.points || 0)).toLocaleString('fr-DZ')} points pour le prochain niveau</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h3 className="font-semibold text-charcoal mb-4">Mes Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
              >
                <Card className={`border-0 shadow-sm rounded-2xl text-center ${badge.earned ? 'bg-white' : 'bg-charcoal/5 opacity-60'}`}>
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                      badge.earned ? getColor(badge.color).bg : 'bg-charcoal/10'
                    }`}>
                      <badge.icon className={`w-6 h-6 ${badge.earned ? getColor(badge.color).text : 'text-charcoal/30'}`} />
                    </div>
                    <p className="text-xs font-semibold text-charcoal">{badge.name}</p>
                    <p className="text-[10px] text-charcoal/40 mt-0.5">{badge.desc}</p>
                    {badge.earned && (
                      <Badge className="mt-2 bg-olive/10 text-olive border-olive/20 text-[9px] rounded-full px-2">Débloqué</Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" />
                Classement Fidélité
              </h3>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div
                    key={entry.name}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                      entry.isUser ? 'bg-terracotta/10 border border-terracotta/15' : 'hover:bg-sand/70'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-gold/20 text-gold' : i === 1 ? 'bg-charcoal/10 text-charcoal/60' : i === 2 ? 'bg-terracotta/10 text-terracotta' : 'bg-sand text-charcoal/40'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center text-xs font-semibold text-terracotta">
                      {entry.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">{entry.name} {entry.isUser && <span className="text-terracotta">(vous)</span>}</p>
                    </div>
                    <span className="text-sm font-semibold text-charcoal">{entry.points.toLocaleString('fr-DZ')} pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Button
            className="bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl"
            onClick={() => setView('catalog')}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continuer mes achats
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// =============================================
// ORDERS VIEW
// =============================================
function OrdersView() {
  const { setView, currency } = useAppStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/orders')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch((err) => {
        setLoading(false);
        toast.error('Erreur de chargement', { description: 'Veuillez réessayer' });
      });
  }, []);

  const statusColors: Record<string, string> = {
    pending: 'bg-gold/15 text-gold',
    confirmed: 'bg-olive/15 text-olive',
    shipped: 'bg-terracotta/15 text-terracotta',
    delivered: 'bg-olive/15 text-olive',
    cancelled: 'bg-charcoal/10 text-charcoal/50',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-charcoal/50 mb-6">
          <button onClick={() => setView('home')} className="hover:text-terracotta transition-colors">Accueil</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-charcoal font-medium">Mes Commandes</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">Mes Commandes</h1>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-sand flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-charcoal/20" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal mb-2">Aucune commande</h3>
            <p className="text-charcoal/50 mb-6">Vous n&apos;avez pas encore passé de commande.</p>
            <Button className="bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl" onClick={() => setView('catalog')}>
              Découvrir la boutique
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Card className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center">
                          <Package className="w-5 h-5 text-terracotta" />
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal text-sm">Commande #{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-charcoal/40 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${statusColors[order.status] || 'bg-charcoal/10 text-charcoal/50'} rounded-full text-xs`}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                        <span className="font-semibold text-charcoal">{formatPrice(order.total, currency)}</span>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-terracotta/5">
                        <p className="text-xs text-charcoal/40">
                          {order.items.length} article(s) {order.items[0]?.product?.name ? `\u2014 ${order.items[0].product.name}` : ''}
                          {order.items.length > 1 ? ` +${order.items.length - 1} autre(s)` : ''}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// MAIN PAGE COMPONENT
// =============================================
export default function Page() {
  const { view } = useAppStore();

  const renderView = () => {
    switch (view) {
      case 'catalog':
        return <CatalogView />;
      case 'product':
        return <ProductDetailView />;
      case 'checkout':
        return <CheckoutView />;
      case 'profile':
        return <ProfileView />;
      case 'orders':
        return <OrdersView />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomeView />;
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-cream relative">
      <ScrollProgress />
      <FloatingParticles />
      <DarnaNavbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      <CartDrawer />
      <DarnaFooter />
    </main>
  );
}
