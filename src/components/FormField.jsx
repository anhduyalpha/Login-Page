import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const FormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  error,
  helperText,
  icon: IconComponent
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs font-medium text-[#a3a3a3]"
        >
          {label} {required && <span className="text-[#f5f5f5]">*</span>}
        </label>
      )}

      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
            <IconComponent className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`form-input w-full py-2.5 text-sm ${IconComponent ? 'pl-9' : 'pl-3.5'} ${isPasswordField ? 'pr-10' : 'pr-3.5'} min-h-[44px]`}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#f5f5f5] focus:outline-none focus:text-white rounded transition-colors"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-[#737373]">{helperText}</p>
      )}

      {error && (
        <p className="text-[11px] text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};
