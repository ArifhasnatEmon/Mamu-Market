
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
  stock?: number;
  isDiscontinued?: boolean;
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
  category: string;
  rating: number;
  productsCount: number;
  verified: boolean;
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
}


export interface CartItem extends Product {
  quantity: number;
}
