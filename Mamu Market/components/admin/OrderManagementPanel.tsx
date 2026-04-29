import React, { useState } from 'react';


// নতুন — component এর বাইরে উপরে যোগ করো
const deriveOverallStatus = (vendorStatuses: Record<string, string>): string => {
  const statuses = Object.values(vendorStatuses);
  if (statuses.every(s => s === 'Completed')) return 'Completed';
  if (statuses.every(s => s === 'Delivered' || s === 'Completed')) return 'Delivered';
  if (statuses.every(s => s === 'Cancelled')) return 'Cancelled';
  if (statuses.some(s => s === 'Shipped' || s === 'Delivered' || s === 'Completed')) return 'Shipped';
  if (statuses.some(s => s === 'Packed')) return 'Packed';
  return 'Processing';
};

const OrderManagementPanel: React.FC<{ setToast: (msg: string) => void }> = ({ setToast }) => {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>(() => JSON.parse(localStorage.getItem('mamu_orders') || '[]'));

  const allOrders = orders;

  React.useEffect(() => {
    const checkAutoComplete = () => {
      const stored: any[] = JSON.parse(localStorage.getItem('mamu_orders') || '[]');
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      let changed = false;
      const updated = stored.map((o: any) => {
        if (o.status === 'Delivered' && o.deliveredAt) {
          if (now - new Date(o.deliveredAt).getTime() >= sevenDays) {
            changed = true;
            const newVendorStatuses = o.vendorStatuses
              ? Object.fromEntries(Object.keys(o.vendorStatuses).map(vid => [vid, 'Completed']))
              : {};
            return { ...o, status: 'Completed', vendorStatuses: newVendorStatuses };
          }
        }
        return o;
      });
      if (changed) {
        localStorage.setItem('mamu_orders', JSON.stringify(updated));
        setOrders(updated);
      }
    };
    checkAutoComplete();
    const interval = setInterval(checkAutoComplete, 60000);
    return () => clearInterval(interval);
  }, []);

  const saveOrders = (updated: any[]) => {
    localStorage.setItem('mamu_orders', JSON.stringify(updated));
    setOrders(updated);
  };

  const pushNotification = (userId: string, orderId: string, type: 'cancel_approved' | 'cancel_rejected' | 'shipped' | 'delivered', message: string) => {
    const notifs = JSON.parse(localStorage.getItem(`mamu_notifs_${userId}`) || '[]');
    notifs.unshift({ id: 'n_' + Date.now(), userId, orderId, type, message, read: false, date: new Date().toLocaleDateString('en-GB') });
    localStorage.setItem(`mamu_notifs_${userId}`, JSON.stringify(notifs));
  };

  // Admin forwards cancel request to vendor for their decision
  const handleForwardToVendor = (orderId: string) => {
    const updated = orders.map((o: any) => o.id === orderId ? { ...o, cancelRequest: 'vendor_review' } : o);
    saveOrders(updated);
    setToast(`Cancel request forwarded to vendor for order ${orderId}`);
  };

  // Admin directly approves cancel (bypassing vendor)
  const handleAdminApprove = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    const updated = orders.map((o: any) => o.id === orderId ? { ...o, status: 'Cancelled', cancelRequest: 'approved' } : o);
    saveOrders(updated);
    
    // Restore stock
    if (order?.items?.length) {
      const approvedProds = JSON.parse(localStorage.getItem('approved_products') || '[]');
      const updatedProds = approvedProds.map((prod: any) => {
        const cancelledItem = order.items.find((i: any) => i.id === prod.id);
        if (!cancelledItem) return prod;
        const restoredUnits = (Number(prod.units) || 0) + cancelledItem.quantity;
        return { ...prod, units: restoredUnits, inStock: restoredUnits > 0 };
      });
      localStorage.setItem('approved_products', JSON.stringify(updatedProds));
    }

    if (order?.userId) {
      pushNotification(order.userId, orderId, 'cancel_approved', `Your cancellation request for order ${orderId} has been approved. Your order has been cancelled.`);
    }
    setToast(`Order ${orderId} cancelled. Customer notified`);
  };

  // Admin directly rejects cancel (bypassing vendor)
  const handleAdminReject = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    const updated = orders.map((o: any) => o.id === orderId ? { ...o, cancelRequest: 'rejected' } : o);
    saveOrders(updated);
    if (order?.userId) {
      pushNotification(order.userId, orderId, 'cancel_rejected', `Your cancellation request for order ${orderId} cannot be processed at this point. Your order remains active.`);
    }
    setToast(`Cancel request rejected for ${orderId}. Customer notified`);
  };

  // Admin finalizes after vendor decision
  const handleFinalizeVendorDecision = (orderId: string, vendorDecision: 'vendor_approved' | 'vendor_rejected') => {
    const order = orders.find((o: any) => o.id === orderId);
    if (vendorDecision === 'vendor_approved') {
      const updated = orders.map((o: any) => o.id === orderId ? { ...o, status: 'Cancelled', cancelRequest: 'approved' } : o);
      saveOrders(updated);
      if (order?.userId) {
        pushNotification(order.userId, orderId, 'cancel_approved', `Your cancellation request for order ${orderId} has been approved by the vendor. Your order has been cancelled.`);
      }
      setToast(`Order ${orderId} cancelled. Customer notified`);
    } else {
      const updated = orders.map((o: any) => o.id === orderId ? { ...o, cancelRequest: 'rejected' } : o);
      saveOrders(updated);
      if (order?.userId) {
        pushNotification(order.userId, orderId, 'cancel_rejected', `Your cancellation request for order ${orderId} has been reviewed. Unfortunately, the vendor cannot cancel this order at this stage.`);
      }
      setToast(`Cancel rejected for ${orderId}. Customer notified`);
    }
  };

  // Admin updates order status — updates all vendor statuses too
  const handleStatusChange = (orderId: string, newStatus: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    const updated = orders.map((o: any) => {
      if (o.id !== orderId) return o;
      // সব vendor এর status একসাথে update করো (admin override)
      const newVendorStatuses = o.vendorStatuses
        ? Object.fromEntries(Object.keys(o.vendorStatuses).map(vid => [vid, newStatus]))
        : {};
      return { 
        ...o, 
        status: newStatus, 
        vendorStatuses: newVendorStatuses,
        ...(newStatus === 'Delivered' ? { deliveredAt: new Date().toISOString() } : {})
      };
    });
    saveOrders(updated);

    if (order?.userId) {
      if (newStatus === 'Shipped') {
        pushNotification(order.userId, orderId, 'shipped', `Your order ${orderId} has been shipped and is on its way!`);
      } else if (newStatus === 'Delivered') {
        pushNotification(order.userId, orderId, 'delivered', `Your order ${orderId} has been delivered. Thank you for shopping with us!`);
      }
    }

    setToast(`Order ${orderId} → ${newStatus}`);
  };

  const cancelRequests = orders.filter((o: any) => ['pending', 'vendor_approved', 'vendor_rejected'].includes(o.cancelRequest));

  const getCommission = (price: number) => price >= 5000 ? 0.10 : price >= 1000 ? 0.15 : 0.20;

  const filtered = allOrders.filter((o: any) => {
    const matchSearch = o.id?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchFilter = orderFilter === 'All' || o.status === orderFilter;
    return matchSearch && matchFilter;
  });

  const totalGMV = allOrders.filter((o: any) => o.status === 'Delivered' || o.status === 'Completed').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const totalCommission = allOrders.filter((o: any) => o.status === 'Delivered' || o.status === 'Completed').reduce((s: number, o: any) => {
    return s + (o.items || []).reduce((si: number, item: any) => {
      return si + (item.price || 0) * (item.quantity || 1) * getCommission(item.price || 0);
    }, 0);
  }, 0);
  const statusCounts = { Processing: 0, Packed: 0, Shipped: 0, Delivered: 0, Completed: 0, Cancelled: 0 } as Record<string, number>;
  allOrders.forEach((o: any) => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

  const statusColor: Record<string, string> = {
    Processing: 'bg-amber-100 text-amber-600',
    Packed: 'bg-purple-100 text-purple-600',
    Shipped: 'bg-blue-100 text-blue-600',
    Delivered: 'bg-emerald-100 text-emerald-600',
    Completed: 'bg-teal-100 text-teal-600',
    Cancelled: 'bg-red-100 text-red-500',
  };

  return (
    <div className="space-y-6">

      {/* Cancel Request Alerts */}
      {cancelRequests.length > 0 && (
        <div className="bg-white border border-red-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-red-50 px-5 py-3 flex items-center gap-2 border-b border-red-100">
            <i className="fas fa-bell text-red-400 text-xs"></i>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
              Cancel Requests — {cancelRequests.length} need attention
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {cancelRequests.map((o: any) => (
              <div key={o.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-gray-900 text-sm">{o.id}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      o.cancelRequest === 'pending' ? 'bg-amber-100 text-amber-600' :
                      o.cancelRequest === 'vendor_approved' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-red-100 text-red-500'
                    }`}>
                      {o.cancelRequest === 'pending' ? 'Awaiting Action' : o.cancelRequest === 'vendor_approved' ? 'Vendor Approved' : 'Vendor Rejected'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {o.userName || o.userId || '—'} · ৳{(o.total || 0).toLocaleString()} · Order: {o.status}
                  </p>
                  {o.cancelReason && (
                    <p className="text-xs text-red-400 font-bold mt-1">
                      <i className="fas fa-quote-left text-[8px] mr-1 opacity-50"></i>{o.cancelReason}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {o.cancelRequest === 'pending' && (
                    <>
                      <button onClick={() => handleForwardToVendor(o.id)} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                        <i className="fas fa-share mr-1"></i>Forward to Vendor
                      </button>
                      <button onClick={() => handleAdminApprove(o.id)} className="px-3 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                        Approve
                      </button>
                      <button onClick={() => handleAdminReject(o.id)} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                        Reject
                      </button>
                    </>
                  )}
                  {(o.cancelRequest === 'vendor_approved' || o.cancelRequest === 'vendor_rejected') && (
                    <button
                      onClick={() => handleFinalizeVendorDecision(o.id, o.cancelRequest)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        o.cancelRequest === 'vendor_approved'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <i className="fas fa-paper-plane mr-1"></i>
                      {o.cancelRequest === 'vendor_approved' ? 'Confirm Cancel & Notify' : 'Notify Rejection'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: allOrders.length, icon: 'fa-receipt', color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Total GMV', value: '৳' + Math.round(totalGMV).toLocaleString(), icon: 'fa-chart-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Commission', value: '৳' + Math.round(totalCommission).toLocaleString(), icon: 'fa-coins', color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Processing', value: statusCounts.Processing, icon: 'fa-clock', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Packed', value: statusCounts.Packed, icon: 'fa-box', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Shipped', value: statusCounts.Shipped, icon: 'fa-truck', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Delivered', value: statusCounts.Delivered, icon: 'fa-check-circle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Completed', value: statusCounts.Completed, icon: 'fa-wallet', color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Cancelled', value: statusCounts.Cancelled, icon: 'fa-times-circle', color: 'text-red-500', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <i className={`fas ${s.icon} text-sm ${s.color}`}></i>
            </div>
            <p className="text-xl font-black text-gray-900">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="🔍 Search by Order ID..."
          value={orderSearch}
          onChange={e => setOrderSearch(e.target.value)}
          className="flex-1 min-w-[180px] bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold outline-none border border-gray-100 focus:border-brand-400"
        />
        {['All', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Completed', 'Cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setOrderFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${orderFilter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-400 border-gray-200 hover:border-brand-400 hover:text-brand-600'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 font-bold py-12">No orders found</p>
        ) : (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-6 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
              {['Order ID', 'Date', 'Status', 'Items', 'Total', 'Commission'].map(h => (
                <p key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
              ))}
            </div>

            {filtered.map((order: any) => {
              const isExpanded = expandedOrder === order.id;
              const commission = (order.items || []).reduce((s: number, item: any) => {
                return s + (item.price || 0) * (item.quantity || 1) * getCommission(item.price || 0);
              }, 0);

              return (
                <div key={order.id}>
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className={`grid grid-cols-6 gap-2 px-5 py-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 ${isExpanded ? 'bg-brand-50' : ''}`}
                  >
                    <p className="font-black text-gray-900 text-sm">{order.id}</p>
                    <p className="text-xs font-medium text-gray-500">{order.date}</p>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full w-fit ${statusColor[order.status] || 'bg-gray-100 text-gray-500'}`}>
                      {order.status}
                    </span>
                    <p className="text-xs font-medium text-gray-500">{(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}</p>
                    <p className="text-sm font-black text-gray-900">৳{(order.total || 0).toLocaleString()}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-emerald-600">৳{Math.round(commission).toLocaleString()}</p>
                      <i className={`fas fa-chevron-down text-[10px] text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 py-5 bg-brand-50 border-b-2 border-brand-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Items */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Order Items</p>
                          <div className="space-y-2">
                            {(order.items || []).map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-brand-100">
                                {item.image ? (
                                  <img src={item.image || 'https://via.placeholder.com/150'} referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" onError={e => (e.currentTarget.style.display='none')} />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                                    <i className="fas fa-box text-brand-400 text-xs"></i>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-gray-900 truncate">{item.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">{item.vendorName || item.vendor || '—'} · Qty: {item.quantity}</p>
                                </div>
                                <p className="text-xs font-black text-brand-600 shrink-0">৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                              <i className="fas fa-shield-halved text-brand-500 text-xs"></i>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Admin Control</p>
                            </div>
                            <div className="bg-white p-4">
                              {/* Pending → forward to vendor or direct action */}
                              {order.cancelRequest === 'pending' && (
                                <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                  <p className="text-xs font-black text-amber-700 mb-2">
                                    <i className="fas fa-hourglass-half mr-1.5"></i>
                                    Customer cancel request{order.cancelReason ? <span className="font-medium"> — "{order.cancelReason}"</span> : ''}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <button onClick={e => { e.stopPropagation(); handleForwardToVendor(order.id); }} className="px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                                      <i className="fas fa-share mr-1.5"></i>Forward to Vendor
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); handleAdminApprove(order.id); }} className="px-4 py-2 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                                      Approve & Cancel
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); handleAdminReject(order.id); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              )}
                              {/* Forwarded — waiting for vendor */}
                              {order.cancelRequest === 'vendor_review' && (
                                <div className="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2">
                                  <i className="fas fa-clock text-blue-400 text-xs"></i>
                                  <p className="text-xs font-bold text-blue-600">Cancel request forwarded — waiting for vendor decision</p>
                                </div>
                              )}
                              {/* Vendor decided — admin must finalize + notify */}
                              {(order.cancelRequest === 'vendor_approved' || order.cancelRequest === 'vendor_rejected') && (
                                <div className={`mb-3 p-3 rounded-xl border ${order.cancelRequest === 'vendor_approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                                  <p className={`text-xs font-black mb-2 ${order.cancelRequest === 'vendor_approved' ? 'text-emerald-700' : 'text-orange-600'}`}>
                                    <i className={`fas ${order.cancelRequest === 'vendor_approved' ? 'fa-check' : 'fa-times'} mr-1.5`}></i>
                                    Vendor {order.cancelRequest === 'vendor_approved' ? 'approved' : 'rejected'} the cancel request
                                  </p>
                                  <button
                                    onClick={e => { e.stopPropagation(); handleFinalizeVendorDecision(order.id, order.cancelRequest); }}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${order.cancelRequest === 'vendor_approved' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                  >
                                    <i className="fas fa-paper-plane mr-1.5"></i>
                                    {order.cancelRequest === 'vendor_approved' ? 'Confirm Cancel & Notify Customer' : 'Notify Customer of Rejection'}
                                  </button>
                                </div>
                              )}
                              {/* Normal status update */}
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Update Order Status</p>
                              <div className="flex flex-wrap gap-2">
                                {(['Processing', 'Packed', 'Shipped', 'Delivered', 'Completed', 'Cancelled'] as const).map(s => (
                                  <button
                                    key={s}
                                    onClick={e => { e.stopPropagation(); handleStatusChange(order.id, s); }}
                                    disabled={order.status === s || order.status === 'Cancelled'}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                      order.status === s
                                        ? 'bg-brand-600 text-white border-brand-600 cursor-default'
                                        : order.status === 'Cancelled'
                                        ? 'opacity-40 cursor-not-allowed bg-white text-gray-400 border-gray-200'
                                        : s === 'Cancelled'
                                        ? 'bg-white text-red-400 border-red-200 hover:bg-red-50'
                                        : 'bg-white text-gray-400 border-gray-200 hover:border-brand-400 hover:text-brand-600'
                                    }`}
                                  >
                                    {order.status === s && <i className="fas fa-check mr-1"></i>}
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Order Info</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { k: 'Order ID', v: order.id },
                              { k: 'Date', v: order.date },
                              { k: 'Total Amount', v: '৳' + (order.total || 0).toLocaleString(), highlight: true },
                              { k: 'Commission', v: '৳' + Math.round(commission).toLocaleString(), green: true },
                              { k: 'Customer', v: order.userName || order.userId || '—' },
                              { k: 'Status', v: order.status },
                            ].map(row => (
                              <div key={row.k} className="bg-white rounded-xl p-3 border border-brand-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{row.k}</p>
                                <p className={`text-xs font-black mt-1 ${row.highlight ? 'text-brand-600' : row.green ? 'text-emerald-600' : 'text-gray-900'}`}>{row.v}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 font-medium text-center">
        Total Platform Commission from all orders: <span className="text-emerald-600 font-black">৳{Math.round(totalCommission).toLocaleString()}</span>
      </p>
    </div>
  );
};

export default OrderManagementPanel;
