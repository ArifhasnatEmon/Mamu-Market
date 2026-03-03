import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ViewType } from '../types';

const LoginView: React.FC<{
  authMode: 'login' | 'signup',
  setAuthMode: (m: 'login' | 'signup') => void,
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void,
  handleSignup: (e: React.FormEvent<HTMLFormElement>) => void,
  setView: (v: ViewType) => void
}> = ({ authMode, setAuthMode, handleLogin, handleSignup, setView }) => {
  const [isVendorMode, setIsVendorMode] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full glass p-10 lg:p-16 rounded-[4rem] shadow-2xl border border-white/40 relative overflow-hidden"
      >
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-gray-400 hover:text-brand-600 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-xl border border-gray-100 flex items-center justify-center group-hover:shadow-lg transition-all">
              <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            </div>
            <span className="text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Back</span>
          </button>
        </div>

        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl"></div>

        <div className="text-center mb-10 relative">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-brand-500/20">
            <i className={`fas ${isVendorMode ? 'fa-store' : 'fa-user-lock'} text-2xl`}></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 font-medium mt-2">
            {isVendorMode ? 'Merchant Portal' : 'Customer Account'}
          </p>
        </div>

        <form className="space-y-6 relative" onSubmit={authMode === 'login' ? handleLogin : handleSignup}>
          <input type="hidden" name="role" value={isVendorMode ? 'vendor' : 'customer'} />
          
          {authMode === 'signup' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Full Name</label>
                <input required name="name" type="text" placeholder="John Doe" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Phone Number</label>
                <input required name="phone" type="tel" placeholder="+880 1XXX XXXXXX" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
              </div>
            </div>
          )}
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Email Address</label>
            <input required name="email" type="email" placeholder="name@example.com" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Delivery Address</label>
              <textarea required name="address" placeholder="House #, Road #, Area, City" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold resize-none" rows={2} />
            </div>
          )}
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Password</label>
            <input required name="password" type="password" placeholder="••••••••" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
          </div>

          <div className="flex items-center justify-between text-xs font-black">
            <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
              <input type="checkbox" className="w-4 h-4 accent-brand-600 rounded-md" /> Remember me
            </label>
            {authMode === 'login' && (
              <button type="button" className="text-brand-600 hover:underline">Forgot Password?</button>
            )}
          </div>

          <button type="submit" className="w-full py-5 gradient-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all">
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-10 text-center relative">
          {!isVendorMode && (
            <p className="text-gray-500 font-bold text-sm mb-6">
              {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-brand-600 font-black hover:underline ml-2"
              >
                {authMode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100">
            <button 
              onClick={() => { setIsVendorMode(!isVendorMode); setAuthMode('login'); }}
              className="w-full py-4 border-2 border-gray-100 rounded-2xl text-[11px] font-black text-gray-900 uppercase tracking-widest hover:border-brand-600 hover:text-brand-600 transition-all"
            >
              {isVendorMode ? 'Back to Customer Login' : 'Are you a merchant? Login here'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
