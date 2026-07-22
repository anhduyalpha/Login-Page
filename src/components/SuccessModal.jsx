import React, { useEffect } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const SuccessModal = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm p-6 sm:p-8 glass-level-2 text-center space-y-4 shadow-2xl relative overflow-hidden"
      >
        <div className="mx-auto w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Check className="w-6 h-6 stroke-[2.5]" />
          </motion.div>
        </div>

        {/* Exact required title string */}
        <h2 id="success-title" className="text-2xl font-bold text-[#f5f5f5] tracking-tight">
          Successfully
        </h2>

        <p className="text-xs text-[#a3a3a3] leading-relaxed">
          Tài khoản đã tạo thành công. Đang chuyển sang trang đăng nhập...
        </p>

        <button
          id="btn-go-to-profile"
          onClick={onComplete}
          className="btn-primary w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
        >
          <span>Đăng nhập ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Small Progress Line Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.15, ease: 'linear' }}
            className="h-full bg-white"
          />
        </div>
      </motion.div>
    </div>
  );
};
