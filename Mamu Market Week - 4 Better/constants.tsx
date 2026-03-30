
import { Category, Product } from './types';

// Uses static mock data to make the website feel more realistic
export const CATEGORIES: Category[] = [
  { 
    id: 'electronics', 
    name: 'Electronics', 
    count: 245, 
    icon: 'fa-laptop',
    subcategories: [
      { id: 'phones', name: 'Phones', count: 120 },
      { id: 'laptops', name: 'Laptops', count: 80 },
      { id: 'headphones', name: 'Headphones', count: 45 },
      { id: 'appliances', name: 'Appliances', count: 30 },
      { id: 'cameras-accessories', name: 'Cameras & Accessories', count: 60 }
    ]
  },
  { 
    id: 'fashion', 
    name: 'Fashion', 
    count: 500, 
    icon: 'fa-shirt',
    subcategories: [
      { id: 'men', name: 'Men', count: 150 },
      { id: 'women', name: 'Women', count: 200 },
      { id: 'kids', name: 'Kids', count: 100 },
      { id: 'shoes', name: 'Shoes', count: 30 },
      { id: 'watches', name: 'Watches', count: 20 }
    ]
  },
  { 
    id: 'home-living', 
    name: 'Home & Living', 
    count: 120, 
    icon: 'fa-house',
    subcategories: [
      { id: 'furniture', name: 'Furniture', count: 50 },
      { id: 'decor', name: 'Decor', count: 70 },
      { id: 'kitchen', name: 'Kitchen', count: 40 },
      { id: 'pets', name: 'Pet Supplies', count: 20 },
      { id: 'books', name: 'Books', count: 35 }
    ]
  },
  { 
    id: 'beauty', 
    name: 'Beauty & Health', 
    count: 85, 
    icon: 'fa-heart-pulse',
    subcategories: [
      { id: 'skincare', name: 'Skincare', count: 40 },
      { id: 'makeup', name: 'Makeup', count: 45 }
    ]
  },
  { 
    id: 'sports', 
    name: 'Sports & Outdoor', 
    count: 150, 
    icon: 'fa-dumbbell',
    subcategories: [
      { id: 'fitness', name: 'Fitness', count: 100 },
      { id: 'outdoor', name: 'Outdoor', count: 50 }
    ]
  }
];



export const PRODUCTS: Product[] = [
  {
    id: 'Sony_WH-1000XM5_Wireless_Noise_Cancelling_Headphones',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    price: 25000,
    originalPrice: 27300,
    rating: 4.6,
    reviewsCount: 15,
    reviews: [],
    image: 'https://images.unsplash.com/photo-1704440278730-b420f5892700?q=80&w=800&auto=format&fit=crop',
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Headphones',
    vendor: 'TechWorld',
    vendorId: 'TechWorld_Store',
    isNew: true,
    isSale: true,
    dealType: 'flash',
    inStock: true,
    description: 'Industry-leading noise cancellation optimized to you. The WH-1000XM5 headphones rewrite the rules for distraction-free listening and exceptional call clarity.he Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and exceptional call quality.',
  },
  {
    id: 'iPhone_15_Pro_Max_256GB_Natural_Titanium',
    name: 'iPhone 15 Pro Max - 256GB Natural Titanium',
    price: 144000,
    originalPrice: 155000,
    rating: 4.9,
    reviewsCount: 10,
    reviews: [],
    image: 'https://images.unsplash.com/photo-1695822919033-f87120df28de?q=80&w=800&auto=format&fit=crop',
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Phones',
    vendor: 'Apple Gadgets',
    vendorId: 'Apple_Gadgets_Store',
    isNew: true,
    isSale: true,
    dealType: 'daily',
    inStock: true,
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.'
  },
  {
    id: 'MacBook_Pro_M3_Max_14-inch',
    name: 'MacBook Pro M3 Max 14-inch',
    price: 320000,
    originalPrice: 350000,
    rating: 4.9,
    reviewsCount: 16,
    reviews: [],
    image: 'https://images.unsplash.com/photo-1649394233584-217c46cb9612?q=80&w=800&auto=format&fit=crop',
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Laptops',
    vendor: 'Apple Gadgets',
    vendorId: 'Apple_Gadgets_Store',
    isNew: true,
    isSale: true,
    dealType: 'flash',
    inStock: true,
    description: 'The most advanced chips ever built for a personal computer. M3 Max brings massive performance for the most demanding workflows.'
  },
  {
    id: 'Smart_Fitness_Watch_Series_5',
    name: 'Smart Fitness Watch Series 5',
    price: 280000,
    originalPrice: 300000,
    rating: 4.7,
    reviewsCount: 12,
    reviews: [],
    image: 'https://images.unsplash.com/photo-1606986628470-26a67fa4730c?q=80&w=800&auto=format&fit=crop',
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Cameras & Accessories',
    vendor: 'TechWorld',
    vendorId: 'TechWorld_Store',
    isNew: false,
    isSale: true,
    dealType: 'flash',
    inStock: true,
    description: 'The Alpha 7 IV sets the bar high for full-frame cameras, offering breathtaking image quality and advanced video performance'
  }
];
