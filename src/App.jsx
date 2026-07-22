import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NotificationToast } from './components/NotificationToast';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { Loader2 } from 'lucide-react';

const MainContent = () => {
  const { currentView, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="font-mono text-sm tracking-wider">Đang khởi tạo AetherAuth...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-grid-pattern relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambient Lighting Blobs */}
      <div className="ambient-light-1"></div>
      <div className="ambient-light-2"></div>

      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col justify-center">
        {currentView === 'register' && <RegisterPage />}
        {currentView === 'login' && <LoginPage />}
        {currentView === 'profile' && <ProfilePage />}
      </main>

      <Footer />

      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
