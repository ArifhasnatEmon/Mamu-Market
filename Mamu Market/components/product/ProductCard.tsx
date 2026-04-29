import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../../types';

const ProductCard: React.FC<{ 
  product: Product, 
  onAddToCart: (p: Product) => void, 
  onSelect: (id: string) => void,
  onToggleWishlist: (id: string) => void,
  isWishlisted: boolean,
  isSponsored?: boolean,
  userRole?: string,
  viewMode?: 'grid' | 'list'
}> = ({ product, onAddToCart, onSelect, onToggleWishlist, isWishlisted, isSponsored, userRole, viewMode = 'grid' }) => {
  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0]?.name || null);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  const resolvedVendorName = React.useMemo(() => {
    if (!product.vendorId) return product.vendor;
    try {
      const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
      const vendorUser = users.find((u: any) => u.id === product.vendorId);
      return vendorUser?.storeName || vendorUser?.name || product.vendor;
    } catch {
      return product.vendor;
    }
  }, [product.vendorId, product.vendor]);

  const handleColorClick = (e: React.MouseEvent, color: { name: string, image: string }) => {
    e.stopPropagation();
    setSelectedColor(color.name);
    setActiveImage(color.image);
  };
  
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-row items-center p-5 gap-8 relative hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(product.id)}>
        <div className="w-44 h-44 overflow-hidden bg-gray-50 rounded-xl shrink-0 relative">
          <img src={activeImage || 'https://via.placeholder.com/400x400?text=Product'} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={product.name} />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {product.isNew && <span className="gradient-success text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg">New Arrival</span>}
            {product.isSale && <span className="gradient-danger text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg">-{discount}% Off</span>}

          </div>
          {((product.inStock === false || (product.inStock as any) === 'false') || (product.stock !== undefined && product.stock <= 0) || product.isDiscontinued) && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center pointer-events-none">
              <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest text-white shadow-md ${product.isDiscontinued ? 'bg-gray-800' : 'bg-red-500'}`}>
                {product.isDiscontinued ? 'Discontinued' : 'Out of Stock'}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-black text-gray-900 mb-1 leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-gray-400 font-medium mb-4">
            {resolvedVendorName} {product.subcategory && <span className="mx-1">•</span>} {product.subcategory}
          </p>
          
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
      className={`group bg-white rounded-3xl overflow-hidden border ${isSponsored ? 'border-amber-400 border-2' : 'border-gray-100'} shadow-sm hover:shadow-xl transition-all flex flex-col h-full relative cursor-pointer`}
      onClick={() => onSelect(product.id)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={activeImage || 'https://via.placeholder.com/400x400?text=Product'} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          alt={product.name} 
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {product.isNew && <span className="gradient-success text-white text-[7px] font-black uppercase px-2 py-1 rounded-full shadow-lg">New Arrival</span>}
          {product.isSale && <span className="gradient-danger text-white text-[7px] font-black uppercase px-2 py-1 rounded-full shadow-lg">-{discount}% Off</span>}

        </div>
        {((product.inStock === false || (product.inStock as any) === 'false') || (product.stock !== undefined && product.stock <= 0) || product.isDiscontinued) && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest text-white shadow-md ${product.isDiscontinued ? 'bg-gray-800' : 'bg-red-500'}`}>
              {product.isDiscontinued ? 'Discontinued' : 'Out of Stock'}
            </div>
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-white'}`}
        >
          <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-xs`}></i>
        </button>
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <div className="mb-1.5">
          <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest">
            {resolvedVendorName} {product.subcategory && <span className="text-gray-400 mx-1">•</span>} {product.subcategory}
          </span>
        </div>
        <h3 className="text-xs font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-black text-gray-900">৳{product.price.toLocaleString()}</span>
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
          

        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
