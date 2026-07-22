import React from 'react';

export const AuthCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`w-full max-w-[440px] mx-auto p-6 sm:p-8 auth-card space-y-6 animate-fade-in ${className}`}>
      {(title || subtitle) && (
        <div className="text-center space-y-1.5">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#94a3b8]">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
