import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hashPassword } from '../../utils/crypto';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
const ADMIN_HASH = import.meta.env.VITE_ADMIN_HASH || '';

const AdminLoginView: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rate limiting
  const ATTEMPT_KEY = 'admin_login_attempts';
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 30000;

  const getAttemptData = () => {
    const raw = JSON.parse(localStorage.getItem(ATTEMPT_KEY) || '{"count":0,"lockedUntil":0}');
    if (raw.lockedUntil && Date.now() >= raw.lockedUntil) return { count: 0, lockedUntil: 0 };
    return raw;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const attemptData = getAttemptData();
    if (attemptData.lockedUntil && Date.now() < attemptData.lockedUntil) {
      const secsLeft = Math.ceil((attemptData.lockedUntil - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${secsLeft}s.`);
      return;
    }

    setLoading(true);
    const hash = await hashPassword(password);
    setLoading(false);

    if (email === ADMIN_EMAIL && hash === ADMIN_HASH) {
      localStorage.removeItem(ATTEMPT_KEY);
      const adminUser: any = {
        id: 'admin',
        name: 'Master Admin',
        email,
        role: 'admin',
        status: 'active',
        avatar: 'https://picsum.photos/seed/admin/100/100',
        loginAt: Date.now()
      };
      setUser(adminUser);
      localStorage.setItem('mamu_user', JSON.stringify(adminUser));
      navigate('/mmu-adm-x9k2');
    } else {
      const newCount = (attemptData.count || 0) + 1;
      const lockedUntil = newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
      localStorage.setItem(ATTEMPT_KEY, JSON.stringify({ count: newCount, lockedUntil }));
      if (lockedUntil) {
        setError(`Too many failed attempts. Locked for 30 seconds.`);
      } else {
        setError(`Access denied. ${MAX_ATTEMPTS - newCount} attempt(s) remaining.`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-black text-gray-900">Secure Access</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Email</label>
            <input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-gray-200 font-bold border-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Password</label>
            <input
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-50 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-gray-200 font-bold border-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginView;
