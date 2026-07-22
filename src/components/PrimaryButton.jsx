import React from 'react';
import { Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PrimaryButton = ({ 
  children, 
  loading = false, 
  success = false,
  disabled = false, 
  id, 
  type = 'submit', 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading || success}
      onClick={onClick}
      className={`btn-primary w-full py-2.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {success ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1.5 text-emerald-700"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Thành công</span>
          </motion.div>
        ) : loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Đang xử lý...</span>
          </motion.div>
        ) : (
          <motion.div
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export const SecondaryButton = ({ 
  children, 
  disabled = false, 
  id, 
  type = 'button', 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn-secondary py-2 px-3.5 text-xs flex items-center justify-center gap-1.5 min-h-[38px] cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};
