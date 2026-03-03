import React from 'react';
import { ViewType } from '../types';

// ─────────────────────────────────────────────────────────────
// TODO — Teammate 3
// Build the Vendor Registration page here. Requirements:
//   └── Store Name, Owner Name, Email, Phone
//       Business Category, Description, Password
//       On submit → show "Application submitted! Pending approval."
//       Back button → setView('home')
// ─────────────────────────────────────────────────────────────

const BecomeVendorView: React.FC<{
  setView: (v: ViewType) => void,
  setToast: (m: string) => void
}> = ({ setView }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F8]">
      <div className="text-center p-16">
        <div className="w-24 h-24 gradient-primary rounded-[2rem] flex items-center justify-center text-white text-4xl mx-auto mb-8 shadow-xl shadow-brand-500/20">
          <i className="fas fa-store"></i>
        </div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Vendor Registration</h1>
        <p className="text-xl text-gray-400 font-medium mb-2">Teammate 3 is working on this.</p>
        <p className="text-sm text-gray-300 font-medium mb-10">[ /become-vendor ]</p>
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

export default BecomeVendorView;
