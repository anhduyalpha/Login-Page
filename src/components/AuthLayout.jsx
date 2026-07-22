import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const AuthLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080808] text-[#f5f5f5] selection:bg-white/20 selection:text-white relative overflow-hidden">
      
      {/* Background subtle radial spotlight */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.035] via-transparent to-transparent" 
        aria-hidden="true" 
      />

      {/* Minimal Header only when logged in */}
      {currentUser && (
        <header className="w-full h-14 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black font-semibold text-xs">
              A
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              AuthPortal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-[#a3a3a3]">
              {currentUser.email}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#a3a3a3] hover:text-white transition-colors"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>
      )}

      {/* Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 animate-fade-in">
        {children}
      </main>

    </div>
  );
};
