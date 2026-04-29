
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { PRODUCTS } from '../../constants';
import ApprovalsPanel from '../../components/admin/ApprovalsPanel';
import OrderManagementPanel from '../../components/admin/OrderManagementPanel';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { pushNotif } from '../../utils/notifications';


const AdminDashboardView: React.FC = () => {
  const { user, handleLogout } = useAuth();
  const { setToast, toast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const [revokeModal, setRevokeModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<any>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [customRevokeReason, setCustomRevokeReason] = useState('');

  const [data, setData] = useState({
    users: [],
    pendingProducts: [],
    pendingUpdates: [],
    removeRequests: [],
    categoryRequests: [],
    storeNameRequests: [],
    verificationRequests: [],
    accountDeleteRequests: [],
    approvedProducts: [],
    reportedProducts: [],
    vendorRequests: [],
  });

  const refreshData = () => {
    const rawUsers = JSON.parse(localStorage.getItem('mamu_users') || '[]');
    const uniqueUsers = Array.from(new Map(rawUsers.map((u: any) => [u.id, u])).values());

    setData({
      users: uniqueUsers as any,
      pendingProducts: JSON.parse(localStorage.getItem('pending_products') || '[]'),
      pendingUpdates: JSON.parse(localStorage.getItem('pending_updates') || '[]'),
      removeRequests: JSON.parse(localStorage.getItem('remove_requests') || '[]'),
      categoryRequests: JSON.parse(localStorage.getItem('category_requests') || '[]'),
      storeNameRequests: JSON.parse(localStorage.getItem('store_name_requests') || '[]'),
      verificationRequests: JSON.parse(localStorage.getItem('verification_requests') || '[]'),
      accountDeleteRequests: JSON.parse(localStorage.getItem('account_delete_requests') || '[]'),
      approvedProducts: JSON.parse(localStorage.getItem('approved_products') || '[]'),
      reportedProducts: JSON.parse(localStorage.getItem('reported_products') || '[]'),
      vendorRequests: JSON.parse(localStorage.getItem('mamu_users') || '[]').filter((u: any) => u.role === 'vendor' && u.status === 'pending'),
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      refreshData();
    };
    window.addEventListener('storage', handleStorageChange);

    const pollInterval = setInterval(() => {
      refreshData();
    }, 15000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (user?.role !== 'admin') return null;

  const handleProductReportAction = (reportId: string, remove: boolean) => {
    const reports = JSON.parse(localStorage.getItem('reported_products') || '[]');
    if (remove) {
      const report = reports.find((r: any) => r.id === reportId);
      if (report) {
        const approved = JSON.parse(localStorage.getItem('approved_products') || '[]');
        localStorage.setItem('approved_products', JSON.stringify(approved.filter((p: any) => p.id !== report.productId)));
      }
    }
    localStorage.setItem('reported_products', JSON.stringify(reports.filter((r: any) => r.id !== reportId)));
    refreshData();
  };

  const handleAccountDeleteRequest = (reqId: string, userId: string, approve: boolean) => {
    const requests = JSON.parse(localStorage.getItem('account_delete_requests') || '[]');

    if (approve) {
      // Delete user
      const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
      const updatedUsers = users.filter((u: any) => u.id !== userId);
      localStorage.setItem('mamu_users', JSON.stringify(updatedUsers));

      const approved = JSON.parse(localStorage.getItem('approved_products') || '[]');
      const updatedApproved = approved.filter((p: any) => p.vendorId !== userId);
      localStorage.setItem('approved_products', JSON.stringify(updatedApproved));

      const pending = JSON.parse(localStorage.getItem('pending_products') || '[]');
      const updatedPending = pending.filter((p: any) => p.vendorId !== userId);
      localStorage.setItem('pending_products', JSON.stringify(updatedPending));
    }

    // Remove request
    const updatedRequests = requests.filter((r: any) => r.id !== reqId);
    localStorage.setItem('account_delete_requests', JSON.stringify(updatedRequests));
    refreshData();
  };

  const handleVendorAction = (userId: string, status: 'approved' | 'rejected') => {
    const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
    const updatedUsers = users.map((u: any) => u.id === userId ? { ...u, status } : u);
    localStorage.setItem('mamu_users', JSON.stringify(updatedUsers));

    if (status === 'approved') {
      pushNotif(userId, 'Account Approved', 'Congratulations! Your vendor account has been approved. You can now start adding products.');
    } else {
      pushNotif(userId, 'Account Rejected', 'We regret to inform you that your vendor account application has been rejected at this time.');
    }

    refreshData();
  };

  const handleProductApproval = (productId: string, approve: boolean, reason?: string) => {
    try {
      const pending = JSON.parse(localStorage.getItem('pending_products') || '[]');
      const product = pending.find((p: any) => p.id === productId);
      if (approve && product) {
        const approved = JSON.parse(localStorage.getItem('approved_products') || '[]');
        const approvedProduct = {
          ...product,
          status: 'approved',
          rating: product.rating || 0,
          reviewsCount: product.reviewsCount || 0,
          price: parseFloat(product.price) || 0,
          originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price) || 0,
          units: parseInt(product.units) || 0,
          isSale: product.isSale === true || product.isSale === 'true',
          description: product.description || '',
          image: product.mainImage || product.image || '',
          images: [product.mainImage, product.extraImage1, product.extraImage2, product.extraImage3].filter(Boolean),
          colors: Array.isArray(product.colors) ? product.colors : [],
          approvedAt: new Date().toISOString(),
        };
        localStorage.setItem('approved_products', JSON.stringify([...approved, approvedProduct]));
        const updatedPending = pending.filter((p: any) => p.id !== productId);
        localStorage.setItem('pending_products', JSON.stringify(updatedPending));

        if (product.vendorId) {
          pushNotif(product.vendorId, 'Product Approved', `Your product "${product.name}" has been approved and is now live on the market!`);
        }
      } else if (product) {
        const updatedPending = pending.filter((p: any) => p.id !== productId);
        localStorage.setItem('pending_products', JSON.stringify(updatedPending));

        if (product.vendorId) {
          pushNotif(product.vendorId, 'Product Rejected', `Your product "${product.name}" was not approved. Reason: ${reason || 'Does not meet our quality guidelines.'}`);
        }
      }
      refreshData();
    } catch (e) {
      console.error('Product approval error:', e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        setToast('Storage is full. Cannot approve more products.');
      }
      refreshData();
    }
  };

  const handleUpdateApproval = (updateId: string, approve: boolean) => {
    const updates = JSON.parse(localStorage.getItem('pending_updates') || '[]');
    const update = updates.find((u: any) => u.id === updateId);

    if (approve && update) {
      const approved = JSON.parse(localStorage.getItem('approved_products') || '[]');
      const updatedProducts = approved.map((p: any) =>
        p.id === update.productId ? { ...p, [update.field]: update.newValue } : p
      );
      localStorage.setItem('approved_products', JSON.stringify(updatedProducts));
    }

    const updatedUpdates = updates.filter((u: any) => u.id !== updateId);
    localStorage.setItem('pending_updates', JSON.stringify(updatedUpdates));
    refreshData();
  };

  const handleRemoveRequest = (requestId: string, approve: boolean) => {
    const requests = JSON.parse(localStorage.getItem('remove_requests') || '[]');
    const request = requests.find((r: any) => r.id === requestId);

    if (approve && request) {
      const approved = JSON.parse(localStorage.getItem('approved_products') || '[]');
      const updatedProducts = approved.filter((p: any) => p.id !== request.productId);
      localStorage.setItem('approved_products', JSON.stringify(updatedProducts));
      pushNotif(request.vendorId, 'Product Removal Approved', `Your request to remove product "${request.productName}" has been approved and the product has been removed.`);
    } else if (request) {
      pushNotif(request.vendorId, 'Product Removal Rejected', `Your request to remove product "${request.productName}" was rejected.`);
    }

    const updatedRequests = requests.filter((r: any) => r.id !== requestId);
    localStorage.setItem('remove_requests', JSON.stringify(updatedRequests));
    refreshData();
  };

  const handleUserStatus = (userId: string, newStatus: string, reason?: string) => {
    const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
    const updatedUsers = users.map((u: any) => u.id === userId ? { ...u, status: newStatus, suspendReason: reason || '' } : u);
    localStorage.setItem('mamu_users', JSON.stringify(updatedUsers));
    refreshData();
  };



  const handleCategoryRequest = (reqId: string, approve: boolean) => {
    const requests = JSON.parse(localStorage.getItem('category_requests') || '[]');
    const request = requests.find((r: any) => r.id === reqId);

    if (approve && request) {
      const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
      const updatedUsers = users.map((u: any) => {
        if (u.id === request.vendorId) {
          const currentCats = u.storeCategory ? u.storeCategory.split(',').map((c: string) => c.trim()) : [];
          if (!currentCats.includes(request.category)) {
            return { ...u, storeCategory: [...currentCats, request.category].join(', ') };
          }
        }
        return u;
      });
      localStorage.setItem('mamu_users', JSON.stringify(updatedUsers));
    }

    const updatedRequests = requests.filter((r: any) => r.id !== reqId);
    localStorage.setItem('category_requests', JSON.stringify(updatedRequests));
    refreshData();
  };

  const handleStoreNameRequest = (reqId: string, approve: boolean) => {
    const requests = JSON.parse(localStorage.getItem('store_name_requests') || '[]');
    const request = requests.find((r: any) => r.id === reqId);

    if (approve && request) {
      const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
      const updatedUsers = users.map((u: any) =>
        u.id === request.vendorId ? { ...u, storeName: request.newName } : u
      );
      localStorage.setItem('mamu_users', JSON.stringify(updatedUsers));
      pushNotif(request.vendorId, 'Store Name Change Approved', `Your request to change store name to "${request.newName}" has been approved.`);
    } else if (request) {
      pushNotif(request.vendorId, 'Store Name Change Rejected', `Your request to change store name was rejected.`);
    }

    const updatedRequests = requests.filter((r: any) => r.id !== reqId);
    localStorage.setItem('store_name_requests', JSON.stringify(updatedRequests));
    refreshData();
  };

  const handleVerificationRequest = (reqId: string, approve: boolean) => {
    const requests = JSON.parse(localStorage.getItem('verification_requests') || '[]');
    const request = requests.find((r: any) => r.id === reqId);

    if (approve && request) {
      const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
      const updatedUsers = users.map((u: any) =>
        u.id === request.vendorId ? { ...u, verified: true, nidTradeLicense: request.nidTradeLicense } : u
      );
      localStorage.setItem('mamu_users', JSON.stringify(updatedUsers));
      pushNotif(request.vendorId, 'Store Verified', 'Congratulations! Your store has been verified. You now have a verified badge on your profile.');
    } else if (request) {
      pushNotif(request.vendorId, 'Verification Rejected', 'Your store verification request was rejected. Please ensure your documents are clear and valid.');
    }

    const updatedRequests = requests.filter((r: any) => r.id !== reqId);
    localStorage.setItem('verification_requests', JSON.stringify(updatedRequests));
    refreshData();
  };

  const handleRevokeVerification = (user: any) => {
    setRevokeTarget(user);
    setRevokeModal(true);
    setRevokeReason('');
    setCustomRevokeReason('');
  };

  const confirmRevocation = () => {
    const finalReason = revokeReason === 'Custom reason' ? customRevokeReason : revokeReason;
    if (!finalReason) return;

    const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
    const updatedUsers = users.map((u: any) =>
      u.id === revokeTarget.id ? { ...u, verified: false, revocationReason: finalReason } : u
    );
    localStorage.setItem('mamu_users', JSON.stringify(updatedUsers));
    setRevokeModal(false);
    refreshData();
  };

  const tabs = ["Overview", "Vendor Approvals", "Product Approvals", "Verification Requests", "Remove Requests", "Store Requests", "Account Requests", "All Users", "Product Monitor", "Order Management"];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900 px-8 flex items-center justify-between z-50">
        <div className="text-white font-black text-xl tracking-tighter">
          Mamu Market Admin
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-sm">{user.name}</span>
          <button
            onClick={() => { handleLogout(); setToast('Logged out successfully'); setTimeout(() => navigate('/'), 100); }}
            className="bg-white text-gray-900 rounded-xl px-4 py-2 font-black text-sm hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0f0a1e] pt-6 px-3 fixed h-[calc(100vh-64px)] overflow-y-auto">
          {(() => {
            let pendingCounts: Record<string, number> = {};
            try {
              pendingCounts = {

                'Product Approvals': [
                  ...JSON.parse(localStorage.getItem('pending_products') || '[]').filter((p: any) => p.status !== 'rejected'),
                  ...JSON.parse(localStorage.getItem('pending_updates') || '[]')
                ].length,
                'Verification Requests': JSON.parse(localStorage.getItem('verification_requests') || '[]').filter((r: any) => r.status === 'pending').length,
                'Remove Requests': JSON.parse(localStorage.getItem('remove_requests') || '[]').filter((r: any) => r.status === 'pending').length,
                'Store Requests': [
                  ...JSON.parse(localStorage.getItem('store_name_requests') || '[]').filter((r: any) => r.status === 'pending'),
                  ...JSON.parse(localStorage.getItem('category_requests') || '[]').filter((r: any) => r.status === 'pending'),
                  ...JSON.parse(localStorage.getItem('category_remove_requests') || '[]').filter((r: any) => r.status === 'pending'),
                  ...JSON.parse(localStorage.getItem('city_change_requests') || '[]').filter((r: any) => r.status === 'pending'),
                ].length,
                'Account Requests': [
                  ...JSON.parse(localStorage.getItem('account_delete_requests') || '[]').filter((r: any) => r.status === 'pending'),
                  ...JSON.parse(localStorage.getItem('email_change_requests') || '[]').filter((r: any) => r.status === 'pending'),
                ].length,
                'Order Management': JSON.parse(localStorage.getItem('mamu_orders') || '[]').filter(
                  (o: any) => o.cancelRequest === 'pending' || o.cancelRequest === 'vendor_approved' || o.cancelRequest === 'vendor_rejected'
                ).length,
              };
            } catch (e) { console.error('sidebar badge error', e); }

            const groups = [
              {
                label: 'Dashboard',
                items: ['Overview'],
              },
              {
                label: 'Approvals',
                items: ['Vendor Approvals', 'Product Approvals', 'Verification Requests', 'Remove Requests', 'Store Requests', 'Account Requests'],
              },
              {
                label: 'Users & Content',
                items: ['All Users', 'Product Monitor'],
              },
              {
                label: 'Finance',
                items: ['Order Management'],
              },
            ];

            const tabIcons: Record<string, string> = {
              'Overview': 'fa-chart-pie',
              'Vendor Approvals': 'fa-store',
              'Product Approvals': 'fa-box',
              'Verification Requests': 'fa-shield-alt',
              'Remove Requests': 'fa-trash',
              'Store Requests': 'fa-edit',
              'Account Requests': 'fa-user-cog',
              'All Users': 'fa-users',
              'Product Monitor': 'fa-chart-bar',
              'Order Management': 'fa-shopping-bag',
            };

            return (
              <div className="space-y-1">
                {groups.map(group => (
                  <div key={group.label} className="mb-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25 px-3 mb-2">{group.label}</p>
                    {group.items.map(tab => {
                      const isActive = activeTab === tab;
                      const count = pendingCounts[tab] || 0;
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all border-l-2 ${isActive
                            ? 'bg-white/10 text-white border-l-[#7c3aed]'
                            : 'text-white/40 hover:text-white/80 hover:bg-white/5 border-l-transparent'
                            }`}
                        >
                          <i className={`fas ${tabIcons[tab]} text-[11px] w-4 text-center ${isActive ? 'text-[#a855f7]' : ''}`}></i>
                          <span className="flex-1 text-[12px] font-bold">{tab}</span>
                          {count > 0 && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })()}
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-gray-50 p-8 ml-64 overflow-y-auto min-h-[calc(100vh-64px)]">
          <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">{activeTab}</h2>

          {activeTab === 'Overview' && (
            <div>
              {(() => {
                const allUsers = JSON.parse(localStorage.getItem('mamu_users') || '[]');
                const vendors = allUsers.filter((u: any) => u.role === 'vendor');
                const customers = allUsers.filter((u: any) => u.role === 'customer');
                const approvedProducts = JSON.parse(localStorage.getItem('approved_products') || '[]');
                const pendingProducts = JSON.parse(localStorage.getItem('pending_products') || '[]');
                const allOrders = JSON.parse(localStorage.getItem('mamu_orders') || '[]');
                const getCommission = (price: number) => price >= 5000 ? 0.10 : price >= 1000 ? 0.15 : 0.20;
                const deliveredOrders = allOrders.filter((o: any) => o.status === 'Delivered');
                const totalRevenue = deliveredOrders.reduce((sum: number, o: any) => {
                  const orderCommission = (o.items || []).reduce((s: number, item: any) => {
                    const price = Number(item.price) || 0;
                    return s + price * (Number(item.quantity) || 1) * getCommission(price);
                  }, 0);
                  return sum + orderCommission;
                }, 0);
                const totalGMV = deliveredOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
                const totalPending = [
                  ...JSON.parse(localStorage.getItem('pending_products') || '[]'),
                  ...JSON.parse(localStorage.getItem('verification_requests') || '[]').filter((r: any) => r.status === 'pending'),
                  ...JSON.parse(localStorage.getItem('store_name_requests') || '[]').filter((r: any) => r.status === 'pending'),
                  ...JSON.parse(localStorage.getItem('category_requests') || '[]').filter((r: any) => r.status === 'pending'),
                ];
                return (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      {[
                        { label: 'Platform Revenue', value: '৳' + Math.round(totalRevenue).toLocaleString(), icon: 'fa-taka-sign', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Total Vendors', value: vendors.length, icon: 'fa-store', color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Total Customers', value: customers.length, icon: 'fa-users', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Active Products', value: approvedProducts.length, icon: 'fa-box', color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Pending Actions', value: totalPending.length, icon: 'fa-clock', color: 'text-amber-600', bg: 'bg-amber-50' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                          <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
                            <i className={`fas ${stat.icon} ${stat.color}`}></i>
                          </div>
                          <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                      ))}

                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-4 uppercase tracking-widest text-sm">Recent Orders</h3>
                        {allOrders.length === 0 && <p className="text-gray-400 font-bold text-sm">No orders yet</p>}
                        <div className="space-y-3">
                          {allOrders.filter((o: any) => o.status !== 'Cancelled').slice(0, 5).map((order: any) => (
                            <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                              <div>
                                <p className="font-black text-gray-900 text-sm">{order.id}</p>
                                <p className="text-xs text-gray-400 font-medium">{order.userName || 'Customer'}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-gray-900 text-sm">৳{order.total?.toLocaleString()}</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                                  order.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                                    'bg-amber-50 text-amber-600'
                                  }`}>{order.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-4 uppercase tracking-widest text-sm">Pending Actions</h3>
                        {totalPending.length === 0 && <p className="text-gray-400 font-bold text-sm">All clear!</p>}
                        <div className="space-y-3">
                          {pendingProducts.slice(0, 3).map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                                <i className="fas fa-box text-amber-500 text-xs"></i>
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-sm">{p.name}</p>
                                <p className="text-xs text-gray-400 font-medium">Product approval pending</p>
                              </div>
                              <button onClick={() => setActiveTab('Product Approvals')} className="ml-auto text-xs font-black text-brand-600 hover:underline shrink-0">Review</button>
                            </div>
                          ))}
                          {JSON.parse(localStorage.getItem('verification_requests') || '[]').filter((r: any) => r.status === 'pending').slice(0, 2).map((r: any) => (
                            <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                <i className="fas fa-shield-alt text-blue-500 text-xs"></i>
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-sm">{r.vendorName}</p>
                                <p className="text-xs text-gray-400 font-medium">Verification pending</p>
                              </div>
                              <button onClick={() => setActiveTab('Verification Requests')} className="ml-auto text-xs font-black text-brand-600 hover:underline shrink-0">Review</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <ApprovalsPanel
            activeTab={activeTab}
            data={data}
            setToast={setToast}
            refreshData={refreshData}
            handleAccountDeleteRequest={handleAccountDeleteRequest}
            handleVendorAction={handleVendorAction}
            handleVerificationRequest={handleVerificationRequest}
            handleProductApproval={handleProductApproval}
            handleRemoveRequest={handleRemoveRequest}
            handleCategoryRequest={handleCategoryRequest}
            handleStoreNameRequest={handleStoreNameRequest}
          />

          {activeTab === 'All Users' && (
            <div>
              {data.users.length > 0 ? (
                data.users.map((u: any) => (
                  <div key={u.id} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-900 flex items-center gap-2 flex-wrap">
                          {u.name}
                          {u.verified && <i className="fas fa-check-circle text-blue-500 text-xs" title="Verified Vendor"></i>}
                          {u.role === 'vendor' && u.storeName && <span className="text-xs font-bold text-brand-600">({u.storeName})</span>}
                        </h3>
                        <p className="text-gray-400 text-sm font-medium">{u.email}</p>
                        {(u.phone || u.storeCity) && (
                          <div className="flex gap-3 mt-1 flex-wrap">
                            {u.phone && <span className="text-[11px] text-gray-500 font-medium"><i className="fas fa-phone text-gray-300 mr-1"></i>{u.phone}</span>}
                            {u.storeCity && <span className="text-[11px] text-gray-500 font-medium"><i className="fas fa-map-marker-alt text-gray-300 mr-1"></i>{u.storeCity}</span>}
                            {u.address && <span className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]"><i className="fas fa-home text-gray-300 mr-1"></i>{u.address}</span>}
                          </div>
                        )}
                        {u.role === 'vendor' && u.categories && u.categories.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {u.categories.slice(0, 3).map((c: string) => <span key={c} className="text-[9px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{c}</span>)}
                          </div>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${u.role === 'customer' ? 'bg-blue-100 text-blue-600' : 'bg-brand-100 text-brand-600'
                            }`}>
                            {u.role}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${u.status === 'suspended' ? 'bg-red-100 text-red-600' :
                            u.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-emerald-100 text-emerald-600'
                            }`}>
                            {u.status === 'suspended' ? 'Suspended' : u.status === 'pending' ? 'Pending' : 'Active'}
                          </span>
                          {u.role === 'vendor' && (() => {
                            const allOrders = JSON.parse(localStorage.getItem('mamu_orders') || '[]');
                            const getComm = (price: number) => price >= 5000 ? 0.10 : price >= 1000 ? 0.15 : 0.20;
                            const grossRevenue = allOrders.reduce((sum: number, o: any) => {
                              return sum + (o.items || [])
                                .filter((i: any) => i.vendorId === u.id)
                                .reduce((s: number, i: any) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
                            }, 0);
                            const commission = allOrders.reduce((sum: number, o: any) => {
                              return sum + (o.items || [])
                                .filter((i: any) => i.vendorId === u.id)
                                .reduce((s: number, i: any) => {
                                  const p = Number(i.price) || 0;
                                  return s + p * (Number(i.quantity) || 1) * getComm(p);
                                }, 0);
                            }, 0);
                            const netRevenue = grossRevenue - commission;
                            if (grossRevenue === 0) return null;
                            return (
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" title={`Gross: ৳${Math.round(grossRevenue).toLocaleString()} | Commission: ৳${Math.round(commission).toLocaleString()}`}>
                                ৳{Math.round(netRevenue).toLocaleString()} earned
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {u.verified && (
                        <button
                          onClick={() => handleRevokeVerification(u)}
                          className="bg-orange-100 text-orange-600 rounded-xl px-3 py-1 text-xs font-black hover:bg-orange-200 transition-colors mb-1"
                        >
                          Revoke Verification
                        </button>
                      )}
                      {u.status !== 'suspended' ? (
                        <button
                          onClick={() => { setSuspendTarget(u); setSuspendModal(true); setSuspendReason(''); setCustomReason(''); }}
                          className="bg-red-100 text-red-600 rounded-xl px-3 py-1 text-xs font-black hover:bg-red-200 transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserStatus(u.id, 'active')}
                          className="bg-emerald-100 text-emerald-600 rounded-xl px-3 py-1 text-xs font-black hover:bg-emerald-200 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-20 font-bold">No users found</p>
              )}
            </div>
          )}


          {activeTab === 'Product Monitor' && (() => {
            const approved = JSON.parse(localStorage.getItem('approved_products') || '[]');
            const pending = JSON.parse(localStorage.getItem('pending_products') || '[]');
            const allVendors = data.users.filter((u: any) => u.role === 'vendor');
            const vendorStats = allVendors.map((v: any) => {
              const vApproved = approved.filter((p: any) => p.vendorId === v.id);
              const vPending = pending.filter((p: any) => p.vendorId === v.id && p.status !== 'rejected');
              const vRejected = pending.filter((p: any) => p.vendorId === v.id && p.status === 'rejected');
              return { ...v, approved: vApproved, pending: vPending, rejected: vRejected };
            }).filter((v: any) => v.approved.length + v.pending.length + v.rejected.length > 0 || true);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-2xl font-black text-gray-900">{approved.length}</p>
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-1">Active Products</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-2xl font-black text-gray-900">{pending.filter((p: any) => p.status !== 'rejected').length}</p>
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest mt-1">Pending Approval</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-2xl font-black text-gray-900">{pending.filter((p: any) => p.status === 'rejected').length}</p>
                    <p className="text-xs font-black text-red-500 uppercase tracking-widest mt-1">Rejected</p>
                  </div>
                </div>
                {vendorStats.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <p className="text-gray-400 font-bold">No vendors with products yet</p>
                  </div>
                ) : (
                  vendorStats.map((v: any) => (
                    <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center gap-4 mb-4">
                        {v.avatar && <img src={v.avatar} referrerPolicy="no-referrer" alt={v.name} className="w-10 h-10 rounded-xl object-cover" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900">{v.storeName || v.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{v.email}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-black">
                          <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">{v.approved.length} Active</span>
                          {v.pending.length > 0 && <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">{v.pending.length} Pending</span>}
                          {v.rejected.length > 0 && <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-full">{v.rejected.length} Rejected</span>}
                        </div>
                      </div>
                      {v.approved.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {v.approved.slice(0, 6).map((p: any) => (
                            <div key={p.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                              {p.mainImage && <img src={p.mainImage} referrerPolicy="no-referrer" alt={p.productName} className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{p.productName || p.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">৳{(p.price || 0).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                          {v.approved.length > 6 && (
                            <div className="flex items-center justify-center p-2 bg-gray-50 rounded-xl">
                              <p className="text-xs font-black text-gray-400">+{v.approved.length - 6} more</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            );
          })()}



          {activeTab === 'Order Management' && (
            <OrderManagementPanel setToast={setToast} />
          )}
        </main>
      </div>

      {suspendModal && suspendTarget && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setSuspendModal(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-gray-900 mb-2">Suspend User</h3>
            <p className="text-gray-400 text-sm font-bold mb-8">{suspendTarget.name} — {suspendTarget.email}</p>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">Select Reason</label>
            <div className="space-y-3 mb-6">
              {[
                'Violation of platform policies',
                'Fraudulent activity detected',
                'Multiple customer complaints',
                'Selling prohibited items',
                'Payment issues',
                'Custom reason'
              ].map(reason => (
                <button
                  key={reason}
                  onClick={() => setSuspendReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${suspendReason === reason ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {suspendReason === 'Custom reason' && (
              <textarea
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Write your reason..."
                rows={3}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 outline-none font-bold border-none text-sm resize-none mb-6"
              />
            )}
            <div className="flex gap-3">
              <button onClick={() => setSuspendModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all">Cancel</button>
              <button
                onClick={() => {
                  const finalReason = suspendReason === 'Custom reason' ? customReason : suspendReason;
                  if (!finalReason) return;
                  handleUserStatus(suspendTarget.id, 'suspended', finalReason);
                  setSuspendModal(false);
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-black text-sm hover:bg-red-600 transition-all"
              >
                Confirm Suspend
              </button>
            </div>
          </div>
        </div>
      )}
      {revokeModal && revokeTarget && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setRevokeModal(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-gray-900 mb-2">Revoke Verification</h3>
            <p className="text-gray-400 text-sm font-bold mb-8">{revokeTarget.name} — {revokeTarget.email}</p>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">Select Reason</label>
            <div className="space-y-3 mb-6">
              {[
                'Invalid or expired documents',
                'Violation of verification terms',
                'Fraudulent activity reported',
                'Business no longer active',
                'Custom reason'
              ].map(reason => (
                <button
                  key={reason}
                  onClick={() => setRevokeReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${revokeReason === reason ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {revokeReason === 'Custom reason' && (
              <textarea
                value={customRevokeReason}
                onChange={e => setCustomRevokeReason(e.target.value)}
                placeholder="Write your reason..."
                rows={3}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 outline-none font-bold border-none text-sm resize-none mb-6"
              />
            )}
            <div className="flex gap-3">
              <button onClick={() => setRevokeModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all">Cancel</button>
              <button
                onClick={confirmRevocation}
                className="flex-1 py-3 bg-orange-500 text-white rounded-2xl font-black text-sm hover:bg-orange-600 transition-all"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
