'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Menu, X, Home, LayoutGrid,
  Star, Globe, ChevronDown, User, LogOut, Package,
  ShieldCheck, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCartStore } from '@/stores/cart-store';
import { useAppStore } from '@/stores/app-store';
import { formatPrice } from '@/lib/format';

const CartDrawer = lazy(() => import('./CartDrawer'));

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const { toggleCart, getItemCount } = useCartStore();
  const { currency, setCurrency, view, setView, filters, setFilters, user, login, logout, isAdmin } = useAppStore();
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleClick = () => setIsUserDropdownOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isUserDropdownOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = login(loginEmail, loginPassword);
    if (success) {
      setLoginOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Email ou mot de passe incorrect');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
    setView('catalog');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleCurrencyToggle = () => {
    setCurrency(currency === 'USD' ? 'EUR' : currency === 'EUR' ? 'GBP' : 'USD');
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
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsUserDropdownOpen(!isUserDropdownOpen); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 transition-all"
                >
                  More <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 z-50"
                    >
                      <button
                        onClick={() => { setView('orders'); setIsUserDropdownOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" /> My Orders
                      </button>
                      {user && isAdmin() && (
                        <button
                          onClick={() => { setView('admin'); setIsUserDropdownOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto' }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="hidden sm:block overflow-hidden"
                  >
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 text-sm w-32 sm:w-48 lg:w-52 bg-gray-100 dark:bg-gray-800 border-none"
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
                onClick={handleCurrencyToggle}
              >
                <Globe className="w-3.5 h-3.5" />
                {currency}
              </Button>

              {/* User / Login */}
              {user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 gap-1.5"
                    onClick={(e) => { e.stopPropagation(); setIsUserDropdownOpen(!isUserDropdownOpen); }}
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { setView('profile'); setIsUserDropdownOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                        >
                          <User className="w-4 h-4" /> Profile
                        </button>
                        <button
                          onClick={() => { setView('orders'); setIsUserDropdownOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4" /> My Orders
                        </button>
                        {isAdmin() && (
                          <button
                            onClick={() => { setView('admin'); setIsUserDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                          </button>
                        )}
                        <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                          <button
                            onClick={() => { logout(); setIsUserDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" /> Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex text-sm font-medium gap-1.5"
                  onClick={() => setLoginOpen(true)}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Connexion
                </Button>
              )}

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
            className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
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

              {/* Mobile currency toggle */}
              <button
                onClick={handleCurrencyToggle}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              >
                <Globe className="w-5 h-5 text-gray-500" />
                Devise: {currency}
              </button>

              <div className="border-t border-gray-200 dark:border-gray-800 my-2" />

              {user ? (
                <>
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setView('profile'); setIsMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-500" /> Profile
                  </button>
                  <button
                    onClick={() => { setView('orders'); setIsMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Package className="w-5 h-5 text-gray-500" /> My Orders
                  </button>
                  {isAdmin() && (
                    <button
                      onClick={() => { setView('admin'); setIsMobileMenuOpen(false); }}
                      className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ShieldCheck className="w-5 h-5 text-gray-500" /> Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-5 h-5" /> Déconnexion
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setLoginOpen(true); }}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Lock className="w-5 h-5 text-gray-500" /> Connexion
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              Connexion
            </DialogTitle>
            <DialogDescription>
              Entrez vos identifiants pour accéder à votre compte.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="votre@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-500 font-medium">{loginError}</p>
            )}
            <Button
              type="submit"
              className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              Se connecter
            </Button>
            <div className="text-xs text-muted-foreground text-center space-y-1 pt-2">
              <p>Comptes démo :</p>
              <p className="text-gray-500">Admin: admin@darna.dz / admin123</p>
              <p className="text-gray-500">User: amina@email.com / amina123</p>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cart Drawer */}
      <Suspense fallback={null}>
        <CartDrawer />
      </Suspense>
    </>
  );
}
