import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';

const ProductCard: React.FC<{ 
  product: Product, 
  onAddToCart: (p: Product) => void, 
  onSelect: (id: string) => void,
  onToggleWishlist: (id: string) => void,
  isWishlisted: boolean,
  userRole?: string,
  viewMode?: 'grid' | 'list'
}> = ({ product, onAddToCart, onSelect, onToggleWishlist, isWishlisted, userRole, viewMode = 'grid' }) => {
  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0]?.name || null);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  const handleColorClick = (e: React.MouseEvent, color: { name: string, image: string }) => {
    e.stopPropagation();
    setSelectedColor(color.name);
    setActiveImage(color.image);
  };
  
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-row items-center p-5 gap-8 relative hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(product.id)}>
        <div className="w-44 h-44 overflow-hidden bg-gray-50 rounded-xl shrink-0 relative">
          <img src={activeImage} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={product.name} />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {product.isNew && <span className="gradient-success text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg">New Arrival</span>}
            {product.isSale && <span className="gradient-danger text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg">-{discount}% Off</span>}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-black text-gray-900 mb-1 leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-gray-400 font-medium mb-4">{product.vendor}</p>
          
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-gray-900">৳{product.price.toLocaleString()}</span>
            {product.isSale && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300 line-through font-bold">৳{product.originalPrice.toLocaleString()}</span>
                <span className="text-xs text-rose-500 font-bold">-{discount}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -8, boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)" }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full relative cursor-pointer"
      onClick={() => onSelect(product.id)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={activeImage} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          alt={product.name} 
        />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {product.isNew && <span className="gradient-success text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">New Arrival</span>}
          {product.isSale && <span className="gradient-danger text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">-{discount}% Off</span>}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
            {product.vendor}
          </span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-black text-gray-900">৳{product.price.toLocaleString()}</span>
            {product.isSale && (
              <span className="text-[10px] text-rose-500 font-bold">-{discount}%</span>
            )}
          </div>
          {product.isSale && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300 line-through font-bold">৳{product.originalPrice.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 mt-3">
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map(s => <i key={s} className={`fas fa-star text-[8px] ${s <= Math.floor(product.rating) ? '' : 'text-gray-100'}`}></i>)}
            </div>
            <span className="text-[9px] font-bold text-gray-400">({product.reviewsCount})</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
