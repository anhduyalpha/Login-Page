import React from 'react';
import { Loader2 } from 'lucide-react';

export const PrimaryButton = ({ 
  children, 
  loading = false, 
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
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn-primary w-full py-2.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        children
      )}
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
