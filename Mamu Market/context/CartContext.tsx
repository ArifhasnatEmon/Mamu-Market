import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { safeGet, safeSet } from '../utils/storage';

interface CartContextValue {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  handleAddToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, delta: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const key = `mamu_cart_${user?.id || 'guest'}`;
    setCart(safeGet(key, []));
  }, [user?.id]);

  useEffect(() => {
    const key = `mamu_cart_${user?.id || 'guest'}`;
    safeSet(key, cart);
  }, [cart, user?.id]);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('cart:authRequired'));
      return;
    }
    // stock check
    if (!product.inStock) {
      window.dispatchEvent(new CustomEvent('cart:outOfStock'));
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      const maxQty = (product as any).units ? Number((product as any).units) : 999;
      if (existing) {
        if (existing.quantity >= maxQty) return prev;
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      if (item.quantity + delta <= 0) return prev.filter(i => i.id !== id);
      const maxQty = (item as any).units ? Number((item as any).units) : 999;
      if (delta > 0 && item.quantity + delta > maxQty) return prev;
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i);
    });
  };

  return (
    <CartContext.Provider value={{ cart, setCart, isCartOpen, setIsCartOpen, handleAddToCart, removeFromCart, updateCartQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
