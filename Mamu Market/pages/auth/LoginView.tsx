import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

import { hashPassword } from '../../utils/crypto';

const LoginView: React.FC<{ initialVendorMode?: boolean }> = ({ initialVendorMode = false }) => {
  const { authMode, setAuthMode, handleLogin } = useAuth();
  const { setToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVendorMode, setIsVendorMode] = useState(() => initialVendorMode || location.state?.vendorMode || false);

  useEffect(() => {
    setIsVendorMode(initialVendorMode || location.state?.vendorMode || false);
  }, [initialVendorMode, location.state?.vendorMode]);
  const [showPass, setShowPass] = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [selectedVendorCats, setSelectedVendorCats] = useState<string[]>([]);

  const toggleVendorCat = (cat: string) => {
    setSelectedVendorCats(prev => {
      if (prev.includes(cat)) return prev.filter(c => c !== cat);
      if (prev.length >= 2) return prev;
      return [...prev, cat];
    });
  };

  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [forgotPin, setForgotPin] = useState('');
  const [forgotPinInput, setForgotPinInput] = useState('');
  const [forgotPinError, setForgotPinError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-between p-12 relative overflow-hidden lg:sticky lg:top-0 lg:h-screen" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)' }}>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/8 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div>
          <button onClick={() => navigate('/')} className="flex items-center gap-3 mb-16 group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <i className="fas fa-shopping-bag text-white text-lg"></i>
            </div>
            <div>
              <div className="text-white font-black text-lg tracking-tight leading-none">Mamu</div>
              <div className="text-white/60 font-black text-[10px] uppercase tracking-[0.2em]">Market</div>
            </div>
          </button>

          <h1 className={`font-black text-white leading-[1.05] tracking-tighter mb-5 ${isVendorMode ? 'text-5xl xl:text-6xl max-w-xs' : 'text-4xl xl:text-5xl'}`}>
            {isVendorMode ? 'Grow your business with us.' : "Bangladesh's\nfavorite\nmarketplace."}
          </h1>
          <p className="text-white/70 text-base font-medium leading-relaxed mb-10 max-w-xs">
            {isVendorMode
              ? 'Join thousands of merchants selling on Mamu Market across Bangladesh.'
              : 'Discover thousands of products from verified local vendors. Fast delivery, secure payments.'}
          </p>

          <div className="space-y-3">
            {(isVendorMode ? [
              { emoji: '🏪', title: 'Easy Setup', desc: 'Your store live in minutes' },
              { emoji: '📊', title: 'Sales Analytics', desc: 'Track orders & revenue' },
              { emoji: '🔒', title: 'Secure Payments', desc: 'Fast & protected payments' },
            ] : [
              { emoji: '🚚', title: 'Free Delivery', desc: 'On orders over ৳10,000' },
              { emoji: '🏪', title: 'Trusted Vendors', desc: 'Verified local merchants' },
              { emoji: '🔒', title: 'Secure Payments', desc: 'bKash, Nagad & more' },
            ]).map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <span className="text-xl shrink-0">{f.emoji}</span>
                <div>
                  <p className="text-white font-black text-sm leading-tight">{f.title}</p>
                  <p className="text-white/60 text-xs font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col bg-gray-50 lg:bg-white lg:h-screen lg:overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-brand-600 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:shadow transition-all">
              <i className="fas fa-arrow-left text-sm group-hover:-translate-x-0.5 transition-transform"></i>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-brand-600 transition-colors hidden sm:block">Back</span>
          </button>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)' }}>
              <i className="fas fa-shopping-bag text-white text-sm"></i>
            </div>
            <span className="font-black text-gray-900 text-base tracking-tight">Mamu Market</span>
          </div>
          <div className="w-9 lg:hidden" />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">
                {authMode === 'login' ? (isVendorMode ? 'Merchant Sign In' : 'Welcome back') : 'Create your account'}
              </h2>
              <p className="text-gray-400 font-medium text-sm">
                {authMode === 'login' ? 'Good to see you again.' : 'Start shopping in minutes.'}
              </p>
            </div>

            {/* Sign In / Sign Up tabs — hidden for vendor */}
            {!isVendorMode && (
              <div className="flex bg-gray-100 rounded-2xl p-1 gap-1 mb-8">
                <button type="button" onClick={() => { setAuthMode('login'); navigate('/user-login'); }}
                  className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${authMode === 'login' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  Sign In
                </button>
                <button type="button" onClick={() => { setAuthMode('signup'); navigate('/user-signup'); }}
                  className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${authMode === 'signup' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  Sign Up
                </button>
              </div>
            )}

            <form className="space-y-4" onSubmit={(e) => {
              if (authMode === 'signup') {
                const passwordVal = (e.currentTarget.querySelector('[name="password"]') as HTMLInputElement)?.value;
                const phoneVal = (e.currentTarget.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                const emailVal = (e.currentTarget.querySelector('[name="email"]') as HTMLInputElement)?.value || '';
                // Password min length
                if (passwordVal.length < 6) {
                  e.preventDefault();
                  setPassError('Password must be at least 6 characters.');
                  return;
                }
                // Password match
                if (passwordVal !== confirmPass) {
                  e.preventDefault();
                  setPassError('Passwords do not match!');
                  return;
                }
                // Store category validation (vendor only)
                if (isVendorMode) {
                  const catVal = (e.currentTarget.querySelector('[name="storeCategory"]') as HTMLSelectElement)?.value || '';
                  if (!catVal) {
                    e.preventDefault();
                    setCategoryError('Please select a store category.');
                    return;
                  }
                }
                const phoneDigits = phoneVal.replace(/[\s\-+]/g, '');
                if (phoneDigits && !/^(880)?01[3-9]\d{8}$/.test(phoneDigits)) {
                  e.preventDefault();
                  setPhoneError('Enter a valid Bangladesh phone number (e.g. 01XXXXXXXXX).');
                  return;
                }
                // Client-side duplicate email check
                const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
                if (users.find((u: any) => u.email.toLowerCase() === emailVal.toLowerCase())) {
                  e.preventDefault();
                  setEmailError('This email is already registered.');
                  return;
                }
              }
              handleLogin(e, setToast);
            }}>
              {/* Hidden Role Input */}
              <input type="hidden" name="role" value={isVendorMode ? 'vendor' : 'customer'} />
              <input type="hidden" name="mode" value={authMode} />

              {authMode === 'signup' && (
                <>
                  {isVendorMode && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Store Name</label>
                      <input required name="storeName" type="text" placeholder="e.g. TechWorld Official" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Full Name</label>
                      <input required name="name" type="text" placeholder="John Doe" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Phone Number</label>
                      <input required name="phone" type="tel" placeholder="01XXXXXXXXX" onChange={() => setPhoneError('')} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
                      {phoneError && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{phoneError}</p>}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Email Address</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-sm pointer-events-none"></i>
                  <input required name="email" type="email" placeholder="name@example.com" onChange={() => setEmailError('')} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-0 focus:border-brand-400 focus:bg-white transition-all font-bold" />
                </div>
                {emailError && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{emailError}</p>}
              </div>

              {authMode === 'signup' && (
                <div>
                  {isVendorMode && (
                    <>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Store City</label>
                      <input type="text" name="storeCity" placeholder="Your City (e.g. Dhaka, Chittagong, Khulna)" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold mb-4" />

                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">
                        Store Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="storeCategory"
                        required
                        onChange={() => setCategoryError('')}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold mb-1 appearance-none cursor-pointer text-gray-700"
                        defaultValue=""
                      >
                        <option value="" disabled>Select your store category</option>
                        {(() => {
                          const defaultCats = ['Electronics', 'Fashion', 'Home & Living', 'Beauty & Health', 'Sports & Outdoor'];
                          const customCats = JSON.parse(localStorage.getItem('custom_categories') || '[]');
                          const allCats = [...defaultCats, ...customCats.map((c: any) => c.name)];
                          return allCats.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ));
                        })()}
                      </select>
                      {categoryError && <p className="text-red-500 text-xs font-bold mt-1 ml-2 mb-2">{categoryError}</p>}
                    </>
                  )}
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">{isVendorMode ? 'Store Address' : 'Delivery Address'}</label>
                  <textarea required name="address" placeholder="House #, Road #, Area, City" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold resize-none" rows={2} />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Password</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-sm pointer-events-none"></i>
                  <input required name="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-12 pr-14 py-4 outline-none focus:ring-0 focus:border-brand-400 focus:bg-white transition-all font-bold" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors">
                    <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Confirm Password</label>
                  <div className="relative">
                    <input
                      required
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPass}
                      onChange={e => { setConfirmPass(e.target.value); setPassError(''); }}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold pr-14"
                    />
                  </div>
                  {passError && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{passError}</p>}
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-black">
                <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
                  <input type="checkbox" className="w-4 h-4 accent-brand-600 rounded-md" /> Remember me
                </label>
                {authMode === 'login' && (
                  <button type="button" onClick={() => { setShowForgotModal(true); setForgotStep('email'); setForgotEmail(''); setForgotEmailError(''); setNewPassword(''); setNewPasswordConfirm(''); setForgotError(''); }} className="text-brand-600 hover:underline">Forgot Password?</button>
                )}
              </div>

              <button type="submit" className="w-full py-4 text-white rounded-2xl font-black text-base shadow-lg hover:scale-[1.01] active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', boxShadow: '0 8px 24px rgba(124,58,237,.25)' }}>
                {isVendorMode ? 'Sign In to Merchant Portal' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {authMode === 'login' && (
              <div className="mt-8 text-center">
                <div className="border-t border-gray-100 pt-5">
                  <button
                    onClick={() => { isVendorMode ? navigate('/user-login') : navigate('/vendor-login'); }}
                    className="w-full py-3.5 border-2 border-gray-100 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest hover:border-brand-500 hover:text-brand-600 transition-all"
                  >
                    {isVendorMode ? '← Back to Customer Login' : 'Are you a merchant? Login here →'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForgotModal(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>

            {forgotStep === 'email' ? (
              <>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)' }}>
                  <i className="fas fa-key text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Reset Password</h3>
                <p className="text-gray-400 text-sm font-bold text-center mb-8">Enter your registered email address</p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => { setForgotEmail(e.target.value); setForgotEmailError(''); }}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none focus:ring-4 focus:ring-brand-500/10 mb-3"
                  autoFocus
                />
                {forgotEmailError && <p className="text-red-500 text-xs font-bold mb-4 ml-2">{forgotEmailError}</p>}
                <button
                  onClick={() => {
                    const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
                    const found = users.find((u: any) => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
                    if (!found) {
                      setForgotEmailError('No account found with this email.');
                      return;
                    }
                    // Generate a 6-digit PIN and store it
                    const pin = String(Math.floor(100000 + Math.random() * 900000));
                    setForgotPin(pin);
                    localStorage.setItem(`reset_pin_${forgotEmail.toLowerCase()}`, JSON.stringify({ pin, expiresAt: Date.now() + 10 * 60 * 1000 }));
                    setForgotStep('verify');
                    setForgotEmailError('');
                    setForgotPinInput('');
                    setForgotPinError('');
                  }}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all mt-2"
                >
                  Send Reset PIN
                </button>
              </>
            ) : forgotStep === 'verify' ? (
              <>
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-shield-alt text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Enter PIN</h3>
                <p className="text-gray-400 text-sm font-bold text-center mb-4">Enter the 6-digit PIN sent to <span className="text-gray-700">{forgotEmail}</span></p>

                {/* DEMO ONLY: Show the PIN */}
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl text-xs font-bold text-center mb-6 border border-blue-100">
                  [DEMO] Your PIN is: {forgotPin}
                </div>

                <input
                  type="text"
                  value={forgotPinInput}
                  onChange={e => { setForgotPinInput(e.target.value.replace(/\D/g, '').slice(0, 6)); setForgotPinError(''); }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-black text-2xl text-center tracking-[0.5em] border-none focus:ring-4 focus:ring-brand-500/10 mb-3"
                  autoFocus
                />
                {forgotPinError && <p className="text-red-500 text-xs font-bold mb-4 ml-2">{forgotPinError}</p>}
                <button
                  onClick={() => {
                    const stored = JSON.parse(localStorage.getItem(`reset_pin_${forgotEmail.toLowerCase()}`) || 'null');
                    if (!stored) { setForgotPinError('PIN expired. Please start over.'); return; }
                    if (Date.now() > stored.expiresAt) { setForgotPinError('PIN expired (10 min limit). Please start over.'); localStorage.removeItem(`reset_pin_${forgotEmail.toLowerCase()}`); return; }
                    if (forgotPinInput !== stored.pin) { setForgotPinError('Incorrect PIN. Please try again.'); return; }
                    setForgotStep('reset');
                    setForgotError('');
                  }}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all mt-2"
                >
                  Verify PIN
                </button>
                <button onClick={() => { setForgotStep('email'); setForgotPinInput(''); setForgotPinError(''); }} className="w-full py-3 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-all mt-3">
                  ← Back
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-lock text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-900 text-center mb-2">New Password</h3>
                <p className="text-gray-400 text-sm font-bold text-center mb-8">Set a new password for <span className="text-gray-700">{forgotEmail}</span></p>
                <div className="space-y-4 mb-3">
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setForgotError(''); }}
                      placeholder="New password"
                      className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none focus:ring-4 focus:ring-brand-500/10 pr-14"
                    />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600">
                      <i className={`fas ${showNewPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPasswordConfirm}
                      onChange={e => { setNewPasswordConfirm(e.target.value); setForgotError(''); }}
                      placeholder="Confirm new password"
                      className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold border-none focus:ring-4 focus:ring-brand-500/10 pr-14"
                    />
                  </div>
                </div>
                {forgotError && <p className="text-red-500 text-xs font-bold mb-4 ml-2">{forgotError}</p>}
                <button
                  onClick={async () => {
                    if (newPassword.length < 6) { setForgotError('Password must be at least 6 characters.'); return; }
                    if (newPassword !== newPasswordConfirm) { setForgotError('Passwords do not match!'); return; }
                    const hashedNew = await hashPassword(newPassword);
                    const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
                    const updatedUsers = users.map((u: any) =>
                      u.email.toLowerCase() === forgotEmail.trim().toLowerCase() ? { ...u, password: hashedNew } : u
                    );
                    localStorage.setItem('mamu_users', JSON.stringify(updatedUsers));
                    localStorage.removeItem(`reset_pin_${forgotEmail.toLowerCase()}`);
                    if (setToast) setToast('Password reset successful! Please log in.');
                    setShowForgotModal(false);
                    setForgotStep('email');
                    setForgotPin('');
                    setForgotPinInput('');
                    setNewPassword('');
                    setNewPasswordConfirm('');
                  }}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all"
                >
                  Reset Password
                </button>
                <button onClick={() => setForgotStep('email')} className="w-full py-3 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-all mt-3">
                  ← Back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;
