import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewType, CartItem, User } from './types';
import Layout from './components/Layout';
import Toast from './components/Toast';

import HomeView from './pages/HomeView';
import LoginView from './pages/LoginView';
import BecomeVendorView from './pages/BecomeVendorView';

type PageView = 'home' | 'login' | 'become-vendor';

const VIEW_TO_URL: Record<PageView, string> = {
  'home':          '/',
  'login':         '/login',
  'become-vendor': '/affiliate-program',
};

const URL_TO_VIEW: Record<string, PageView> = {
  '/':                   'home',
  '/login':              'login',
  '/affiliate-program':  'become-vendor',
};

const getViewFromPath = (pathname: string): PageView =>
  URL_TO_VIEW[pathname] ?? 'home';

const App: React.FC = () => {
  const [view, setRawView] = useState<PageView>(
    getViewFromPath(window.location.pathname)
  );
  const [cart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const savedUser = localStorage.getItem('mamu_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const onPopState = () => setRawView(getViewFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const setView = (urlview: ViewType) => {
    if (urlview !== 'home' && urlview !== 'login' && urlview !== 'become-vendor') {
      return; // other views not implemented yet
    }
    if (urlview === 'login') setAuthMode('login');
    window.history.pushState({}, '', VIEW_TO_URL[urlview as PageView]);
    setRawView(urlview as PageView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as 'customer' | 'vendor';
    const name = formData.get('name') as string || (role === 'vendor' ? 'Arif Tech' : 'Junied');
    const mockUser: User = {
      id: role === 'vendor' ? 'v1' : 'u1',
      name,
      email: formData.get('email') as string,
      role,
      avatar: role === 'vendor'
        ? 'https://picsum.photos/seed/tech/100/100'
        : 'https://picsum.photos/seed/alex/100/100'
    };
    setUser(mockUser);
    localStorage.setItem('mamu_user', JSON.stringify(mockUser));
    setView('home');
    setToast(`Welcome back, ${mockUser.name}!`);
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as 'customer' | 'vendor';
    const name = formData.get('name') as string || 'New User';
    const mockUser: User = {
      id: role === 'vendor' ? 'v1' : 'u1',
      name,
      email: formData.get('email') as string,
      role,
      avatar: role === 'vendor'
        ? 'https://picsum.photos/seed/tech/100/100'
        : 'https://picsum.photos/seed/alex/100/100'
    };
    setUser(mockUser);
    localStorage.setItem('mamu_user', JSON.stringify(mockUser));
    setView('home');
    setToast(`Account created! Welcome, ${mockUser.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mamu_user');
    setView('home');
    setToast('Logged out successfully');
  };

  const noop = () => {};

  const renderContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'circOut' }}
      >
        {view === 'home' && (
          <HomeView
            setView={setView}
            onAddToCart={noop}
            onSelectProduct={noop}
            onToggleWishlist={noop}
            wishlist={[]}
            onSelectCategory={noop}
            onSelectFilter={noop}
            onSelectDealType={noop}
            userRole={user?.role}
          />
        )}
        {view === 'login' && (
          <LoginView
            authMode={authMode}
            setAuthMode={setAuthMode}
            handleLogin={handleLogin}
            handleSignup={handleSignup}
            setView={setView}
          />
        )}
        {view === 'become-vendor' && (
          <BecomeVendorView setView={setView} setToast={setToast} />
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <Layout
      currentView={view as ViewType}
      setView={setView}
      cart={cart}
      user={user}
      onLogout={handleLogout}
      onSearch={noop}
      onSelectCategory={noop}
      onSelectSubCategory={noop}
      onSelectFilter={noop}
    >
      {renderContent()}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </Layout>
  );
};

export default App;
