import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

import { hashPassword } from '../../utils/crypto';

const BecomeVendorView: React.FC = () => {
  const { setToast } = useApp();
  const navigate = useNavigate();
  const [showPass, setShowPass] = React.useState(false);
  const [showConfirmPass, setShowConfirmPass] = React.useState(false);
  const [termsChecked, setTermsChecked] = React.useState(false);
  const [catError, setCatError] = React.useState('');
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [selectedVendorCats, setSelectedVendorCats] = React.useState<string[]>([]);

  const toggleVendorCat = (cat: string) => {
    setSelectedVendorCats(prev => {
      if (prev.includes(cat)) return prev.filter(c => c !== cat);
      if (prev.length >= 2) return prev;
      return [...prev, cat];
    });
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-between p-12 relative overflow-hidden lg:sticky lg:top-0 lg:h-screen" style={{background:'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)'}}>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/8 rounded-full blur-3xl pointer-events-none" />

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

          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tighter mb-5 max-w-xs">
            Grow your business with us.
          </h1>
          <p className="text-white/70 text-base font-medium leading-relaxed mb-10 max-w-xs">
            Join thousands of merchants selling on Mamu Market across Bangladesh.
          </p>

          <div className="space-y-3">
            {[
              { emoji: '🏪', title: 'Easy Setup', desc: 'Your store live in minutes' },
              { emoji: '📊', title: 'Sales Analytics', desc: 'Track orders & revenue' },
              { emoji: '🔒', title: 'Secure Payouts', desc: 'Fast & protected payments' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{background:'rgba(255,255,255,0.1)'}}>
                <span className="text-xl shrink-0">{f.emoji}</span>
                <div>
                  <p className="text-white font-black text-sm leading-tight">{f.title}</p>
                  <p className="text-white/60 text-xs font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-white/40 text-xs font-semibold">
          Already have an account?{' '}
          <button onClick={() => navigate('/vendor-login')} className="text-white/70 hover:text-white underline transition-colors">Sign In</button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col bg-white lg:h-screen lg:overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-brand-600 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:shadow transition-all">
              <i className="fas fa-arrow-left text-sm group-hover:-translate-x-0.5 transition-transform"></i>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-brand-600 transition-colors hidden sm:block">Back</span>
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)'}}>
              <i className="fas fa-shopping-bag text-white text-sm"></i>
            </div>
            <span className="font-black text-gray-900 text-base tracking-tight">Mamu Market</span>
          </div>
          <div className="w-9 lg:hidden" />
        </div>

        <div className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Seller Application</h2>
              <p className="text-gray-400 font-medium text-sm">Start your business journey today.</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
            <form className="space-y-6" onSubmit={async (e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget);
              const password = formData.get('password') as string;
              const confirmPassword = formData.get('confirmPassword') as string;
              if (password.length < 6) { setToast('Password must be at least 6 characters.'); return; }
              if (password !== confirmPassword) { setToast('Passwords do not match!'); return; }
              if (selectedVendorCats.length === 0) { setCatError('Please select at least 1 category.'); return; }
              if (!termsChecked) { setToast('Please agree to Merchant Terms first.'); return; }

              const san = (s: string) => (s || '').trim().replace(/[<>]/g, '');
              const email = san(formData.get('email') as string);
              const name = san(`${formData.get('firstName')} ${formData.get('lastName')}`);
              const storeName = san(formData.get('storeName') as string);
              
              const users = JSON.parse(localStorage.getItem('mamu_users') || '[]');
              const exists = users.find((u: any) => u.email === email);
              
              if (exists) {
                setToast('This email is already registered.');
                return;
              }

              const hashedPassword = await hashPassword(password);
              const newVendor = {
                id: 'v_' + Date.now(),
                name: name,
                storeName: storeName,
                email: email,
                phone: san(formData.get('phone') as string || ''),
                storeCity: san(formData.get('storeCity') as string || ''),
                storeDescription: san(formData.get('storeDescription') as string || ''),
                password: hashedPassword,
                role: 'vendor',
                status: 'pending',
                storeCategory: selectedVendorCats.join(','),
                rating: 0,
                verified: false,
                avatar: ''
              };

              users.push(newVendor);
              localStorage.setItem('mamu_users', JSON.stringify(users));
              
              setToast('Application submitted! Await admin approval.');
              navigate('/vendor-login'); 
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">First Name</label>
                  <input required name="firstName" type="text" placeholder="John" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Last Name</label>
                  <input required name="lastName" type="text" placeholder="Doe" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Store Name</label>
                <input required name="storeName" type="text" placeholder="TechWorld Official" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Business Email</label>
                <input required name="email" type="email" placeholder="vendor@techworld.com" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Phone Number</label>
                <input required name="phone" type="tel" placeholder="01XXXXXXXXX" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Password</label>
                <div className="relative">
                  <input required name="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold pr-14" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors">
                    <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Confirm Password</label>
                <div className="relative">
                  <input required name="confirmPassword" type={showConfirmPass ? 'text' : 'password'} placeholder="••••••••" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold pr-14" />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors">
                    <i className={`fas ${showConfirmPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              {(() => {
                const defaultCats = ['Electronics', 'Fashion', 'Home & Living', 'Beauty & Health', 'Sports & Outdoor'];
                const customCats = JSON.parse(localStorage.getItem('custom_categories') || '[]');
                const allCats = [...defaultCats, ...customCats.map((c: any) => c.name)];
                return (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                      Store Categories <span className="text-brand-600">(Choose up to 2)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {allCats.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleVendorCat(cat)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                            selectedVendorCats.includes(cat)
                              ? 'bg-brand-600 text-white border-brand-600'
                              : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-brand-300'
                          } ${selectedVendorCats.length >= 2 && !selectedVendorCats.includes(cat) ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          {selectedVendorCats.includes(cat) && <i className="fas fa-check mr-1 text-[10px]"></i>}
                          {cat}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">
                      {selectedVendorCats.length === 0 && 'Select at least 1 category'}
                      {selectedVendorCats.length === 1 && `Selected: ${selectedVendorCats[0]} — you can add 1 more`}
                      {selectedVendorCats.length === 2 && `Selected: ${selectedVendorCats.join(' & ')}`}
                    </p>
                    <input type="hidden" name="storeCategory" value={selectedVendorCats.join(',')} />
                    {catError && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{catError}</p>}
                  </div>
                );
              })()}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Store Location / City</label>
                <input required name="storeCity" type="text" placeholder="e.g. Dhaka, Chittagong, Khulna" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Store Description <span className="text-gray-300 normal-case font-bold">(optional)</span></label>
                <textarea name="storeDescription" placeholder="Tell customers what your store sells..." className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold resize-none" rows={2} />
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsChecked}
                  onChange={e => setTermsChecked(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-brand-600 cursor-pointer shrink-0"
                />
                <label htmlFor="terms" className="text-[11px] text-gray-400 font-bold leading-relaxed cursor-pointer">
                  I have read and agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-brand-600 hover:underline">Merchant Terms</button>. Submitting without reading is your responsibility.
                </label>
              </div>
              <button type="submit" className="w-full py-5 text-white rounded-[2rem] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all" style={{background:'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', boxShadow:'0 8px 32px rgba(124,58,237,.3)'}}>
                Submit Application
              </button>
            </form>
            </motion.div>
          </div>
        </div>
      </div>
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTermsModal(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-gray-900 mb-6">Merchant Terms</h3>
            <div className="text-sm text-gray-500 font-medium space-y-4 leading-relaxed">
              <p>1. You agree to provide accurate product information at all times.</p>
              <p>2. All products must comply with Mamu Market's quality standards.</p>
              <p>3. Vendors are responsible for timely order fulfillment.</p>
              <p>4. Mamu Market reserves the right to remove listings that violate policies.</p>
              <p>5. Vendor accounts found in violation may be suspended or terminated.</p>
              <p>6. Commission rates and payment terms are subject to change with notice.</p>
              <p>7. All disputes will be handled through Mamu Market's resolution process.</p>
            </div>
            <button
              onClick={() => { setShowTermsModal(false); setTermsChecked(true); }}
              className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BecomeVendorView;
