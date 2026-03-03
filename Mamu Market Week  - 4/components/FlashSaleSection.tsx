import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ViewType, Product } from '../types';
import { PRODUCTS } from '../constants';

const FlashSaleSection: React.FC<{
  setView: (v: ViewType) => void,
  onAddToCart: (p: Product) => void,
  onSelectProduct: (p: Product) => void,
  onSelectFilter: (filter: string) => void,
  onSelectDealType: (type: 'daily' | 'weekly' | 'monthly' | 'flash') => void,
  userRole?: string
}> = ({ setView, onAddToCart, onSelectProduct, onSelectFilter, onSelectDealType, userRole }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 16 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = PRODUCTS.filter(p => p.isSale).slice(0, 3);

  return (
    <section className="container mx-auto px-4">
      <div className="bg-gray-900 rounded-[3.5rem] p-10 lg:p-16 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-600/10 blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3 space-y-10">
            <div>
              <div 
                className="inline-flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full mb-6"
                style={{ background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' }}
              >
                <i className="fas fa-bolt"></i> Flash Sale
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter leading-tight mb-6">Limited Time Offers</h2>
              <p className="text-gray-400 font-medium text-lg leading-relaxed">Grab these exclusive deals before they vanish. High-quality products at unbeatable prices.</p>
            </div>

            <div className="flex items-center gap-4">
              {[
                { label: 'Hrs', val: timeLeft.hours },
                { label: 'Min', val: timeLeft.minutes },
                { label: 'Sec', val: timeLeft.seconds }
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-white mb-2">
                    {String(t.val).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { onSelectDealType('flash'); setView('deals'); }}
              className="w-full py-5 bg-white text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-grad-soft transition-all shadow-2xl shadow-black/20"
            >
              View All Deals
            </button>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {flashProducts.map((p) => {
              const discount = Math.round((1 - p.price / p.originalPrice) * 100);
              const soldCount = Math.floor(Math.random() * 40) + 60;
              
              return (
                <motion.div 
                  key={p.id}
                  whileHover={{ y: -10 }}
                  className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col group/card"
                >
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5 mb-6 cursor-pointer" onClick={() => onSelectProduct(p)}>
                    <img src={p.image} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" alt={p.name} />
                    <div className="absolute top-4 left-4 gradient-danger text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full z-20 shadow-lg">
                      -{discount}%
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-2 truncate cursor-pointer hover:text-brand-400 transition-colors" onClick={() => onSelectProduct(p)}>{p.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-white">৳{p.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 line-through font-bold">৳{p.originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-500">Sold: <span className="text-white">{soldCount}%</span></span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full gradient-primary" style={{ width: `${soldCount}%` }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSection;
