import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { safeGet, safeSet } from '../../utils/storage';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const SettingsView: React.FC = () => {
  const { user, setUser } = useAuth();
  const { setToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState(user?.name || '');

  const [bio, setBio] = useState((user as any)?.bio || '');
  const [address, setAddress] = useState((user as any)?.address || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [socialFacebook, setSocialFacebook] = useState(user?.socialFacebook || '');
  const [socialInstagram, setSocialInstagram] = useState(user?.socialInstagram || '');
  const [socialYoutube, setSocialYoutube] = useState(user?.socialYoutube || '');
  const [socialWhatsapp, setSocialWhatsapp] = useState(user?.socialWhatsapp || '');
  
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);

  const [addresses, setAddresses] = useState<any[]>(() => {
    const users = safeGet('mamu_users', []);
    const found = users.find((u: any) => u.id === user?.id);
    return found?.addresses || [];
  });
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');
  const [notifications, setNotifications] = useState<any>(() => {
    const users = safeGet('mamu_users', []);
    const found = users.find((u: any) => u.id === user?.id);
    return found?.notifications || { orderShipped: true };
  });

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [upImg, setUpImg] = useState<any>();
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
  const imgRef = useRef<HTMLImageElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => setUpImg(reader.result));
    reader.readAsDataURL(file);
    setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
    setCropModalOpen(true);
  };

  const handleCropComplete = () => {
    if (!imgRef.current || !crop.width || !crop.height) return;
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelCropX = (crop.unit === '%' ? (crop.x / 100) * image.width : crop.x) * scaleX;
    const pixelCropY = (crop.unit === '%' ? (crop.y / 100) * image.height : crop.y) * scaleY;
    const pixelCropW = (crop.unit === '%' ? (crop.width / 100) * image.width : crop.width) * scaleX;
    const pixelCropH = (crop.unit === '%' ? (crop.height / 100) * image.height : crop.height) * scaleY;

    canvas.width = pixelCropW;
    canvas.height = pixelCropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(image, pixelCropX, pixelCropY, pixelCropW, pixelCropH, 0, 0, pixelCropW, pixelCropH);

    const base64Image = canvas.toDataURL('image/jpeg', 0.95);
    setAvatar(base64Image);
    setCropModalOpen(false);
    setUpImg(null);
  };

  const handleSaveProfile = () => {
    const users = safeGet('mamu_users', []);
    const updated = { ...user, name, bio, address, phone, avatar, socialFacebook, socialInstagram, socialYoutube, socialWhatsapp };
    const updatedUsers = users.map((u: any) => u.id === user?.id ? { ...u, ...updated } : u);
    safeSet('mamu_users', updatedUsers);
    safeSet('mamu_user', updated);
    setUser(updated);
    setToast('Profile updated successfully!');
  };

  const handleChangePassword = async () => {
    setPassError('');
    const users = safeGet('mamu_users', []);
    const found = users.find((u: any) => u.id === user?.id);
    const hashedCurrent = await hashPassword(currentPass);
    if (!found || found.password !== hashedCurrent) { setPassError('Current password is incorrect.'); return; }
    if (newPass.length < 6) { setPassError('Password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { setPassError('Passwords do not match!'); return; }
    const hashedNew = await hashPassword(newPass);
    const updatedUsers = users.map((u: any) => u.id === user?.id ? { ...u, password: hashedNew } : u);
    safeSet('mamu_users', updatedUsers);
    const updatedSession = { ...user, password: hashedNew };
    safeSet('mamu_user', updatedSession);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setToast('Password changed successfully!');
    setActiveTab('security');
  };

  const handleDeleteAccount = () => {
    const requests = safeGet('account_delete_requests', []);
    requests.push({
      id: 'adr_' + Date.now(),
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      role: user?.role,
      status: 'pending',
      date: new Date().toISOString()
    });
    safeSet('account_delete_requests', requests);
    setShowDeleteConfirm(false);
    setToast('Account deletion requested. Please allow 24 hours to 7 days for our administrative team to process your request.');
  };

  const handleEmailChangeRequest = async () => {
    if (!newEmail || !emailPassword) { setToast('Please fill all fields'); return; }
    const hashedEmailPass = await hashPassword(emailPassword);
    if (user?.password !== hashedEmailPass) { setToast('Incorrect password'); return; }
    
    const requests = safeGet('email_change_requests', []);
    requests.push({
      id: 'ecr_' + Date.now(),
      userId: user?.id,
      userName: user?.name,
      currentEmail: user?.email,
      newEmail: newEmail,
      status: 'pending',
      date: new Date().toISOString()
    });
    safeSet('email_change_requests', requests);
    setShowEmailModal(false);
    setNewEmail('');
    setEmailPassword('');
    setToast('Email change request sent to admin');
  };

  const handleAddAddress = () => {
    if (!newAddressLabel || !newAddressText) { setToast('Please fill all fields'); return; }
    const newAddr = { id: Date.now().toString(), label: newAddressLabel, address: newAddressText, isDefault: addresses.length === 0 };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    const users = safeGet('mamu_users', []);
    const updatedUsers = users.map((u: any) => u.id === user?.id ? { ...u, addresses: updated } : u);
    safeSet('mamu_users', updatedUsers);
    setNewAddressLabel(''); setNewAddressText('');
    setToast('Address saved.');
  };
  const handleRemoveAddress = (id: string) => {
    const updated = addresses.filter((a: any) => a.id !== id);
    setAddresses(updated);
    const users = safeGet('mamu_users', []);
    const updatedUsers = users.map((u: any) => u.id === user?.id ? { ...u, addresses: updated } : u);
    safeSet('mamu_users', updatedUsers);
  };
  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a: any) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    const users = safeGet('mamu_users', []);
    const updatedUsers = users.map((u: any) => u.id === user?.id ? { ...u, addresses: updated } : u);
    safeSet('mamu_users', updatedUsers);
    setToast('Default address updated.');
  };
  const handleSaveNotifications = () => {
    const users = safeGet('mamu_users', []);
    const updatedUsers = users.map((u: any) => u.id === user?.id ? { ...u, notifications } : u);
    safeSet('mamu_users', updatedUsers);
    setToast('Notification preferences saved.');
    setActiveTab('notifications');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'fa-user' },
    { id: 'security', label: 'Password & Security', icon: 'fa-shield-alt' },
    ...(user?.role === 'vendor' ? [{ id: 'social', label: 'Social Media', icon: 'fa-share-alt' }] : []),
    ...(user?.role === 'customer' ? [{ id: 'addresses', label: 'Address Book', icon: 'fa-map-marker-alt' }] : []),
    ...(user?.role === 'customer' ? [{ id: 'notifications', label: 'Notifications', icon: 'fa-bell' }] : []),
  ];

  const inputClass = "w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all font-bold";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block";

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Account Settings</h1>
        <p className="text-gray-400 font-medium mb-12">Manage your profile, security and preferences</p>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Profile Card - Large */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
                <i className="fas fa-user text-white text-xs"></i>
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Profile</h2>
            </div>
            <div className="flex items-center gap-6 mb-8">
              <div className="relative shrink-0">
                {avatar ? (
                  <img src={avatar || 'https://via.placeholder.com/150?text=User'} referrerPolicy="no-referrer" className="w-20 h-20 rounded-2xl object-cover" alt="avatar" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    {(name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-brand-700 transition-all">
                  <i className="fas fa-camera text-xs"></i>
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onSelectFile(f); }} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{name || 'Your Name'}</p>
                <p className="text-gray-400 font-medium text-sm">{user?.email ? (() => { const [local, domain] = user.email.split('@'); return local.charAt(0) + '*'.repeat(Math.min(local.length - 1, 4)) + '@' + domain; })() : ''}</p>
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full mt-2 inline-block ${user?.role === 'vendor' ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}>{user?.role || 'customer'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880 1XXX XXXXXX" className={inputClass} />
              </div>
              {user?.role === 'customer' && (
                <div>
                  <label className={labelClass}>Default Address</label>
                  <div className={`${inputClass} flex items-center gap-2`}>
                    <span className="flex-1 truncate text-gray-500">
                      {(() => {
                        const def = addresses.find((a: any) => a.isDefault);
                        return def ? `${def.label} — ${def.address}` : 'No default set';
                      })()}
                    </span>
                    <button onClick={() => setActiveTab('addresses')} className="text-xs font-black text-brand-600 shrink-0 hover:underline">Change</button>
                  </div>
                </div>
              )}
              <div className="col-span-2">
                <label className={labelClass}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={2} className={inputClass + " resize-none"} />
              </div>
            </div>
            <button onClick={handleSaveProfile} className="mt-6 px-10 py-4 gradient-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
              Save Changes
            </button>
          </div>

          {/* Quick Nav Cards - Right Column */}
          <div className="flex flex-col gap-6">

            {/* Security Card */}
            <button onClick={() => setActiveTab(activeTab === 'security' ? 'general' : 'security')} className={`text-left bg-white rounded-[2rem] border-2 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all w-full ${activeTab === 'security' ? 'border-gray-900' : 'border-gray-100'}`}>
              <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mb-4">
                <i className="fas fa-shield-alt text-white"></i>
              </div>
              <h3 className="font-black text-gray-900 mb-1">Password & Security</h3>
              <p className="text-xs text-gray-400 font-medium">Change password, manage security</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-black text-brand-600">
                {activeTab === 'security' ? 'Close' : 'Manage'} <i className={`fas fa-arrow-${activeTab === 'security' ? 'up' : 'right'} text-xs`}></i>
              </div>
            </button>

            {user?.role === 'vendor' && (
              <button onClick={() => navigate('/settings/store')} className="text-left bg-white rounded-[2rem] border-2 border-gray-100 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all w-full">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mb-4">
                  <i className="fas fa-store text-white"></i>
                </div>
                <h3 className="font-black text-gray-900 mb-1">Store Settings</h3>
                <p className="text-xs text-gray-400 font-medium">Banner, categories, location</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-black text-brand-600">Manage <i className="fas fa-arrow-right text-xs"></i></div>
              </button>
            )}

            {user?.role === 'vendor' && (
              <button onClick={() => setActiveTab(activeTab === 'social' ? 'general' : 'social')} className={`text-left bg-white rounded-[2rem] border-2 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all w-full ${activeTab === 'social' ? 'border-gray-900' : 'border-gray-100'}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-4">
                  <i className="fas fa-share-alt text-white"></i>
                </div>
                <h3 className="font-black text-gray-900 mb-1">Social Media</h3>
                <p className="text-xs text-gray-400 font-medium">Link your social pages</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-black text-brand-600">
                  {activeTab === 'social' ? 'Close' : 'Manage'} <i className={`fas fa-arrow-${activeTab === 'social' ? 'up' : 'right'} text-xs`}></i>
                </div>
              </button>
            )}

            {user?.role === 'customer' && (
              <button onClick={() => setActiveTab(activeTab === 'addresses' ? 'general' : 'addresses')} className={`text-left bg-white rounded-[2rem] border-2 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all w-full ${activeTab === 'addresses' ? 'border-gray-900' : 'border-gray-100'}`}>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4">
                  <i className="fas fa-map-marker-alt text-white"></i>
                </div>
                <h3 className="font-black text-gray-900 mb-1">Address Book</h3>
                <p className="text-xs text-gray-400 font-medium">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-black text-brand-600">
                  {activeTab === 'addresses' ? 'Close' : 'Manage'} <i className={`fas fa-arrow-${activeTab === 'addresses' ? 'up' : 'right'} text-xs`}></i>
                </div>
              </button>
            )}

            {user?.role === 'customer' && (
              <button onClick={() => setActiveTab(activeTab === 'notifications' ? 'general' : 'notifications')} className={`text-left bg-white rounded-[2rem] border-2 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all w-full ${activeTab === 'notifications' ? 'border-gray-900' : 'border-gray-100'}`}>
                <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center mb-4">
                  <i className="fas fa-bell text-white"></i>
                </div>
                <h3 className="font-black text-gray-900 mb-1">Notifications</h3>
                <p className="text-xs text-gray-400 font-medium">Manage your preferences</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-black text-brand-600">
                  {activeTab === 'notifications' ? 'Close' : 'Manage'} <i className={`fas fa-arrow-${activeTab === 'notifications' ? 'up' : 'right'} text-xs`}></i>
                </div>
              </button>
            )}

          </div>

          {/* Expanded Tab Content */}
          {activeTab !== 'general' && (
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">

                  {activeTab === 'security' && (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
                          <i className="fas fa-shield-alt text-white text-xs"></i>
                        </div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Password & Security</h2>
                      </div>
                      <div className="max-w-md space-y-4">
                        <div>
                          <label className={labelClass}>Current Password</label>
                          <div className="relative">
                            <input type={showCurrentPass ? 'text' : 'password'} value={currentPass} onChange={e => setCurrentPass(e.target.value)} className={inputClass} />
                            <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <i className={`fas ${showCurrentPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>New Password</label>
                          <div className="relative">
                            <input type={showNewPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} className={inputClass} />
                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              <i className={`fas ${showNewPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Confirm New Password</label>
                          <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={inputClass} />
                        </div>
                        {passError && <p className="text-red-500 text-sm font-bold">{passError}</p>}
                        <button onClick={handleChangePassword} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">Update Password</button>
                      </div>
                      <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 mb-4">Email Address</h3>
                        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user?.email}</p>
                            <p className="text-xs text-gray-400 font-medium">Verified</p>
                          </div>
                          <button onClick={() => setShowEmailModal(true)} className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Change</button>
                        </div>
                      </div>
                      <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-black text-red-500 mb-4">Danger Zone</h3>
                        {!showDeleteConfirm ? (
                          <button onClick={() => setShowDeleteConfirm(true)} className="px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-all">Delete Account</button>
                        ) : (
                          <div className="bg-red-50 rounded-2xl p-6 max-w-md">
                            <p className="font-black text-red-700 mb-4">Are you sure? This cannot be undone.</p>
                            <div className="flex gap-3">
                              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-black text-sm hover:bg-gray-50">Cancel</button>
                              <button onClick={handleDeleteAccount} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600">Delete</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'addresses' && user?.role === 'customer' && (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                          <i className="fas fa-map-marker-alt text-white text-xs"></i>
                        </div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Address Book</h2>
                      </div>
                      <div className="space-y-3 mb-8">
                        {addresses.length === 0 && <p className="text-gray-400 font-bold text-center py-8">No saved addresses yet</p>}
                        {addresses.map((addr: any) => (
                          <div key={addr.id} className={`p-5 rounded-2xl border-2 transition-all ${addr.isDefault ? 'border-brand-500 bg-brand-50/30' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-black text-gray-900">{addr.label}</span>
                                  {addr.isDefault && <span className="text-[10px] font-black text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full uppercase">Default</span>}
                                </div>
                                <p className="text-gray-500 text-sm font-medium">{addr.address}</p>
                              </div>
                              <div className="flex gap-3 shrink-0">
                                {!addr.isDefault && <button onClick={() => handleSetDefault(addr.id)} className="text-xs font-black text-brand-600 hover:underline">Set Default</button>}
                                <button onClick={() => handleRemoveAddress(addr.id)} className="text-xs font-black text-red-400 hover:text-red-600">Remove</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 pt-8">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Add New Address</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Label (e.g. Home, Office)</label>
                            <input type="text" value={newAddressLabel} onChange={e => setNewAddressLabel(e.target.value)} placeholder="Home" className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Full Address</label>
                            <input type="text" value={newAddressText} onChange={e => setNewAddressText(e.target.value)} placeholder="House #, Road #, Area, City" className={inputClass} />
                          </div>
                        </div>
                        <button onClick={handleAddAddress} className="mt-4 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">Add Address</button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && user?.role === 'customer' && (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center">
                          <i className="fas fa-bell text-white text-xs"></i>
                        </div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Notification Preferences</h2>
                      </div>
                      <div className="space-y-4 max-w-lg mb-8">
                        {[
                          { key: 'orderShipped', label: 'Order Updates', desc: 'Get notified when your order is shipped or delivered', icon: 'fa-box' },



                        ].map(item => (
                          <div key={item.key} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <i className={`fas ${item.icon} text-brand-600 text-sm`}></i>
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-sm">{item.label}</p>
                                <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                              </div>
                            </div>
                            <button onClick={() => setNotifications((prev: any) => ({ ...prev, [item.key]: !prev[item.key] }))} className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${notifications[item.key] ? 'bg-brand-600' : 'bg-gray-200'}`}>
                              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifications[item.key] ? 'left-6' : 'left-0.5'}`}></span>
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleSaveNotifications} className="px-12 py-5 gradient-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all">Save Preferences</button>
                    </div>
                  )}

                  {activeTab === 'social' && user?.role === 'vendor' && (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                          <i className="fas fa-share-alt text-white text-xs"></i>
                        </div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Social Media Links</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 ${socialFacebook ? 'bg-blue-50' : 'bg-gray-50'}`}>
                          <i className={`fab fa-facebook text-lg ${socialFacebook ? 'text-blue-600' : 'text-gray-300'}`}></i>
                          <input type="text" value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} placeholder="facebook.com/yourpage" className="flex-1 bg-transparent outline-none font-bold text-gray-700 placeholder-gray-300 min-w-0" />
                        </div>
                        <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 ${socialInstagram ? 'bg-pink-50' : 'bg-gray-50'}`}>
                          <i className={`fab fa-instagram text-lg ${socialInstagram ? 'text-pink-500' : 'text-gray-300'}`}></i>
                          <input type="text" value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} placeholder="instagram.com/yourprofile" className="flex-1 bg-transparent outline-none font-bold text-gray-700 placeholder-gray-300 min-w-0" />
                        </div>
                        <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 ${socialWhatsapp ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <i className={`fab fa-whatsapp text-lg ${socialWhatsapp ? 'text-green-500' : 'text-gray-300'}`}></i>
                          <input type="text" value={socialWhatsapp} onChange={e => setSocialWhatsapp(e.target.value)} placeholder="01XXXXXXXXX" className="flex-1 bg-transparent outline-none font-bold text-gray-700 placeholder-gray-300 min-w-0" />
                        </div>
                        <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 ${socialYoutube ? 'bg-red-50' : 'bg-gray-50'}`}>
                          <i className={`fab fa-youtube text-lg ${socialYoutube ? 'text-red-500' : 'text-gray-300'}`}></i>
                          <input type="text" value={socialYoutube} onChange={e => setSocialYoutube(e.target.value)} placeholder="youtube.com/@yourchannel" className="flex-1 bg-transparent outline-none font-bold text-gray-700 placeholder-gray-300 min-w-0" />
                        </div>
                      </div>
                      <button onClick={handleSaveProfile} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">
                        Save Social Links
                      </button>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>

      {/* Crop Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg">
            <h3 className="text-xl font-black text-gray-900 mb-6">Crop Profile Photo</h3>
            <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1} circularCrop>
              <img ref={imgRef} src={upImg || undefined} referrerPolicy="no-referrer" alt="crop" />
            </ReactCrop>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCropModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest">Cancel</button>
              <button onClick={handleCropComplete} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md">
            <h3 className="text-xl font-black text-gray-900 mb-6">Change Email</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>New Email</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)} className={inputClass} />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEmailModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest">Cancel</button>
                <button onClick={handleEmailChangeRequest} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
