import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, useNavigationType } from 'react-router-dom';

import { safeGet, safeSet } from '../utils/storage';

interface AppContextValue {
  toast: string | null;
  setToast: (msg: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// For handling global application state that isn't related to authentication.
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const navType = useNavigationType();

  // Scroll to the top of the page & back/forward button
  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

  useEffect(() => {
    const handleCartAuthRequired = () => {
      setToast('Please sign in to add items to your bag');
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

  return (
    <AppContext.Provider value={{
      toast, setToast
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
