import React from 'react';
import { motion } from 'framer-motion';

export const AuthCard = ({ title, subtitle, brandMark = true, children, className = '' }) => {
  return (
    <div className="w-full max-w-[460px] mx-auto flex flex-col items-center space-y-4">
      
      {/* Top subtle visual anchor label */}
      <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-[#737373] selection:none">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
        <span>Secure Identity Platform</span>
      </div>

      {/* Main Glass Level 1 Card */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full p-6 sm:p-8 glass-level-1 space-y-6 ${className}`}
      >
        {brandMark && (
          <div className="flex justify-center mb-1">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-black font-bold text-base shadow-sm">
              A
            </div>
          </div>
        )}
        {(title || subtitle) && (
          <div className="text-center space-y-1.5">
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#a3a3a3]">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
};
