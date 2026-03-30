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

// For user login/singup and vendor login
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

// Check For localStorage
  useEffect(() => {
    const parsedUser = safeGet('mamu_user', null);
    if (parsedUser) {
      setUser(parsedUser);
    }

    const existingUsers = localStorage.getItem('mamu_users');
    if (!existingUsers) {
      safeSet('mamu_users', []);
    }
  }, []);

  // Main function to handle both Login and Signup 
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>, setToast: (m: string) => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const mode = (formData.get('mode') as string) || authMode;

  // SIGNUP LOGIC
    if (mode === 'signup') {
      const users: any[] = safeGet('mamu_users', []);
      const exists = users.find((u: any) => u.email === email);
      if (exists) { setToast('Email already registered!'); return; }
      
      // Hash the password for security before saving 
      const hashedPassword = await hashPassword(password);
      const newUser = {
        id: 'u_' + Date.now(),
        name: name || email.split('@')[0],
        email, 
        password: hashedPassword,
        role: role === 'vendor' ? 'vendor' : 'customer',
        status: 'active',
        avatar: '',
        phone: formData.get('phone') as string || '',
        address: (formData.get('address') as string || '').trim(),
        storeCity: formData.get('storeCity') as string || '',
        storeCategory: role === 'vendor' ? (formData.get('storeCategory') as string || '') : '',
        storeName: role === 'vendor' ? (formData.get('storeName') as string || '') : '',
      };
      
      // Save the new user localStorage
      users.push(newUser);
      localStorage.setItem('mamu_users', JSON.stringify(users));
      
      setToast('Registration successful! Please log in.');
      // Redirect to the appropriate login page
      if (role === 'vendor') {
        setTimeout(() => navigate('/vendor-login'), 100);
      } else {
        setTimeout(() => navigate('/user-login'), 100);
      }
      return;
    }

    // LOGIN LOGIC
    const users: any[] = safeGet('mamu_users', []);
    const hashedInput = await hashPassword(password);

    // Find the user with matching email and hashed password
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedInput);
    
    if (!found) {
      setToast('Invalid email or password.');
      return;
    }
    
    // Ensure users are logging into the correct portal (Customer vs Merchant)
    if (found.role === 'vendor' && role === 'customer') { setToast('Please use the Merchant login to sign in.'); return; }
    if (found.role === 'customer' && role === 'vendor') { setToast('This email is not a merchant account.'); return; }
    
    setUser(found);
    localStorage.setItem('mamu_user', JSON.stringify(found));
    setToast('Welcome back, ' + found.name + '!');

    // Redirect to Dashboard for vendors or Home for customers
    setTimeout(() => navigate(found.role === 'vendor' ? '/dashboard' : '/'), 100);
  };

  const handleLogout = () => {
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
