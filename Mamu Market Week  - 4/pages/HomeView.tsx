import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewType, Product } from '../types';
import { PRODUCTS, CATEGORIES } from '../constants';
import FlashSaleSection from '../components/FlashSaleSection';
import ProductCard from '../components/ProductCard';

const HomeView: React.FC<{ 
  setView: (v: ViewType) => void, 
  onAddToCart: (p: Product) => void,
  onSelectProduct: (p: Product) => void,
  onToggleWishlist: (id: string) => void,
  wishlist: string[],
  onSelectCategory: (id: string | null) => void,
  onSelectFilter: (filter: string) => void,
  onSelectDealType: (type: 'daily' | 'weekly' | 'monthly' | 'flash') => void,
  userRole?: string
}> = ({ setView, onAddToCart, onSelectProduct, onToggleWishlist, wishlist, onSelectCategory, onSelectFilter, onSelectDealType, userRole }) => {
  const [slide, setSlide] = useState(0);
  const slides = [
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
      img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1170&auto=format&fit=crop',
      title: 'Best Gadget and Gear',
      sub: 'Grab the best gadgets and gear from the most trusted sellers.'
    },
    {
      img: 'https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=1169&auto=format&fit=crop',
      title: 'Elevate Your Space in Style',
      sub: 'Premium furniture curated for modern living.'
    },
    {
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1170&auto=format&fit=crop',
      title: 'Glow with Confidence',
      sub: 'Premium beauty and health essentials for your everyday well-being.'
    },
    {
      img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1074&auto=format&fit=crop',
      title: 'Define Your Style',
      sub: 'Fashion that speaks confidence, comfort, and individuality.' 
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % slides.length), 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-24 pb-32"
    >
      {/* Hero */}
      <section className="container mx-auto px-4 pt-8">
        <div className="relative h-[500px] lg:h-[700px] rounded-[3rem] overflow-hidden shadow-2xl group bg-black">
          <AnimatePresence initial={false}>
            <motion.div
              key={slide}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="absolute inset-0 bg-black/40 z-10"></div>
              <motion.img 
                initial={{ x: '20%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.8, ease: "linear" }}
                src={slides[slide].img} 
                referrerPolicy="no-referrer" 
                className="absolute inset-0 w-full h-full object-cover" 
                alt="Hero" 
              />
              <div className="relative z-20 h-full flex flex-col justify-center px-12 lg:px-32 max-w-5xl">
                <motion.span 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="gradient-success text-white text-[11px] font-black uppercase tracking-[0.4em] px-6 py-2.5 rounded-full w-fit mb-8 shadow-xl shadow-emerald-500/20"
                >
                  New Season Arrival
                </motion.span>
                <motion.h1 
                  initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-6xl lg:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter text-balance"
                >
                  {slides[slide].title}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="text-xl lg:text-2xl text-white/80 mb-12 max-w-2xl font-medium leading-relaxed text-balance"
                >
                  {slides[slide].sub}
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="flex flex-wrap gap-6"
                >
                  <button onClick={() => setView('products')} className="px-12 py-5 gradient-primary text-white rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-500/30">
                    Explore Shop
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-12 right-12 z-20 flex gap-3">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setSlide(i)} 
                className={`h-1.5 rounded-full transition-all duration-500 ${slide === i ? 'w-12 bg-white' : 'w-3 bg-white/30 hover:bg-white/50'}`} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight text-gradient">Shop by Department</h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">Curated collections from the world's most innovative vendors.</p>
          </div>
          <button onClick={() => setView('products')} className="group flex items-center gap-3 text-brand-600 font-black uppercase tracking-widest text-sm hover:gap-5 transition-all text-gradient">
            View All Categories <i className="fas fa-arrow-right"></i>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {CATEGORIES.map((cat, idx) => (
            <motion.button 
              key={cat.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => { onSelectCategory(cat.id); setView('products'); }}
              className="group relative bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-24 h-24 rounded-[2rem] bg-grad-soft flex items-center justify-center text-brand-600 mb-8 group-hover:scale-110 gradient-primary group-hover:text-white transition-all duration-500">
                <i className={`fas ${cat.icon} text-4xl`}></i>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{cat.name}</h3>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <FlashSaleSection
        setView={setView}
        onAddToCart={onAddToCart}
        onSelectProduct={onSelectProduct}
        onSelectFilter={onSelectFilter}
        onSelectDealType={onSelectDealType}
        userRole={userRole}
      />

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight text-gradient">Trending Now</h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">The most coveted items from our global community.</p>
          </div>
          <button onClick={() => setView('products')} className="px-8 py-3 rounded-2xl bg-gray-100 font-black text-gray-600 hover:bg-gray-200 transition-all active:scale-95">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {PRODUCTS.slice(0, 4).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <ProductCard 
                product={product} 
                onAddToCart={onAddToCart} 
                onSelect={() => { onSelectProduct(product); setView('product-details'); }}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
                userRole={userRole}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Promotion */}
      <section className="container mx-auto px-4">
        <motion.div 
          whileHover={{ scale: 1.005 }}
          className="relative rounded-[3rem] overflow-hidden h-[300px] lg:h-[400px] shadow-2xl group border border-gray-100"
        >
          <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="Merchant" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-700/90 via-brand-600/60 to-transparent z-10"></div>
          <div className="relative z-20 h-full flex flex-col justify-center p-12 lg:p-20 items-start text-left">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl lg:text-6xl font-black text-white mb-4 tracking-tighter"
            >
              Ready to scale your brand?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-white/80 mb-8 max-w-2xl font-medium leading-relaxed"
            >
              Join the world's most sophisticated marketplace and reach millions of customers instantly.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setView('become-vendor')} 
              className="px-12 py-5 bg-white text-brand-600 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
            >
              Join Affiliate Program
            </motion.button>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default HomeView;
