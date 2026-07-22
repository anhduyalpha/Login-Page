import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut } from 'lucide-react';

export const AuthLayout = ({ children }) => {
  const { currentUser, navigateTo, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#090d16] text-[#f8fafc] selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Minimal Header */}
      <header className="w-full h-16 border-b border-[#1e293b] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button 
          onClick={() => navigateTo(currentUser ? 'profile' : 'register')}
          className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          aria-label="AuthPortal Trang chủ"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-white font-sans">
            Auth<span className="text-indigo-400">Portal</span>
          </span>
        </button>

        {currentUser && (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-mono text-[#94a3b8]">
              {currentUser.email}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </header>

      {/* Centered Main Viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
        {children}
      </main>

      {/* Minimal Subdued Footer */}
      <footer className="py-4 text-center text-xs font-mono text-[#64748b] border-t border-[#1e293b]">
        <span>AuthPortal &copy; {new Date().getFullYear()} &bull; Identity & Access Management</span>
      </footer>
    </div>
  );
};
