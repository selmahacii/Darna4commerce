'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Package, Users, ShoppingBag, TrendingUp, DollarSign,
  Eye, Edit3, Trash2, Plus, Search, ChevronLeft, X,
  Star, CheckCircle2, Clock, Truck, XCircle, RefreshCw,
  UserPlus, Settings, Tag, Layers, ArrowUpRight, ArrowDownRight,
  Filter, MoreHorizontal, AlertTriangle, Download, Ticket, Gift, Calendar, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { useAppStore } from '@/stores/app-store';
import { safeJSONParse } from '@/lib/format';

// =============================================
// API HELPER
// =============================================
const BACKEND_URL = 'http://localhost:3003';
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

// =============================================
// TYPES
// =============================================
interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  tags?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  images?: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  city: string;
  paymentMethod: string;
  user?: { id: string; name: string; email: string };
  items?: { id: string; quantity: number; price: number; product?: { name: string; images: string } }[];
}

interface StoreUser {
  id: string;
  email: string;
  name: string;
  role: string;
  points: number;
  level: number;
  isActive: boolean;
  createdAt: string;
  _count?: { orders: number; reviews: number };
}

interface AnalyticsSummary {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    lowStockProducts: number;
    pendingOrders: number;
    avgRating: number;
  };
  recentOrders: Order[];
  topProducts: { name: string; sales: number; revenue: number }[];
  salesByCategory: { name: string; sales: number }[];
  monthlySales: { month: string; orders: number; sales: number }[];
  monthlyRevenue?: { month: string; revenue: number }[];
  visitorStats: { totalVisitors: number; uniqueVisitors: number; events: number };
}

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderTotal: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  endDate?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType<any> }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
  shipped: { label: 'Expédié', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  delivered: { label: 'Livré', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const formatDA = (n: number) => (n || 0).toLocaleString('fr-DZ') + ' DA';
const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

// =============================================
// MAIN ADMIN DASHBOARD
// =============================================
export default function AdminDashboard() {
  const { auth } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics for overview
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api('/api/analytics/summary');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {
      // Analytics might fail, that's ok
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      let cancelled = false;
      (async () => {
        setLoading(true);
        await fetchAnalytics();
        if (!cancelled) setLoading(false);
      })();
      return () => { cancelled = true; };
    }
  }, [activeTab, fetchAnalytics]);

  // Unauthorized guard
  if (!auth.user || auth.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/30 pt-20">
        <Card className="max-w-md w-full mx-4 border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-charcoal mb-2">Accès Refusé</h2>
            <p className="text-charcoal/60 text-sm">
              Vous n'avez pas les permissions nécessaires pour accéder au tableau de bord administrateur.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/30 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-charcoal flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-terracotta" />
                </div>
                Tableau de Bord
              </h1>
              <p className="text-sm text-charcoal/50 mt-1 ml-[52px]">
                Bienvenue, {auth.user.name} — Gestion complète de la boutique
              </p>
            </div>
            <Badge className="bg-terracotta/10 text-terracotta border-terracotta/20 w-fit px-3 py-1">
              <Shield className="w-3 h-3 mr-1.5" />
              Administrateur
            </Badge>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-terracotta/10 rounded-xl p-1 h-auto flex-wrap gap-1">
            {[
              { value: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { value: 'products', label: 'Produits', icon: Package },
              { value: 'orders', label: 'Commandes', icon: ShoppingBag },
              { value: 'users', label: 'Clients', icon: Users },
              { value: 'categories', label: 'Catégories', icon: Tag },
              { value: 'coupons', label: 'Marketing', icon: Ticket },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center gap-1.5"
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === 'overview' && <OverviewTab analytics={analytics} loading={loading} />}
              {activeTab === 'products' && <ProductsTab />}
              {activeTab === 'orders' && <OrdersTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'coupons' && <CouponsTab />}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

// =============================================
// OVERVIEW TAB
// =============================================
function OverviewTab({ analytics, loading }: { analytics: AnalyticsSummary | null; loading: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api('/api/orders').then(r => r.json()).then(setOrders).catch(() => {});
  }, []);

  const kpis = [
    { label: 'Chiffre d\'affaires', value: analytics ? formatDA(analytics.summary.totalRevenue) : '—', icon: DollarSign, color: 'text-green-600 bg-green-50', change: '+12.5%' },
    { label: 'Commandes', value: analytics ? String(analytics.summary.totalOrders) : '—', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50', change: '+8.2%' },
    { label: 'Produits', value: analytics ? String(analytics.summary.totalProducts) : '—', icon: Package, color: 'text-purple-600 bg-purple-50', change: '+3' },
    { label: 'Clients', value: analytics ? String(analytics.summary.totalUsers) : '—', icon: Users, color: 'text-terracotta bg-terracotta/10', change: '+15.3%' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {kpi.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-charcoal">{loading ? <Skeleton className="h-8 w-24" /> : kpi.value}</div>
                <p className="text-xs text-charcoal/50 mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Tendance du Chiffre d'Affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.monthlyRevenue || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A66835" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#A66835" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#777' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#777' }} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                      formatter={(v) => [formatDA(Number(v)), 'Revenu']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#A66835" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Répartition par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full">
               {loading ? (
                 <Skeleton className="w-full h-full rounded-xl" />
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={analytics?.salesByCategory || []} layout="vertical" margin={{ left: 40 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#777' }} width={80} />
                     <Tooltip 
                       cursor={{ fill: 'rgba(166, 104, 53, 0.05)' }}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                     />
                     <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={20}>
                       {analytics?.salesByCategory.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={['#A66835', '#D4AF37', '#556B2F', '#722F37', '#2F4F4F'][index % 5]} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               )}
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <Card className="border-0 shadow-sm">
           <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Produits les plus vendus</CardTitle>
                <TrendingUp className="w-4 h-4 text-terracotta" />
              </div>
           </CardHeader>
           <CardContent>
              <div className="space-y-4">
                 {(analytics?.topProducts || []).slice(0, 5).map((prod, i) => (
                   <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-sand/20 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center font-bold text-terracotta text-sm">#{i+1}</div>
                         <div>
                            <p className="text-sm font-medium text-charcoal">{prod.name}</p>
                            <p className="text-[10px] text-charcoal/40 uppercase tracking-widest">{prod.sales} Ventes</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-bold text-charcoal">{formatDA(prod.revenue)}</p>
                         <p className="text-[10px] text-green-600 font-medium">+15% ce mois</p>
                      </div>
                   </div>
                 ))}
                 {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
                   <p className="text-center py-4 text-charcoal/30 text-sm">Pas encore de données de vente</p>
                 )}
              </div>
           </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-0 shadow-sm">
           <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Alertes de Stock</CardTitle>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
           </CardHeader>
           <CardContent>
              <div className="space-y-3">
                 {[
                   { name: 'Babouches Artisanales', stock: 3, id: '1' },
                   { name: 'Fibule Kabyle Argent', stock: 2, id: '2' },
                   { name: 'Chaise Touareg', stock: 5, id: '3' },
                 ].map((item) => (
                   <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div>
                         <p className="text-sm font-semibold text-amber-900">{item.name}</p>
                         <p className="text-xs text-amber-700">Stock critique : {item.stock} restants</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 rounded-lg bg-white border-amber-200 text-amber-900 hover:bg-amber-100">Réapprovisionner</Button>
                   </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="border-0 shadow-sm lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Commandes Récentes</CardTitle>
              <Badge variant="outline" className="text-xs">{orders.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {orders.length === 0 ? (
                <p className="text-sm text-charcoal/40 text-center py-8 col-span-2">Aucune commande pour le moment</p>
              ) : orders.slice(0, 12).map((order) => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-sand/30 hover:bg-white hover:shadow-sm border border-transparent hover:border-terracotta/10 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <User className="w-4.5 h-4.5 text-terracotta/40" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-charcoal truncate">
                          {order.user?.name || 'Client Inconnu'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] text-charcoal/40 uppercase tracking-wider">{order.city}</span>
                           <span className="w-1 h-1 rounded-full bg-charcoal/10" />
                           <p className="text-xs text-charcoal/40">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 ml-3">
                      <span className="text-sm font-bold text-charcoal">{formatDA(order.total)}</span>
                      <Badge className={`${statusCfg.color} text-[10px] px-2 py-0 border-0 font-medium`}>
                        <StatusIcon className="w-2.5 h-2.5 mr-1" />
                        {statusCfg.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =============================================
// PRODUCTS TAB
// =============================================
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(search ? { search } : {});
      const res = await api(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast.error('Erreur de chargement des produits');
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await loadProducts();
      if (cancelled) return;
      try {
        const res = await api('/api/categories');
        if (res.ok && !cancelled) setCategories(await res.json());
      } catch { /* ignore */ }
    };
    init();
    return () => { cancelled = true; };
  }, [loadProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      const res = await api(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Produit supprimé');
        loadProducts();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur serveur');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-white border-terracotta/10"
          />
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl">
          <Plus className="w-4 h-4 mr-1.5" />
          Ajouter un produit
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm"><CardContent className="p-4"><Skeleton className="h-32 w-full rounded-lg mb-3" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2 mt-2" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const images = safeJSONParse(product.images || '[]', []);
            return (
              <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-4">
                  <div className="aspect-square rounded-xl bg-sand/60 mb-3 overflow-hidden relative">
                    {images[0] ? (
                      <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal/20">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-sm" onClick={() => setEditProduct(product)}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg shadow-sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1">
                      {product.isNew && <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0">Nouveau</Badge>}
                      {product.isFeatured && <Badge className="bg-gold text-white text-[10px] px-1.5 py-0">Vedette</Badge>}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-charcoal truncate">{product.name}</h3>
                      <p className="text-xs text-charcoal/40 mt-0.5">{product.category?.name}</p>
                    </div>
                    <p className="text-sm font-bold text-terracotta whitespace-nowrap">{formatDA(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-charcoal/50">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {product.rating.toFixed(1)}</span>
                    <span>Stock: {product.stock}</span>
                    <span>{product.reviewCount} avis</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Product Dialog */}
      <ProductFormDialog
        product={editProduct}
        categories={categories}
        open={showCreate || !!editProduct}
        onClose={() => { setShowCreate(false); setEditProduct(null); }}
        onSave={() => { setShowCreate(false); setEditProduct(null); loadProducts(); }}
      />
    </div>
  );
}

// =============================================
// PRODUCT FORM DIALOG
// =============================================
function ProductFormDialog({ product, categories, open, onClose, onSave }: {
  product: Product | null;
  categories: Category[];
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!product;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      slug: fd.get('name') ? String(fd.get('name')).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '',
      description: fd.get('description') || '',
      shortDesc: fd.get('shortDesc') || '',
      price: parseFloat(String(fd.get('price'))),
      comparePrice: fd.get('comparePrice') ? parseFloat(String(fd.get('comparePrice'))) : null,
      categoryId: fd.get('categoryId'),
      stock: parseInt(String(fd.get('stock'))),
      isFeatured: fd.has('isFeatured'),
      isNew: fd.has('isNew'),
      tags: fd.get('tags') ? JSON.stringify(String(fd.get('tags')).split(',').map(t => t.trim())) : '[]',
    };

    try {
      const res = isEdit
        ? await api(`/api/products/${product.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : await api('/api/products', { method: 'POST', body: JSON.stringify(body) });

      if (res.ok) {
        toast.success(isEdit ? 'Produit mis à jour' : 'Produit créé');
        onSave();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      toast.error('Erreur serveur');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Modifiez les informations du produit' : 'Remplissez les informations pour créer un nouveau produit'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nom du produit *</Label>
            <Input name="name" defaultValue={product?.name || ''} required placeholder="Ex: Babouche artisanale" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Description courte</Label>
            <Input name="shortDesc" defaultValue={product?.shortDesc || ''} placeholder="Description en une ligne" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea name="description" defaultValue={product?.description || ''} rows={3} placeholder="Description détaillée du produit" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prix (DA) *</Label>
              <Input name="price" type="number" step="0.01" defaultValue={product?.price || ''} required placeholder="0" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Prix barré (DA)</Label>
              <Input name="comparePrice" type="number" step="0.01" defaultValue={product?.comparePrice || ''} placeholder="Optionnel" className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stock *</Label>
              <Input name="stock" type="number" defaultValue={product?.stock || 0} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select name="categoryId" defaultValue={product?.categoryId || ''} required>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags (séparés par des virgules)</Label>
            <Input name="tags" defaultValue={product?.tags || ''} placeholder="artisanal, cuir, fait-main" className="rounded-xl" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured || false} className="rounded" />
              <span className="text-sm">Produit vedette</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isNew" defaultChecked={product?.isNew || false} className="rounded" />
              <span className="text-sm">Nouveau</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Annuler</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl">
              {saving ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// ORDERS TAB
// =============================================
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api('/api/orders');
        if (!cancelled) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await api(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('Statut mis à jour');
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch {
      toast.error('Erreur serveur');
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={filter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer rounded-lg px-3 py-1.5 hover:bg-terracotta/10"
          onClick={() => setFilter('all')}
        >
          Tous ({orders.length})
        </Badge>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <Badge
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            className="cursor-pointer rounded-lg px-3 py-1.5 hover:bg-sand"
            onClick={() => setFilter(key)}
          >
            {cfg.label} ({statusCounts[key] || 0})
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-charcoal/40">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Aucune commande trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-charcoal">{order.user?.name || 'Client'}</span>
                        <span className="text-xs text-charcoal/40">{order.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-charcoal/50">
                        <span>{formatDate(order.createdAt)}</span>
                        <span>{order.city}</span>
                        <span>{order.items?.length || 0} article(s)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-charcoal">{formatDA(order.total)}</span>
                      <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                        <SelectTrigger className={`w-[140px] h-8 text-xs rounded-lg border ${statusCfg.color.split(' ').find(c => c.startsWith('border-')) || 'border-gray-200'}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================
// USERS TAB
// =============================================
function UsersTab() {
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api('/api/users');
        if (!cancelled) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const toggleActive = async (userId: string, currentState: boolean) => {
    try {
      const res = await api(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentState }),
      });
      if (res.ok) {
        toast.success(currentState ? 'Utilisateur désactivé' : 'Utilisateur activé');
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentState } : u));
      }
    } catch {
      toast.error('Erreur serveur');
    }
  };

  const filteredUsers = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
        <Input placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl bg-white border-terracotta/10" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-terracotta/10 bg-sand/30">
                  <th className="text-left px-4 py-3 font-medium text-charcoal/60">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-charcoal/60">Rôle</th>
                  <th className="text-center px-4 py-3 font-medium text-charcoal/60">Points</th>
                  <th className="text-center px-4 py-3 font-medium text-charcoal/60">Commandes</th>
                  <th className="text-center px-4 py-3 font-medium text-charcoal/60">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-charcoal/60">Inscription</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-terracotta/5 hover:bg-sand/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-charcoal">{user.name}</p>
                        <p className="text-xs text-charcoal/40">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={user.role === 'admin' ? 'bg-terracotta/10 text-terracotta' : 'bg-sand text-charcoal/60'}>
                        {user.role === 'admin' ? 'Admin' : 'Client'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium text-charcoal">{user.points}</span>
                      <span className="text-xs text-charcoal/40 ml-1">Niv.{user.level}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{user._count?.orders || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-charcoal/50">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-7 text-xs rounded-lg ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          onClick={() => toggleActive(user.id, user.isActive)}
                        >
                          {user.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// =============================================
// CATEGORIES TAB
// =============================================
function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur de chargement');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await loadCategories();
    };
    if (!cancelled) init();
    return () => { cancelled = true; };
  }, [loadCategories]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      const res = await api(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Catégorie supprimée');
        loadCategories();
      } else toast.error('Erreur lors de la suppression');
    } catch { toast.error('Erreur serveur'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal/50">{categories.length} catégorie(s)</p>
        <Button onClick={() => setShowCreate(true)} className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl">
          <Plus className="w-4 h-4 mr-1.5" />
          Nouvelle catégorie
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="border-0 shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-terracotta" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-charcoal">{cat.name}</h3>
                      <p className="text-xs text-charcoal/40">{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditCat(cat)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {cat.description && <p className="text-xs text-charcoal/50 mt-2">{cat.description}</p>}
                <Badge className="mt-2 bg-sand text-charcoal/60 text-[10px]">{cat._count?.products || 0} produits</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Category Dialog */}
      <CategoryFormDialog
        category={editCat}
        open={showCreate || !!editCat}
        onClose={() => { setShowCreate(false); setEditCat(null); }}
        onSave={() => { setShowCreate(false); setEditCat(null); loadCategories(); }}
      />
    </div>
  );
}

function CategoryFormDialog({ category, open, onClose, onSave }: {
  category: Category | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      slug: fd.get('name') ? String(fd.get('name')).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '',
      description: fd.get('description') || '',
    };

    try {
      const res = category
        ? await api(`/api/categories/${category.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : await api('/api/categories', { method: 'POST', body: JSON.stringify(body) });

      if (res.ok) {
        toast.success(category ? 'Catégorie mise à jour' : 'Catégorie créée');
        onSave();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur');
      }
    } catch { toast.error('Erreur serveur'); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nom *</Label>
            <Input name="name" defaultValue={category?.name || ''} required placeholder="Ex: Cuir & Artisanat" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea name="description" defaultValue={category?.description || ''} rows={3} placeholder="Description de la catégorie" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Annuler</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl">
              {saving ? 'Sauvegarde...' : category ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// COUPONS TAB (MARKETING)
// =============================================
function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/api/coupons');
      if (res.ok) setCoupons(await res.json());
    } catch { toast.error('Erreur de chargement'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce coupon ?')) return;
    try {
      const res = await api(`/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Coupon supprimé');
        loadCoupons();
      }
    } catch { toast.error('Erreur serveur'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-charcoal">Coupons & Promotions</h3>
          <p className="text-sm text-charcoal/50">Gérez vos codes de réduction et offres spéciales</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl">
          <Plus className="w-4 h-4 mr-1.5" />
          Nouveau coupon
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : coupons.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="p-12 text-center text-charcoal/40"><Gift className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>Aucun coupon actif</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="border-0 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-terracotta" />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge className="bg-terracotta/10 text-terracotta text-lg font-mono mb-1">{coupon.code}</Badge>
                    <p className="text-xs text-charcoal/40">{coupon.description || 'Pas de description'}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(coupon.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-charcoal">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue} DA`}</p>
                    <p className="text-[10px] uppercase tracking-wider text-charcoal/40">Remise</p>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-charcoal">{coupon.usageCount}</p>
                    <p className="text-[10px] uppercase tracking-wider text-charcoal/40">Utilisations</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-sand">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal/50">Minimum d'achat</span>
                    <span className="font-medium text-charcoal">{formatDA(coupon.minOrderTotal)}</span>
                  </div>
                  {coupon.endDate && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-charcoal/50">Expire le</span>
                      <span className="font-medium text-charcoal">{formatDate(coupon.endDate)}</span>
                    </div>
                  )}
                  {coupon.usageLimit && (
                    <div className="mt-2">
                       <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-charcoal/40">Limite d'utilisation</span>
                          <span className="font-medium text-charcoal">{coupon.usageCount} / {coupon.usageLimit}</span>
                       </div>
                       <Progress value={(coupon.usageCount / coupon.usageLimit) * 100} className="h-1 bg-sand" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CouponFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={() => { setShowCreate(false); loadCoupons(); }}
      />
    </div>
  );
}

function CouponFormDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      code: fd.get('code'),
      discountType: fd.get('discountType'),
      discountValue: fd.get('discountValue'),
      description: fd.get('description'),
      minOrderTotal: fd.get('minOrderTotal'),
      usageLimit: fd.get('usageLimit'),
      endDate: fd.get('endDate'),
    };

    try {
      const res = await api('/api/coupons', { method: 'POST', body: JSON.stringify(body) });
      if (res.ok) {
        toast.success('Coupon créé avec succès');
        onSave();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de la création');
      }
    } catch { toast.error('Erreur serveur'); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Nouveau Coupon</DialogTitle>
          <DialogDescription>Créez un code de réduction pour vos clients</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Code du coupon *</Label>
            <Input name="code" placeholder="EX: HIVER2025" required className="rounded-xl font-mono uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de remise</Label>
              <Select name="discountType" defaultValue="percentage">
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                  <SelectItem value="fixed">Montant Fixe (DA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valeur *</Label>
              <Input name="discountValue" type="number" step="0.01" required placeholder="Ex: 20" className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input name="description" placeholder="Ex: 20% de remise sur tout le site" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum d'achat (DA)</Label>
              <Input name="minOrderTotal" type="number" defaultValue="0" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Limite d'utilisations</Label>
              <Input name="usageLimit" type="number" placeholder="Illimité" className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date d'expiration</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <Input name="endDate" type="date" className="pl-9 rounded-xl" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Annuler</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl">
              {saving ? 'Création...' : 'Créer le coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
