
import { Category, Product, Vendor } from './types';

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

export const getCategoryName = (categoryId: string): string => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  return category ? category.name : '';
};

export const VENDORS: Vendor[] = [
  {
    id: 'techworld',
    name: 'TechWorld',
    logo: 'https://picsum.photos/seed/tech/200/200',
    category: 'Electronics',
    rating: 4.8,
    productsCount: 5,
    verified: true
  },
  {
    id: 'fashionhub',
    name: 'FashionHub',
    logo: 'https://picsum.photos/seed/fashion/200/200',
    category: 'Fashion',
    rating: 4.5,
    productsCount: 2,
    verified: true
  },
  {
    id: 'homedecor-plus',
    name: 'HomeDecor Plus',
    logo: 'https://picsum.photos/seed/home/200/200',
    category: 'Home & Living',
    rating: 4.6,
    productsCount: 2,
    verified: false
  },
  {
    id: 'greenlife-organics',
    name: 'GreenLife Organics',
    logo: 'https://picsum.photos/seed/green/200/200',
    category: 'Beauty',
    rating: 4.7,
    productsCount: 2,
    verified: true
  },
  {
    id: 'sportyzone',
    name: 'SportyZone',
    logo: 'https://picsum.photos/seed/sport/200/200',
    category: 'Sports',
    rating: 4.9,
    productsCount: 2,
    verified: true
  },
  {
    id: 'kitchenmaster',
    name: 'KitchenMaster',
    logo: 'https://picsum.photos/seed/kitchen/200/200',
    category: 'Home & Living',
    rating: 4.8,
    productsCount: 3,
    verified: true
  },
  {
    id: 'petparadise',
    name: 'PetParadise',
    logo: 'https://picsum.photos/seed/pet/200/200',
    category: 'Home & Living',
    rating: 4.7,
    productsCount: 1,
    verified: true
  },
  {
    id: 'bookworm',
    name: 'BookWorm',
    logo: 'https://picsum.photos/seed/book/200/200',
    category: 'Home & Living',
    rating: 4.9,
    productsCount: 1,
    verified: false
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'sony-wh-1000xm5-headphones',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    price: 4200,
    originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Headphones',
    vendor: 'TechWorld',
    vendorId: 'techworld',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and exceptional call quality. With a newly developed driver, DSEE – Extreme and Hires Audio support the WH-1000XM5 headphones provide awe-inspiring audio quality.',
    specifications: [
      { label: 'Driver Unit', value: '30mm' },
      { label: 'Frequency Response', value: '4Hz - 40,000Hz' },
      { label: 'Battery Life', value: 'Up to 30 hours' },
      { label: 'Bluetooth Version', value: '5.2' },
      { label: 'Weight', value: '250g' }
    ],
    colors: [
      {
        name: 'Silver',
        value: '#E5E7EB',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop'
        ]
      },
      {
        name: 'Black',
        value: '#1F2937',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1524670858766-614307555995?q=80&w=800&auto=format&fit=crop'
        ]
      },
      {
        name: 'Blue',
        value: '#1E3A8A',
        image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop'
        ]
      }
    ]
  },
  {
    id: 'iphone-15-pro-max-256gb',
    name: 'iPhone 15 Pro Max - 256GB',
    price: 145000,
    originalPrice: 155000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Phones',
    vendor: 'TechWorld',
    vendorId: 'techworld',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'The ultimate iPhone with Titanium design, A17 Pro chip, and a pro camera system.'
  },
  {
    id: 'macbook-pro-m3-max-14-inch',
    name: 'MacBook Pro M3 Max 14-inch',
    price: 320000,
    originalPrice: 350000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Laptops',
    vendor: 'TechWorld',
    vendorId: 'techworld',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'The most powerful MacBook Pro ever. Built for creators and professionals.'
  },
  {
    id: 'smart-fitness-watch-series-5',
    name: 'Smart Fitness Watch Series 5',
    price: 2200,
    originalPrice: 2800,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Fashion',
    categoryId: 'fashion',
    subcategory: 'Watches',
    vendor: 'TechWorld',
    vendorId: 'techworld',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'Advanced health tracking, GPS connectivity, and a stunning AMOLED display for the modern athlete.'
  },
  {
    id: 'ergonomic-premium-office-chair',
    name: 'Ergonomic Premium Office Chair',
    price: 5000,
    originalPrice: 5500,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Home & Living',
    categoryId: 'home-living',
    subcategory: 'Furniture',
    vendor: 'HomeDecor Plus',
    vendorId: 'homedecor-plus',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'High-back ergonomic design with lumbar support and breathable mesh for maximum comfort during long work hours.'
  },
  {
    id: 'handcrafted-leather-backpack',
    name: 'Handcrafted Leather Backpack',
    price: 2000,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Fashion',
    categoryId: 'fashion',
    subcategory: 'Men',
    vendor: 'FashionHub',
    vendorId: 'fashionhub',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'Genuine full-grain leather backpack. Ages beautifully and features multiple compartments for all your essentials.'
  },
  {
    id: 'radiance-face-serum',
    name: 'Radiance Face Serum',
    price: 2500,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
    images: [
    ],
    category: 'Beauty & Health',
    categoryId: 'beauty',
    subcategory: 'Skincare',
    vendor: 'GreenLife Organics',
    vendorId: 'greenlife-organics',
    isNew: false,
    isSale: true,
    inStock: false,
    description: 'Potent botanical blend designed to brighten and rejuvenate your skin naturally.'
  },
  {
    id: 'pro-yoga-mat',
    name: 'Pro Yoga Mat',
    price: 3500,
    originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Sports & Outdoor',
    categoryId: 'sports',
    subcategory: 'Fitness',
    vendor: 'SportyZone',
    vendorId: 'sportyzone',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'Eco-friendly non-slip yoga mat for maximum grip and comfort.'
  },
  {
    id: 'cast-iron-skillet',
    name: 'Cast Iron Skillet',
    price: 4500,
    originalPrice: 5000,
    image: 'https://images.unsplash.com/photo-1594834749740-74b3f6764be4?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1594834749740-74b3f6764be4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603038124597-2c5c207edf47?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Home & Living',
    categoryId: 'home-living',
    subcategory: 'Kitchen',
    vendor: 'KitchenMaster',
    vendorId: 'kitchenmaster',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'Pre-seasoned cast iron skillet for perfect searing and even heating.'
  },
  {
    id: 'premium-dog-bed',
    name: 'Premium Dog Bed',
    price: 2500,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1646195164326-124b72fb9d34?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Home & Living',
    categoryId: 'home-living',
    subcategory: 'Pet Supplies',
    vendor: 'PetParadise',
    vendorId: 'petparadise',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'Orthopedic memory foam dog bed for ultimate comfort and support.'
  },
  {
    id: 'the-great-gatsby-special-edition',
    name: 'The Great Gatsby - Special Edition',
    price: 1500,
    originalPrice: 2000,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Home & Living',
    categoryId: 'home-living',
    subcategory: 'Books',
    vendor: 'BookWorm',
    vendorId: 'bookworm',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'A beautiful hardcover edition of F. Scott Fitzgerald\'s classic novel.'
  },
  {
    id: 'ultra-quiet-air-purifier',
    name: 'Ultra-Quiet Air Purifier',
    price: 8500,
    originalPrice: 12000,
    image: 'https://images.unsplash.com/photo-1436473849883-bb3464c23e93?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1436473849883-bb3464c23e93?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1709745634912-2a79b938f3c2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1632928274371-878938e4d825?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Appliances',
    vendor: 'TechWorld',
    vendorId: 'techworld',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'HEPA filter air purifier for clean and fresh indoor air.'
  },
  {
    id: 'mechanical-gaming-keyboard',
    name: 'Mechanical Gaming Keyboard',
    price: 3200,
    originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Cameras & Accessories',
    vendor: 'TechWorld',
    vendorId: 'techworld',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'RGB backlit mechanical keyboard with tactile switches.'
  },
  {
    id: 'organic-cotton-t-shirt',
    name: 'Organic Cotton T-Shirt',
    price: 800,
    originalPrice: 1200,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Fashion',
    categoryId: 'fashion',
    subcategory: 'Men',
    vendor: 'FashionHub',
    vendorId: 'fashionhub',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'Soft and breathable 100% organic cotton t-shirt.'
  },
  {
    id: 'professional-camera-tripod',
    name: 'Professional Camera Tripod',
    price: 2800,
    originalPrice: 4000,
    image: 'https://images.unsplash.com/photo-1762592818526-bed91d92a655?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1634680582783-0b06ca18a449?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Electronics',
    categoryId: 'electronics',
    subcategory: 'Cameras & Accessories',
    vendor: 'TechWorld',
    vendorId: 'techworld',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'Lightweight and sturdy aluminum tripod for professional photography.'
  },
  {
    id: 'minimalist-wall-clock',
    name: 'Minimalist Wall Clock',
    price: 1200,
    originalPrice: 1800,
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602162786736-1575a5b1be76?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564091880021-bb02f2b2928d?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Home & Living',
    categoryId: 'home-living',
    subcategory: 'Decor',
    vendor: 'HomeDecor Plus',
    vendorId: 'homedecor-plus',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'Elegant and silent wall clock for a modern home.'
  },
  {
    id: 'high-performance-blender',
    name: 'High-Performance Blender',
    price: 5500,
    originalPrice: 7500,
    image: 'https://plus.unsplash.com/premium_photo-1718043036199-d98bef36af46?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://plus.unsplash.com/premium_photo-1718043036193-e9d56e94e391?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Home & Living',
    categoryId: 'home-living',
    subcategory: 'Kitchen',
    vendor: 'KitchenMaster',
    vendorId: 'kitchenmaster',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'Powerful blender for smoothies, soups, and more.'
  },
  {
    id: 'durable-hiking-boots',
    name: 'Durable Hiking Boots',
    price: 4800,
    originalPrice: 6500,
    image: 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Sports & Outdoor',
    categoryId: 'sports',
    subcategory: 'Outdoor',
    vendor: 'SportyZone',
    vendorId: 'sportyzone',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'Waterproof and comfortable hiking boots for all terrains.'
  },
  {
    id: 'moisturizing-night-cream',
    name: 'Moisturizing Night Cream',
    price: 1800,
    originalPrice: 2500,
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Beauty & Health',
    categoryId: 'beauty',
    subcategory: 'Skincare',
    vendor: 'GreenLife Organics',
    vendorId: 'greenlife-organics',
    isNew: true,
    isSale: true,
    inStock: true,
    description: 'Deeply hydrating night cream with natural extracts.'
  },
  {
    id: 'electric-coffee-grinder',
    name: 'Electric Coffee Grinder',
    price: 2200,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1739991892154-8ce8fbae2f88?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1628195441391-e444b7a0516c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop'
    ],
    category: 'Home & Living',
    categoryId: 'home-living',
    subcategory: 'Kitchen',
    vendor: 'KitchenMaster',
    vendorId: 'kitchenmaster',
    isNew: false,
    isSale: true,
    inStock: true,
    description: 'Stainless steel electric coffee grinder for fresh grounds.'
  }
];

export const FREE_SHIPPING_THRESHOLD = 10000;
export const getShippingFee = (subtotal: number): number =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal >= 2000 ? 150 : 100;
