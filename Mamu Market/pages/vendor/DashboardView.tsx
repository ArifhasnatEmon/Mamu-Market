import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { safeGet } from '../../utils/storage';

const SUBCATEGORIES: Record<string, string[]> = {
  'Electronics': ['Mobile', 'Laptop', 'Accessories', 'Audio', 'Camera'],
  'Fashion': ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'],
  'Home & Living': ['Furniture', 'Decor', 'Kitchen', 'Bedding'],
  'Beauty & Health': ['Makeup', 'Skincare', 'Haircare', 'Supplements'],
  'Sports & Outdoor': ['Fitness', 'Camping', 'Cycling', 'Team Sports'],
  'Groceries': ['Fresh Produce', 'Snacks', 'Beverages', 'Household'],
  'Automotive': ['Parts', 'Accessories', 'Tools', 'Car Care']
};

const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { setToast } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [realOrderCount, setRealOrderCount] = useState(0);

  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem('mamu_orders') || '[]');
    const vendorOrders = allOrders.filter((order: any) =>
      order.items.some((item: any) => item.vendorId === user?.id)
    );
    setRealOrderCount(vendorOrders.filter((o: any) => o.status !== 'Cancelled').length);
  }, [user]);

  const storeCategory = user?.storeCategory || '';
  const approvedCategoryRequests = JSON.parse(localStorage.getItem('category_requests') || '[]')
    .filter((r: any) => r.vendorId === user?.id && r.status === 'approved')
    .map((r: any) => r.category || r.requestedCategory);
  const vendorCategories = storeCategory
    ? [...new Set([...storeCategory.split(',').map((c: string) => c.trim()), ...approvedCategoryRequests])].filter(Boolean)
    : approvedCategoryRequests.length > 0 ? approvedCategoryRequests : [];

  const [form, setForm] = useState({
    productName: '', category: vendorCategories.length >= 1 ? vendorCategories[0] : '', subCategory: '', price: '', originalPrice: '',
    units: '', description: '', mainImage: '',
    extraImage1: '', extraImage2: '', extraImage3: '',
    color1name: '', color1image: '', color2name: '', color2image: '',
    color3name: '', color3image: '', color4name: '', color4image: '',
    isSale: false,
    dealType: 'none' as 'none' | 'flash' | 'weekly' | 'monthly',
  });
  const [updateReason, setUpdateReason] = useState('');

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentImageField, setCurrentImageField] = useState('');
  const [upImg, setUpImg] = useState<any>();
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files.length > 0) {
      setCurrentImageField(fieldName);
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result));
      reader.readAsDataURL(e.target.files[0]);
      setCropModalOpen(true);
    }
  };

  const getCroppedImg = () => {
    if (!imgRef.current || !crop.width || !crop.height) return;
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCropX = (crop.unit === '%' ? (crop.x / 100) * image.width : crop.x) * scaleX;
    const pixelCropY = (crop.unit === '%' ? (crop.y / 100) * image.height : crop.y) * scaleY;
    const pixelCropW = (crop.unit === '%' ? (crop.width / 100) * image.width : crop.width) * scaleX;
    const pixelCropH = (crop.unit === '%' ? (crop.height / 100) * image.height : crop.height) * scaleY;

    canvas.width = pixelCropW;
    canvas.height = pixelCropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      pixelCropX,
      pixelCropY,
      pixelCropW,
      pixelCropH,
      0,
      0,
      pixelCropW,
      pixelCropH
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.95);
    setForm((prev: any) => ({ ...prev, [currentImageField]: base64Image }));
    setCropModalOpen(false);
    setUpImg(null);
  };

  const handleRemoveImage = (fieldName: string) => {
    setForm(prev => ({ ...prev, [fieldName]: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadProducts = useCallback(() => {
    const vendorId = user?.id;
    if (!vendorId) return;
    const approved: any[] = safeGet('approved_products', []);
    setMyProducts(approved.filter(p => p.vendorId === vendorId));
    const pending: any[] = safeGet('pending_products', []);
    setPendingProducts(pending.filter(p => p.vendorId === vendorId));
  }, [user?.id]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const refreshData = () => {
    loadProducts();
  };

  const handleSubmit = () => {
    const colors = [];
    if (form.color1name) colors.push({ name: form.color1name, image: form.color1image });
    if (form.color2name) colors.push({ name: form.color2name, image: form.color2image });
    if (form.color3name) colors.push({ name: form.color3name, image: form.color3image });
    if (form.color4name) colors.push({ name: form.color4name, image: form.color4image });
    if (editingProduct) {
      const approved = JSON.parse(localStorage.getItem('approved_products') || '[]');
      const isApproved = approved.some((p: any) => p.id === editingProduct.id);

      if (isApproved) {
        const updatedApproved = approved.map((p: any) => {
          if (p.id !== editingProduct.id) return p;
          return { ...p, isSale: form.isSale, dealType: form.dealType };
        });
        try {
          localStorage.setItem('approved_products', JSON.stringify(updatedApproved));
        } catch (e) {
          setToast('Failed to save changes');
          return;
        }

        const updates = JSON.parse(localStorage.getItem('pending_updates') || '[]');
        let hasOtherChanges = false;
        ['productName', 'price', 'originalPrice', 'units', 'description', 'mainImage'].forEach(field => {
          const oldVal = String(editingProduct[field] ?? '');
          const newVal = String((form as any)[field] ?? '');
          if (oldVal !== newVal) {
            hasOtherChanges = true;
            updates.push({
              id: 'upd_' + Date.now() + '_' + field,
              productId: editingProduct.id,
              productName: editingProduct.productName || editingProduct.name,
              vendorId: user?.id,
              vendorName: user?.name,
              field,
              oldValue: oldVal,
              newValue: newVal,
              reason: updateReason || 'No reason provided',
              date: new Date().toISOString()
            });
          }
        });

        if (hasOtherChanges) {
          try {
            localStorage.setItem('pending_updates', JSON.stringify(updates));
            setToast('Deal updated. Other changes sent to admin for approval.');
          } catch (e) {
            setToast('Storage limit exceeded! Please reduce image sizes.');
          }
        } else {
          setToast('Deal section updated.');
        }
        setUpdateReason('');
        refreshData();
      } else {
        const updates = JSON.parse(localStorage.getItem('pending_updates') || '[]');
        ['productName', 'price', 'originalPrice', 'units', 'description', 'mainImage'].forEach(field => {
          if ((form as any)[field] !== editingProduct[field]) {
            updates.push({
              id: 'upd_' + Date.now() + '_' + field,
              productId: editingProduct.id,
              productName: editingProduct.productName,
              vendorId: user?.id,
              vendorName: user?.name,
              field,
              oldValue: editingProduct[field],
              newValue: (form as any)[field],
              reason: updateReason || 'No reason provided',
              date: new Date().toISOString()
            });
          }
        });
        try {
          localStorage.setItem('pending_updates', JSON.stringify(updates));
          setToast('Update request sent to admin for approval!');
          setUpdateReason('');
        } catch (e) {
          setToast('Storage limit exceeded! Please reduce image sizes.');
          console.error('Storage error:', e);
        }
      }
    } else {
      const pending = JSON.parse(localStorage.getItem('pending_products') || '[]');
      pending.push({
        id: 'p_' + Date.now(),
        ...form, colors,
        inStock: Number(form.units) > 0,
        vendorId: user?.id,
        vendorName: user?.name,
        status: 'pending_approval'
      });
      try {
        localStorage.setItem('pending_products', JSON.stringify(pending));
        setToast('Product submitted for admin approval!');
      } catch (e) {
        setToast('Storage limit exceeded! Please reduce image sizes.');
        console.error('Storage error:', e);
      }
    }
    setShowModal(false);
    setForm({ productName: '', category: vendorCategories.length >= 1 ? vendorCategories[0] : '', subCategory: '', price: '', originalPrice: '', units: '', description: '', mainImage: '', extraImage1: '', extraImage2: '', extraImage3: '', color1name: '', color1image: '', color2name: '', color2image: '', color3name: '', color3image: '', color4name: '', color4image: '', isSale: false, dealType: 'none' });
    refreshData();
  };

  const handleRemove = (product: any) => {
    setDeleteTarget(product);
    setDeleteReason('');
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteReason.trim()) { setToast('Please provide a reason'); return; }
    const requests = JSON.parse(localStorage.getItem('remove_requests') || '[]');
    const alreadyRequested = requests.some((r: any) => r.productId === deleteTarget.id && r.status !== 'rejected');
    if (alreadyRequested) { setToast('Removal request already submitted!'); setDeleteModal(false); return; }
    requests.push({
      id: 'rem_' + Date.now(),
      productId: deleteTarget.id,
      productName: deleteTarget.productName || deleteTarget.name,
      vendorId: user?.id,
      vendorName: user?.name,
      reason: deleteReason,
      status: 'pending',
      date: new Date().toISOString()
    });
    localStorage.setItem('remove_requests', JSON.stringify(requests));
    setDeleteModal(false);
    setDeleteTarget(null);
    setDeleteReason('');
    setToast('Removal request sent to admin for approval!');
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Merchant Center</h1>
            <p className="text-xl text-gray-500 font-medium">Manage your store, track sales, and connect with customers.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/dashboard/add-product')} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10">Add New Product</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {(() => {
            const storedUserId = user?.id;
            const approvedProds = JSON.parse(localStorage.getItem('approved_products') || '[]').filter((p: any) => p.vendorId === storedUserId);
            const allPendingProds = JSON.parse(localStorage.getItem('pending_products') || '[]').filter((p: any) => p.vendorId === storedUserId);
            const rejectedProds = allPendingProds.filter((p: any) => p.status === 'rejected');
            const activePendingProds = allPendingProds.filter((p: any) => !p.status || p.status === 'pending' || p.status === 'pending_approval');
            const pendingUpdates = JSON.parse(localStorage.getItem('pending_updates') || '[]').filter((p: any) => p.vendorId === storedUserId);
            const pendingStoreReqs = JSON.parse(localStorage.getItem('store_name_requests') || '[]').filter((p: any) => p.vendorId === storedUserId && p.status === 'pending');
            const pendingCatReqs = JSON.parse(localStorage.getItem('category_requests') || '[]').filter((p: any) => p.vendorId === storedUserId && p.status === 'pending');
            const totalPending = activePendingProds.length + pendingUpdates.length + pendingStoreReqs.length + pendingCatReqs.length;

            return [
              { label: 'Active Products', value: approvedProds.length, icon: 'fa-box', color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Pending Approval', value: totalPending, icon: 'fa-clock', color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Total Orders', value: realOrderCount, icon: 'fa-shopping-cart', color: 'text-brand-600', bg: 'bg-grad-soft', link: '/dashboard/orders' },
              { label: 'Rejected', value: rejectedProds.length, icon: 'fa-times-circle', color: 'text-red-500', bg: 'bg-red-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => (stat as any).link && navigate((stat as any).link)}
                className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group ${(stat as any).link ? 'cursor-pointer' : ''}`}
              >
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${stat.icon} text-xl`}></i>
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
              </motion.div>
            ));
          })()}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
              <button onClick={() => navigate('/dashboard/inventory')} className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="space-y-8">
              {(() => {
                const recentItems = [
                  ...JSON.parse(localStorage.getItem('pending_products') || '[]').filter((p: any) => p.vendorId === user?.id),
                  ...JSON.parse(localStorage.getItem('approved_products') || '[]').filter((p: any) => p.vendorId === user?.id)
                ].slice(0, 3);
                if (recentItems.length === 0) return (
                  <div className="text-center py-12">
                    <i className="fas fa-inbox text-4xl text-gray-200 mb-4 block"></i>
                    <p className="text-gray-400 font-bold">No activity yet</p>
                    <p className="text-gray-300 text-sm font-medium mt-1">Add your first product to get started</p>
                  </div>
                );
                return recentItems.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {p.mainImage ? <img src={p.mainImage} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={p.productName} /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-box"></i></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{p.productName}</p>
                      <p className="text-xs text-gray-400 font-medium">৳{p.price} • {p.units} units</p>
                      {p.status === 'rejected' && p.rejectReason && (
                        <p className="text-red-500 text-[10px] font-bold mt-1">Reason: {p.rejectReason}</p>
                      )}
                    </div>
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-full ${p.status === 'rejected' ? 'bg-red-50 text-red-500' :
                        p.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-amber-50 text-amber-600'
                      }`}>
                      {p.status === 'rejected' ? 'Rejected' : p.status === 'approved' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-10">Quick Actions</h3>
            <div className="space-y-4">
              {[
                { label: 'My Orders', icon: 'fa-shopping-bag', action: () => navigate('/dashboard/orders'), count: realOrderCount },
                { label: 'Update Inventory', icon: 'fa-boxes', action: () => navigate('/dashboard/inventory') },
                { label: 'Store Analytics', icon: 'fa-chart-pie', action: () => navigate('/dashboard/analytics') },
                { label: 'Store Settings', icon: 'fa-cog', action: () => navigate('/settings/store') }
              ].map((action, i) => (
                <button key={i} onClick={action.action} className="w-full flex items-center gap-4 p-5 rounded-2xl border border-gray-50 hover:border-brand-600 hover:bg-grad-soft transition-all group relative">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-brand-600 transition-all">
                    <i className={`fas ${action.icon}`}></i>
                  </div>
                  <span className="text-sm font-black text-gray-900">{action.label}</span>
                  {action.count !== undefined && action.count > 0 && (
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg shadow-red-500/30">
                      {action.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div id="my-products-section" className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 mt-12">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">My Products</h3>
          {myProducts.length > 0 ? (
            <div className="space-y-3">
              {myProducts.map((product: any) => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                  {(product.mainImage || product.image) && <img src={product.mainImage || product.image} referrerPolicy="no-referrer" alt={product.productName || product.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm truncate">{product.productName || product.name}</p>
                    <p className="text-brand-600 font-bold text-sm">৳{product.price}</p>
                    <p className="text-gray-400 text-xs font-medium">{product.units || product.stock || product.quantity || 0} units</p>
                    {(product.isSale || product.dealType && product.dealType !== 'none') && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${product.dealType === 'weekly' ? 'bg-indigo-50 text-indigo-600' :
                          product.dealType === 'monthly' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-amber-50 text-amber-600'
                        }`}>
                        {product.dealType === 'weekly' ? '📅 Weekly Deal' :
                          product.dealType === 'monthly' ? '🗓️ Monthly Deal' :
                            '⚡ Flash/Daily'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => navigate('/dashboard/inventory')} className="px-3 py-1.5 bg-brand-600 text-white rounded-xl font-black text-xs hover:opacity-90 transition-all">
                      <i className="fas fa-boxes mr-1"></i>Inventory
                    </button>
                    <button onClick={() => handleRemove(product)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-xl font-black text-xs hover:bg-red-100 transition-all">
                      <i className="fas fa-trash mr-1"></i>Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 font-bold text-center py-10">No approved products yet</p>}
        </div>





        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 mt-8">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Submission Status</h3>
          {(() => {
            const newProducts = JSON.parse(localStorage.getItem('pending_products') || '[]').filter((p: any) => p.vendorId === user?.id);
            const pendingUpdates = JSON.parse(localStorage.getItem('pending_updates') || '[]').filter((u: any) => {
              const approved = JSON.parse(localStorage.getItem('approved_products') || '[]');
              return approved.some((p: any) => p.id === u.productId && p.vendorId === user?.id);
            });
            const removeRequests = JSON.parse(localStorage.getItem('remove_requests') || '[]').filter((r: any) => r.vendorId === user?.id);

            const allItems = [
              ...newProducts.map((p: any) => ({
                id: p.id, title: p.productName, subtitle: `৳${p.price} • ${p.units} units`,
                type: 'New Product', image: p.mainImage,
                status: p.status === 'rejected' ? 'REJECTED' : p.status === 'approved' ? 'APPROVED' : 'PENDING',
                color: p.status === 'rejected' ? 'red' : p.status === 'approved' ? 'green' : 'amber',
                reason: p.rejectReason, date: p.date
              })),
              ...pendingUpdates.map((u: any) => ({
                id: u.id, title: u.productName, subtitle: `Field: ${u.field}`,
                type: 'Product Update', image: null,
                status: 'PENDING', color: 'blue', reason: null, date: u.date
              })),
              ...removeRequests.map((r: any) => ({
                id: r.id, title: r.productName, subtitle: `Reason: ${r.reason || 'Not specified'}`,
                type: 'Product Removal', image: null,
                status: 'SENT', color: 'red', reason: r.reason, date: r.date
              })),
            ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

            const colorMap: any = {
              red: 'bg-red-100 text-red-700',
              green: 'bg-green-100 text-green-700',
              amber: 'bg-amber-100 text-amber-700',
              blue: 'bg-blue-100 text-blue-700',
              purple: 'bg-purple-100 text-purple-700',
              indigo: 'bg-indigo-100 text-indigo-700',
            };

            const typeColorMap: any = {
              'New Product': 'text-amber-600',
              'Product Update': 'text-blue-600',
              'Product Removal': 'text-red-500',
              'Store Name': 'text-purple-600',
              'Category': 'text-indigo-600',
            };

            if (allItems.length === 0) return <p className="text-gray-400 font-bold text-center py-10">No submissions yet</p>;

            return (
              <div className="space-y-3">
                {allItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {item.image && <img src={item.image} referrerPolicy="no-referrer" className="w-12 h-12 rounded-xl object-cover shrink-0" alt={item.title} />}
                    {!item.image && (
                      <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                        <i className={`fas fa-box text-gray-400 text-sm`}></i>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm truncate">{item.title}</p>
                      <p className={`text-xs font-black uppercase tracking-widest ${typeColorMap[item.type]}`}>{item.type}</p>
                      <p className="text-gray-400 text-xs font-medium">{item.subtitle}</p>
                      {item.reason && <p className="text-red-500 text-xs font-bold mt-0.5">↳ {item.reason}</p>}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0 ${colorMap[item.color]}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>



      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-gray-900 mb-8">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Product Name</label>
                <input type="text" value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Category</label>
                  {vendorCategories.length === 1 ? (
                    <input type="text" value={form.category} readOnly className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none text-gray-500 cursor-not-allowed" />
                  ) : (
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value, subCategory: '' })} className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none">
                      <option value="">Select Category</option>
                      {vendorCategories.map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Sub-category</label>
                  <select value={form.subCategory} onChange={e => setForm({ ...form, subCategory: e.target.value })} className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none" disabled={!form.category}>
                    <option value="">Select Sub-category</option>
                    {form.category && (() => {
                      const hardcoded = SUBCATEGORIES[form.category] || [];
                      const customCats = JSON.parse(localStorage.getItem('custom_categories') || '[]');
                      const customMatch = customCats.find((c: any) => c.name.toLowerCase() === form.category.toLowerCase());
                      const customSubs = (customMatch?.subs || []).map((s: any) => s.name);
                      const allSubs = [...new Set([...hardcoded, ...customSubs])];
                      return allSubs.map(sc => <option key={sc} value={sc}>{sc}</option>);
                    })()}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Price (৳)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Original Price (৳)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none" />
                  <p className="text-[10px] text-gray-400 font-medium mt-1">Set higher than sale price to show discount %</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Stock / Units</label>
                <input type="number" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Main Image</label>
                <div className="flex items-center gap-4">
                  {form.mainImage && (
                    <div className="relative">
                      {form.mainImage && <img src={form.mainImage} referrerPolicy="no-referrer" className="w-16 h-16 object-cover rounded-xl border border-gray-200" alt="Preview" />}
                      <button onClick={() => handleRemoveImage('mainImage')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-red-600 shadow-sm">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                  <button onClick={() => { setCurrentImageField('mainImage'); fileInputRef.current?.click(); }} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                    <i className="fas fa-upload mr-2"></i> Upload Image
                  </button>
                </div>
              </div>
              {['extraImage1', 'extraImage2', 'extraImage3'].map((field, i) => (
                <div key={field}>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Extra Image {i + 1}</label>
                  <div className="flex items-center gap-4">
                    {(form as any)[field] && (
                      <div className="relative">
                        <img src={(form as any)[field] || 'https://via.placeholder.com/150'} referrerPolicy="no-referrer" className="w-16 h-16 object-cover rounded-xl border border-gray-200" alt="Preview" />
                        <button onClick={() => handleRemoveImage(field)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-red-600 shadow-sm">
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                    <button onClick={() => { setCurrentImageField(field); fileInputRef.current?.click(); }} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                      <i className="fas fa-upload mr-2"></i> Upload Image
                    </button>
                  </div>
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 block">Color Variants</label>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder={`Color ${n} Name`} value={(form as any)[`color${n}name`]} onChange={e => setForm({ ...form, [`color${n}name`]: e.target.value })} className="w-full bg-gray-50 rounded-2xl px-4 py-3 outline-none font-bold border-none text-sm" />
                      <div className="flex gap-2">
                        <input type="text" placeholder={`Color ${n} Image URL`} value={(form as any)[`color${n}image`]} onChange={e => setForm({ ...form, [`color${n}image`]: e.target.value })} className="w-full bg-gray-50 rounded-2xl px-4 py-3 outline-none font-bold border-none text-sm" />
                        <button onClick={() => { setCurrentImageField(`color${n}image`); fileInputRef.current?.click(); }} className="bg-gray-100 text-gray-700 px-3 rounded-xl hover:bg-gray-200">
                          <i className="fas fa-upload"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">Deal Section</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'none', label: 'No Deal', desc: 'Regular product' },
                    { value: 'flash', label: 'Flash / Daily', desc: 'Flash Sale & Daily Deals' },
                    { value: 'weekly', label: 'Weekly', desc: 'Weekly Mega Deals' },
                    { value: 'monthly', label: 'Monthly', desc: 'Monthly Super Sale' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, dealType: opt.value as any, isSale: opt.value !== 'none' })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${form.dealType === opt.value
                          ? 'border-brand-600 bg-grad-soft'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                      <p className="font-black text-gray-900 text-sm">{opt.label}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                {form.dealType !== 'none' && (
                  <p className="text-xs text-brand-600 font-bold mt-3">
                    This product will appear in the selected deals section
                  </p>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all">Submit</button>
              </div>
              {editingProduct && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Reason for Update</label>
                  <textarea
                    value={updateReason}
                    onChange={e => setUpdateReason(e.target.value)}
                    placeholder="e.g. Price correction, Wrong description, Updated stock..."
                    rows={2}
                    className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => onSelectFile(e, currentImageField)}
        className="hidden"
      />

      {/* Crop Modal */}
      {cropModalOpen && upImg && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-xl">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Crop Image</h3>
            <div className="w-full overflow-auto" style={{ maxHeight: '60vh' }}>
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                style={{ width: '100%' }}
              >
                <img
                  ref={imgRef}
                  src={upImg || undefined}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', display: 'block' }}
                  alt="crop"
                />
              </ReactCrop>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setCropModalOpen(false); setUpImg(null); }} className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={getCroppedImg} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all">Save Image</button>
            </div>
          </div>
        </div>
      )}



      {deleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal(false)}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6">
              <i className="fas fa-trash text-xl"></i>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Remove Product</h3>
            <p className="text-gray-400 font-medium mb-6">You are about to remove <span className="text-gray-900 font-black">"{deleteTarget.productName || deleteTarget.name}"</span>. Please provide a reason.</p>
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Reason for Removal</label>
              <select value={deleteReason} onChange={e => setDeleteReason(e.target.value)} className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none mb-3">
                <option value="">Select a reason</option>
                <option value="Out of stock permanently">Out of stock permanently</option>
                <option value="Pricing issue">Pricing issue</option>
                <option value="Wrong category">Wrong category</option>
                <option value="Discontinuing product">Discontinuing product</option>
                <option value="Other">Other</option>
              </select>
              {deleteReason === 'Other' && (
                <textarea value={deleteReason === 'Other' ? '' : deleteReason} onChange={e => setDeleteReason(e.target.value)} placeholder="Describe your reason..." rows={2} className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none resize-none" />
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
