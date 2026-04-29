import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../../types';
import { PRODUCTS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';

const FlashSaleSection: React.FC = () => {
  const { user } = useAuth();
  const { handleAddToCart } = useCart();
  const { handleSelectProduct } = useApp();
  const userRole = user?.role;

  const dynamicProducts = JSON.parse(localStorage.getItem('approved_products') || '[]');
  const allProducts = [
    ...PRODUCTS,
    ...dynamicProducts.map((p: any) => {
      const price = parseFloat(p.price) || 0;
      const originalPrice = parseFloat(p.originalPrice) || Math.round(price * 1.2);
      const isSale = p.isSale === true || p.isSale === 'true';
      const rating = typeof p.rating === 'number' ? p.rating : (parseFloat(p.rating) || 0);
      return {
        ...p,
        price,
        originalPrice,
        isSale,
        dealType: p.dealType || (isSale ? 'flash' : 'none'),
        rating,
        reviewsCount: p.reviewsCount || 0,
        image: p.image || p.mainImage || '',
        name: p.productName || p.name || '',
      };
    })
  ];
  const now = Date.now();
  const rawPinned = JSON.parse(localStorage.getItem('flash_pinned_products') || '[]');
  const pinnedIds: string[] = rawPinned.map((x: any) =>
    typeof x === 'string' ? x : x.id
  ).filter((id: string) => {
    const item = rawPinned.find((x: any) => (typeof x === 'string' ? x : x.id) === id);
    if (!item || typeof item === 'string') return true;
    return (now - new Date(item.pinnedAt).getTime()) < 3 * 24 * 60 * 60 * 1000;
  });
  const sponsoredFlash = JSON.parse(localStorage.getItem('vendor_promotion_requests') || '[]')
    .filter((r: any) =>
      r.status === 'approved' &&
      r.placements?.includes('flash_deals') &&
      (!r.expiresAt || new Date(r.expiresAt).getTime() > now)
    )
    .map((r: any) => {
      const product = allProducts.find((p: any) => p.id === r.productId);
      return product ? { ...product, isSponsored: true } : null;
    })
    .filter(Boolean)
    .slice(0, 3);

  const regularFlash = pinnedIds.length > 0
    ? pinnedIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean) as typeof allProducts
    : allProducts.filter(p => (p as any).dealType === 'flash');

  const flashProducts = sponsoredFlash.length > 0
    ? [...sponsoredFlash, ...regularFlash.filter((p: any) => !sponsoredFlash.find((s: any) => s.id === p.id))].slice(0, 3)
    : regularFlash.slice(0, 3);



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

          </div>

          <div className="lg:w-2/3">
            {flashProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-bolt text-2xl text-white/20"></i>
                  </div>
                  <p className="text-white/40 font-black text-xs uppercase tracking-widest">No active flash deals</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {flashProducts.map((p) => {
                  const discount = Math.round((1 - p.price / p.originalPrice) * 100);
                  return (
                    <motion.div 
                      key={p.id}
                      whileHover={{ y: -5 }}
                      className="bg-white/10 border border-white/10 rounded-[1.5rem] p-3 flex flex-col group/card shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 mb-3 cursor-pointer" onClick={() => handleSelectProduct(p)}>
                        <img src={p.image || 'https://via.placeholder.com/400x400?text=Product'} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" alt={p.name} />
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full z-20 shadow-md">
                          -{discount}%
                        </div>
                      </div>
                      <h3 className="font-bold text-white mb-1 text-xs truncate cursor-pointer hover:text-brand-400 transition-colors" onClick={() => handleSelectProduct(p)}>{p.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">৳{p.price.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 line-through font-bold">৳{p.originalPrice.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSection;
