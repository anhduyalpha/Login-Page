import React from 'react';
import { Shield, Lock, Globe, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-obsidian/90 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-xs sm:text-sm">
        
        {/* Left copyright and brand note */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <p>© 2026 WebDev Studios — AetherAuth Systems. Tất cả quyền được bảo lưu.</p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Firebase Engine Active</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-cyan-400 transition-colors">
            Điều khoản
          </a>
          <span className="text-white/10">•</span>
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-cyan-400 transition-colors">
            Bảo mật
          </a>
          <span className="text-white/10">•</span>
          <a href="#contact" onClick={(e) => e.preventDefault()} className="hover:text-cyan-400 transition-colors">
            Liên hệ
          </a>
        </div>
      </div>
    </footer>
  );
};
