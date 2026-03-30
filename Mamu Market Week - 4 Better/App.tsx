import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppRoutes from './routes/AppRoutes';

// It wraps the entire app in context providers to manage auth and global state.
const App: React.FC = () => (
  <AuthProvider>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </AuthProvider>
);

export default App;
