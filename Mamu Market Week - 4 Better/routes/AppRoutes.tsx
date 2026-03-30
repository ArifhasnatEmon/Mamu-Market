import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import Toast from '../components/ui/Toast';
import HomeView from '../pages/home/HomeView';
import LoginView from '../pages/auth/LoginView';
import BecomeVendorView from '../pages/static/BecomeVendorView';


// URLs (paths) to specific page components. (reactRoutedome)
const AppRoutes: React.FC = () => {
  const { toast, setToast } = useApp();
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/dashboard" element={<div className="min-h-[60vh]" />} />
          <Route path="/user-login" element={<LoginView initialVendorMode={false} />} />
          <Route path="/user-signup" element={<LoginView initialVendorMode={false} />} />
          <Route path="/vendor-login" element={<LoginView initialVendorMode={true} />} />
          <Route path="/affiliate-program" element={<BecomeVendorView />} />
        </Routes>
      </Layout>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};
export default AppRoutes;
