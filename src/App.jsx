import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthLayout } from './components/AuthLayout';
import { NotificationToast } from './components/NotificationToast';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { Loader2 } from 'lucide-react';

const MainContent = () => {
  const { currentView, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-mono text-xs tracking-wider text-[#94a3b8]">Đang khởi tạo...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      {currentView === 'register' && <RegisterPage />}
      {currentView === 'login' && <LoginPage />}
      {currentView === 'profile' && <ProfilePage />}
      <NotificationToast />
    </AuthLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
