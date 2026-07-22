import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SuccessModal = ({ onComplete }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981']
      });
    } catch (e) {}

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-xl animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      <div className="relative w-full max-w-md p-8 rounded-3xl glass-panel border border-cyan-500/30 text-center shadow-2xl shadow-cyan-500/20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-[2px] shadow-lg shadow-cyan-500/30 mb-6">
          <div className="w-full h-full bg-[#0b0f17] rounded-[14px] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
          </div>
        </div>

        {/* Mandatory Exact Text Requirement */}
        <h2 id="success-title" className="relative z-10 text-3xl font-extrabold font-heading text-white tracking-tight mb-2">
          Successfully
        </h2>

        <p className="relative z-10 text-slate-300 text-sm mb-6 leading-relaxed">
          Tài khoản AetherAuth của bạn đã được khởi tạo thành công trên hệ thống bảo mật.
        </p>

        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-6">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Tài khoản sẵn sàng hoạt động</span>
        </div>

        <div className="relative z-10 space-y-3">
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            ></div>
          </div>

          <button
            id="btn-go-to-profile"
            onClick={onComplete}
            className="btn-primary w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30"
          >
            <span>Tới trang hồ sơ cá nhân ngay ({countdown}s)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
