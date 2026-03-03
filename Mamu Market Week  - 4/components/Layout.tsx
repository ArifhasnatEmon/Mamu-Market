
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewType, CartItem, User } from '../types';
import { CATEGORIES } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  setView: (view: ViewType) => void;
  cart: CartItem[];
  user: User | null;
  onLogout: () => void;
  onSearch: (query: string) => void;
  onSelectCategory?: (categoryId: string | null) => void;
  onSelectSubCategory?: (subCategoryName: string | null) => void;
  onSelectFilter?: (filter: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, cart, user, onLogout, onSearch, onSelectCategory, onSelectSubCategory, onSelectFilter }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaCat, setActiveMegaCat] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
    if (currentView !== 'products') setView('products');
  };

  const handleProtectedView = (view: ViewType) => {
    if (!user) {
      setView('login');
    } else {
      setView(view);
    }
  };

  const handleStaticPage = (view: ViewType) => {
    setView(view);
    window.scrollTo(0, 0);
  };

  const isAuthPage = currentView === 'login' || currentView === 'vendor-login' || currentView === 'become-vendor' || 
                    currentView === 'help-center' || currentView === 'about-us' || currentView === 'terms' || 
                    currentView === 'privacy' || currentView === 'return-policy' || currentView === 'seller-policy' || 
                    currentView === 'promote-item';

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-100 selection:text-brand-600 bg-[#F5F5F8]">
      {/* Top Banner */}
      {!isAuthPage && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="gradient-primary px-4 py-2 text-[11px] font-bold text-white uppercase tracking-widest"
        >
          <div className="container mx-auto flex justify-between items-center">
            <p className="hidden sm:block">🚚 Free Delivery on Orders Over ৳5,000.</p>
            <div className="flex gap-6 w-full sm:w-auto justify-end">
              <button onClick={() => setView('become-vendor')} className="hover:opacity-80 transition-opacity">Join Affiliate Program</button>
              <button onClick={() => handleStaticPage('help-center')} className="hover:opacity-80 transition-opacity">Help Center</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      {!isAuthPage && (
        <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'glass shadow-lg py-2' : 'bg-[#F5F5F8] border-b border-gray-100 py-4'}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-8">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl text-gray-700`}></i>
                </button>
                <button onClick={() => setView('home')} className="flex items-center gap-3 group">
                  <motion.div 
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-white shadow-xl shadow-brand-500/20"
                  >
                    <i className="fas fa-store text-xl"></i>
                  </motion.div>
                  <div className="flex flex-col text-left">
                    <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none text-gradient">Mamu</span>
                    <span className="text-[10px] font-black text-brand-600 tracking-[0.2em] uppercase">Market</span>
                  </div>
                </button>
              </div>

              {/* Search */}
              <div className="hidden max-w-xl flex-1 lg:block">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search for products, brands, and more..."
                    onChange={handleSearchChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (currentView !== 'products') setView('products');
                      }
                    }}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-6 pr-14 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all placeholder:text-gray-400"
                  />
                  <button 
                    onClick={() => {
                      if (currentView !== 'products') setView('products');
                    }}
                    className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-xl gradient-primary text-white flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                <button 
                  onClick={() => setView('wishlist')}
                  className="hidden lg:flex flex-col items-center gap-1 text-gray-500 hover:text-brand-600 p-2.5 rounded-2xl hover:bg-grad-soft transition-all group"
                >
                  <i className="far fa-heart text-xl group-hover:scale-110 transition-transform"></i>
                  <span className="text-[9px] font-black uppercase tracking-widest">Wishlist</span>
                </button>
                
                {user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                    >
                      <img src={user.avatar} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover shadow-md" alt="User" />
                      <div className="hidden xl:flex flex-col text-left">
                        <span className="text-xs font-black text-gray-900 leading-none mb-1">{user.name}</span>
                        <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest">{user.role}</span>
                      </div>
                      <i className={`fas fa-chevron-down text-[10px] text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-gray-100 py-3 z-50 overflow-hidden"
                        >
                          <div className="px-6 py-4 border-b border-gray-50 mb-2">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Account</p>
                            <p className="text-sm font-bold text-[#111827] truncate">{user.email}</p>
                          </div>
                          {user.role === 'vendor' && (
                            <button onClick={() => { setView('dashboard'); setIsUserMenuOpen(false); }} className="w-full text-left px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-grad-soft hover:text-brand-600 transition-all flex items-center gap-3">
                              <i className="fas fa-columns w-5"></i> Dashboard
                            </button>
                          )}
                          <button onClick={() => { setView('settings'); setIsUserMenuOpen(false); }} className="w-full text-left px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-grad-soft hover:text-brand-600 transition-all flex items-center gap-3">
                            <i className="fas fa-cog w-5"></i> Account Settings
                          </button>
                          <div className="h-px bg-gray-50 my-2 mx-4"></div>
                          <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left px-6 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all flex items-center gap-3">
                            <i className="fas fa-sign-out-alt w-5"></i> Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button 
                    onClick={() => setView('login')}
                    className="hidden lg:flex flex-col items-center gap-1 text-gray-500 hover:text-brand-600 p-2.5 rounded-2xl hover:bg-grad-soft transition-all group"
                  >
                    <i className="far fa-user text-xl group-hover:scale-110 transition-transform"></i>
                    <span className="text-[9px] font-black uppercase tracking-widest">Sign In</span>
                  </button>
                )}

                <div className="h-8 w-px bg-gray-200 hidden lg:block mx-1"></div>

                <button 
                  onClick={() => setView('cart')}
                  className="relative flex items-center gap-4 p-2.5 lg:p-3 rounded-2xl bg-white hover:bg-grad-soft transition-all group border border-transparent hover:border-brand-100"
                >
                  <div className="relative">
                    <i className="fas fa-shopping-bag text-2xl text-[#111827] group-hover:text-brand-600 transition-colors"></i>
                    <AnimatePresence>
                      {cartCount > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full gradient-primary text-[10px] font-black text-white ring-2 ring-white"
                        >
                          {cartCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="hidden flex-col text-left lg:flex">
                    <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1"></span>
                    <span className="font-black text-[#111827] leading-none">৳{cartTotal.toLocaleString()}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Nav */}
          <div className="hidden border-t border-gray-100 bg-white lg:block">
            <div className="container mx-auto px-4">
              <nav className="flex items-center gap-10 py-4 relative">
                {/* All Categories Mega Menu */}
                <div 
                  className="relative"
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                  <button 
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-black uppercase tracking-widest text-[13px] ${isMegaMenuOpen ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-900 hover:bg-gray-50'}`}
                  >
                    <i className="fas fa-bars"></i>
                    All Categories
                    <i className={`fas fa-chevron-down text-[10px] transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`}></i>
                  </button>

                  <AnimatePresence>
                    {isMegaMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-[800px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-[100] flex"
                      >
                        {/* Left: Categories List */}
                        <div className="w-1/3 bg-gray-50/50 p-8 border-r border-gray-100">
                          <div className="space-y-2">
                            <button 
                              onMouseEnter={() => setActiveMegaCat(null)}
                              onClick={() => { 
                                if (onSelectCategory) onSelectCategory(null);
                                setView('products'); 
                                setIsMegaMenuOpen(false); 
                              }}
                              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all group text-left mb-4 ${!activeMegaCat ? 'text-brand-600 bg-white shadow-sm' : 'text-gray-600 hover:bg-white hover:text-brand-600'}`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!activeMegaCat ? 'gradient-primary text-white' : 'bg-white shadow-sm group-hover:gradient-primary group-hover:text-white'}`}>
                                <i className="fas fa-th-large"></i>
                              </div>
                              All Products
                            </button>
                            {CATEGORIES.map((cat) => (
                              <button 
                                key={cat.id}
                                onMouseEnter={() => setActiveMegaCat(cat.id)}
                                onClick={() => { 
                                  if (onSelectCategory) onSelectCategory(cat.id);
                                  setView('products'); 
                                  setIsMegaMenuOpen(false); 
                                }}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all group text-left ${activeMegaCat === cat.id ? 'text-brand-600 bg-white shadow-md' : 'text-gray-600 hover:bg-white hover:text-brand-600'}`}
                              >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeMegaCat === cat.id ? 'gradient-primary text-white' : 'bg-white shadow-sm group-hover:gradient-primary group-hover:text-white'}`}>
                                  <i className={`fas ${cat.icon}`}></i>
                                </div>
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Right: Subcategories or Featured */}
                        <div className="flex-1 p-10 bg-white">
                          {activeMegaCat ? (
                            <div>
                              <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                                  {CATEGORIES.find(c => c.id === activeMegaCat)?.name} Subcategories
                                </h3>
                                <button 
                                  onClick={() => {
                                    if (onSelectCategory) onSelectCategory(activeMegaCat);
                                    setView('products');
                                    setIsMegaMenuOpen(false);
                                  }}
                                  className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline"
                                >
                                  View All
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                                {CATEGORIES.find(c => c.id === activeMegaCat)?.subcategories?.map(sub => (
                                  <button
                                    key={sub.id}
                                    onClick={() => {
                                      if (onSelectCategory) onSelectCategory(activeMegaCat);
                                      if (onSelectSubCategory) onSelectSubCategory(sub.name);
                                      setView('products');
                                      setIsMegaMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors group text-left"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-brand-600 transition-colors"></div>
                                    {sub.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Featured Collections</h3>
                                <button onClick={() => { setView('products'); setIsMegaMenuOpen(false); }} className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline text-gradient">View All</button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-6">
                                {[
                                  { title: 'New Arrivals', color: 'bg-emerald-50', icon: 'fa-sparkles', filter: 'new' },
                                  { title: 'Best Sellers', color: 'bg-amber-50', icon: 'fa-fire', filter: 'best' },
                                  { title: 'Trending Now', color: 'bg-brand-50', icon: 'fa-bolt', filter: 'trending' },
                                  { title: 'Official Stores', color: 'bg-blue-50', icon: 'fa-check-circle', filter: 'official' }
                                ].map((item) => (
                                  <div 
                                    key={item.title}
                                    onClick={() => {
                                      if (onSelectFilter) onSelectFilter(item.filter);
                                      setView('products');
                                      setIsMegaMenuOpen(false);
                                    }}
                                    className={`p-8 rounded-[2rem] ${item.color} border border-white group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all`}
                                  >
                                    <h4 className="text-lg font-black text-gray-900 mb-2">{item.title}</h4>
                                    <button className="text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-brand-600 transition-colors flex items-center gap-2">
                                      Shop Now <i className="fas fa-arrow-right text-[10px]"></i>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-6 w-px bg-gray-100"></div>

                {[
                  { id: 'home', label: 'Home' },
                  { id: 'vendors', label: 'Vendors' },
                  { id: 'deals', label: 'Daily Deals' },
                  { id: 'dashboard', label: 'Merchant Center', vendorOnly: true }
                ].filter(link => !link.vendorOnly || user?.role === 'vendor').map(link => (
                    <button 
                      key={link.id}
                      onClick={() => setView(link.id as ViewType)}
                      className={`text-[13px] font-black uppercase tracking-widest transition-all relative py-1 ${currentView === link.id ? 'text-gradient' : 'text-gray-500 hover:text-brand-600'}`}
                    >
                      {link.label}
                      {currentView === link.id && (
                        <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-0.5 gradient-primary rounded-full" />
                      )}
                    </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-gray-100 bg-[#F5F5F8] px-4 py-8 space-y-4 overflow-hidden"
              >
                 {[
                    { id: 'home', label: 'Home', icon: 'fa-home' },
                    { id: 'products', label: 'Products', icon: 'fa-box' },
                    { id: 'vendors', label: 'Vendors', icon: 'fa-store' },
                    { id: 'dashboard', label: 'Merchant Center', icon: 'fa-columns', vendorOnly: true },
                    { id: 'settings', label: 'Settings', icon: 'fa-cog', showIfLogged: true },
                    { id: 'cart', label: 'My Cart', icon: 'fa-shopping-cart' },
                    { id: 'login', label: 'Login', icon: 'fa-user', hideIfLogged: true }
                  ].filter(link => {
                    if (link.vendorOnly && user?.role !== 'vendor') return false;
                    if (link.hideIfLogged && user) return false;
                    if (link.showIfLogged && !user) return false;
                    return true;
                  }).map(link => (
                    <button 
                      key={link.id}
                      onClick={() => { setView(link.id as ViewType); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-5 w-full py-4 px-6 rounded-2xl font-bold text-gray-700 hover:bg-grad-soft hover:text-brand-600 transition-all border border-transparent hover:border-brand-100"
                    >
                      <i className={`fas ${link.icon} w-6 text-xl`}></i>
                      <span className="text-lg">{link.label}</span>
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      )}

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {!isAuthPage && (
        <footer className="bg-[#111827] text-white pt-32 pb-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-12 gap-y-16 mb-24">
              <div className="lg:col-span-4 space-y-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-brand-500/20">
                    <i className="fas fa-store"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-4xl font-black tracking-tighter text-gradient">Mamu</span>
                    <span className="text-sm font-black text-brand-300 tracking-[0.4em] uppercase">Market</span>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed max-w-sm text-lg font-medium">
                  Bangladesh's premier multi-vendor marketplace since 2025.
                </p>
                <div className="flex gap-5">
                  {['facebook', 'instagram', 'twitter', 'linkedin'].map(social => (
                    <motion.button 
                      key={social} 
                      whileHover={{ y: -8, scale: 1.15 }}
                      className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center hover:bg-brand-600 transition-all shadow-xl"
                    >
                      <i className={`fab fa-${social} text-2xl`}></i>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-12 text-brand-300">Quick Links</h3>
                <ul className="space-y-6 text-gray-400 font-bold">
                  <li><button onClick={() => handleStaticPage('about-us')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> About Us</button></li>
                  <li><button onClick={() => handleStaticPage('help-center')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Help Center</button></li>
                  <li><button onClick={() => handleStaticPage('terms')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Terms & Conditions</button></li>
                  <li><button onClick={() => handleStaticPage('privacy')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Privacy Policy</button></li>
                  <li><button onClick={() => handleStaticPage('return-policy')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Return Policy</button></li>
                </ul>
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-12 text-brand-300">Account</h3>
                <ul className="space-y-6 text-gray-400 font-bold">
                  <li><button onClick={() => handleProtectedView('settings')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> My Account</button></li>
                  <li><button onClick={() => handleProtectedView('order-history')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Order History</button></li>
                  <li><button onClick={() => handleProtectedView('wishlist')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Wishlist</button></li>
                  <li><button onClick={() => handleProtectedView('cart')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> My Cart</button></li>
                </ul>
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-12 text-brand-300">Vendor</h3>
                <ul className="space-y-6 text-gray-400 font-bold">
                  <li><button onClick={() => setView('become-vendor')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Affiliate Program</button></li>
                  {user?.role === 'vendor' && (
                    <li><button onClick={() => setView('dashboard')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Vendor Dashboard</button></li>
                  )}
                  <li><button onClick={() => setView('vendor-login')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Vendor Login</button></li>
                  <li><button onClick={() => handleStaticPage('seller-policy')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Seller Policies</button></li>
                  <li><button onClick={() => handleStaticPage('promote-item')} className="hover:text-white transition-colors flex items-center gap-3 group"><i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"></i> Promotion</button></li>
                </ul>
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-12 text-brand-300">Newsletter</h3>
                <p className="text-gray-400 mb-8 font-medium leading-relaxed">Subscribe for the latest deals and exclusive offers</p>
                <div className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full bg-gray-800 border-2 border-transparent rounded-2xl px-6 py-5 text-sm focus:ring-0 focus:border-brand-600 outline-none transition-all"
                  />
                  <button className="w-full gradient-primary py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-brand-500/20">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <p>© 2025 Mamu Market Inc.</p>
              <div className="flex gap-10">
                <button className="hover:text-white transition-colors">Privacy</button>
                <button className="hover:text-white transition-colors">Terms</button>
                <button className="hover:text-white transition-colors">Cookies</button>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
