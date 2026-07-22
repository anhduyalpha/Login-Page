import React, { useEffect } from 'react';
import { Check, ArrowRight } from 'lucide-react';

export const SuccessModal = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      <div className="w-full max-w-sm p-6 sm:p-8 monochrome-glass text-center space-y-4 shadow-2xl">
        <div className="mx-auto w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
          <Check className="w-6 h-6 stroke-[2.5]" />
        </div>

        {/* Exact required title string */}
        <h2 id="success-title" className="text-2xl font-bold text-[#f5f5f5] tracking-tight">
          Successfully
        </h2>

        <p className="text-xs text-[#a3a3a3] leading-relaxed">
          Tài khoản của bạn đã được khởi tạo thành công. Đang chuyển sang trang đăng nhập...
        </p>

        <button
          id="btn-go-to-profile"
          onClick={onComplete}
          className="btn-primary w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
        >
          <span>Chuyển tới Đăng nhập</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
