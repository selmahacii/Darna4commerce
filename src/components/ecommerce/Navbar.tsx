'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Menu, X, Shield, Home, LayoutGrid,
  Settings, BarChart3, Star, Globe, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart-store';
import { useAppStore } from '@/stores/app-store';

const CartDrawer = lazy(() => import('./CartDrawer'));

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleCart, getItemCount } = useCartStore();
  const { view, setView, isAdmin, setAdmin, filters, setFilters } = useAppStore();
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
    setView('catalog');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const navLinks = [
    { icon: Home, label: 'Home', view: 'home' as const },
    { icon: LayoutGrid, label: 'Shop', view: 'catalog' as const },
    { icon: Star, label: 'Rewards', view: 'profile' as const },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold tracking-tight hidden sm:block">
                <span className="text-amber-600">LUXE</span>
                <span className="text-gray-800 dark:text-gray-200">STORE</span>
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => setView(link.view)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    view === link.view
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                  {view === link.view && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full"
                      layoutId="activeNav"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
              <div className="relative group">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 transition-all">
                  More <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <button
                    onClick={() => setView('orders')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <LayoutGrid className="w-4 h-4" /> My Orders
                  </button>
                  <button
                    onClick={() => { setAdmin(!isAdmin); setView('admin'); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" /> {isAdmin ? 'Admin Dashboard' : 'Admin Mode'}
                  </button>
                </div>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="hidden sm:block"
                  >
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 text-sm bg-gray-100 dark:bg-gray-800 border-none"
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
                className="text-gray-600 dark:text-gray-400"
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </Button>

              {/* Currency */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-xs font-medium text-gray-500 dark:text-gray-400 gap-1"
                onClick={() => {
                  const curr = useAppStore.getState().currency;
                  setCurrency(curr === 'USD' ? 'EUR' : curr === 'EUR' ? 'GBP' : 'USD');
                }}
              >
                <Globe className="w-3.5 h-3.5" />
                {useAppStore.getState().currency}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative text-gray-600 dark:text-gray-400 hover:text-amber-600"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-600 dark:text-gray-400"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => { setView(link.view); setIsMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <link.icon className="w-5 h-5 text-gray-500" />
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => { setAdmin(!isAdmin); setView('admin'); setIsMobileMenuOpen(false); }}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Shield className="w-5 h-5 text-gray-500" />
                {isAdmin ? 'Admin Dashboard' : 'Admin Mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <Suspense fallback={null}>
        <CartDrawer />
      </Suspense>
    </>
  );
}

function setCurrency(c: string) {
  useAppStore.getState().setCurrency(c);
}
