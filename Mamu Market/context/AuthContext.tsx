import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { safeGet, safeSet } from '../utils/storage';

import { hashPassword } from '../utils/crypto';

interface AuthContextValue {
  user: User | null;
  setUser: (u: User | null) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (m: 'login' | 'signup') => void;
  handleLogin: (e: React.FormEvent<HTMLFormElement>, setToast: (m: string) => void) => Promise<void>;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    const parsedUser = safeGet('mamu_user', null);
    if (parsedUser) {
      const SESSION_MS = 24 * 60 * 60 * 1000; // 24 hours
      if (parsedUser.loginAt && Date.now() - parsedUser.loginAt > SESSION_MS) {
        localStorage.removeItem('mamu_user');
      } else {
        setUser(parsedUser);
      }
    }

    const existingUsers = localStorage.getItem('mamu_users');
    if (!existingUsers) {
      safeSet('mamu_users', []);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>, setToast: (m: string) => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    const mode = (formData.get('mode') as string) || authMode;

    if (mode === 'signup') {
      const users: any[] = safeGet('mamu_users', []);
      const exists = users.find((u: any) => u.email === email);
      if (exists) { setToast('Email already registered!'); return; }
      const signupAddress = (formData.get('address') as string || '').trim();
      const hashedPassword = await hashPassword(password);
      const newUser = {
        id: 'u_' + Date.now(),
        name: name || email.split('@')[0],
        email, password: hashedPassword,
        role: role === 'vendor' ? 'vendor' : 'customer',
        status: role === 'vendor' ? 'pending' : 'active',
        avatar: '',
        phone: formData.get('phone') as string || '',
        address: signupAddress,
        storeCity: formData.get('storeCity') as string || '',
        storeCategory: role === 'vendor' ? (formData.get('storeCategory') as string || '') : '',
        storeName: role === 'vendor' ? (formData.get('storeName') as string || '') : '',
        addresses: signupAddress ? [{ id: 'addr_' + Date.now(), label: 'Home', address: signupAddress, isDefault: true }] : [],
      };
      users.push(newUser);
      localStorage.setItem('mamu_users', JSON.stringify(users));
      if (role === 'vendor') {
        setToast('Application submitted! Await admin approval.');
        setTimeout(() => navigate('/vendor-login'), 100);
      } else {
        setToast('Registration successful! Please log in.');
        setTimeout(() => navigate('/user-login'), 100);
      }
      return;
    }

    // LOGIN — rate limiting
    const attemptKey = `login_attempts_${email.toLowerCase()}`;
    const rawAttempt = safeGet(attemptKey, { count: 0, lockedUntil: 0 });
    // Reset count if lockout period has expired
    const attemptData = (rawAttempt.lockedUntil && Date.now() >= rawAttempt.lockedUntil)
      ? { count: 0, lockedUntil: 0 }
      : rawAttempt;
    if (attemptData.lockedUntil && Date.now() < attemptData.lockedUntil) {
      const secsLeft = Math.ceil((attemptData.lockedUntil - Date.now()) / 1000);
      setToast(`Too many attempts. Try again in ${secsLeft}s.`);
      return;
    }

    // LOGIN — only for normal users, no admin check here
    const users: any[] = safeGet('mamu_users', []);
    const hashedInput = await hashPassword(password);
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedInput);
    if (!found) {
      const newCount = (attemptData.count || 0) + 1;
      const lockedUntil = newCount >= 5 ? Date.now() + 30000 : 0;
      localStorage.setItem(attemptKey, JSON.stringify({ count: newCount, lockedUntil }));
      if (newCount >= 5) {
        setToast('Too many failed attempts. Please wait 30 seconds.');
      } else {
        setToast('Invalid email or password.');
      }
      return;
    }
    localStorage.removeItem(attemptKey);
    if (found.role === 'vendor' && role === 'customer') { setToast('Please use the Merchant login to sign in.'); return; }
    if (found.role === 'customer' && role === 'vendor') { setToast('This email is not a merchant account.'); return; }
    if (found.status === 'pending') { setToast('Your account is pending admin approval.'); return; }
    if (found.status === 'rejected') { setToast('Your application was rejected.'); return; }
    if (found.status === 'suspended') {
      const reason = found.suspendReason ? `Your account has been suspended. Reason: ${found.suspendReason}` : 'Your account has been suspended. Please contact support.';
      setToast(reason);
      return;
    }
    const sessionUser = { ...found, loginAt: Date.now() };
    setUser(sessionUser);
    localStorage.setItem('mamu_user', JSON.stringify(sessionUser));
    setToast('Welcome back, ' + found.name + '!');
    setTimeout(() => navigate(found.role === 'vendor' ? '/dashboard' : '/'), 100);
  };

  const handleLogout = () => {
    const currentUserId = user?.id;
    if (currentUserId) {
      localStorage.removeItem(`mamu_cart_${currentUserId}`);
      localStorage.removeItem(`mamu_wishlist_${currentUserId}`);
    }
    setUser(null);
    localStorage.removeItem('mamu_user');
    window.dispatchEvent(new CustomEvent('auth:logout'));
    setTimeout(() => navigate('/'), 100);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authMode, setAuthMode, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
