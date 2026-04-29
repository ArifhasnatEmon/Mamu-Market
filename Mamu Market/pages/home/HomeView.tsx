import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { PRODUCTS, CATEGORIES } from '../../constants';
import FlashSaleSection from './FlashSaleSection';
import ProductCard from '../../components/product/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';

type BannerMsg = { message: string; sub?: string; icon?: string; ctaText?: string; ctaLink?: string; badge?: string };

const messageHasEmoji = (msg: string): boolean => {
  const code = msg?.trim().codePointAt(0) || 0;
  return code > 127;
};

const GBanner: React.FC<{ msgs: BannerMsg[] }> = ({ msgs }) => {
  const navigate = useNavigate();
  const [ci, setCi] = React.useState(0);
  const [phase, setPhase] = React.useState<'in' | 'out'>('in');
  React.useEffect(() => {
    if (msgs.length <= 1) return;
    const iv = setInterval(() => {
      setPhase('out');
      setTimeout(() => { setCi(p => (p + 1) % msgs.length); setPhase('in'); }, 380);
    }, 5000);
    return () => clearInterval(iv);
  }, [msgs.length]);
  const c = msgs[ci] || msgs[0];
  if (!c) return null;

  const hasEmoji = messageHasEmoji(c.message);

  return (
    <section className="container mx-auto px-4">
      <style>{`@keyframes secUp{from{transform:translateY(60%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes secDown{from{transform:translateY(0);opacity:1}to{transform:translateY(-60%);opacity:0}}.sec-in{animation:secUp .38s ease forwards}.sec-out{animation:secDown .35s ease forwards}`}</style>
      <div className="rounded-[2rem] overflow-hidden" style={{ background: 'linear-gradient(135deg,#4c1d95,#7c3aed,#a855f7)', minHeight: '72px' }}>
        <div className="flex items-center justify-between px-6 py-5 gap-4">
          <div className={phase === 'out' ? 'sec-out' : 'sec-in'} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {c.icon && <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0">{c.icon}</div>}
            <div><p className="font-black text-white text-base">{c.icon ? c.message.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').trim() : c.message}</p>{c.sub && <p className="text-white/70 text-sm mt-0.5">{c.sub}</p>}</div>
          </div>
          <button onClick={() => { navigate(c.ctaLink || '/products'); window.scrollTo(0, 0); }} className="shrink-0 bg-white text-purple-700 px-6 py-3 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap">
            {c.ctaText || 'Shop Now'} →
          </button>
        </div>
      </div>
    </section>
  );
};

const DBanner: React.FC<{ msgs: BannerMsg[] }> = ({ msgs }) => {
  const navigate = useNavigate();
  const [ci, setCi] = React.useState(0);
  const [vis, setVis] = React.useState(true);
  React.useEffect(() => {
    if (msgs.length <= 1) return;
    const iv = setInterval(() => {
      setVis(false);
      setTimeout(() => { setCi(p => (p + 1) % msgs.length); setVis(true); }, 500);
    }, 5000);
    return () => clearInterval(iv);
  }, [msgs.length]);
  const c = msgs[ci] || msgs[0];
  if (!c) return null;


  const hasEmoji = messageHasEmoji(c.message);

  return (
    <section className="container mx-auto px-4">
      <div className="rounded-[2rem] overflow-hidden bg-gray-900 border-t-4 border-purple-600" style={{ minHeight: '72px' }}>
        <div className="flex items-center justify-between px-8 py-5 gap-6">
          <div className="flex-1 min-w-0" style={{ transition: 'opacity 0.5s ease, transform 0.5s ease', opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(-20px)' }}>
            {c.badge && <span className="inline-block text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full mb-2">{c.badge}</span>}
            <p className="font-black text-white text-lg truncate">{c.badge ? c.message.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').trim() : c.message}</p>
            {c.sub && <p className="text-gray-400 text-sm mt-1 truncate">{c.sub}</p>}
          </div>
          <button
            onClick={() => { navigate(c.ctaLink || '/products'); window.scrollTo(0, 0); }}
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm text-white hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
          >
            {c.ctaText || 'Shop Now'} <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleAddToCart } = useCart();
  const {
    wishlist, handleToggleWishlist, setSelectedCategory,
    handleSelectProduct
  } = useApp();
  const userRole = user?.role;
  const [slide, setSlide] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    const dynamicProducts = JSON.parse(localStorage.getItem('approved_products') || '[]').map((p: any) => ({
      ...p,
      id: p.id,
      name: p.productName || p.name || '',
      price: parseFloat(p.price) || 0,
      originalPrice: parseFloat(p.originalPrice) || parseFloat(p.price) || 0,
      image: p.mainImage || p.image || '',
      categoryId: p.category?.toLowerCase().replace(/\s+/g, '-') || 'general',
      rating: p.rating || 0,
      reviewsCount: p.reviewsCount || 0,
      inStock: p.inStock !== false && p.inStock !== 'false' && (p.stock === undefined || p.stock > 0),
    }));
    const hydrated = stored.map((item: any) => {
      const fullProduct = PRODUCTS.find(p => p.id === item.id) || dynamicProducts.find((p: any) => p.id === item.id);
      return fullProduct ? { ...item, ...fullProduct } : item;
    });
    setRecentlyViewed(hydrated);
  }, []);
  const savedSlides = JSON.parse(localStorage.getItem('hero_slides') || 'null');
  const now = Date.now();
  const parsedPromos = JSON.parse(localStorage.getItem('hero_promotion_requests') || '[]');
  const approvedPromos = (Array.isArray(parsedPromos) ? parsedPromos : [])
    .filter((r: any) => r.status === 'approved' && (!r.expiresAt || new Date(r.expiresAt).getTime() > now) && r.img)
    .map((r: any) => ({
      img: r.img,
      title: r.title || r.vendorName || 'Special Offer',
      sub: r.sub || (r.type === 'store' ? `Visit ${r.vendorName}'s store` : r.productName || ''),
      isPromo: true,
      vendorName: r.vendorName,
      vendorId: r.vendorId,
      linkType: r.linkType || (r.type === 'store' ? 'store' : 'store'),
      linkProductId: r.linkProductId || r.productId || '',
    }));
  const defaultSlides = [
    {
      img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
      title: 'Elevate Your Everyday',
      sub: 'Discover premium collections curated for the modern lifestyle.'
    },
    {
      img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
      title: 'The Future of Tech',
      sub: 'Experience cutting-edge innovation from world-class vendors.'
    },
    {
      img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop',
      title: 'Best Gadget and Gear',
      sub: 'Grab the best gadgets and gear from the most trusted sellers.'
    },
    {
      img: 'https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=1200&auto=format&fit=crop',
      title: 'Elevate Your Space in Style',
      sub: 'Premium furniture curated for modern living.'
    },
    {
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
      title: 'Glow with Confidence',
      sub: 'Premium beauty and health essentials for your everyday well-being.'
    },
    {
      img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop',
      title: 'Define Your Style',
      sub: 'Fashion that speaks confidence, comfort, and individuality.'
    }
  ];
  const slides = [...(Array.isArray(savedSlides) ? savedSlides : defaultSlides), ...approvedPromos];

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => setSlide(s => (s + 1) % slides.length), 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  React.useEffect(() => {
    const now = Date.now();
    const slots: any[] = JSON.parse(localStorage.getItem('secondary_banner_slots') || '[]');
    if (slots.length === 0) return;
    let changed = false;
    const updated = slots.map((slot: any, idx: number) => {
      if (idx === 0) return slot; // admin slot never expires
      if (slot.active && slot.expiresAt && new Date(slot.expiresAt).getTime() <= now) {
        changed = true;
        return { ...slot, active: false };
      }
      return slot;
    });
    if (changed) {
      const navReqs: any[] = JSON.parse(localStorage.getItem('nav_promotion_requests') || '[]');
      const inSlots = new Set(updated.filter((s: any) => s.active && s.type === 'vendor').map((s: any) => s.id));
      const queue = navReqs
        .filter((r: any) => r.status === 'approved' && r.expiresAt && new Date(r.expiresAt).getTime() > now && !inSlots.has(r.id))
        .sort((a: any, b: any) => new Date(a.approvedAt || a.createdAt).getTime() - new Date(b.approvedAt || b.createdAt).getTime());
      let qi = 0;
      for (let i = 1; i <= 3; i++) {
        if ((!updated[i] || !updated[i].active) && queue[qi]) {
          updated[i] = { id: queue[qi].id, type: 'vendor', message: queue[qi].message, vendorId: queue[qi].vendorId, vendorName: queue[qi].vendorName, expiresAt: queue[qi].expiresAt, active: true };
          qi++;
        }
      }
      localStorage.setItem('secondary_banner_slots', JSON.stringify(updated));
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-24 pb-32"
    >
      {/* Hero */}
      <section className="container mx-auto px-4 pt-8">
        <div className="relative h-[560px] sm:h-[530px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl group bg-black">
          <AnimatePresence initial={false}>
            <motion.div
              key={slide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.10) 100%)' }}></div>

              <motion.img
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                src={slides[slide].img || 'https://via.placeholder.com/1920x1080?text=Mamu+Market'}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
                alt="Hero"
              />

              <div className="relative z-20 h-full flex flex-col justify-center pl-12 pr-6 sm:pl-16 sm:pr-8 lg:pl-20 lg:pr-12 max-w-xs sm:max-w-sm lg:max-w-lg">
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="gradient-success text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] px-5 sm:px-6 py-2 sm:py-2.5 rounded-full w-fit mb-4 sm:mb-6 shadow-xl shadow-emerald-500/20"
                >
                  New Season Arrival
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-[0.95] tracking-tighter text-balance"
                >
                  {slides[slide].title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl font-medium leading-relaxed text-balance"
                >
                  {slides[slide].sub}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="flex flex-wrap gap-6"
                >
                  {slides[slide].isPromo ? (
                    <button
                      onClick={() => {
                        if (slides[slide].linkType === 'product' && slides[slide].linkProductId) {
                          navigate(`/products/${slides[slide].linkProductId}`);
                        } else {
                          navigate(`/vendors/${slides[slide].vendorId}`);
                        }
                      }}
                      className="px-8 sm:px-12 py-4 sm:py-5 gradient-primary text-white rounded-2xl font-black text-base sm:text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-500/30"
                    >
                      {slides[slide].linkType === 'product' ? 'View Product' : 'Visit Store'}
                    </button>
                  ) : (
                    <button onClick={() => navigate('/products')} className="px-8 sm:px-12 py-4 sm:py-5 gradient-primary text-white rounded-2xl font-black text-base sm:text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-500/30">
                      Explore Shop
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 sm:left-auto sm:right-12 sm:translate-x-0 z-20 flex gap-2 sm:gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${slide === i ? 'w-8 sm:w-12 bg-white' : 'w-2 sm:w-3 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Secondary Banner — below hero slider */}
      {(() => {
        const enabled = localStorage.getItem('secondary_banner_enabled') !== 'false';
        if (!enabled || userRole === 'vendor' || userRole === 'admin') return null;

        const style = localStorage.getItem('secondary_banner_style') || 'gradient';
        const now = Date.now();

        type BMsg = { message: string; sub?: string; icon?: string; badge?: string; ctaText?: string; ctaLink?: string };
        const rawSlots: any[] = JSON.parse(localStorage.getItem('secondary_banner_slots') || '[]');
        let msgs: BMsg[] = rawSlots.length > 0
          ? rawSlots.filter((s: any) => s.active && s.message && (!s.expiresAt || new Date(s.expiresAt).getTime() > now))
            .map((s: any) => ({ message: s.message, sub: s.subMessage, icon: s.icon, badge: s.badge, ctaText: s.ctaText, ctaLink: s.ctaLink }))
          : [];

        // Legacy fallback
        if (msgs.length === 0) {
          const title = localStorage.getItem('secondary_banner_title') || '';
          const msg1 = localStorage.getItem('secondary_msg1') || '';
          if (style === 'marquee' && msg1) {
            const msg2 = localStorage.getItem('secondary_msg2') || '';
            const msg3 = localStorage.getItem('secondary_msg3') || '';
            msgs = [msg1, msg2, msg3].filter(Boolean).map(m => ({ message: m }));
          } else if (title) {
            msgs = [{ message: title, sub: localStorage.getItem('secondary_banner_subtitle') || '', icon: localStorage.getItem('secondary_banner_icon') || '🚀', ctaText: localStorage.getItem('secondary_banner_cta_text') || '', ctaLink: localStorage.getItem('secondary_banner_cta_link') || '/products' }];
          }
        }
        if (msgs.length === 0) return null;

        // MARQUEE
        if (style === 'marquee') {
          const rep = [...msgs, ...msgs];
          const cta = msgs[0]?.ctaText || localStorage.getItem('secondary_banner_cta_text') || '';
          const ctaHref = msgs[0]?.ctaLink || localStorage.getItem('secondary_banner_cta_link') || '/products';
          return (
            <section className="container mx-auto px-4">
              <div className="rounded-[2.5rem] overflow-hidden shadow-xl shadow-purple-500/20 relative" style={{ background: 'linear-gradient(120deg,#3b0764,#6d28d9,#9333ea,#db2777)' }}>
                <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #5b21b6cc, transparent)' }} />
                <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #831843cc, transparent)' }} />
                <div className="flex items-center">
                  <div className="flex-1 overflow-hidden py-5">
                    <div style={{ display: 'flex', gap: '64px', animation: 'heroMarquee 24s linear infinite', whiteSpace: 'nowrap', willChange: 'transform', paddingLeft: '24px' }}>
                      {rep.map((m, i) => (
                        <span key={i} style={{ color: '#fff', flexShrink: 0, fontSize: '12px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>
                          {m.message}<span style={{ opacity: 0.35, margin: '0 0 0 64px', fontSize: '8px', verticalAlign: 'middle' }}>◆</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 pr-5 pl-3 z-20 relative">
                    <button onClick={() => { navigate('/products'); window.scrollTo(0, 0); }} className="bg-white text-purple-700 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap">
                      Shop Now →
                    </button>
                  </div>
                </div>
              </div>
              <style>{`@keyframes heroMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
            </section>
          );
        }

        // GRADIENT — Slide Up
        if (style === 'gradient') return <GBanner msgs={msgs} />;

        // DARK — Auto-slide + Fade combo
        return <DBanner msgs={msgs} />;
      })()}

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shop by Department</h2>
          <button onClick={() => { setSelectedCategory(''); window.scrollTo(0, 0); navigate('/products'); }} className="flex items-center gap-2 text-brand-600 font-black text-sm hover:gap-3 transition-all">
            View All <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {(() => {
            const customCats = JSON.parse(localStorage.getItem('custom_categories') || '[]');
            const allCats = [
              ...CATEGORIES.map(c => ({ id: c.id, name: c.name, icon: c.icon, isCustom: false })),
              ...customCats.map((c: any) => ({ id: c.id || c.name.toLowerCase().replace(/\s+/g, '-'), name: c.name, icon: c.icon || 'fa-tag', isCustom: true }))
            ];
            return allCats.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (!cat.isCustom) { setSelectedCategory(cat.id); window.scrollTo(0, 0); navigate(`/${cat.id}`); }
                  else { window.scrollTo(0, 0); navigate(`/products?customCat=${encodeURIComponent(cat.name)}`); }
                }}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-all font-black text-sm text-gray-600 shadow-sm hover:shadow-md"
              >
                <i className={`fas ${cat.icon} text-xs`}></i>
                {cat.name}
              </button>
            ));
          })()}
        </div>
      </section>

      {/* Flash Sale */}
      <FlashSaleSection />

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight text-gradient">Trending Now</h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">The most coveted items from our global community.</p>
          </div>
          <button onClick={() => navigate('/products?filter=trending')} className="px-8 py-3 rounded-2xl bg-gray-100 font-black text-gray-600 hover:bg-gray-200 transition-all active:scale-95">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {(() => {
            const now = Date.now();
            const sponsoredTrending = JSON.parse(localStorage.getItem('vendor_promotion_requests') || '[]')
              .filter((r: any) =>
                r.status === 'approved' &&
                r.placements?.includes('trending_now') &&
                (!r.expiresAt || new Date(r.expiresAt).getTime() > now)
              )
              .map((r: any) => {
                const found = [...JSON.parse(localStorage.getItem('approved_products') || '[]'), ...PRODUCTS]
                  .find((p: any) => p.id === r.productId);
                return found ? { ...found, image: found.mainImage || found.image || '', isSponsored: true } : null;
              })
              .filter(Boolean)
              .slice(0, 5); // max 4 global slots for trending_now

            const dynamic = JSON.parse(localStorage.getItem('approved_products') || '[]').map((p: any) => ({
              ...p,
              image: p.mainImage || p.image || '',
              reviewsCount: p.reviewsCount || 0,
            }));
            const allProducts = [...dynamic, ...PRODUCTS];
            const seen = new Set<string>();
            const unique = allProducts.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
            const regularTrending = unique
              .filter((p: any) => !sponsoredTrending.find((s: any) => s.id === p.id))
              .sort((a: any, b: any) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
              .slice(0, 5 - sponsoredTrending.length);

            return [...sponsoredTrending, ...regularTrending];
          })().map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onSelect={() => handleSelectProduct(product)}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
                userRole={userRole}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {(() => {
        const newArrivals = JSON.parse(localStorage.getItem('approved_products') || '[]')
          .map((p: any) => ({ ...p, image: p.mainImage || p.image || '' }))
          .slice(0, 4);
        if (newArrivals.length === 0) return null;
        return (
          <section className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
              <div className="max-w-xl">
                <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-brand-600 bg-brand-50 px-4 py-1.5 rounded-full mb-4">Just Added</span>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">New Arrivals</h2>
                <p className="text-lg text-gray-500 font-medium leading-relaxed mt-4">Fresh products from our latest vendors.</p>
              </div>
              <button onClick={() => navigate('/products?filter=new')} className="px-8 py-3 rounded-2xl bg-gray-100 font-black text-gray-600 hover:bg-gray-200 transition-all active:scale-95">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
              {newArrivals.slice(0, 10).map((product: any, idx: number) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onSelect={() => handleSelectProduct(product)}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                    userRole={userRole}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Recently Viewed */}
      {userRole !== 'vendor' && userRole !== 'admin' && recentlyViewed.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full mb-3">Your History</span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Recently Viewed</h2>
            </div>
            <button onClick={() => { localStorage.removeItem('recently_viewed'); setRecentlyViewed([]); }} className="text-xs font-bold text-gray-400 hover:text-red-400 transition-colors">Clear</button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {recentlyViewed.map((product: any) => (
              <div key={product.id} className="flex-shrink-0 w-56">
                <ProductCard
                  product={{ ...product, image: product.mainImage || product.image || '' }}
                  onAddToCart={handleAddToCart}
                  onSelect={() => handleSelectProduct(product)}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                  userRole={userRole}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Promotion */}
      <section className="container mx-auto px-4">
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="relative rounded-[2.5rem] overflow-hidden min-h-[250px] lg:h-[320px] shadow-2xl group border border-gray-100"
        >
          <img src="https://images.unsplash.com/photo-1674027392851-7b34f21b07ee?q=80&w=1200&auto=format&fit=crop" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="Merchant" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-700/90 via-brand-600/60 to-transparent z-10"></div>
          <div className="relative z-20 h-full flex flex-col justify-center p-8 sm:p-10 lg:p-12 items-start text-left">
            {userRole === 'vendor' ? (
              <>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tighter"
                >
                  Welcome back, Merchant!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base sm:text-lg text-white/80 mb-6 max-w-2xl font-medium leading-relaxed"
                >
                  Manage your products, check your orders, and grow your store.
                </motion.p>
                <div className="flex gap-4 flex-wrap">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => navigate('/dashboard')}
                    className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-brand-600 rounded-xl font-black text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                  >
                    Go to Dashboard →
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => navigate('/dashboard/analytics')}
                    className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 text-white border border-white/30 rounded-xl font-black text-sm sm:text-base hover:bg-white/20 transition-all"
                  >
                    View Analytics
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tighter"
                >
                  Ready to scale your brand?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base sm:text-lg text-white/80 mb-6 max-w-2xl font-medium leading-relaxed"
                >
                  Join a trusted marketplace built to help your business grow.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => navigate('/become-vendor')}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-brand-600 rounded-xl font-black text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                  Start Selling Today
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default HomeView;
