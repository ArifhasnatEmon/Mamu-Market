import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { safeGet, safeSet } from '../utils/storage';

interface AppContextValue {
  toast: string | null;
  setToast: (msg: string | null) => void;
  wishlist: string[];
  setWishlist: React.Dispatch<React.SetStateAction<string[]>>;
  handleToggleWishlist: (productId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  selectedSubCategory: string | null;
  setSelectedSubCategory: (s: string | null) => void;
  selectedFilter: string | null;
  setSelectedFilter: (f: string | null) => void;
  handleSelectProduct: (product: Product) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    const wishlistKey = `mamu_wishlist_${user?.id || 'guest'}`;
    setWishlist(safeGet(wishlistKey, []));
  }, [user?.id]);

  useEffect(() => {
    const wishlistKey = `mamu_wishlist_${user?.id || 'guest'}`;
    safeSet(wishlistKey, wishlist);
  }, [wishlist, user?.id]);

  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

  useEffect(() => {
    const handleCartAuthRequired = () => {
      setToast('Please sign in to add items to your cart');
      setTimeout(() => navigate('/user-login'), 100);
    };
    window.addEventListener('cart:authRequired', handleCartAuthRequired);
    return () => window.removeEventListener('cart:authRequired', handleCartAuthRequired);
  }, [navigate]);

  useEffect(() => {
    const handleOutOfStock = () => {
      setToast('Sorry, this product is out of stock.');
    };
    window.addEventListener('cart:outOfStock', handleOutOfStock);
    return () => window.removeEventListener('cart:outOfStock', handleOutOfStock);
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      setToast('Logged out successfully');
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  useEffect(() => {
    const handleQuota = () => setToast('Storage full! Please clear some data from Settings.');
    window.addEventListener('storage:quotaExceeded', handleQuota);
    return () => window.removeEventListener('storage:quotaExceeded', handleQuota);
  }, []);

  const handleToggleWishlist = (productId: string) => {
    if (!user) {
      setToast('Please sign in to manage your wishlist');
      setTimeout(() => navigate('/user-login'), 100);
      return;
    }
    setWishlist(prev => {
      const isWishlisted = prev.includes(productId);
      if (isWishlisted) {
        setToast('Removed from wishlist');
        return prev.filter(id => id !== productId);
      } else {
        setToast('Added to wishlist!');
        return [...prev, productId];
      }
    });
  };



  const handleSelectProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <AppContext.Provider value={{
      toast, setToast,
      wishlist, setWishlist,
      handleToggleWishlist,
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory,
      selectedSubCategory, setSelectedSubCategory,
      selectedFilter, setSelectedFilter,
      handleSelectProduct
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
