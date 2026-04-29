import React from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { PRODUCTS, CATEGORIES, getCategoryName } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';

import Layout from '../components/Layout';
import CartDrawer from '../components/cart/CartDrawer';
import Toast from '../components/ui/Toast';

import HomeView from '../pages/home/HomeView';
import ProductsView from '../pages/products/ProductsView';
import ProductDetailsView from '../pages/products/ProductDetailsView';
import LoginView from '../pages/auth/LoginView';
import AdminLoginView from '../pages/auth/AdminLoginView';
import AdminDashboardView from '../pages/admin/AdminDashboardView';
import CartView from '../pages/cart/CartView';
import CheckoutView from '../pages/cart/CheckoutView';
import CheckoutSuccessView from '../pages/cart/CheckoutSuccessView';
import WishlistView from '../pages/account/WishlistView';
import NotificationsView from '../pages/account/NotificationsView';
import SettingsView from '../pages/account/SettingsView';
import OrderHistoryView from '../pages/account/OrderHistoryView';
import BecomeVendorView from '../pages/static/BecomeVendorView';

// Vendor pages
import DashboardView from '../pages/vendor/DashboardView';
import AddProductView from '../pages/vendor/AddProductView';
import VendorInventoryView from '../pages/vendor/VendorInventoryView';
import VendorOrdersView from '../pages/vendor/VendorOrdersView';
import VendorAnalyticsView from '../pages/vendor/VendorAnalyticsView';

import StoreSettingsView from '../pages/vendor/StoreSettingsView';

// Protected route — any logged-in user
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/user-login" replace />;
  return <>{children}</>;
};

// Vendor-only route
const ProtectedVendorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/vendor-login" replace />;
  if (user.role !== 'vendor') return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Admin-only route
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/mmu-login-x9k2" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Resolves a product from static data or localStorage approved products
const ProductDetailsViewWrapper: React.FC = () => {
  const { id } = useParams();
  const staticProduct = PRODUCTS.find(p => p.id === id);
  const dynamicProduct = JSON.parse(localStorage.getItem('approved_products') || '[]').find((p: any) => p.id === id);
  const product = staticProduct || (dynamicProduct ? {
    id: dynamicProduct.id,
    name: dynamicProduct.productName,
    price: Number(dynamicProduct.price),
    originalPrice: Number(dynamicProduct.originalPrice) || Number(dynamicProduct.price),
    image: dynamicProduct.mainImage || `https://picsum.photos/seed/${dynamicProduct.id}/400/400`,
    images: [dynamicProduct.mainImage, dynamicProduct.extraImage1, dynamicProduct.extraImage2, dynamicProduct.extraImage3].filter(Boolean),
    categoryId: dynamicProduct.category?.toLowerCase().replace(/\s+/g, '-') || 'general',
    category: getCategoryName(dynamicProduct.category?.toLowerCase().replace(/\s+/g, '-') || '') || dynamicProduct.category || 'General',
    vendorId: dynamicProduct.vendorId,
    vendor: dynamicProduct.vendorName || 'Unknown Vendor',
    rating: typeof dynamicProduct.rating === 'number' ? dynamicProduct.rating : (parseFloat(dynamicProduct.rating) || 0),
    reviewsCount: dynamicProduct.reviewsCount || 0,
    isSale: dynamicProduct.isSale || false,
    isNew: (() => {
      const added = dynamicProduct.approvedAt;
      if (!added) return false;
      return (Date.now() - new Date(added).getTime()) / (1000 * 60 * 60 * 24) <= 30;
    })(),
    inStock: (Number(dynamicProduct.units) || 0) > 0,
    description: dynamicProduct.description || '',
    colors: dynamicProduct.colors || [],
    reviews: []
  } : null);
  if (!product) return <Navigate to="/products" replace />;
  return <ProductDetailsView product={product} />;
};

const AppRoutes: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartQuantity } = useCart();
  const { toast, setToast } = useApp();

  return (
    <>
      <Layout>
        <Routes>
          {/* ── Core ── */}
          <Route path="/" element={<HomeView />} />
          <Route path="/products" element={<ProductsView />} />
          <Route path="/products/:id" element={<ProductDetailsViewWrapper />} />

          {/* Category routes */}
          {CATEGORIES.map(cat => (
            <Route key={`route-${cat.id}`} path={`/${cat.id}`} element={<ProductsView initialCategory={cat.id} />} />
          ))}
          {CATEGORIES.map(cat =>
            cat.subcategories?.map(sub => (
              <Route key={`route-${cat.id}-${sub.id}`} path={`/${cat.id}/${sub.id}`} element={<ProductsView initialCategory={cat.id} initialSubCategory={sub.name} />} />
            ))
          )}

          {/* ── Auth ── */}
          <Route path="/user-login" element={<LoginView initialVendorMode={false} />} />
          <Route path="/user-signup" element={<LoginView initialVendorMode={false} />} />
          <Route path="/vendor-login" element={<LoginView initialVendorMode={true} />} />
          <Route path="/login" element={<Navigate to="/user-login" replace />} />

          {/* ── Cart & Checkout ── */}
          <Route path="/cart" element={<CartView />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutView /></ProtectedRoute>} />
          <Route path="/checkout/delivery" element={<ProtectedRoute><CheckoutView /></ProtectedRoute>} />
          <Route path="/checkout/payment" element={<ProtectedRoute><CheckoutView /></ProtectedRoute>} />
          <Route path="/checkout/confirmation" element={<ProtectedRoute><CheckoutView /></ProtectedRoute>} />
          <Route path="/checkout/success" element={<CheckoutSuccessView />} />

          {/* ── Account ── */}
          <Route path="/wishlist" element={<ProtectedRoute><WishlistView /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsView /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryView /></ProtectedRoute>} />

          {/* ── Vendor / Merchant Center ── */}
          <Route path="/dashboard" element={<ProtectedVendorRoute><DashboardView /></ProtectedVendorRoute>} />
          <Route path="/dashboard/add-product" element={<ProtectedVendorRoute><AddProductView /></ProtectedVendorRoute>} />
          <Route path="/dashboard/inventory" element={<ProtectedVendorRoute><VendorInventoryView /></ProtectedVendorRoute>} />
          <Route path="/dashboard/orders" element={<ProtectedVendorRoute><VendorOrdersView /></ProtectedVendorRoute>} />
          <Route path="/dashboard/analytics" element={<ProtectedVendorRoute><VendorAnalyticsView /></ProtectedVendorRoute>} />

          <Route path="/settings/store" element={<ProtectedVendorRoute><StoreSettingsView /></ProtectedVendorRoute>} />

          {/* ── Static / info pages ── */}
          <Route path="/affiliate-program" element={<BecomeVendorView />} />
          <Route path="/become-vendor" element={<Navigate to="/affiliate-program" replace />} />

          <Route path="/contact" element={<Navigate to="/" replace />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/terms" element={<Navigate to="/" replace />} />
          <Route path="/privacy" element={<Navigate to="/" replace />} />
          <Route path="/return-policy" element={<Navigate to="/" replace />} />
          <Route path="/seller-policy" element={<Navigate to="/" replace />} />

          {/* ── Admin ── */}
          <Route path="/mmu-adm-x9k2" element={<ProtectedAdminRoute><AdminDashboardView /></ProtectedAdminRoute>} />
          <Route path="/mmu-login-x9k2" element={<AdminLoginView />} />

          {/* Catch-all — covers /deals/*, /vendors/*, any unmatched path */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        removeFromCart={removeFromCart}
        updateCartQuantity={updateCartQuantity}
      />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default AppRoutes;
