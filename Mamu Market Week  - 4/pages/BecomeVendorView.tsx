import React from 'react';
import { motion } from 'motion/react';
import { ViewType } from '../types';

const BecomeVendorView: React.FC<{ setView: (v: ViewType) => void, setToast: (m: string) => void }> = ({ setView, setToast }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4 relative overflow-hidden"
    >
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute top-8 left-8 z-20">
        <button 
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-gray-400 hover:text-brand-600 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-xl border border-gray-100 flex items-center justify-center group-hover:shadow-lg transition-all">
            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          </div>
          <span className="text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Back to Shop</span>
        </button>
      </div>

      <div className="max-w-6xl w-full mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="hidden lg:block">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-grad-soft text-brand-600 text-[11px] font-black uppercase tracking-[0.4em] px-6 py-3 rounded-full mb-10 inline-block shadow-sm"
            >
              Affiliate Program
            </motion.span>
            <h1 className="text-6xl font-black text-gray-900 mb-8 leading-[0.9] tracking-tighter text-balance">Scale your brand with Mamu Market</h1>
            <p className="text-xl text-gray-500 mb-12 leading-relaxed font-medium text-balance">Join thousands of successful entrepreneurs who use our platform to reach millions of customers globally.</p>
            
            <div className="space-y-8">
              {[
                { icon: 'fa-globe', title: 'Global Reach', desc: 'Sell to customers in over 150 countries.', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: 'fa-chart-line', title: 'Advanced Analytics', desc: 'Deep insights into your sales and traffic.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { icon: 'fa-shield-alt', title: 'Secure Payments', desc: 'Fast, reliable, and protected transactions.', color: 'text-brand-600', bg: 'bg-grad-soft' }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                    <i className={`fas ${item.icon} text-xl`}></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-10 lg:p-14 rounded-[3.5rem] shadow-2xl border border-white/40 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-10 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            <div className="lg:hidden mb-10">
              <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Affiliate Program</h1>
              <p className="text-gray-500 font-medium">Join our affiliate network today.</p>
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-10 tracking-tight hidden lg:block">Affiliate Application</h3>
            <form className="space-y-6" onSubmit={(e) => { 
              e.preventDefault(); 
              setToast('Application submitted! We will contact you soon.');
              setView('home'); 
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">First Name</label>
                  <input required type="text" placeholder="John" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Last Name</label>
                  <input required type="text" placeholder="Doe" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Store Name</label>
                <input required type="text" placeholder="TechWorld Official" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Business Email</label>
                <input required type="email" placeholder="vendor@techworld.com" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Primary Category</label>
                <div className="relative">
                  <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold appearance-none cursor-pointer">
                    <option>Electronics &amp; Gadgets</option>
                    <option>Fashion &amp; Apparel</option>
                    <option>Home &amp; Smart Living</option>
                    <option>Health &amp; Beauty</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div>
              <button type="submit" className="w-full py-5 gradient-primary text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-brand-500/30 hover:scale-[1.02] active:scale-95 transition-all">
                Submit Application
              </button>
              <p className="text-center text-[10px] text-gray-400 font-bold">By submitting, you agree to our <button type="button" className="text-brand-600 hover:underline">Merchant Terms</button>.</p>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BecomeVendorView;
