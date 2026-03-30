
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

// For wraping every page in the app.
// From Top Banner, Navigation Bar to Footer.
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, handleLogout } = useAuth();
  const { toast, setToast } = useApp();

  // For menus and scrolling
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaCat, setActiveMegaCat] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  
  // Announcement banner
  const bannerEnabled = localStorage.getItem('announcement_enabled') !== 'false';
  const bannerStyle = localStorage.getItem('announcement_style') || 'gradient';
  const bannerCaption1 = localStorage.getItem('announcement_banner') || '🚚 FREE DELIVERY ON ORDERS OVER ৳10,000.';
  const bannerCaption2 = localStorage.getItem('announcement_banner_2') || '';
  
  const [searchVal, setSearchVal] = useState('');

  // Daily deals auto-reset at midnight
  useEffect(() => {
    const autoResetDailyDeal = () => {
      const existing = localStorage.getItem('deal_end_time_daily');
      const now = new Date();
      if (!existing || new Date(existing).getTime() <= now.getTime()) {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 0);
        localStorage.setItem('deal_end_time_daily', midnight.toISOString());
      }
    };
    autoResetDailyDeal();
    const interval = setInterval(autoResetDailyDeal, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const [topbarTime, setTopbarTime] = useState<{h:number,m:number,s:number}|null>(() => {
    const endStr = localStorage.getItem('deal_end_time_daily');
    if (!endStr) return null;
    const diff = new Date(endStr).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      s: Math.floor((diff % (1000 * 60)) / 1000),
    };
  });
  const [topbarSlot, setTopbarSlot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const endStr = localStorage.getItem('deal_end_time_daily');
      if (!endStr) { setTopbarTime(null); return; }
      const diff = new Date(endStr).getTime() - Date.now();
      if (diff <= 0) { setTopbarTime(null); return; }
      setTopbarTime({
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTopbarSlot(prev => (prev + 1) % 3);
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  };

  const isAuthPage = ['/user-login', '/user-signup', '/vendor-login', '/affiliate-program'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-100 selection:text-brand-600 bg-[#F5F5F8]">
      {/* Top Banner */}
      {!isAuthPage && bannerEnabled && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${bannerStyle === 'dark' ? 'bg-gray-900' : 'gradient-primary'} px-4 py-2 text-[11px] font-bold uppercase tracking-widest`}
        >
          <div className="container mx-auto flex justify-between items-center text-white">
            {user?.role !== 'vendor' && (
              <AnimatePresence mode="wait">
                {!topbarTime ? (
                  // No timer — shuffle bannerCaption1 and bannerCaption2
                  (() => {
                    const active = topbarSlot % 2 === 0
                      ? (bannerCaption1 || bannerCaption2)
                      : (bannerCaption2 || bannerCaption1);
                    if (!active) return null;
                    return (
                      <motion.span
                        key={`cap-${topbarSlot}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.4 }}
                      >
                        {active}
                      </motion.span>
                    );
                  })()
                ) : (
                  // Timer exists — slot 0: timer/caption, slot 1: bannerCaption1, slot 2: bannerCaption2
                  (() => {
                    const captionContent = topbarSlot === 1
                      ? (bannerCaption1 || bannerCaption2)
                      : (bannerCaption2 || bannerCaption1);
                    const isTimerSlot = topbarSlot === 0 || !captionContent;

                    return isTimerSlot ? (
                      <motion.span
                        key="timer"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-2"
                      >
                        <i className="fas fa-bolt text-yellow-300 text-xs"></i>
                        <span>Daily Deal ends in:</span>
                        <span className="font-black tabular-nums bg-white/20 px-2 py-0.5 rounded-lg">
                          {String(topbarTime.h).padStart(2,'0')}:{String(topbarTime.m).padStart(2,'0')}:{String(topbarTime.s).padStart(2,'0')}
                        </span>
                      </motion.span>
                    ) : captionContent ? (
                      <motion.span
                        key={`slot-${topbarSlot}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.4 }}
                      >
                        {captionContent}
                      </motion.span>
                    ) : null;
                  })()
                )}
              </AnimatePresence>
            )}
            <div className="flex gap-6 w-full sm:w-auto justify-end">
              {user?.role !== 'vendor' && (
                <button onClick={() => navigate('/affiliate-program')} className="hover:opacity-80 transition-opacity">Join Affiliate Program</button>
              )}
              <button className="hover:opacity-80 transition-opacity cursor-default">Help & Support</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      {!isAuthPage && (
        <nav className={`sticky top-0 z-50 w-full ${scrolled ? 'glass shadow-lg py-2' : 'bg-[#F5F5F8] border-b border-gray-100 py-4'}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-8">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl text-gray-700`}></i>
                </button>
                <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
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
                    value={searchVal}
                    placeholder="Search for products, brands, and more..."
                    onChange={handleSearchChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/products');
                      }
                    }}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-6 pr-14 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 transition-all placeholder:text-gray-400"
                  />
                  <button 
                    onClick={() => {
                      navigate('/products');
                    }}
                    className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-xl gradient-primary text-white flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                {user?.role !== 'vendor' && (
                  <button 
                    className="hidden lg:flex flex-col items-center gap-1 text-gray-500 hover:text-brand-600 p-2.5 rounded-2xl hover:bg-grad-soft transition-all group relative cursor-default"
                  >
                    <div className="relative">
                      <i className="far fa-heart text-xl group-hover:scale-110 transition-transform"></i>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Wishlist</span>
                  </button>
                )}
                
                {user && (
                  <button className="relative hidden lg:flex flex-col items-center gap-1 hover:opacity-80 transition-all cursor-default">
                    <i className="fas fa-bell text-xl text-gray-600"></i>
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Alerts</span>
                  </button>
                )}

                {user && (
                  <button className="relative hidden lg:flex flex-col items-center gap-1 hover:opacity-80 transition-all cursor-default">
                    <i className="fas fa-comment-dots text-xl text-gray-600"></i>
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Messages</span>
                  </button>
                )}

                {user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                    >
                      <div className="relative">
                        {user.avatar ? (
                          <img src={user.avatar} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover shadow-md" alt="User" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md font-black text-white text-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            {(user.storeName || user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
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
                            <>
                              <button
                                onClick={() => { navigate('/dashboard'); setIsUserMenuOpen(false); }}
                                className="w-full text-left px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-grad-soft hover:text-brand-600 transition-all flex items-center gap-3"
                              >
                                <i className="fas fa-store w-5"></i> My Dashboard
                              </button>
                              <button
                                onClick={() => { setIsUserMenuOpen(false); }}
                                className="w-full text-left px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-grad-soft hover:text-brand-600 transition-all flex items-center gap-3 cursor-default"
                              >
                                <i className="fas fa-shop w-5"></i> My Store
                              </button>
                              <div className="h-px bg-gray-50 my-2 mx-4"></div>
                            </>
                          )}
                          <button onClick={() => { setIsUserMenuOpen(false); }} className="w-full text-left px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-grad-soft hover:text-brand-600 transition-all flex items-center gap-3 cursor-default">
                            <i className="fas fa-cog w-5"></i> Account Settings
                          </button>
                          {user.role !== 'vendor' && (
                            <button onClick={() => { setIsUserMenuOpen(false); }} className="w-full text-left px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-grad-soft hover:text-brand-600 transition-all flex items-center gap-3 cursor-default">
                              <i className="fas fa-box w-5"></i> Order History
                            </button>
                          )}
                          <div className="h-px bg-gray-50 my-2 mx-4"></div>
                          <button onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} className="w-full text-left px-6 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all flex items-center gap-3">
                            <i className="fas fa-sign-out-alt w-5"></i> Logout
                          </button>
                        </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate('/user-login')}
                      className="hidden lg:flex flex-col items-center gap-1 text-gray-500 hover:text-brand-600 p-2.5 rounded-2xl hover:bg-grad-soft transition-all group"
                    >
                      <i className="far fa-user text-xl group-hover:scale-110 transition-transform"></i>
                      <span className="text-[9px] font-black uppercase tracking-widest">Sign In</span>
                    </button>
                  )}
  
                  {user?.role !== 'vendor' && (
                    <>
                      <div className="h-8 w-px bg-gray-200 hidden lg:block mx-1"></div>
      
                      <button 
                        className="relative flex items-center gap-4 p-2.5 lg:p-3 rounded-2xl bg-white border border-transparent hover:bg-grad-soft hover:text-brand-600 transition-all group"
                      >
                        <i className="fas fa-shopping-bag text-2xl text-[#111827] group-hover:scale-110 transition-transform"></i>
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">0</span>
                      </button>
                    </>
                  )}
                </div>
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
                      { id: '/', label: 'Home', icon: 'fa-home' },
                      { id: '/products', label: 'Products', icon: 'fa-box' },
                      { id: '/vendors', label: 'Vendors', icon: 'fa-store' },
                      { id: '/dashboard', label: 'Merchant Center', icon: 'fa-columns', vendorOnly: true },
                      { id: '/settings', label: 'Settings', icon: 'fa-cog', showIfLogged: true },
                      { id: '/user-login', label: 'Login', icon: 'fa-user', hideIfLogged: true }
                    ].filter(link => {
                      if (link.vendorOnly && user?.role !== 'vendor') return false;
                      if (link.hideIfLogged && user) return false;
                      if (link.showIfLogged && !user) return false;
                      return true;
                    }).map(link => (
                      <button 
                        key={link.id}
                        onClick={() => { 
                          if (link.id === '/' || link.id === '/user-login') {
                            navigate(link.id); 
                            setIsMobileMenuOpen(false); 
                          }
                        }}
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

        {/* Secondary Nav — separate sticky bar below main nav */}
        {!isAuthPage && (
          <div className={`hidden lg:block sticky z-40 bg-white border-b border-gray-100 shadow-sm transition-all`} style={{ top: scrolled ? '64px' : '80px' }}>
            <div className="container mx-auto px-4">
              <nav className="flex items-center gap-10 py-3 relative">
                {/* All Categories Mega Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                  <button
                    className={`flex items-center gap-3 px-6 py-2 rounded-xl transition-all font-black uppercase tracking-widest text-[13px] ${isMegaMenuOpen ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-900 hover:bg-gray-50'}`}
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
                                  className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline"
                                >
                                  View All
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                                {CATEGORIES.find(c => c.id === activeMegaCat)?.subcategories?.map(sub => (
                                  <button
                                    key={sub.id}
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
                                <button className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline text-gradient">View All</button>
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
                  { id: '/', label: 'Home' },
                  { id: '/vendors', label: 'Vendors' },
                  { id: '/deals', label: 'Daily Deals' },
                  { id: '/dashboard', label: 'Merchant Center', vendorOnly: true }
                ].filter(link => !link.vendorOnly || user?.role === 'vendor').map(link => (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (link.id === '/' || link.id === '/dashboard') navigate(link.id);
                      // Other links are visual only, do nothing
                    }}
                    className={`text-[13px] font-black uppercase tracking-widest transition-all relative py-1 ${location.pathname === link.id ? 'text-gradient' : 'text-gray-500 hover:text-brand-600'}`}
                  >
                    {link.label}
                    {location.pathname === link.id && (
                      <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-0.5 gradient-primary rounded-full" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}



        <main className="flex-1">
          {children}
        </main>
  
        {/* Footer */}
        {!isAuthPage && (
          <footer className="bg-[#111827] text-white pt-20 pb-10">
            <div className="container mx-auto px-4">
              <div className={user?.role === 'vendor' ? 'flex flex-col lg:flex-row gap-x-16 gap-y-12 mb-16' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 mb-16'}>
                <div className={user?.role === 'vendor' ? 'lg:w-72 shrink-0 space-y-6' : 'lg:col-span-3 space-y-6'}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-brand-500/10">
                      <i className="fas fa-store"></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-3xl font-black tracking-tighter text-gradient">Mamu</span>
                      <span className="text-[10px] font-black text-brand-300 tracking-[0.4em] uppercase">Market</span>
                    </div>
                  </div>
                  <p className="text-gray-400 leading-relaxed text-base font-medium">
                    Bangladesh's premier multi-vendor<br />marketplace since 2025.
                  </p>
                  <div className="flex gap-3">
                    {['facebook', 'instagram', 'twitter', 'linkedin'].map(social => (
                      <motion.button 
                        key={social} 
                        whileHover={{ y: -4, scale: 1.1 }}
                        className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-brand-600 transition-all shadow-lg"
                      >
                        <i className={`fab fa-${social} text-lg`}></i>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div className={user?.role === 'vendor' ? 'flex-1' : 'lg:col-span-2'}>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-brand-300">Quick Links</h3>
                  <ul className="space-y-3 text-gray-400 font-bold text-sm">
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> About Us</button></li>
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Contact Us</button></li>
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Help & Support</button></li>
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Terms & Conditions</button></li>
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Return & Refund Policy</button></li>
                  </ul>
                </div>
  
                {/* ACCOUNT — vendor only */}
                {user?.role === 'vendor' && (
                <div className="flex-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-brand-300">My Account</h3>
                  <ul className="space-y-3 text-gray-400 font-bold text-sm">
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Account Settings</button></li>
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Messages</button></li>
                  </ul>
                </div>
                )}

                {/* ACCOUNT — hidden for vendor */}
                {user?.role !== 'vendor' && (
                <div className="lg:col-span-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-brand-300">Account</h3>
                  <ul className="space-y-3 text-gray-400 font-bold text-sm">
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> My Account</button></li>
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Order History</button></li>
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Wishlist</button></li>
                  </ul>
                </div>
                )}

                {/* MERCHANT — hidden for vendor */}
                {user?.role !== 'vendor' && (
                <div className="lg:col-span-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-brand-300">Merchant</h3>
                  <ul className="space-y-3 text-gray-400 font-bold text-sm">
                    <li><button onClick={() => { navigate('/affiliate-program'); }} className="hover:text-white transition-colors flex items-center gap-2 group"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Affiliate Program</button></li>
                    {!user && (
                      <li><button onClick={() => { navigate('/vendor-login'); }} className="hover:text-white transition-colors flex items-center gap-2 group"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Vendor Login</button></li>
                    )}
                    <li><button className="hover:text-white transition-colors flex items-center gap-2 group cursor-default"><i className="fas fa-chevron-right text-[6px] opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all"></i> Seller Policies</button></li>
                  </ul>
                </div>
                )}

              {/* 4TH COLUMN — Merchant Tools for vendor, Newsletter for others */}
              <div className={user?.role === 'vendor' ? 'flex-1' : 'lg:col-span-3'}>
                {user?.role === 'vendor' ? (
                  <>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-brand-300">Merchant Tools</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'My Dashboard', path: '/dashboard', icon: 'fa-store', active: true },
                        { label: 'My Store', path: '#', icon: 'fa-shop' },
                        { label: 'Analytics', path: '#', icon: 'fa-chart-pie' },
                        { label: 'Marketing Tools', path: '#', icon: 'fa-bullhorn' },
                        { label: 'Seller Policies', path: '#', icon: 'fa-file-contract' },
                      ].map(item => (
                        <button 
                          key={item.label} 
                          onClick={() => { if(item.active) { navigate(item.path); } }} 
                          className={`w-full text-left flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm font-medium ${!item.active ? 'cursor-default' : ''}`}
                        >
                          <i className={`fas ${item.icon} text-brand-400 w-4`}></i> {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-brand-300">Newsletter</h3>
                    <p className="text-gray-400 mb-5 text-sm font-medium leading-relaxed">Subscribe for the latest deals and exclusive offers.</p>
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="w-full bg-gray-800 border-2 border-transparent rounded-xl px-5 py-3.5 text-sm focus:ring-0 focus:border-brand-600 outline-none transition-all mb-3"
                    />
                    <button className="w-full gradient-primary py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-500/10">
                      Subscribe Now
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <p>© {new Date().getFullYear()} MAMU MARKET INC</p>
              <div className="flex gap-8">
                <span style={{opacity:0.4, color:'white', userSelect:'none', fontSize:'18px', fontWeight:'bold', padding: '0 4px'}}>&bull;</span>
                <button className="hover:text-white transition-colors cursor-default">Privacy</button>
                <button className="hover:text-white transition-colors cursor-default">Terms</button>
                <button className="hover:text-white transition-colors cursor-default">Cookies</button>
              </div>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};

export default Layout;
