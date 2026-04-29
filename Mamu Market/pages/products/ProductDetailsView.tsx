import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Product, Vendor } from '../../types';
import { PRODUCTS, VENDORS } from '../../constants';
import ProductCard from '../../components/product/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { safeGet, safeSet } from '../../utils/storage';

const ProductDetailsView: React.FC<{
  product: Product,
}> = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleAddToCart } = useCart();
  const {
    wishlist, handleToggleWishlist,
    handleSelectProduct
  } = useApp();
  const userRole = user?.role;
  const isWishlisted = wishlist.includes(product.id);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  const resolvedVendorName = React.useMemo(() => {
    if (!product.vendorId) return product.vendor;
    try {
      const users = safeGet('mamu_users', []);
      const vendorUser = users.find((u: any) => u.id === product.vendorId);
      return vendorUser?.storeName || vendorUser?.name || product.vendor;
    } catch {
      return product.vendor;
    }
  }, [product.vendorId, product.vendor]);

  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || null);
  const [activeImage, setActiveImage] = useState(product.image);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [productReportModal, setProductReportModal] = useState(false);
  const [productReportReason, setProductReportReason] = useState('');
  const [productReported, setProductReported] = useState(false);

  useEffect(() => {
    setActiveImage(product.image);
    setSelectedColor(product.colors?.[0]?.name || null);
    setQuantity(1);
    window.scrollTo(0, 0);
    // Track recently viewed (customer only)
    const currentUser = safeGet('mamu_user', null);
    if (currentUser?.role === 'customer') {
      const viewed: any[] = safeGet('recently_viewed', []);
      const filtered = viewed.filter((p: any) => p.id !== product.id);
      filtered.unshift({ id: product.id, name: product.name, image: product.image, price: product.price, categoryId: product.categoryId });
      safeSet('recently_viewed', filtered.slice(0, 8));
    }
  }, [product.id]);

  const dynamicRelated = safeGet('approved_products', [])
    .filter((p: any) => p.category?.toLowerCase().replace(/\s+/g, '-') === product.categoryId && p.id !== product.id)
    .map((p: any) => ({
      id: p.id,
      name: p.productName || p.name || '',
      price: parseFloat(p.price) || 0,
      originalPrice: parseFloat(p.originalPrice) || parseFloat(p.price) || 0,
      image: p.mainImage || p.image || '',
      images: [p.mainImage, p.extraImage1, p.extraImage2, p.extraImage3].filter(Boolean),
      categoryId: p.category?.toLowerCase().replace(/\s+/g, '-') || 'general',
      category: p.category || 'General',
      subcategory: p.subCategory || '',
      vendorId: p.vendorId,
      isSale: p.isSale === true || p.isSale === 'true',
      description: p.description || '',
      colors: p.colors || [],
      vendor: p.vendor || 'Unknown',
      isNew: p.isNew === true || p.isNew === 'true',
      inStock: p.inStock !== false && p.inStock !== 'false',
    }));
  const relatedProducts = [...PRODUCTS.filter(p => p.categoryId === product.categoryId && p.id !== product.id), ...dynamicRelated].slice(0, 5);

  const storageUsers = safeGet('mamu_users', []);
  const localVendor = storageUsers.find((u: any) => u.id === product.vendorId);

  let vendor = VENDORS.find(v => v.id === product.vendorId);

  if (vendor && localVendor) {
    vendor = { ...vendor, verified: localVendor.verified };
  } else if (!vendor && localVendor) {
    vendor = {
      id: localVendor.id,
      name: localVendor.storeName || localVendor.name,
      logo: localVendor.avatar || '',
      category: localVendor.storeCategory || localVendor.category || 'General',
      rating: localVendor.rating !== undefined ? localVendor.rating : 0,
      productsCount: safeGet('approved_products', []).filter((p: any) => p.vendorId === localVendor.id).length,
      verified: localVendor.verified || false
    };
  }


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 lg:py-20"
    >
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 mb-24">
        {/* Image Gallery */}
        <div className="lg:col-span-5 space-y-6 relative z-30">
          <div
            className="relative aspect-square rounded-[2rem] bg-gray-50 border border-gray-100 shadow-xl cursor-zoom-in group"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              key={activeImage}
              src={activeImage || undefined}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[2rem] transition-transform duration-300 group-hover:scale-[1.02]"
              alt={product.name}
            />

            {/* Badges - Repositioned */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
              {product.isNew && <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-md">New Arrival</span>}
              {product.isSale && <span className="bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-md">Flash Sale</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[product.image, ...(product.images || []), ...(product.colors?.map(c => c.image) || [])].filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-gray-50 ${activeImage === img ? 'border-brand-600 scale-95 shadow-lg' : 'border-transparent hover:border-gray-200'}`}
              >
                {img && <img src={img} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Gallery" />}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="mb-8">
            <nav className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-6 flex-wrap">
              <button onClick={() => navigate('/')} className="text-gray-400 hover:text-brand-600 transition-colors">Home</button>
              <i className="fas fa-chevron-right text-[7px] text-gray-300"></i>
              <button onClick={() => navigate('/products')} className="text-gray-400 hover:text-brand-600 transition-colors">All Products</button>
              {product.category && (
                <>
                  <i className="fas fa-chevron-right text-[7px] text-gray-300"></i>
                  <button onClick={() => navigate(`/${product.categoryId}`)} className="text-gray-400 hover:text-brand-600 transition-colors">{product.category}</button>
                </>
              )}
              {product.subcategory && (
                <>
                  <i className="fas fa-chevron-right text-[7px] text-gray-300"></i>
                  <span className="text-brand-600">{product.subcategory}</span>
                </>
              )}
            </nav>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-brand-600 uppercase tracking-[0.2em]">
                {product.category} {product.subcategory && <span className="text-gray-400 mx-1">/</span>} {product.subcategory}
              </span>

            </div>
            <div className="flex items-start gap-3 mb-4">
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-tight flex-1">{product.name}</h1>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-brand-600 hover:border-brand-200 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <i className={`fas ${copied ? 'fa-check text-emerald-500' : 'fa-share-alt'} text-xs`}></i>
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-black text-gray-900">৳{product.price.toLocaleString()}</span>
              {product.isSale && (
                <>
                  <span className="text-xl text-gray-300 line-through font-bold">৳{product.originalPrice.toLocaleString()}</span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-500 text-[10px] font-black rounded-full border border-rose-100">Save {Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
                </>
              )}
              {user?.role === 'customer' && (
                <button onClick={() => {
                  if (productReported) return;
                  const reports: any[] = safeGet('reported_products', []);
                  const alreadyReported = reports.find((r: any) => r.productId === product.id && r.reportedBy === user.id);
                  if (alreadyReported) { setProductReported(true); return; }
                  setProductReportReason('');
                  setProductReportModal(true);
                }} className={`ml-auto text-[10px] font-black uppercase tracking-widest transition-colors ${productReported ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-400'}`}>
                  {productReported ? '✓ Product Reported' : '⚑ Report Product'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-10 mb-10">
            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Available Colors</h4>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => { setSelectedColor(color.name); setActiveImage(color.image); }}
                      className={`group relative w-12 h-12 rounded-2xl p-1 border-2 transition-all ${selectedColor === color.name ? 'border-brand-600 scale-110 shadow-lg' : 'border-transparent hover:border-gray-200'}`}
                    >
                      <div className="w-full h-full rounded-xl shadow-inner" style={{ backgroundColor: color.value }}></div>
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {userRole !== 'vendor' && (
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Quantity</h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100 shadow-inner">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-600 transition-colors">
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <span className="w-12 text-center font-black text-gray-900 text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-brand-600 transition-colors">
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                  {(() => {
                    const units = Number((product as any).units || (product as any).stock || 0);
                    const inStock = (product as any).inStock === true || (product as any).inStock === 'true' || units > 0;
                    if (!inStock) return <p className="text-xs font-black text-red-500"><i className="fas fa-times-circle mr-1"></i>Out of Stock</p>;
                    if (units > 0 && units <= 5) return <p className="text-xs font-black text-amber-500"><i className="fas fa-exclamation-circle mr-1"></i>Only <span className="text-amber-600">{units} left</span> — order soon!</p>;
                    return <p className="text-xs font-bold text-emerald-600"><i className="fas fa-check-circle mr-1"></i>In Stock</p>;
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-10">
            {userRole === 'vendor' ? (
              user?.id === product.vendorId ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3"
                >
                  <i className="fas fa-pencil-alt"></i> Edit in Dashboard
                </button>
              ) : (
                <div className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 border border-gray-100 cursor-not-allowed select-none">
                  <i className="fas fa-store"></i> Vendor View Only
                </div>
              )
            ) : (
              <>
                {(() => {
                  const outOfStock = product.inStock === false || (product.inStock as any) === 'false' || (product.stock !== undefined && product.stock <= 0);
                  const isDiscontinued = product.isDiscontinued === true;

                  if (isDiscontinued) {
                    return (
                      <div className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest border border-gray-200 cursor-not-allowed select-none flex items-center justify-center gap-3">
                        <i className="fas fa-ban-circle"></i> Discontinued
                      </div>
                    );
                  }

                  if (outOfStock) {
                    return (
                      <div className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest border border-gray-200 cursor-not-allowed select-none flex items-center justify-center gap-3">
                        <i className="fas fa-box-open"></i> Out of Stock
                      </div>
                    );
                  }

                  return (
                    <button
                      onClick={() => {
                        for (let i = 0; i < quantity; i++) {
                          handleAddToCart(product);
                        }
                      }}
                      className="flex-1 py-5 gradient-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <i className="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                  );
                })()}
                <button
                  onClick={() => handleToggleWishlist(product.id)}
                  className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${isWishlisted ? 'bg-rose-50 border-rose-100 text-rose-500' : 'border-gray-100 text-gray-400 hover:border-rose-500 hover:text-rose-500'}`}
                >
                  <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-xl`}></i>
                </button>
              </>
            )}
          </div>

          <p className="text-gray-500 font-medium leading-relaxed text-lg">{product.description}</p>

          {/* Vendor Info Card */}
          {vendor && (
            <div className="mt-12 p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                  {vendor.logo && <img src={vendor.logo} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={resolvedVendorName} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-black text-gray-900">{resolvedVendorName}</h4>
                    {vendor.verified && <i className="fas fa-check-circle text-blue-500 text-xs"></i>}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold text-gray-400">{vendor.productsCount} Products</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-24">
        <div className="flex border-b border-gray-100 mb-12">
          {[
            { id: 'description', label: 'Description' },
            { id: 'shipping', label: 'Shipping & Returns' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-10 py-6 text-xs font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 gradient-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="prose prose-lg max-w-none text-gray-500 font-medium leading-relaxed">
                  {product.description ? (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">No description provided for this product.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
                      <i className="fas fa-truck"></i>
                    </div>
                    <h4 className="text-xl font-black text-gray-900">Fast Delivery</h4>
                    <p className="text-gray-500 font-medium leading-relaxed">Standard shipping takes 3-5 business days. Express options available at checkout for next-day delivery.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                      <i className="fas fa-undo"></i>
                    </div>
                    <h4 className="text-xl font-black text-gray-900">Easy Returns</h4>
                    <p className="text-gray-500 font-medium leading-relaxed">Not satisfied? Return your item within 30 days for a full refund. No questions asked.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Related Products */}
      {(() => {
        const currentUser = safeGet('mamu_user', null);
        if (currentUser?.role !== 'customer') return null;
        const viewed: any[] = safeGet('recently_viewed', []).filter((p: any) => p.id !== product.id);
        if (viewed.length === 0) return null;
        return (
          <section className="mb-16">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Recently Viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {viewed.slice(0, 6).map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className="shrink-0 w-36 cursor-pointer group"
                >
                  <div className="w-36 h-36 rounded-2xl overflow-hidden bg-gray-100 mb-2">
                    {p.image && <img src={p.image} referrerPolicy="no-referrer" alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                  </div>
                  <p className="text-xs font-black text-gray-900 truncate group-hover:text-brand-600 transition-colors">{p.name}</p>
                  <p className="text-xs font-bold text-brand-600">৳{Number(p.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">You May Also Like</h2>
            <button onClick={() => navigate('/products')} className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
                onSelect={() => handleSelectProduct(p)}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.includes(p.id)}
                userRole={userRole}
              />
            ))}
          </div>
        </section>
      )}

      {productReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setProductReportModal(false)}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-gray-900 mb-2">Report Product</h3>
            <p className="text-gray-400 font-medium text-sm mb-6">Why are you reporting this product?</p>
            <div className="space-y-2 mb-6">
              {['Counterfeit or fake product', 'Wrong or misleading description', 'Inappropriate or offensive content', 'Prohibited item', 'Other'].map(r => (
                <button
                  key={r}
                  onClick={() => setProductReportReason(r)}
                  className={`w-full text-left px-5 py-3 rounded-xl font-bold text-sm transition-all border-2 ${productReportReason === r ? 'border-brand-600 bg-grad-soft text-brand-600' : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-300'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setProductReportModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all">Cancel</button>
              <button
                onClick={() => {
                  if (!productReportReason) return;
                  const reports = safeGet('reported_products', []);
                  reports.push({
                    id: 'prodrep_' + Date.now(),
                    productId: product.id,
                    productName: product.name,
                    vendorId: product.vendorId,
                    reportedBy: user?.id,
                    reporterName: user?.name,
                    reason: productReportReason,
                    date: new Date().toISOString()
                  });
                  safeSet('reported_products', reports);
                  setProductReported(true);
                  setProductReportModal(false);
                  setProductReportReason('');
                }}
                disabled={!productReportReason}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-black text-sm hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10 cursor-zoom-out" onClick={() => setIsLightboxOpen(false)}>
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-[110]"
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage || undefined}
              alt={product.name}
              className="max-h-[90vh] max-w-full object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
            {/* Gallery Thumbnails inside Lightbox */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10">
              {[product.image, ...(product.images || []), ...(product.colors?.map(c => c.image) || [])].filter((v, i, a) => v && a.indexOf(v) === i).map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(img); }}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all bg-white ${activeImage === img ? 'border-brand-500 scale-100 shadow-lg' : 'border-transparent scale-90 hover:scale-95 opacity-50 hover:opacity-100'}`}
                >
                  {img && <img src={img} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Gallery" />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductDetailsView;
