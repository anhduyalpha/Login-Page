import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { LiquidGlassBackground } from './LiquidGlassBackground';

export const AuthLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#030303] text-[#f5f5f5] selection:bg-white/20 selection:text-white relative overflow-hidden font-sans">
      
      {/* Interactive Liquid Glass WebGL Background */}
      <LiquidGlassBackground />

      {/* CSS Fallback background layers (visible if WebGL fails) */}
      <div className="fixed inset-0 pointer-events-none z-0 -z-10">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Minimal Header only when logged in */}
      {currentUser && (
        <header className="w-full h-14 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between relative z-20 glass-level-3">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black font-bold text-xs shadow-sm">
              A
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#f5f5f5]">
              AuthPortal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-[#a3a3a3]">
              {currentUser.email}
            </span>
            <button
              onClick={logout}
              className="btn-glass flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#a3a3a3] hover:text-white cursor-pointer"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>
      )}

      {/* Centered Content Viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        {children}
      </main>

    </div>
  );
};
