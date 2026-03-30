import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '../../constants';
import FlashSaleSection from './FlashSaleSection';
import ProductCard from '../../components/product/ProductCard';
import { useAuth } from '../../context/AuthContext';

// Landing page
const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role;

  // State for the Hero Slider
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
      img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop',
      title: 'Best Gadget and Gear',
      sub: 'Grab the best gadgets and gear from the most trusted sellers.'
    }
  ];

  // Automatically advance the hero slider every 8 seconds
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => setSlide(s => (s + 1) % slides.length), 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
                src={slides[slide].img} 
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
                  <button className="px-8 sm:px-12 py-4 sm:py-5 gradient-primary text-white rounded-2xl font-black text-base sm:text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-500/30">
                    Explore Shop
                  </button>
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

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shop by Department</h2>
          <button className="flex items-center gap-2 text-brand-600 font-black text-sm hover:gap-3 transition-all">
            View All <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat: any) => (
            <button
              key={cat.id}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-all font-black text-sm text-gray-600 shadow-sm hover:shadow-md"
            >
              <i className={`fas ${cat.icon} text-xs`}></i>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <FlashSaleSection />

      {/* Trending Products */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight text-gradient">Trending Now</h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">The most coveted items from our global community.</p>
          </div>
          <button className="px-8 py-3 rounded-2xl bg-gray-100 font-black text-gray-600 hover:bg-gray-200 transition-all active:scale-95">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {PRODUCTS.slice(0, 4).map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Promotion */}
      <section className="container mx-auto px-4">
        <motion.div 
          whileHover={{ scale: 1.005 }}
          className="relative rounded-[3rem] overflow-hidden min-h-[400px] lg:h-[450px] shadow-2xl group border border-gray-100"
        >
          <img src="https://images.unsplash.com/photo-1674027392851-7b34f21b07ee?q=80&w=1200&auto=format&fit=crop" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="Merchant" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-700/90 via-brand-600/60 to-transparent z-10"></div>
          <div className="relative z-20 h-full flex flex-col justify-center p-8 sm:p-12 lg:p-20 items-start text-left">
            {userRole === 'vendor' ? (
              <>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-3xl sm:text-4xl lg:text-6xl font-black text-white mb-4 tracking-tighter"
                >
                  Welcome back, Merchant!
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base sm:text-lg lg:text-xl text-white/80 mb-8 max-w-2xl font-medium leading-relaxed"
                >
                  Manage your products, check your orders, and grow your store.
                </motion.p>
                <div className="flex flex-wrap gap-4">
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => navigate('/dashboard')} 
                    className="px-8 sm:px-12 py-4 sm:py-5 bg-white text-brand-600 rounded-2xl font-black text-base sm:text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
                  >
                    Go to Dashboard →
                  </motion.button>
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => navigate('/dashboard')} 
                    className="px-8 sm:px-12 py-4 sm:py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-base sm:text-lg hover:bg-white/20 transition-all"
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
                  className="text-3xl sm:text-4xl lg:text-6xl font-black text-white mb-4 tracking-tighter"
                >
                  Ready to scale your brand?
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base sm:text-lg lg:text-xl text-white/80 mb-8 max-w-2xl font-medium leading-relaxed"
                >
                  Join a trusted marketplace built to help your business grow.
                </motion.p>
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => navigate('/affiliate-program')} 
                  className="px-8 sm:px-12 py-4 sm:py-5 bg-white text-brand-600 rounded-2xl font-black text-base sm:text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
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
