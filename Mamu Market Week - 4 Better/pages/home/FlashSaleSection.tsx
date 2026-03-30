import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PRODUCTS } from '../../constants';

// For showing flash sale section on the home page & realtime countdown
const FlashSaleSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // This is for to countdown timer every second
  useEffect(() => {
    const updateTimer = () => {
      const endStr = localStorage.getItem('deal_end_time_daily');
      if (!endStr) return;
      const diff = new Date(endStr).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter the main product list to only show items marked as 'isSale'
  const flashProducts = PRODUCTS.filter(p => p.isSale).slice(0, 3);

  return (
    <section className="container mx-auto px-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[3rem] p-8 lg:p-12 overflow-hidden relative group shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-600/10 blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          <div className="lg:w-1/3 space-y-8">
            <div>
              <div 
                className="inline-flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full mb-4"
                style={{ background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' }}
              >
                <i className="fas fa-bolt"></i> Flash Deal
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter leading-tight mb-4">Flash Deals</h2>
              <p className="text-gray-300 font-medium text-base leading-relaxed">Limited-time offers — grab them before they're gone.</p>
            </div>

            <div className="flex items-center gap-4">
              {[
                { label: 'Hrs', val: timeLeft.hours },
                { label: 'Min', val: timeLeft.minutes },
                { label: 'Sec', val: timeLeft.seconds }
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center bg-white/5 rounded-xl p-3 min-w-[60px]">
                  <div className="text-2xl font-black text-white mb-0.5">
                    {String(t.val).padStart(2, '0')}
                  </div>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.label}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-white text-gray-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg">
              View All Deals
            </button>
          </div>

          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashProducts.map((p) => {
                const discount = Math.round((1 - p.price / p.originalPrice) * 100);
                return (
                  <motion.div 
                    key={p.id}
                    whileHover={{ y: -5 }}
                    className="bg-white/10 border border-white/10 rounded-[1.5rem] p-3 flex flex-col group/card shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 mb-3">
                      <img src={p.image || 'https://via.placeholder.com/400x400?text=Product'} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" alt={p.name} />
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full z-20 shadow-md">
                        -{discount}%
                      </div>
                    </div>
                    <h3 className="font-bold text-white mb-1 text-xs truncate hover:text-brand-400 transition-colors">{p.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">৳{p.price.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 line-through font-bold">৳{p.originalPrice.toLocaleString()}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSection;
