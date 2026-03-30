import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../../types';

// The ProductCard component displays a single product in a grid.
// It handles showing badges for "New Arrival" and discounts.
const ProductCard: React.FC<{ 
  product: Product
}> = ({ product }) => {
  // Calculate the discount percentage to show on the UI
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <motion.div 
      whileHover={{ y: -8, boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)" }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full relative"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.image || 'https://via.placeholder.com/400x400?text=Product'} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          alt={product.name} 
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {product.isNew && <span className="gradient-success text-white text-[7px] font-black uppercase px-2 py-1 rounded-full shadow-lg">New Arrival</span>}
          {product.isSale && <span className="gradient-danger text-white text-[7px] font-black uppercase px-2 py-1 rounded-full shadow-lg">-{discount}% Off</span>}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-1.5">
          <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest">
            {product.vendor} {product.subcategory && <span className="text-gray-400 mx-1">•</span>} {product.subcategory}
          </span>
        </div>
        <h3 className="text-xs font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-base font-black text-gray-900">৳{product.price.toLocaleString()}</span>
                {product.isSale && (
                  <span className="text-[9px] text-rose-500 font-bold">-{discount}%</span>
                )}
              </div>
              {product.isSale && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-300 line-through font-bold">৳{product.originalPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map(s => <i key={s} className={`fas fa-star text-[7px] ${s <= Math.floor(product.rating) ? '' : 'text-gray-100'}`}></i>)}
            </div>
            {product.rating > 0 && (
              <span className="text-[9px] font-black text-gray-700">{product.rating.toFixed(1)}</span>
            )}
            <span className="text-[8px] font-bold text-gray-400">({product.reviewsCount})</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
