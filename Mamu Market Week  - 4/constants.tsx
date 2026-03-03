import { Category, Product, Vendor } from './types';

export const CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics', count: 50, icon: 'fa-laptop',
    subcategories: [
      { id: 'phones', name: 'Phones', count: 15 },
      { id: 'laptops', name: 'Laptops', count: 10 },
      { id: 'headphones', name: 'Headphones', count: 25 }
    ]
  },
  { id: 'fashion', name: 'Fashion', count: 100, icon: 'fa-shirt',
    subcategories: [
      { id: 'men', name: 'Men', count: 20 },
      { id: 'women', name: 'Women', count: 20 },
      { id: 'kids', name: 'Kids', count: 20 },
      { id: 'shoes', name: 'Shoes', count: 20 },
      { id: 'watches', name: 'Watches', count: 20 }
    ]
  },
  { id: 'home-living', name: 'Home & Living', count: 70, icon: 'fa-house',
    subcategories: [
      { id: 'furniture', name: 'Furniture', count: 40 },
      { id: 'decor', name: 'Decor', count: 30 }
    ]
  },
  { id: 'beauty', name: 'Beauty & Health', count: 60, icon: 'fa-heart-pulse',
    subcategories: [
      { id: 'skincare', name: 'Skincare', count: 35 },
      { id: 'makeup', name: 'Makeup', count: 25 }
    ]
  },
  { id: 'sports', name: 'Sports & Outdoor', count: 40, icon: 'fa-dumbbell',
    subcategories: [
      { id: 'fitness', name: 'Fitness', count: 15 },
      { id: 'outdoor', name: 'Outdoor', count: 25 }
    ]
  }
];

export const VENDORS: Vendor[] = [];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sony Headphones',
    price: 4000,
    originalPrice: 4500,
    rating: 4.7,
    reviewsCount: 7,
    reviews: [],
    image: 'https://images.unsplash.com/photo-1612858249937-1cc0852093dd?q=80&w=800&auto=format&fit=crop',
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'headphones',
    vendor: 'Arif Tech',
    vendorId: 'v1',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'Industry-leading noise cancellation with exceptional call quality and 30-hour battery life.'
  },
  {
    id: '2',
    name: 'Smart Fitness Watch Series 5',
    price: 2200,
    originalPrice: 2800,
    rating: 4.6,
    reviewsCount: 36,
    reviews: [],
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'watches',
    vendor: 'TechWorld',
    vendorId: 'v1',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'Advanced health tracking with GPS and stunning AMOLED display.'
  },
  {
    id: '3',
    name: 'Ergonomic Premium Office Chair',
    price: 5000,
    originalPrice: 5500,
    rating: 4.5,
    reviewsCount: 56,
    reviews: [],
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop',
    category: 'Home & Living',
    categoryId: 'home-living',
    subcategory: 'furniture',
    vendor: 'HomeDecor Plus',
    vendorId: 'v3',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'High-back ergonomic design with lumbar support and breathable mesh.'
  },
  {
    id: '4',
    name: 'Handcrafted Leather Backpack',
    price: 2000,
    originalPrice: 3000,
    rating: 4.3,
    reviewsCount: 210,
    reviews: [],
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    category: 'Fashion',
    categoryId: 'fashion',
    subcategory: 'men',
    vendor: 'FashionHub',
    vendorId: 'v2',
    isNew: true,
    isSale: false,
    inStock: true,
    description: 'Genuine full-grain leather backpack with multiple compartments.'
  }
];
