import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const SuccessModal = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      <div className="w-full max-w-sm p-6 auth-card text-center space-y-4 shadow-2xl border border-emerald-500/30">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        {/* Exact required title string */}
        <h2 id="success-title" className="text-2xl font-bold text-white tracking-tight">
          Successfully
        </h2>

        <p className="text-xs text-[#94a3b8] leading-relaxed">
          Tài khoản đã được khởi tạo thành công. Đang chuyển tới trang đăng nhập...
        </p>

        <button
          id="btn-go-to-profile"
          onClick={onComplete}
          className="btn-primary w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[40px]"
        >
          <span>Đăng nhập ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
