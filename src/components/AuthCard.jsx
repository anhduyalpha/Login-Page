import React from 'react';

export const AuthCard = ({ title, subtitle, brandMark = true, children, className = '' }) => {
  return (
    <div className={`w-full max-w-[440px] mx-auto p-6 sm:p-8 monochrome-glass space-y-6 animate-fade-in ${className}`}>
      {brandMark && (
        <div className="flex justify-center mb-1">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold text-sm shadow-sm">
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
    </div>
  );
};
