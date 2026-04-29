import React, { useState } from 'react';
import { PRODUCTS } from '../../constants';

const defaultSlides = [
  { img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop', title: 'Elevate Your Everyday', sub: 'Discover premium collections curated for the modern lifestyle.' },
  { img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop', title: 'The Future of Tech', sub: 'Experience cutting-edge innovation from world-class vendors.' },
  { img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop', title: 'Best Gadget and Gear', sub: 'Grab the best gadgets and gear from the most trusted sellers.' },
  { img: 'https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=1200&auto=format&fit=crop', title: 'Elevate Your Space in Style', sub: 'Premium furniture curated for modern living.' },
  { img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop', title: 'Glow with Confidence', sub: 'Premium beauty and health essentials for your everyday well-being.' },
  { img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop', title: 'Define Your Style', sub: 'Fashion that speaks confidence, comfort, and individuality.' },
];

type BannerMsg = { message: string; icon?: string; badge?: string };

const GPreview: React.FC<{ msgs: BannerMsg[] }> = ({ msgs }) => {
  const [ci, setCi] = React.useState(0);
  const [phase, setPhase] = React.useState<'in'|'out'>('in');
  React.useEffect(() => {
    if (msgs.length <= 1) return;
    const iv = setInterval(() => {
      setPhase('out');
      setTimeout(() => { setCi(p => (p + 1) % msgs.length); setPhase('in'); }, 380);
    }, 3000);
    return () => clearInterval(iv);
  }, [msgs.length]);
  const c = msgs[ci] || msgs[0];
  if (!c) return null;
  return (
    <div className="rounded-2xl overflow-hidden mb-5" style={{ background: 'linear-gradient(135deg,#4c1d95,#7c3aed,#a855f7)' }}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-white px-5 pt-3">Live Preview</p>
      <style>{`@keyframes secUp{from{transform:translateY(60%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes secDown{from{transform:translateY(0);opacity:1}to{transform:translateY(-60%);opacity:0}}.sec-in{animation:secUp .38s ease forwards}.sec-out{animation:secDown .35s ease forwards}`}</style>
      <div className="flex items-center justify-between px-5 py-4 gap-4 overflow-hidden" style={{minHeight:'64px'}}>
        <div className={phase === 'out' ? 'sec-out' : 'sec-in'} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          {c.icon && <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl shrink-0">{c.icon}</div>}
          <p className="font-black text-white text-sm">{c.icon ? c.message.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').trim() : c.message}</p>
        </div>
        {msgs.length > 1 && (
          <div className="flex gap-1 shrink-0">
            {msgs.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === ci ? 'bg-white' : 'bg-white/30'}`} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const DPreview: React.FC<{ msgs: BannerMsg[] }> = ({ msgs }) => {
  const [ci, setCi] = React.useState(0);
  const [vis, setVis] = React.useState(true);
  React.useEffect(() => {
    if (msgs.length <= 1) return;
    const iv = setInterval(() => {
      setVis(false);
      setTimeout(() => { setCi(p => (p + 1) % msgs.length); setVis(true); }, 500);
    }, 3000);
    return () => clearInterval(iv);
  }, [msgs.length]);
  const c = msgs[ci] || msgs[0];
  if (!c) return null;
  return (
    <div className="rounded-2xl overflow-hidden mb-5 bg-gray-900 border-t-4 border-purple-600">
      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-white px-5 pt-3">Live Preview</p>
      <div className="flex items-center justify-between px-5 py-4 gap-4" style={{minHeight:'64px'}}>
        <div style={{ transition: 'opacity 0.5s ease, transform 0.5s ease', opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(-20px)' }}>
          {c.badge && <span className="inline-block text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full mb-2">{c.badge}</span>}
          <p className="font-black text-white text-sm">{c.badge ? c.message.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').trim() : c.message}</p>
        </div>
        {msgs.length > 1 && (
          <div className="flex gap-1 shrink-0">
            {msgs.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === ci ? 'bg-purple-400' : 'bg-gray-600'}`} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const AnnouncementsPanel: React.FC<{ setToast: (msg: string) => void }> = ({ setToast }) => {
  const [slotData, setSlotData] = useState<any[]>(() => JSON.parse(localStorage.getItem('secondary_banner_slots') || '[]'));
  const [dailyEnd, setDailyEnd] = useState(localStorage.getItem('deal_end_time_daily') || '');
  const [weeklyEnd, setWeeklyEnd] = useState(localStorage.getItem('deal_end_time_weekly') || '');
  const [monthlyEnd, setMonthlyEnd] = useState(localStorage.getItem('deal_end_time_monthly') || '');
  const [bannerText, setBannerText] = useState(localStorage.getItem('announcement_banner') || '');
  const [bannerText2, setBannerText2] = useState(localStorage.getItem('announcement_banner_2') || '');
  const [bannerEnabled, setBannerEnabled] = useState(localStorage.getItem('announcement_enabled') !== 'false');
  const [bannerStyle, setBannerStyle] = useState(localStorage.getItem('announcement_style') || 'gradient');
  const [bannerCtaText, setBannerCtaText] = useState(localStorage.getItem('announcement_cta_text') || '');
  const [bannerCtaLink, setBannerCtaLink] = useState(localStorage.getItem('announcement_cta_link') || '/products');
  const [secBannerEnabled, setSecBannerEnabled] = useState(localStorage.getItem('secondary_banner_enabled') !== 'false');
  const [secBannerStyle, setSecBannerStyle] = useState(localStorage.getItem('secondary_banner_style') || 'gradient');
  const defaultAdminSlots = [
  { message: localStorage.getItem('secondary_banner_title') || '', sub: localStorage.getItem('secondary_banner_subtitle') || '', icon: localStorage.getItem('secondary_banner_icon') || '🚀', badge: localStorage.getItem('secondary_banner_badge') || '🔥 LIMITED OFFER', ctaText: localStorage.getItem('secondary_banner_cta_text') || '', ctaLink: localStorage.getItem('secondary_banner_cta_link') || '/products' },
  { message: localStorage.getItem('admin_slot1_message') || '', sub: localStorage.getItem('admin_slot1_sub') || '', icon: localStorage.getItem('admin_slot1_icon') || '⚡', badge: localStorage.getItem('admin_slot1_badge') || '🛍️ NEW ARRIVALS', ctaText: localStorage.getItem('admin_slot1_cta') || '', ctaLink: localStorage.getItem('admin_slot1_link') || '/products' },
  { message: localStorage.getItem('admin_slot2_message') || '', sub: localStorage.getItem('admin_slot2_sub') || '', icon: localStorage.getItem('admin_slot2_icon') || '🎁', badge: localStorage.getItem('admin_slot2_badge') || '✨ SPECIAL DEAL', ctaText: localStorage.getItem('admin_slot2_cta') || '', ctaLink: localStorage.getItem('admin_slot2_link') || '/products' },
  { message: localStorage.getItem('admin_slot3_message') || '', sub: localStorage.getItem('admin_slot3_sub') || '', icon: localStorage.getItem('admin_slot3_icon') || '🚚', badge: localStorage.getItem('admin_slot3_badge') || '🆓 FREE DELIVERY', ctaText: localStorage.getItem('admin_slot3_cta') || '', ctaLink: localStorage.getItem('admin_slot3_link') || '/products' },
];
const [adminSlots, setAdminSlots] = useState<any[]>(defaultAdminSlots);

const updateSlot = (i: number, field: string, value: string) => {
  setAdminSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
};
  const parsedSlides = JSON.parse(localStorage.getItem('hero_slides') || 'null');
  const [heroSlides, setHeroSlides] = useState<any[]>(Array.isArray(parsedSlides) ? parsedSlides : defaultSlides);
  const [activeTab, setActiveTab] = useState<'deal_products' | 'deal_timers' | 'top_banner' | 'secondary_banner' | 'hero_slider'>('deal_products');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('deal_products')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
            activeTab === 'deal_products' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          Deal Products
        </button>
        <button
          onClick={() => setActiveTab('deal_timers')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
            activeTab === 'deal_timers' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          Deal Timers
        </button>
        <button
          onClick={() => setActiveTab('top_banner')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
            activeTab === 'top_banner' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          Top Banner
        </button>
        <button
          onClick={() => setActiveTab('secondary_banner')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
            activeTab === 'secondary_banner' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          Secondary Banner
        </button>
        <button
          onClick={() => setActiveTab('hero_slider')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
            activeTab === 'hero_slider' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
          }`}
        >
          Hero Slider
        </button>
      </div>

    {/* Deal Products Manager */}
    {activeTab === 'deal_products' && (() => {
      const allProducts = [
        ...JSON.parse(localStorage.getItem('approved_products') || '[]'),
        ...PRODUCTS
      ];
      const dealProducts = allProducts.filter((p: any) => p.isSale && p.dealType && p.dealType !== 'none');
      const byType: Record<string, any[]> = { daily: [], weekly: [], monthly: [], flash: [] };
      dealProducts.forEach((p: any) => { if (byType[p.dealType]) byType[p.dealType].push(p); });
      const dealMeta: Record<string, { label: string, color: string, icon: string }> = {
        daily: { label: 'Daily Deal', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: 'fa-bolt' },
        weekly: { label: 'Weekly', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: 'fa-calendar-week' },
        monthly: { label: 'Monthly', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: 'fa-calendar-alt' },
        flash: { label: 'Flash', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: 'fa-fire' },
      };
      return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-black text-gray-900 mb-1">Deal Products Manager</h3>
          <p className="text-xs text-gray-400 font-medium mb-5">View and remove products from active deals</p>
          {dealProducts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No products in any active deal</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(byType).map(([type, products]) => products.length === 0 ? null : (
                <div key={type}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black mb-3 ${dealMeta[type].color}`}>
                    <i className={`fas ${dealMeta[type].icon}`}></i>
                    {dealMeta[type].label} ({products.length})
                  </div>
                  <div className="space-y-2">
                    {products.map((p: any) => {
                      const approved = JSON.parse(localStorage.getItem('approved_products') || '[]');
                      const isDynamic = approved.some((a: any) => a.id === p.id);
                      return (
                        <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isDynamic ? 'bg-gray-50 border-gray-100' : 'bg-amber-50 border-amber-100'}`}>
                          {(p.mainImage || p.image) ? (
                            <img src={p.mainImage || p.image || 'https://via.placeholder.com/150'} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" onError={e => (e.currentTarget.style.display='none')} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                              <i className="fas fa-box text-gray-400 text-sm"></i>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-black text-gray-900 text-xs truncate">{p.productName || p.name}</p>
                              {!isDynamic && <span className="text-[9px] font-black bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full shrink-0">Static</span>}
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">{p.vendor || p.vendorName || '—'} · ৳{Number(p.price).toLocaleString()}</p>
                          </div>
                          {isDynamic ? (
                            <button onClick={() => {
                              const updApproved = approved.map((a: any) => a.id === p.id ? { ...a, isSale: false, dealType: 'none' } : a);
                              localStorage.setItem('approved_products', JSON.stringify(updApproved));
                              setToast(`"${p.productName || p.name}" removed from ${dealMeta[type].label}`);
                              }} className="text-[10px] font-black text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all shrink-0">
                              Remove
                            </button>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-500 bg-amber-100 px-3 py-1.5 rounded-lg shrink-0">Built-in</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    })()}

    {activeTab === 'deal_timers' && (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="font-black text-gray-900 mb-1">Deal Timers</h3>
      <p className="text-xs text-gray-400 font-medium mb-5">Set countdown timers for each deal type</p>
      {(() => {
        const saveTimer = (key: string, value: string, label: string) => {
          if (!value) { setToast('Please select date and time'); return; }
          if (new Date(value) < new Date()) { setToast('Cannot set a past date!'); return; }
          localStorage.setItem(key, value);
          setToast(`${label} timer saved!`);
        };

        const clearTimer = (key: string, setter: (v: string) => void) => {
          localStorage.removeItem(key);
          setter('');
          setToast('Timer cleared!');
        };

        const formatPreview = (value: string) => {
          if (!value) return null;
          const d = new Date(value);
          const now = new Date();
          if (d < now) return { text: 'This time has already passed!', color: 'bg-red-50 text-red-500' };
          const diff = d.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const parts = [];
          if (days > 0) parts.push(`${days}d`);
          if (hours > 0) parts.push(`${hours}h`);
          if (mins > 0) parts.push(`${mins}m`);
          return {
            text: `${d.toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })} at ${d.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit', hour12: true })} — ${parts.join(' ')} remaining`,
            color: 'bg-green-50 text-green-700'
          };
        };

        const timers = [
          { label: 'Daily Deal', key: 'deal_end_time_daily', value: dailyEnd, setter: setDailyEnd, accent: 'text-amber-600 bg-amber-50' },
          { label: 'Weekly Deal', key: 'deal_end_time_weekly', value: weeklyEnd, setter: setWeeklyEnd, accent: 'text-blue-600 bg-blue-50' },
          { label: 'Monthly Deal', key: 'deal_end_time_monthly', value: monthlyEnd, setter: setMonthlyEnd, accent: 'text-purple-600 bg-purple-50' },
        ];

        return (
          <div className="space-y-4">
            {timers.map(timer => {
              const preview = formatPreview(timer.value);
              return (
                <div key={timer.key} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className={`px-5 py-3 flex items-center gap-2 ${timer.accent}`}>
                    <i className="fas fa-clock text-sm"></i>
                    <span className="font-black text-sm uppercase tracking-widest">{timer.label}</span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Date</label>
                        <input
                          type="date"
                          value={timer.value ? timer.value.split('T')[0] : ''}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => {
                            const timePart = timer.value ? timer.value.split('T')[1] || '23:59' : '23:59';
                            timer.setter(e.target.value + 'T' + timePart);
                          }}
                          className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none font-bold text-sm border-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Time (Hour : Min)</label>
                        <input
                          type="time"
                          value={timer.value ? timer.value.split('T')[1] || '' : ''}
                          onChange={e => {
                            const datePart = timer.value ? timer.value.split('T')[0] : new Date().toISOString().split('T')[0];
                            timer.setter(datePart + 'T' + e.target.value);
                          }}
                          className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none font-bold text-sm border-none"
                        />
                      </div>
                    </div>
                    {timer.key === 'deal_end_time_daily' && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest self-center">Quick Set:</span>
                        <button onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          d.setHours(23, 59, 0, 0);
                          const val = d.toISOString().slice(0, 16);
                          timer.setter(val);
                        }} className="text-[10px] font-black px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all">+1 Day</button>
                        <button onClick={() => {
                          const d = new Date();
                          d.setHours(d.getHours() + 12);
                          const val = d.toISOString().slice(0, 16);
                          timer.setter(val);
                        }} className="text-[10px] font-black px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all">+12 Hrs</button>
                        <button onClick={() => {
                          const d = new Date();
                          d.setHours(d.getHours() + 6);
                          const val = d.toISOString().slice(0, 16);
                          timer.setter(val);
                        }} className="text-[10px] font-black px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all">+6 Hrs</button>
                      </div>
                    )}
                    {timer.key === 'deal_end_time_weekly' && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest self-center">Quick Set:</span>
                        <button onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 7);
                          d.setHours(23, 59, 0, 0);
                          const val = d.toISOString().slice(0, 16);
                          timer.setter(val);
                        }} className="text-[10px] font-black px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">+1 Week</button>
                        <button onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 3);
                          d.setHours(23, 59, 0, 0);
                          const val = d.toISOString().slice(0, 16);
                          timer.setter(val);
                        }} className="text-[10px] font-black px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">+3 Days</button>
                      </div>
                    )}
                    {timer.key === 'deal_end_time_monthly' && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest self-center">Quick Set:</span>
                        <button onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 1);
                          d.setHours(23, 59, 0, 0);
                          const val = d.toISOString().slice(0, 16);
                          timer.setter(val);
                        }} className="text-[10px] font-black px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all">+1 Month</button>
                        <button onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 15);
                          d.setHours(23, 59, 0, 0);
                          const val = d.toISOString().slice(0, 16);
                          timer.setter(val);
                        }} className="text-[10px] font-black px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all">+15 Days</button>
                      </div>
                    )}
                    {preview && (
                      <p className={`text-xs font-bold px-4 py-2 rounded-xl ${preview.color}`}>{preview.text}</p>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => saveTimer(timer.key, timer.value, timer.label)} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">
                        Save Timer
                      </button>
                      <button onClick={() => clearTimer(timer.key, timer.setter)} className="px-5 py-3 bg-red-50 text-red-500 rounded-xl font-black text-xs hover:bg-red-100 transition-all">
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
    )}
        <>
          {activeTab === 'top_banner' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-black text-gray-900 mb-1">Top Banner</h3>
            <p className="text-xs text-gray-400 font-medium mb-5">Shows at the very top of every page — single message + style</p>
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-2xl">
              <span className="font-black text-gray-700 text-sm">Banner Active</span>
              <button onClick={() => setBannerEnabled(!bannerEnabled)} className={`w-12 h-6 rounded-full transition-all relative ${bannerEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${bannerEnabled ? 'left-6' : 'left-0.5'}`}></span>
              </button>
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Caption 1</label>
              <input type="text" value={bannerText} onChange={e => setBannerText(e.target.value)} className="w-full bg-gray-50 rounded-2xl px-5 py-4 outline-none font-bold border-none" placeholder="e.g. 🚚 Free delivery on orders over ৳2,000" />
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Caption 2</label>
              <input type="text" value={bannerText2} onChange={e => setBannerText2(e.target.value)} className="w-full bg-gray-50 rounded-2xl px-5 py-4 outline-none font-bold border-none" placeholder="e.g. 🎉 New arrivals every day — shop now!" />
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Banner Style</label>
              <select value={bannerStyle} onChange={e => setBannerStyle(e.target.value)} className="w-full bg-gray-50 rounded-2xl px-5 py-4 outline-none font-bold border-none">
                <option value="gradient">🟣 Gradient (Purple)</option>
                <option value="dark">⚫ Dark Premium</option>
              </select>
            </div>
            <div className={`rounded-2xl px-6 py-3 mb-5 ${bannerStyle === 'light' ? 'bg-gray-100' : bannerStyle === 'dark' ? 'bg-gray-900' : 'gradient-primary'}`}>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-50 text-white mb-1">Live Preview</p>
              {bannerEnabled ? (
                <div className="space-y-1">
                  {bannerText && <p className={`text-sm font-bold text-center ${bannerStyle === 'light' ? 'text-gray-700' : 'text-white'}`}>① {bannerText}</p>}
                  {bannerText2 && <p className={`text-sm font-bold text-center ${bannerStyle === 'light' ? 'text-gray-700' : 'text-white'}`}>② {bannerText2}</p>}
                  {!bannerText && !bannerText2 && <p className="text-sm font-bold text-center text-white opacity-50">(enter captions above)</p>}
                </div>
              ) : (
                <p className="text-sm font-bold text-center text-white opacity-50">(Banner disabled)</p>
              )}
            </div>
            <button onClick={() => {
              localStorage.setItem('announcement_banner', bannerText);
              localStorage.setItem('announcement_banner_2', bannerText2);
              localStorage.setItem('announcement_enabled', String(bannerEnabled));
              localStorage.setItem('announcement_style', bannerStyle);
              localStorage.setItem('banner_ts', Date.now().toString());
              window.dispatchEvent(new Event('bannerSaved'));
              setToast('Banner saved!');
            }} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">Save Banner</button>
          </div>
          )}

          {/* Secondary Banner */}
          {activeTab === 'secondary_banner' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
                <i className="fas fa-film text-white text-xs"></i>
              </div>
              <h3 className="font-black text-gray-900">Secondary Banner</h3>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-5">Promotional banner shown below the hero slider on the homepage</p>

            {/* Active toggle */}
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-2xl">
              <span className="font-black text-gray-700 text-sm">Banner Active</span>
              <button onClick={() => setSecBannerEnabled(!secBannerEnabled)} className={`w-12 h-6 rounded-full transition-all relative ${secBannerEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${secBannerEnabled ? 'left-6' : 'left-0.5'}`}></span>
              </button>
            </div>

            {/* 4-Slot Live Status Dashboard */}
            {(() => {
              const rawSlots: any[] = slotData;
              const now = Date.now();

              const slotLabels = ['Admin (Permanent)', 'Vendor Slot 1', 'Vendor Slot 2', 'Vendor Slot 3'];
              const slotIcons  = ['fa-crown', 'fa-store', 'fa-store', 'fa-store'];

              return (
                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Live Slot Status</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map(i => {
                      const slot = rawSlots[i];
                      const isActive = slot?.active && slot?.message && (!slot?.expiresAt || new Date(slot.expiresAt).getTime() > now);
                      const isExpired = slot?.expiresAt && new Date(slot.expiresAt).getTime() <= now;
                      const expiresIn = slot?.expiresAt ? Math.max(0, Math.ceil((new Date(slot.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24))) : null;

                      return (
                        <div
                          key={i}
                          className={`rounded-2xl p-4 border-2 transition-all ${
                            i === 0
                              ? 'border-purple-200 bg-purple-50'
                              : isActive
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              i === 0 ? 'bg-purple-200' : isActive ? 'bg-emerald-200' : 'bg-gray-200'
                            }`}>
                              <i className={`fas ${slotIcons[i]} text-[10px] ${
                                i === 0 ? 'text-purple-700' : isActive ? 'text-emerald-700' : 'text-gray-400'
                              }`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider leading-tight">{slotLabels[i]}</p>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                i === 0 ? 'bg-purple-200 text-purple-700' :
                                isActive ? 'bg-emerald-200 text-emerald-700' :
                                isExpired ? 'bg-red-100 text-red-400' :
                                'bg-gray-200 text-gray-400'
                              }`}>
                                {i === 0 ? (isActive ? 'LIVE' : 'EMPTY') : isActive ? 'LIVE' : isExpired ? 'EXPIRED' : 'EMPTY'}
                              </span>
                            </div>
                          </div>

                          {slot?.message ? (
                            <>
                              <p className="text-xs font-black text-gray-800 truncate mb-0.5">"{slot.message}"</p>
                              {slot.vendorName && (
                                <p className="text-[10px] text-gray-400 font-medium truncate">{slot.vendorName}</p>
                              )}
                              {expiresIn !== null && (
                                <p className="text-[9px] text-gray-400 font-black mt-1 uppercase tracking-wider">
                                  {isExpired ? '⚠ Expired' : `Expires in ${expiresIn}d`}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-[10px] text-gray-300 font-medium italic">No content</p>
                          )}

                          {/* Quick remove for vendor slots */}
                          {i > 0 && isActive && (
                            <button
                              onClick={() => {
                                const updated = [...rawSlots];
                                if (updated[i]) updated[i] = { ...updated[i], active: false };
                                localStorage.setItem('secondary_banner_slots', JSON.stringify(updated));
                                setSlotData([...updated]);
                                setToast(`Slot ${i} cleared.`);
                              }}
                              className="mt-2 text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-wider"
                            >
                              × Clear Slot
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Style selector */}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">Banner Style</label>
              <div className="flex gap-2">
                <button onClick={() => setSecBannerStyle('gradient')} className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all border-2 ${secBannerStyle === 'gradient' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>🟣 Gradient<br/>with Icon</button>
                <button onClick={() => setSecBannerStyle('dark')} className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all border-2 ${secBannerStyle === 'dark' ? 'border-gray-800 bg-gray-100 text-gray-800' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>⚫ Dark<br/>Premium</button>
                <button onClick={() => setSecBannerStyle('marquee')} className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all border-2 ${secBannerStyle === 'marquee' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>🎞️ Animated<br/>Marquee</button>
              </div>
            </div>

            {/* 4 Slot simple inputs */}
            <div className="space-y-3 mb-6">
              {[0, 1, 2, 3].map(i => {
                const s = adminSlots[i];
                const slotLabel = i === 0 ? 'Slot 0 — Admin (Permanent)' : `Slot ${i} — Admin Fallback`;
                const slotBorder = i === 0 ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50';
                const labelColor = i === 0 ? 'text-purple-600' : 'text-gray-400';
                return (
                  <div key={i} className={`rounded-2xl p-4 border-2 ${slotBorder}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.18em] mb-3 ${labelColor}`}>{slotLabel}</p>
                    <div className="flex gap-2">
                      {secBannerStyle !== 'marquee' && (
                        <input
                          type="text"
                          value={secBannerStyle === 'gradient' ? s.icon : s.badge}
                          onChange={e => updateSlot(i, secBannerStyle === 'gradient' ? 'icon' : 'badge', e.target.value)}
                          className={`${secBannerStyle === 'dark' ? 'w-36' : 'w-16'} bg-white rounded-xl px-3 py-2.5 outline-none font-bold text-sm border border-gray-200 shrink-0`}
                          placeholder={secBannerStyle === 'gradient' ? '🚀' : 'e.g. FLASH SALE'}
                        />
                      )}
                      <input
                        type="text"
                        value={s.message}
                        onChange={e => updateSlot(i, 'message', e.target.value)}
                        className="flex-1 bg-white rounded-xl px-3 py-2.5 outline-none font-bold text-sm border border-gray-200"
                        placeholder={
                          secBannerStyle === 'marquee'
                            ? (i === 0 ? 'e.g. 🚚 FREE DELIVERY ON ORDERS OVER ৳10,000' : i === 1 ? 'e.g. ⚡ FLASH SALE — 50% OFF TODAY' : i === 2 ? 'e.g. 🎁 NEW ARRIVALS THIS WEEK' : 'e.g. 🏷️ USE CODE MAMU10 FOR 10% OFF')
                            : (i === 0 ? 'e.g. Flash Sale — 50% Off Today!' : i === 1 ? 'e.g. New Arrivals This Week' : i === 2 ? 'e.g. Free Delivery on Orders ৳10000+' : 'e.g. Use Code MAMU10 for 10% Off')
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Animated Live Preview */}
            {(() => {
              const msgs = adminSlots.map(s => ({ message: s.message, icon: s.icon, badge: s.badge })).filter(s => s.message);
              if (msgs.length === 0) return null;

              if (secBannerStyle === 'marquee') {
                const rep = [...msgs, ...msgs];
                return (
                  <div className="rounded-2xl overflow-hidden mb-5" style={{ background: 'linear-gradient(135deg,#4c1d95,#7c3aed,#a855f7,#ec4899)' }}>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-white px-5 pt-3">Live Preview</p>
                    <div className="overflow-hidden py-3 px-2">
                      <div style={{ display: 'flex', gap: '48px', animation: 'secMarquee 14s linear infinite', whiteSpace: 'nowrap' }}>
                        {rep.map((m, i) => (
                          <span key={i} className="shrink-0 text-white text-[10px] font-black uppercase tracking-widest">{m.message} <span style={{opacity:0.4}}>✦</span></span>
                        ))}
                      </div>
                      <style>{`@keyframes secMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
                    </div>
                  </div>
                );
              }

              if (secBannerStyle === 'gradient') return <GPreview msgs={msgs} />;
              return <DPreview msgs={msgs} />;
            })()}

            <button onClick={() => {
              localStorage.setItem('secondary_banner_enabled', String(secBannerEnabled));
              localStorage.setItem('secondary_banner_style', secBannerStyle);
              localStorage.setItem('secondary_banner_title', adminSlots[0].message);
              localStorage.setItem('secondary_banner_subtitle', adminSlots[0].sub);
              localStorage.setItem('secondary_banner_icon', adminSlots[0].icon);
              localStorage.setItem('secondary_banner_badge', adminSlots[0].badge);
              localStorage.setItem('secondary_banner_cta_text', adminSlots[0].ctaText);
              localStorage.setItem('secondary_banner_cta_link', adminSlots[0].ctaLink);
              localStorage.setItem('admin_slot1_message', adminSlots[1].message);
              localStorage.setItem('admin_slot1_sub', adminSlots[1].sub);
              localStorage.setItem('admin_slot1_icon', adminSlots[1].icon);
              localStorage.setItem('admin_slot1_badge', adminSlots[1].badge);
              localStorage.setItem('admin_slot1_cta', adminSlots[1].ctaText);
              localStorage.setItem('admin_slot1_link', adminSlots[1].ctaLink);
              localStorage.setItem('admin_slot2_message', adminSlots[2].message);
              localStorage.setItem('admin_slot2_sub', adminSlots[2].sub);
              localStorage.setItem('admin_slot2_icon', adminSlots[2].icon);
              localStorage.setItem('admin_slot2_badge', adminSlots[2].badge);
              localStorage.setItem('admin_slot2_cta', adminSlots[2].ctaText);
              localStorage.setItem('admin_slot2_link', adminSlots[2].ctaLink);
              localStorage.setItem('admin_slot3_message', adminSlots[3].message);
              localStorage.setItem('admin_slot3_sub', adminSlots[3].sub);
              localStorage.setItem('admin_slot3_icon', adminSlots[3].icon);
              localStorage.setItem('admin_slot3_badge', adminSlots[3].badge);
              localStorage.setItem('admin_slot3_cta', adminSlots[3].ctaText);
              localStorage.setItem('admin_slot3_link', adminSlots[3].ctaLink);

              const curSlots: any[] = JSON.parse(localStorage.getItem('secondary_banner_slots') || '[null,null,null,null]');
              const now = Date.now();
              for (let i = 0; i < 4; i++) {
                const existing = curSlots[i];
                const isVendorActive = existing?.type === 'vendor' && existing?.active && existing?.expiresAt && new Date(existing.expiresAt).getTime() > now;
                if (!isVendorActive) {
                  const s = adminSlots[i];
                  curSlots[i] = {
                    id: i === 0 ? 'admin_slot' : `admin_slot_${i}`,
                    type: 'admin',
                    message: s.message,
                    subMessage: s.sub,
                    icon: secBannerStyle === 'gradient' ? s.icon : (secBannerStyle === 'dark' ? s.badge : ''),
                    ctaText: s.ctaText,
                    ctaLink: s.ctaLink,
                    active: secBannerEnabled && !!s.message,
                    expiresAt: null,
                  };
                } else {
                  // Ensure vendor slots retain their icon and badge
                  curSlots[i] = {
                    ...existing,
                    icon: secBannerStyle === 'gradient' ? existing.icon : (secBannerStyle === 'dark' ? existing.badge : ''),
                  };
                }
              }
              localStorage.setItem('secondary_banner_slots', JSON.stringify(curSlots));
              setSlotData([...curSlots]);
              window.dispatchEvent(new Event('bannerSaved'));
              setToast('Secondary banner saved!');
            }} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">Save Secondary Banner</button>
          </div>
          )}


          {activeTab === 'hero_slider' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-black text-gray-900 mb-1">Hero Slider Captions</h3>
            <p className="text-xs text-gray-400 font-medium mb-5">Edit title and subtitle for each hero slide</p>
            <div className="space-y-4">
              {heroSlides.map((slide: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={slide.img || 'https://via.placeholder.com/80x48?text=IMG'} referrerPolicy="no-referrer" className="w-20 h-12 rounded-xl object-cover shrink-0" alt="" onError={e => (e.currentTarget.src = 'https://via.placeholder.com/80x48?text=IMG')} />
                    <span className="text-xs font-black text-gray-400 uppercase">Slide {i + 1}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={slide.img} 
                        onChange={e => { const updated = [...heroSlides]; updated[i] = { ...updated[i], img: e.target.value }; setHeroSlides(updated); }} 
                        className={`flex-1 bg-white rounded-xl px-4 py-2 outline-none font-medium text-xs border ${slide.img && !slide.img.includes('w=1200') ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder="Unsplash URL with ?q=80&w=1200&auto=format&fit=crop" 
                      />
                      <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-2 rounded-xl hover:bg-purple-100 whitespace-nowrap">
                        Get Image →
                      </a>
                    </div>
                    {slide.img && !slide.img.includes('w=1200') && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">URL must include: ?q=80&w=1200&auto=format&fit=crop</p>
                    )}
                    {slide.img && slide.img.includes('w=1200') && (
                      <p className="text-[10px] text-green-500 font-bold mt-1 ml-1">Valid image URL</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input type="text" value={slide.title} onChange={e => { const updated = [...heroSlides]; updated[i] = { ...updated[i], title: e.target.value }; setHeroSlides(updated); }} className="w-full bg-white rounded-xl px-4 py-3 outline-none font-black text-sm border border-gray-200" placeholder="Slide title" />
                    <input type="text" value={slide.sub} onChange={e => { const updated = [...heroSlides]; updated[i] = { ...updated[i], sub: e.target.value }; setHeroSlides(updated); }} className="w-full bg-white rounded-xl px-4 py-3 outline-none font-bold text-sm border border-gray-200" placeholder="Slide subtitle" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { 
              const invalid = heroSlides.filter((s: any) => s.img && !s.img.includes('w=1200'));
              if (invalid.length > 0) { setToast('Some slides have invalid image URLs! Must include: ?q=80&w=1200&auto=format&fit=crop'); return; }
              localStorage.setItem('hero_slides', JSON.stringify(heroSlides)); 
              setToast('Hero slides saved!'); 
            }} className="mt-5 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">Save Hero Slides</button>
          </div>
          )}
        </>
    </div>
  );
};

export default AnnouncementsPanel;
