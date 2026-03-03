
export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ColorVariant {
  name: string;
  value: string;
  image: string;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  image: string;
  images?: string[];
  category: string;
  categoryId: string;
  subcategory?: string;
  vendor: string;
  vendorId: string;
  isNew: boolean;
  isSale: boolean;
  inStock: boolean;
  description: string;
  colors?: ColorVariant[];
  keywords?: string[];
  specifications?: { label: string, value: string }[];
}

export interface SubCategory {
  id: string;
  name: string;
  count: number;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
  subcategories?: SubCategory[];
}

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  banner?: string;
  category: string;
  rating: number;
  productsCount: number;
  verified: boolean;
  joinedDate: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
  avatar?: string;
}

export type ViewType = 'home' | 'products' | 'product-details' | 'vendors' | 'vendor-store' | 'login' | 'vendor-login' | 'dashboard' | 'cart' | 'wishlist' | 'become-vendor' | 'deals' | 'deals-listing' | 'checkout-success' | 'settings' | 'order-history' | 'help-center' | 'about-us' | 'terms' | 'privacy' | 'return-policy' | 'seller-policy' | 'promote-item' | 'top-vendors';

export interface CartItem extends Product {
  quantity: number;
}
