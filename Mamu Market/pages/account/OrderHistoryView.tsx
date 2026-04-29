import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CartItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: CartItem[];
  userId: string;
  userName?: string;
  promoCode?: string;
  discount?: number;
  cancelRequest?: string;
  cancelReason?: string;
  createdAt?: string;
  vendorStatuses?: Record<string, string>;
}

interface Notification {
  id: string;
  userId: string;
  orderId: string;
  type: 'cancel_approved' | 'cancel_rejected' | 'shipped' | 'delivered' | 'completed';
  message: string;
  read: boolean;
  date: string;
}

const STATUS_STEPS = ['Processing', 'Packed', 'Shipped', 'Delivered', 'Completed'];


const getVendorName = (vendorId: string): string => {
  try {
    const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
    const vendor = users.find((u: any) => u.id === vendorId);
    return vendor?.storeName || vendor?.name || 'Vendor';
  } catch {
    return 'Vendor';
  }
};

const statusColor: Record<string, string> = {
  Processing: 'bg-amber-50 text-amber-600 border-amber-100',
  Shipped: 'bg-blue-50 text-blue-600 border-blue-100',
  Delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Completed: 'bg-teal-50 text-teal-600 border-teal-100',
  Cancelled: 'bg-red-50 text-red-500 border-red-100',
};

const OrderHistoryView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadData = () => {
    if (!user) return;
    const allOrders = JSON.parse(localStorage.getItem('mamu_orders') || '[]');
    setOrders(allOrders.filter((o: Order) => o.userId === user.id));
    const allNotifs = JSON.parse(localStorage.getItem(`mamu_notifs_${user.id}`) || '[]');
    setNotifications(allNotifs);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const markNotifRead = (notifId: string) => {
    const all = JSON.parse(localStorage.getItem(`mamu_notifs_${user?.id}`) || '[]');
    const updated = all.map((n: Notification) => n.id === notifId ? { ...n, read: true } : n);
    localStorage.setItem(`mamu_notifs_${user?.id}`, JSON.stringify(updated));
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    const all = JSON.parse(localStorage.getItem(`mamu_notifs_${user?.id}`) || '[]');
    const updated = all.map((n: Notification) => ({ ...n, read: true }));
    localStorage.setItem(`mamu_notifs_${user?.id}`, JSON.stringify(updated));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Sends a cancel REQUEST — does NOT cancel directly. Admin/vendor must approve.
  const handleSendCancelRequest = (orderId: string) => {
    if (!cancelReason.trim()) return;
    const allOrders = JSON.parse(localStorage.getItem('mamu_orders') || '[]');
    const updated = allOrders.map((o: any) =>
      o.id === orderId ? { ...o, cancelRequest: 'pending', cancelReason: cancelReason.trim() } : o
    );
    localStorage.setItem('mamu_orders', JSON.stringify(updated));
    loadData();
    setCancelModalOrderId(null);
    setCancelReason('');
  };

  // Customer confirms they received the order → marks as Completed
  const handleConfirmReceived = (orderId: string) => {
    const allOrders: any[] = JSON.parse(localStorage.getItem('mamu_orders') || '[]');
    const order = allOrders.find((o: any) => o.id === orderId);
    if (!order) return;
    const completedAt = new Date().toISOString();
    const newVendorStatuses = order.vendorStatuses
      ? Object.fromEntries(Object.keys(order.vendorStatuses).map((vid: string) => [vid, 'Completed']))
      : {};
    const updated = allOrders.map((o: any) =>
      o.id === orderId
        ? { ...o, status: 'Completed', completedAt, vendorStatuses: newVendorStatuses }
        : o
    );
    localStorage.setItem('mamu_orders', JSON.stringify(updated));
    // Notify the customer
    if (user?.id) {
      const notifs = JSON.parse(localStorage.getItem(`mamu_notifs_${user.id}`) || '[]');
      notifs.unshift({
        id: 'n_' + Date.now(),
        userId: user.id,
        orderId,
        type: 'completed',
        message: `You confirmed receipt of order ${orderId}. Your order is now Completed. Thank you!`,
        read: false,
        date: new Date().toLocaleDateString('en-GB'),
      });
      localStorage.setItem(`mamu_notifs_${user.id}`, JSON.stringify(notifs));
    }
    loadData();
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">Order History</h1>

        {/* In-app Notifications */}
        {notifications.length > 0 && (
          <div className="mb-10 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <i className="fas fa-bell text-brand-500"></i>
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="w-5 h-5 bg-brand-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </p>
              {notifications.some(n => !n.read) && (
                <button onClick={markAllRead} className="text-[10px] font-black text-gray-400 hover:text-brand-600 uppercase tracking-widest transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotifRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-all ${!n.read ? 'bg-brand-50' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.type === 'cancel_approved' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                    <i className={`fas ${n.type === 'cancel_approved' ? 'fa-check text-emerald-500' : 'fa-times text-orange-400'} text-xs`}></i>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold leading-relaxed ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>{n.message}</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-1">{n.date} · Order: {n.orderId}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-brand-600 rounded-full mt-2 shrink-0"></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-50 gap-4">
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                    <h3 className="text-xl font-black text-gray-900">#{order.id}</h3>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Date Placed</p>
                    <p className="font-bold text-gray-700">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : order.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="font-black text-brand-600 text-lg">৳{order.total.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {/* Cancelled or in-progress tracker */}
                    {order.status === 'Cancelled' ? (
                      <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-red-100 text-red-500">
                        Cancelled
                      </span>
                    ) : (
                      <div className="flex items-center justify-between w-full mt-1">
                        {STATUS_STEPS.map((step, i) => {
                          const activeIdx = STATUS_STEPS.indexOf(order.status);
                          const done = i <= activeIdx;
                          const isCurrent = i === activeIdx;
                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2 ${done ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-200' : 'bg-white border-gray-200 text-gray-300'
                                  } ${isCurrent ? 'ring-4 ring-brand-100 scale-110' : ''}`}>
                                  {done && !isCurrent ? <i className="fas fa-check text-[10px]"></i> : i + 1}
                                </div>
                                <p className={`text-[8px] font-black uppercase tracking-wide text-center leading-tight max-w-[56px] ${done ? 'text-brand-600' : 'text-gray-300'}`}>{step}</p>
                              </div>
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mb-5 mx-1 rounded-full ${i < activeIdx ? 'bg-brand-600' : 'bg-gray-100'}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {/* Cancel request states — only relevant during Processing */}
                    {order.status === 'Processing' && (
                      <div className="text-right">
                        {!order.cancelRequest && (
                          <button
                            onClick={() => { setCancelModalOrderId(order.id); setCancelReason(''); }}
                            className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                          >
                            Request Cancel
                          </button>
                        )}
                        {order.cancelRequest === 'pending' && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                            <i className="fas fa-clock mr-1"></i>Awaiting Review
                          </span>
                        )}
                        {order.cancelRequest === 'vendor_review' && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                            <i className="fas fa-clock mr-1"></i>Vendor Reviewing
                          </span>
                        )}
                        {(order.cancelRequest === 'rejected' || order.cancelRequest === 'vendor_rejected') && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                            <i className="fas fa-times mr-1"></i>Cannot Be Cancelled
                          </span>
                        )}
                      </div>
                    )}

                    {/* Delivered — customer confirms receipt */}
                    {order.status === 'Delivered' && (
                      <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                            <i className="fas fa-box-open text-emerald-600 text-sm"></i>
                          </div>
                          <div>
                            <p className="text-sm font-black text-emerald-800">Your order has been delivered!</p>
                            <p className="text-[10px] font-medium text-emerald-500 mt-0.5">
                              Please confirm receipt to complete your order. Auto-completes in 7 days if not confirmed.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleConfirmReceived(order.id)}
                          className="shrink-0 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-200 whitespace-nowrap"
                        >
                          <i className="fas fa-check mr-2"></i>Confirm Received
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {order.promoCode && (
                  <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                    <i className="fas fa-tag text-emerald-500"></i>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Promo Applied</p>
                      <p className="text-xs font-black text-gray-900">
                        {order.promoCode}
                        {order.discount ? <span className="text-emerald-600 font-bold ml-2">— saved ৳{order.discount.toLocaleString()}</span> : null}
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  {(() => {
                    const groups: Record<string, typeof order.items> = {};
                    order.items.forEach((item: any) => {
                      const vid = item.vendorId || 'unknown';
                      if (!groups[vid]) groups[vid] = [];
                      groups[vid].push(item);
                    });
                    return Object.entries(groups).map(([vid, items]) => {
                      const vendorStatus = order.vendorStatuses?.[vid] || order.status;
                      const vendorName = getVendorName(vid);
                      return (
                        <div key={vid} className="border border-gray-100 rounded-2xl overflow-hidden">
                          {/* Vendor header with status */}
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-store text-gray-400 text-xs"></i>
                              <span className="text-xs font-black text-gray-700">{vendorName}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${statusColor[vendorStatus] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              {vendorStatus}
                            </span>
                          </div>
                          {/* Items from this vendor */}
                          <div className="divide-y divide-gray-50">
                            {(items as any[]).map((item: any, index: number) => (
                              <div key={index} className="flex items-center gap-4 bg-white p-4">
                                <img src={item.image || 'https://via.placeholder.com/150?text=Product'} referrerPolicy="no-referrer" alt={item.name} className="w-14 h-14 object-cover rounded-lg bg-gray-50" />
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                                  <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                                  {/* Review feature removed as per simplified flow */}
                                </div>
                                <p className="font-black text-gray-900 text-sm">৳{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-box-open text-3xl text-gray-200"></i>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">No orders yet</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">When you make a purchase, your order details will appear here.</p>
          </div>
        )}
      </div>

      {/* Cancel Request Modal */}
      {cancelModalOrderId && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setCancelModalOrderId(null)}
        >
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-5">
              <i className="fas fa-ban text-red-500 text-xl"></i>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Request Cancellation</h3>
            <p className="text-sm text-gray-400 font-medium mb-6 leading-relaxed">
              Your request will be reviewed by our team and the vendor. The order will <strong className="text-gray-700">not be cancelled</strong> until approved.
            </p>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind, ordered wrong item..."
              rows={3}
              className="w-full bg-gray-50 rounded-2xl px-5 py-4 outline-none font-medium text-sm border border-gray-100 focus:border-brand-300 resize-none mb-6 transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleSendCancelRequest(cancelModalOrderId)}
                disabled={!cancelReason.trim()}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send Request
              </button>
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryView;
