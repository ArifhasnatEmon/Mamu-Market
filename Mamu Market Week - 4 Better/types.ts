
export interface Review {
  id: string;
  userId?: string;
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
  dealType?: 'none' | 'flash' | 'daily' | 'weekly' | 'monthly';
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
  storeName?: string;
  avatar?: string;
  logo?: string;
  banner?: string;
  category: string;
  rating?: number;
  productsCount?: number;
  verified?: boolean;
  joinedDate?: string;
  description?: string;
  storeCity?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  socialWhatsapp?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar?: string;
  password?: string;
  status?: string;
  nickname?: string;
  address?: string;
  storeName?: string;
  storeDescription?: string;
  banner?: string;
  nidTradeLicense?: string;
  verified?: boolean;
  storeCategory?: string;
  storeCity?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  socialWhatsapp?: string;
  promotion_enabled?: boolean;
}
