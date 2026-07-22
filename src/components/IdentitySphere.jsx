import React from 'react';
import { Shield, Lock, Cpu, Key, Fingerprint, Zap } from 'lucide-react';

export const IdentitySphere = ({ mode = 'register' }) => {
  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-[620px] rounded-3xl glass-panel p-8 sm:p-12 flex flex-col justify-between overflow-hidden border border-white/10 shadow-2xl">
      {/* Animated Light Blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-mono text-cyan-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Aether Security Node v2.4</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-xs font-mono text-slate-400">ONLINE</span>
        </div>
      </div>

      {/* Center Interactive Visual Graphic */}
      <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center text-center">
        {/* Orbital Ring Graphic */}
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center mb-8">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed animate-spin" style={{ animationDuration: '30s' }}></div>
          {/* Inner Ring */}
          <div className="absolute inset-4 rounded-full border-2 border-gradient-to-r from-violet-500 to-cyan-500 opacity-40 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
          
          {/* Floating Badges */}
          <div className="absolute -top-2 left-6 p-2 rounded-xl bg-surface border border-cyan-500/30 shadow-lg text-cyan-400 animate-float">
            <Shield className="w-5 h-5" />
          </div>
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 p-2 rounded-xl bg-surface border border-violet-500/30 shadow-lg text-violet-400 animate-float" style={{ animationDelay: '1.5s' }}>
            <Fingerprint className="w-5 h-5" />
          </div>
          <div className="absolute -bottom-2 left-10 p-2 rounded-xl bg-surface border border-emerald-500/30 shadow-lg text-emerald-400 animate-float" style={{ animationDelay: '3s' }}>
            <Key className="w-5 h-5" />
          </div>

          {/* Central Core Emblem */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 p-[2px] shadow-2xl shadow-cyan-500/40">
            <div className="w-full h-full bg-[#0b0f17] rounded-[14px] flex items-center justify-center">
              {mode === 'register' ? (
                <Lock className="w-10 h-10 text-cyan-400" />
              ) : (
                <Zap className="w-10 h-10 text-violet-400" />
              )}
            </div>
          </div>
        </div>

        {/* Narrative Text */}
        <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight mb-3">
          {mode === 'register' ? 'Khởi tạo Định danh An toàn' : 'Trải nghiệm Bán cổng Bảo mật'}
        </h3>
        <p className="text-sm text-slate-300 max-w-md leading-relaxed">
          {mode === 'register' 
            ? 'Bảo vệ dữ liệu cá nhân của bạn với hệ thống mã hóa đa tầng SSL/TLS 256-bit và kiến trúc bảo mật chuẩn doanh nghiệp.'
            : 'Đăng nhập vào không gian quản trị tài khoản được cá nhân hóa cao cấp với tốc độ phản hồi tính bằng ms.'}
        </p>
      </div>

      {/* Bottom Feature Micro-Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-white/10 text-left">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-cyan-400 text-xs font-mono mb-1 font-bold">256-BIT</div>
          <div className="text-[11px] text-slate-400">Mã hóa dữ liệu</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-violet-400 text-xs font-mono mb-1 font-bold">ZERO-TRUST</div>
          <div className="text-[11px] text-slate-400">Xác thực 0 tin tưởng</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-emerald-400 text-xs font-mono mb-1 font-bold">99.99%</div>
          <div className="text-[11px] text-slate-400">Khả dụng hệ thống</div>
        </div>
      </div>
    </div>
  );
};
