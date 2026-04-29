import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartItem, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { safeGet, safeSet } from '../../utils/storage';
import { getShippingFee } from '../../constants';

const CITIES = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh', 'Comilla', 'Narayanganj'];

const CheckoutView: React.FC = () => {
  const { cart, setCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const promoData = safeGet('checkout_promo', null);
  const appliedPromo = promoData?.promo || null;
  const productDiscount = promoData?.discount || 0;
  const deliveryDiscount = promoData?.deliveryDiscount || 0;

  const getStepFromPath = (): number => {
    if (location.pathname === '/checkout/payment') return 2;
    if (location.pathname === '/checkout/confirmation') return 3;
    return 1;
  };

  const step = getStepFromPath();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [address, setAddress] = useState(() => {
    const saved = sessionStorage.getItem('checkout_address');
    if (saved) return JSON.parse(saved);
    return {
      name: user?.name || '',
      phone: (user as any)?.phone || '',
      street: (user as any)?.address || '',
      area: '',
      city: '',
    };
  });
  const [placing, setPlacing] = useState(false);

  // Save address to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem('checkout_address', JSON.stringify(address));
  }, [address]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = getShippingFee(subtotal);
  const effectiveShipping = shippingFee - deliveryDiscount;
  const grandTotal = subtotal - productDiscount + effectiveShipping;

  useEffect(() => {
    if (orderPlaced) return;
    if (!user) {
      navigate('/user-login');
    } else if (cart.length === 0) {
      navigate('/cart');
    }
  }, [user, cart.length, navigate, orderPlaced]);

  if (!orderPlaced && (!user || cart.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="fas fa-spinner fa-spin text-3xl text-gray-300" />
      </div>
    );
  }

  const canProceedStep1 = address.name.trim() && /^01[3-9]\d{8}$/.test(address.phone.trim()) && address.street.trim() && address.city;

  const navigateToStep = (s: number) => {
    if (s === 1) navigate('/checkout/delivery');
    else if (s === 2) navigate('/checkout/payment');
    else if (s === 3) navigate('/checkout/confirmation');
  };

  const placeOrder = () => {
    setPlacing(true);
    const masterOrderId = 'ORD-' + Date.now().toString().slice(-6);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const createdAt = now.toISOString();

    // Group items by vendorId for sub-orders
    const vendorGroups: Record<string, any[]> = {};
    cart.forEach((item: any) => {
      const vid = item.vendorId || 'unknown';
      if (!vendorGroups[vid]) vendorGroups[vid] = [];
      vendorGroups[vid].push(item);
    });

    const uniqueVendorIds = Object.keys(vendorGroups);
    const vendorStatuses: Record<string, string> = {};
    uniqueVendorIds.forEach(vid => { vendorStatuses[vid] = 'Processing'; });

    // Create master order
    const masterOrder = {
      id: masterOrderId,
      type: 'master',
      date: dateStr,
      createdAt,
      total: grandTotal,
      subtotal,
      shippingFee: effectiveShipping,
      originalShipping: shippingFee,
      deliveryDiscount,
      status: 'Processing',
      vendorStatuses,
      items: cart,
      userId: user.id,
      userName: user.name,
      address,
      paymentMethod: 'cod',
      ...(appliedPromo ? { promoCode: appliedPromo.code, discount: productDiscount } : {}),
      subOrderIds: uniqueVendorIds.map((vid, i) => `${masterOrderId}-V${i + 1}`),
    };

    // Create sub-orders per vendor
    const subOrders = uniqueVendorIds.map((vid, i) => {
      const vendorItems = vendorGroups[vid];
      const vendorSubtotal = vendorItems.reduce((s: number, item: any) => s + item.price * item.quantity, 0);
      return {
        id: `${masterOrderId}-V${i + 1}`,
        type: 'sub',
        masterOrderId,
        vendorId: vid,
        vendorName: vendorItems[0]?.vendorName || vendorItems[0]?.vendor || 'Unknown',
        date: dateStr,
        createdAt,
        total: vendorSubtotal,
        subtotal: vendorSubtotal,
        status: 'Processing',
        items: vendorItems,
        userId: user.id,
        userName: user.name,
        address,
        paymentMethod: 'cod',
      };
    });

    const existingOrders = safeGet('mamu_orders', []);
    safeSet('mamu_orders', [masterOrder, ...subOrders, ...existingOrders]);

    const approvedProds = safeGet('approved_products', []);
    const updatedProds = approvedProds.map((prod: any) => {
      const orderedItem = cart.find((i: any) => i.id === prod.id);
      if (!orderedItem) return prod;
      const currentUnits = Number(prod.units) || 0;
      const newUnits = Math.max(0, currentUnits - orderedItem.quantity);
      return { ...prod, units: newUnits, inStock: newUnits > 0 };
    });
    safeSet('approved_products', updatedProds);

    if (appliedPromo) {
      const codes = JSON.parse(localStorage.getItem('promo_codes') || '[]');
      const updated = codes.map((c: any) => c.code === appliedPromo.code ? { ...c, usedCount: (c.usedCount || 0) + 1 } : c);
      safeSet('promo_codes', updated);
    }
    localStorage.removeItem('checkout_promo');
    sessionStorage.removeItem('checkout_address');
    setOrderPlaced(true);
    setCart([]);
    setTimeout(() => navigate('/checkout/success'), 600);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => step === 1 ? navigate('/cart') : navigateToStep(step - 1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-bold text-sm mb-4 transition-colors">
            <i className="fas fa-arrow-left"></i> {step === 1 ? 'Back to Cart' : 'Back'}
          </button>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Checkout</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {['Delivery', 'Payment', 'Confirmation'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'gradient-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {step > i + 1 ? <i className="fas fa-check text-xs"></i> : i + 1}
                </div>
                <span className={`text-sm font-bold hidden sm:block ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > i + 1 ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-lg font-black text-gray-900 mb-6">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                    <input value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })}
                      className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 outline-none font-bold text-sm border-2 border-transparent focus:border-brand-400 transition-all"
                      placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                    <input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })}
                      className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 outline-none font-bold text-sm border-2 border-transparent focus:border-brand-400 transition-all"
                      placeholder="01XXXXXXXXX" type="tel" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Street Address</label>
                    <input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })}
                      className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 outline-none font-bold text-sm border-2 border-transparent focus:border-brand-400 transition-all"
                      placeholder="House no, road, block" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Area / Thana</label>
                      <input value={address.area} onChange={e => setAddress({ ...address, area: e.target.value })}
                        className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 outline-none font-bold text-sm border-2 border-transparent focus:border-brand-400 transition-all"
                        placeholder="e.g. Gulshan" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">City</label>
                      <select value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })}
                        className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 outline-none font-bold text-sm border-2 border-transparent focus:border-brand-400 transition-all appearance-none">
                        <option value="" disabled>Select your city</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => navigateToStep(2)} disabled={!canProceedStep1}
                  className="w-full mt-8 py-4 gradient-primary text-white rounded-2xl font-black text-base shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed">
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment — Cash on Delivery Only */}
            {step === 2 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-lg font-black text-gray-900 mb-2">Payment Method</h2>
                <p className="text-xs text-gray-400 font-medium mb-6">Currently only Cash on Delivery is available</p>
                <div className="space-y-3">
                  <div className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-brand-500 bg-brand-50 text-left">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg gradient-primary text-white">
                      <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-900 text-sm">Cash on Delivery</p>
                      <p className="text-xs text-gray-400 font-medium">Pay when your order arrives</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-brand-500 bg-brand-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
                <button onClick={() => navigateToStep(3)}
                  className="w-full mt-8 py-4 gradient-primary text-white rounded-2xl font-black text-base shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Confirm Order
                </button>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-lg font-black text-gray-900 mb-6">Confirm Your Order</h2>
                <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fas fa-map-marker-alt text-sm"></i>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{address.name} · {address.phone}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{address.street}{address.area ? `, ${address.area}` : ''}, {address.city}</p>
                  </div>
                  <button onClick={() => navigateToStep(1)} className="ml-auto text-brand-500 text-xs font-black hover:underline">Edit</button>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                    <i className="fas fa-money-bill-wave text-sm"></i>
                  </div>
                  <p className="font-black text-gray-900 text-sm">Cash on Delivery</p>
                </div>
                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.image || undefined} referrerPolicy="no-referrer" alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <button onClick={placeOrder} disabled={placing}
                  className="w-full py-4 gradient-primary text-white rounded-2xl font-black text-base shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70">
                  {placing ? <><i className="fas fa-spinner fa-spin mr-2"></i>Placing Order...</> : 'Place Order'}
                </button>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h3 className="font-black text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Subtotal ({cart.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
                </div>
                {productDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-medium">Promo ({appliedPromo?.code})</span>
                    <span className="font-bold text-emerald-600">-৳{productDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Shipping</span>
                  <div className="text-right">
                    {deliveryDiscount > 0 && <p className="text-[10px] text-gray-400 line-through">৳{shippingFee}</p>}
                    <span className="font-bold text-gray-900">৳{effectiveShipping}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  {subtotal >= 10000 ? 'Free delivery on orders ৳10,000+' : subtotal >= 500 ? 'Delivery: ৳120 (orders ৳500–৳1,999)' : 'Delivery: ৳80 (orders under ৳500)'}
                  {deliveryDiscount > 0 ? ` · ৳${deliveryDiscount} discount applied` : ''}
                </p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-xl text-gradient">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
                <i className="fas fa-shield-alt text-emerald-500 text-xs"></i>
                <span className="text-[10px] font-bold text-emerald-600">Cash on Delivery — Pay when received</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
