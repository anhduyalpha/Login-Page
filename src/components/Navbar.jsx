import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, navigateTo, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-obsidian/80 border-b border-white/10 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Identity Logo */}
        <button 
          onClick={() => navigateTo(currentUser ? 'profile' : 'register')}
          className="flex items-center gap-3 group focus:outline-none rounded-xl p-1"
          aria-label="AetherAuth Homepage"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Aether<span className="text-cyan-400">Auth</span>
            </span>
          </div>
        </button>

        {/* Right User State / Action */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã xác thực</span>
              </div>

              <button 
                onClick={logout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-medium transition-all"
                aria-label="Đăng xuất tài khoản"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
