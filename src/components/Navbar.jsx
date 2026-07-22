import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, currentView, navigateTo, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-obsidian/80 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Identity Logo */}
        <button 
          onClick={() => navigateTo(currentUser ? 'profile' : 'register')}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl p-1"
          aria-label="AetherAuth Homepage"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Aether<span className="text-cyan-400">Auth</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">
              Identity Portal
            </span>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface/50 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
          <button 
            onClick={() => navigateTo(currentUser ? 'profile' : 'register')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentView === 'register' || (currentView === 'profile' && currentUser)
                ? 'bg-white/10 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Trang chủ
          </button>
          <button 
            onClick={() => navigateTo('login')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentView === 'login'
                ? 'bg-white/10 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Dịch vụ
          </button>
          <a 
            href="#support" 
            onClick={(e) => { e.preventDefault(); alert("AetherAuth Security Operations Center — Hỗ trợ 24/7 khả dụng."); }}
            className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            Hỗ trợ
          </a>
        </nav>

        {/* Right User State / Action */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Xác thực SSL</span>
              </div>

              <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Đăng xuất tài khoản"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {currentView === 'login' ? (
                <button
                  onClick={() => navigateTo('register')}
                  className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/25"
                >
                  <User className="w-4 h-4" />
                  <span>Đăng ký ngay</span>
                </button>
              ) : (
                <button
                  onClick={() => navigateTo('login')}
                  className="btn-secondary px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border-white/15 hover:border-cyan-500/40"
                >
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
