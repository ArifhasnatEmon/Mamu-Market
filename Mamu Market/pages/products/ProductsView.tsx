import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Product, Vendor } from '../../types';
import { PRODUCTS, VENDORS, CATEGORIES, getCategoryName } from '../../constants';
import ProductCard from '../../components/product/ProductCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { safeGet } from '../../utils/storage';

const ProductsView: React.FC<{ 
  initialCategory?: string | null,
  initialSubCategory?: string | null,
  initialFilter?: string | null,
}> = ({ initialCategory, initialSubCategory, initialFilter }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleAddToCart } = useCart();
  const { 
    wishlist, handleToggleWishlist, searchQuery, 
    handleSelectProduct
  } = useApp();
  const userRole = user?.role;
  const savedFilters = (() => { try { return JSON.parse(localStorage.getItem('product_filters') || '{}'); } catch { return {}; } })();
  const [minPrice, setMinPrice] = useState<number>(savedFilters.minPrice ?? 0);
  const [maxPrice, setMaxPrice] = useState<number>(savedFilters.maxPrice ?? 500000);

  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [onlyOnSale, setOnlyOnSale] = useState<boolean>(savedFilters.onlyOnSale ?? false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(initialCategory || null);
  const [selectedSubCat, setSelectedSubCat] = useState<string | null>(initialSubCategory || null);
  const [sortBy, setSortBy] = useState<string>(savedFilters.sortBy ?? 'newest');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>(savedFilters.stockFilter ?? 'all');
  const [expandedCats, setExpandedCats] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(savedFilters.viewMode ?? 'grid');
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const customCatParam = searchParams.get('customCat');
  const customSubParam = searchParams.get('customSub');
  const filterParam = searchParams.get('filter');
  const BATCH_SIZE = 9;

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setVisibleCount(9);
    localStorage.setItem('product_filters', JSON.stringify({ minPrice, maxPrice, onlyOnSale, sortBy, stockFilter, viewMode }));
  }, [selectedCat, selectedSubCat, minPrice, maxPrice, sortBy, stockFilter, searchQuery, selectedVendors, onlyOnSale, wishlistOnly, customCatParam, customSubParam, viewMode]);

  useEffect(() => {
    const checkSentinel = () => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return;
      const rect = sentinel.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 300) {
        setVisibleCount(prev => prev + BATCH_SIZE);
      }
    };
    window.addEventListener('scroll', checkSentinel, { passive: true });
    return () => window.removeEventListener('scroll', checkSentinel);
  }, []);

  useEffect(() => {
    setSelectedCat(initialCategory || null);
    setSelectedSubCat(initialSubCategory || null);
    if (initialCategory) {
      setExpandedCats(prev => prev.includes(initialCategory) ? prev : [...prev, initialCategory]);
    }
  }, [initialCategory, initialSubCategory]);

  const toggleExpand = (catId: string) => {
    setExpandedCats(prev => 
      prev.includes(catId) ? [] : [catId]
    );
  };

  const dynamicProds = useMemo(() => {
    const raw: any[] = safeGet('approved_products', []);
    return raw.map((p: any) => {
      const price = parseFloat(p.price) || 0;
      const originalPrice = parseFloat(p.originalPrice) || Math.round(price * 1.2);
      const rating = typeof p.rating === 'number' ? p.rating : (parseFloat(p.rating) || 0);
      return {
        ...p,
        id: p.id,
        name: p.productName || p.name || '',
        price,
        originalPrice,
        isSale: p.isSale === true || p.isSale === 'true',
        image: p.image || p.mainImage || `https://picsum.photos/seed/${p.id}/400/400`,
        images: [p.mainImage, p.extraImage1, p.extraImage2, p.extraImage3].filter(Boolean),
        categoryId: p.category?.toLowerCase().replace(/\s+/g, '-') || 'general',
        subcategory: p.subCategory || p.subcategory || '',
        category: getCategoryName(p.category) || p.category || 'General',
        vendorId: p.vendorId,
        vendor: p.storeName || p.vendorId || '',
        isNew: (() => {
          if (p.isNew === false || p.isNew === 'false') return false;
          const added = p.approvedAt || p.createdAt;
          if (!added) return false;
          return (Date.now() - new Date(added).getTime()) / (1000 * 60 * 60 * 24) <= 30;
        })(),
        inStock: p.inStock !== false && p.inStock !== 'false' && (Number(p.units) || 0) > 0,
        description: p.description || '',
        colors: p.colors || []
      };
    });
  }, []);

  const allProducts = useMemo(() => [...PRODUCTS, ...dynamicProds], [dynamicProds]);

  const filtered = useMemo(() => {
    return allProducts.filter(p => {
      if (selectedCat && p.categoryId !== selectedCat) return false;
      if (customCatParam && !selectedCat) {
        const productCat = (p.category || p.categoryName || '').toLowerCase();
        if (productCat !== customCatParam.toLowerCase()) return false;
      }
      if (customSubParam) {
        const productSub = (p.subCategory || p.subcategory || p.subCategoryName || '').toLowerCase();
        if (productSub !== customSubParam.toLowerCase()) return false;
      }
      if (selectedSubCat && p.subcategory?.toLowerCase() !== selectedSubCat.toLowerCase()) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      const activeFilter = initialFilter || filterParam;
      if (selectedVendors.length > 0 && !selectedVendors.includes(p.vendorId)) return false;
      if (onlyOnSale && !p.isSale) return false;
      if (wishlistOnly && !wishlist.includes(p.id)) return false;
      
      if (activeFilter === 'new' && !p.isNew) return false;
      if (activeFilter === 'deals' && !p.isSale) return false;
      if (activeFilter === 'daily' && (!p.isSale || p.price > 3000)) return false;
      if (activeFilter === 'weekly' && (!p.isSale || (p.price > 2000 && p.price < 5000))) return false;
      if (activeFilter === 'monthly' && (!p.isSale || p.price < 2000)) return false;
      if (activeFilter === 'official' && !p.vendor.includes('Official') && !['v1', 'v2'].includes(p.vendorId)) return false;

      if (stockFilter === 'in' && !p.inStock) return false;
      if (stockFilter === 'out' && p.inStock) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q) || 
          p.category.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.keywords?.some((k: any) => k.toLowerCase().includes(q))
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'discount') {
        const discA = a.isSale ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.isSale ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      }
      const aNum = parseInt(String(a.id));
      const bNum = parseInt(String(b.id));
      const aIsNew = !isNaN(aNum);
      const bIsNew = !isNaN(bNum);
      if (aIsNew && bIsNew) return bNum - aNum;
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      return 0;
    });
  }, [allProducts, selectedCat, customCatParam, customSubParam, selectedSubCat, minPrice, maxPrice, selectedVendors, onlyOnSale, wishlistOnly, initialFilter, filterParam, stockFilter, searchQuery, sortBy, wishlist]);

  const sponsoredCats = useMemo(() => {
    const nowTs = Date.now();
    const requests: any[] = safeGet('vendor_promotion_requests', []);
    return requests.filter((r: any) =>
        r.status === 'approved' &&
        r.placements?.includes('all_categories') &&
        (!r.expiresAt || new Date(r.expiresAt).getTime() > nowTs)
      )
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((r: any) => {
        const found = allProducts.find((p: any) => p.id === r.productId);
        return found ? { ...found, isSponsored: true } : null;
      })
      .filter(Boolean);
  }, [allProducts]);

  const sponsoredIds = useMemo(() => new Set(sponsoredCats.map((p: any) => p.id)), [sponsoredCats]);
  const finalProducts = useMemo(() => [
    ...sponsoredCats,
    ...filtered.filter((p: any) => !sponsoredIds.has(p.id))
  ], [sponsoredCats, filtered, sponsoredIds]);

  const visibleProducts = useMemo(() => finalProducts.slice(0, visibleCount), [finalProducts, visibleCount]);
  const hasMore = useMemo(() => visibleCount < finalProducts.length, [visibleCount, finalProducts.length]);

  const dynamicVendors = useMemo(() => {
    const users: any[] = safeGet('mamu_users', []);
    return users.filter((u: any) => u.role === 'vendor' && (u.status === 'approved' || u.status === 'active'))
      .map((u: any): Vendor => ({
        id: u.id,
        name: u.storeName || u.name,
        logo: u.avatar || '',
        category: u.storeCategory || 'General',
        rating: u.rating || 0,
        productsCount: u.productsCount || 0,
        verified: u.verified || false,
      }));
  }, []);
  const staticIds = useMemo(() => new Set(VENDORS.map((v: any) => v.id)), []);
  const allVendorsList = useMemo(() => [...VENDORS, ...dynamicVendors.filter((v: any) => !staticIds.has(v.id))], [dynamicVendors, staticIds]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-16"
    >
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between gap-4 mb-8">
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="flex-1 py-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest text-gray-900 shadow-sm"
          >
            <i className="fas fa-filter text-brand-600"></i>
            Filter & Sort
          </button>
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400'}`}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400'}`}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`lg:w-80 shrink-0 ${showMobileFilters ? 'fixed inset-0 z-[100] bg-white p-8 overflow-y-auto' : 'hidden lg:block'}`}>
          {showMobileFilters && (
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <h2 className="text-2xl font-black text-gray-900">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          <div className="sticky top-24 h-[calc(100vh-110px)] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-10">
              <div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Categories</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => { navigate('/products'); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-bold transition-all ${!selectedCat && !customCatParam ? 'bg-brand-50 shadow-sm text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${!selectedCat && !customCatParam ? 'bg-white text-brand-600 shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                        <i className="fas fa-layer-group text-[10px]"></i>
                      </div>
                      <span>All Categories</span>
                    </div>
                  </button>
                  
                  {CATEGORIES.map(cat => (
                    <div key={cat.id} className="space-y-1">
                      <button 
                        onClick={() => {
                          if (selectedCat === cat.id) {
                            toggleExpand(cat.id);
                          } else {
                            navigate(`/${cat.id}`);
                            toggleExpand(cat.id);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-bold transition-all ${selectedCat === cat.id ? 'bg-brand-50 shadow-sm text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${selectedCat === cat.id ? 'bg-white text-brand-600 shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                            <i className={`fas ${cat.icon} text-[10px]`}></i>
                          </div>
                          <span>{cat.name}</span>
                        </div>
                        <i className={`fas fa-chevron-right text-[8px] transition-transform text-gray-400 ${expandedCats.includes(cat.id) ? 'rotate-90' : ''}`}></i>
                      </button>
                      
                      <AnimatePresence>
                        {expandedCats.includes(cat.id) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-[3.25rem] space-y-1 pb-2"
                          >
                            {cat.subcategories?.map(sub => (
                              <button 
                                key={sub.name} 
                                onClick={() => {
                                  if (selectedSubCat === sub.name) {
                                    navigate(`/${cat.id}`);
                                  } else {
                                    navigate(`/${cat.id}/${sub.id}`);
                                  }
                                }}
                                className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-colors ${selectedSubCat === sub.name ? 'bg-brand-50 text-brand-700' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                              >
                                {selectedSubCat === sub.name && <div className="w-1 h-1 rounded-full bg-brand-600 mr-2"></div>}
                                <span>{sub.name}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                  {(() => {
                    const customCats = JSON.parse(localStorage.getItem('custom_categories') || '[]');
                    const params = new URLSearchParams(window.location.search);
                    const activeCat = params.get('customCat');
                    return customCats.map((cat: any) => (
                      <div key={cat.id} className="space-y-1">
                        <button
                          onClick={() => {
                            if (activeCat === cat.name) {
                              navigate('/products');
                            } else {
                              navigate('/products?customCat=' + encodeURIComponent(cat.name));
                              window.scrollTo(0, 0);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeCat === cat.name ? 'bg-brand-50 shadow-sm text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${activeCat === cat.name ? 'bg-white text-brand-600 shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                              <i className={`fas ${cat.icon || 'fa-folder'} text-[10px]`}></i>
                            </div>
                            <span>{cat.name}</span>
                          </div>
                          <i className={`fas fa-chevron-right text-[8px] transition-transform text-gray-400 ${activeCat === cat.name ? 'rotate-90' : ''}`}></i>
                        </button>
                        {activeCat === cat.name && (cat.subs || []).length > 0 && (
                          <div className="pl-[3.25rem] space-y-1 pb-2">
                            {(cat.subs || []).map((sub: any) => (
                              <button
                                key={sub.id}
                                onClick={() => navigate('/products?customCat=' + encodeURIComponent(cat.name) + '&customSub=' + encodeURIComponent(sub.name))}
                                className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-colors ${params.get('customSub') === sub.name ? 'bg-brand-50 text-brand-700' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                              >
                                {params.get('customSub') === sub.name && <div className="w-1 h-1 rounded-full bg-brand-600 mr-2"></div>}
                                <span>{sub.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Price Range</h3>
                <div className="px-2 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Min</label>
                      <input 
                        type="number" 
                        value={minPrice === 0 ? '' : minPrice} 
                        onChange={(e) => setMinPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Max</label>
                      <input 
                        type="number" 
                        value={maxPrice === 500000 ? '' : maxPrice} 
                        onChange={(e) => setMaxPrice(e.target.value === '' ? 500000 : Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                  <div className="relative h-1.5 bg-gray-100 rounded-lg">
                    <div 
                      className="absolute top-0 left-0 h-full bg-brand-600 rounded-lg"
                      style={{ 
                        left: `${(minPrice / 500000) * 100}%`,
                        width: `${((maxPrice - minPrice) / 500000) * 100}%` 
                      }}
                    ></div>
                    <input 
                      type="range" min="0" max="500000" step="1000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                      className="absolute top-0 left-0 w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-brand-600 z-10 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                    />
                    <input 
                      type="range" min="0" max="500000" step="1000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                      className="absolute top-0 left-0 w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-brand-600 z-10 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Availability</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'in', label: 'In Stock' },
                    { id: 'out', label: 'Out of Stock' }
                  ].map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => setStockFilter(opt.id as any)}
                      className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center ${stockFilter === opt.id ? 'gradient-primary border-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-600 hover:text-brand-600'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {userRole !== 'vendor' && (
                <div>
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Wishlist</h3>
                  <button
                    onClick={() => setWishlistOnly(!wishlistOnly)}
                    className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${wishlistOnly ? 'gradient-primary border-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-600 hover:text-brand-600'}`}
                  >
                    <i className="fas fa-heart text-[8px]"></i> Wishlisted Only
                  </button>
                </div>
              )}

              <div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Sale Items</h3>
                <button
                  onClick={() => setOnlyOnSale(!onlyOnSale)}
                  className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${onlyOnSale ? 'gradient-primary border-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-600 hover:text-brand-600'}`}
                >
                  <i className="fas fa-tag text-[8px]"></i> On Sale Only
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedCat(null);
                  navigate('/products');
                  setMinPrice(0);
                  setMaxPrice(500000);

                  setSelectedVendors([]);
                  setOnlyOnSale(false);
                  setWishlistOnly(false);
                  setStockFilter('all');
                }}
                className="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-dashed border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 transition-all"
              >
                <i className="fas fa-times mr-1.5"></i> Reset All Filters
              </button>



              {showMobileFilters && (
                <div className="pt-8 lg:hidden">
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-5 gradient-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-500/20"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {(() => {
            const chips: { label: string; onRemove: () => void }[] = [];
            if (selectedCat) chips.push({ label: CATEGORIES.find(c => c.id === selectedCat)?.name || selectedCat, onRemove: () => { setSelectedCat(null); navigate('/products'); } });
            if (selectedSubCat) chips.push({ label: selectedSubCat, onRemove: () => { setSelectedSubCat(null); if (selectedCat) navigate(`/${selectedCat}`); else navigate('/products'); } });
            if (onlyOnSale) chips.push({ label: 'On Sale', onRemove: () => setOnlyOnSale(false) });

            if (wishlistOnly) chips.push({ label: 'Wishlisted', onRemove: () => setWishlistOnly(false) });
            if (minPrice > 0) chips.push({ label: `Min ৳${minPrice}`, onRemove: () => setMinPrice(0) });
            if (maxPrice < 500000) chips.push({ label: `Max ৳${maxPrice}`, onRemove: () => setMaxPrice(500000) });
            if (stockFilter !== 'all') chips.push({ label: stockFilter === 'in' ? 'In Stock' : 'Out of Stock', onRemove: () => setStockFilter('all') });
            if (chips.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-2 mb-6">
                {chips.map(chip => (
                  <span key={chip.label} className="flex items-center gap-1.5 bg-brand-50 text-brand-600 px-3 py-1.5 rounded-full text-xs font-black">
                    {chip.label}
                    <button onClick={chip.onRemove} className="hover:text-brand-800 ml-0.5"><i className="fas fa-times text-[9px]"></i></button>
                  </span>
                ))}
              </div>
            );
          })()}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight text-gradient">
                {selectedCat ? CATEGORIES.find(c => c.id === selectedCat)?.name : customSubParam ? customSubParam : customCatParam ? customCatParam : 'Explore All'}
              </h2>
              <p className="text-gray-500 font-medium mt-1">Showing {filtered.length} curated products</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8" : "flex flex-col gap-6"}>
              {Array.from({ length: 15 }).map((_, i) => (
                <SkeletonCard key={i} viewMode={viewMode} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8" : "flex flex-col gap-6"}>
                {visibleProducts.map((p, idx) => (
                  <div key={p.id}>
                    <ProductCard 
                      product={p} 
                      onAddToCart={handleAddToCart} 
                      onSelect={() => handleSelectProduct(p)} 
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.includes(p.id)}
                      userRole={userRole}
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </div>
              <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-8">
                {hasMore && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-black uppercase tracking-widest">Loading more...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <i className="fas fa-search text-4xl text-gray-200"></i>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">No matches found</h3>
              <p className="text-gray-500 font-medium max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button 
                onClick={() => { 
                  setSelectedCat(null); 
                  navigate('/products');
                  setMinPrice(0); 
                  setMaxPrice(100000); 

                  setSelectedVendors([]); 
                  setOnlyOnSale(false);
                  setWishlistOnly(false);
                  setStockFilter('all');
                }}
                className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductsView;
