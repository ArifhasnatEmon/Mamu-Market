import React from 'react';
import { ViewType } from '../types';

// ─────────────────────────────────────────────────────────────
// TODO — Teammate 2
// Build the Login page here. Requirements:
//   ├── Customer Login (email + password)
//   ├── Customer Signup (name, email, password)
//   └── Vendor Login (toggle button)
//
// Props available:
//   authMode        → 'login' | 'signup'
//   setAuthMode     → switch between login and signup
//   isVendorMode    → true = vendor login
//   setIsVendorMode → toggle vendor mode
//   handleLogin     → call on form submit
//   setView('home') → go back to home
// ─────────────────────────────────────────────────────────────

const LoginView: React.FC<{
  authMode: 'login' | 'signup',
  setAuthMode: (m: 'login' | 'signup') => void,
  isVendorMode: boolean,
  setIsVendorMode: (v: boolean) => void,
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void,
  setView: (v: ViewType) => void
}> = ({ setView }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F8]">
      <div className="text-center p-16">
        <div className="w-24 h-24 gradient-primary rounded-[2rem] flex items-center justify-center text-white text-4xl mx-auto mb-8 shadow-xl shadow-brand-500/20">
          <i className="fas fa-user-lock"></i>
        </div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Login Page</h1>
        <p className="text-xl text-gray-400 font-medium mb-2">Teammate 2 is working on this.</p>
        <p className="text-sm text-gray-300 font-medium mb-10">[ /login ]</p>
        <button
          onClick={() => setView('home')}
          className="px-10 py-4 gradient-primary text-white rounded-2xl font-black shadow-xl shadow-brand-500/20 hover:scale-105 transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default LoginView;
