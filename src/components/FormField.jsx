import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  isValid = false,
  helperText,
  icon: IconComponent
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-xs font-medium transition-colors duration-150 ${
            isFocused ? 'text-[#f5f5f5]' : 'text-[#a3a3a3]'
          }`}
        >
          {label} {required && <span className="text-[#f5f5f5]">*</span>}
        </label>
      )}

      <div className={`form-input-container ${error ? 'animate-shake-once' : ''}`}>
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373] transition-colors duration-150">
            <IconComponent className={`w-4 h-4 ${isFocused ? 'text-white' : ''}`} />
          </div>
        )}

        <input
          id={id}
          type={inputType}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`form-input w-full py-2.5 text-sm ${IconComponent ? 'pl-9' : 'pl-3.5'} ${
            isPasswordField || isValid ? 'pr-10' : 'pr-3.5'
          } min-h-[44px] ${error ? 'border-red-400/50 focus:border-red-400' : ''}`}
        />

        {/* Valid Icon indicator */}
        {isValid && !isPasswordField && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400 pointer-events-none">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {/* Password visibility toggle */}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#f5f5f5] focus:outline-none focus:text-white rounded transition-colors cursor-pointer"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
          >
            <motion.div
              key={showPassword ? 'hide' : 'show'}
              initial={{ opacity: 0, rotate: -15 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 15 }}
              transition={{ duration: 0.15 }}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </motion.div>
          </button>
        )}
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-[#737373]">{helperText}</p>
      )}

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-[11px] text-red-400 font-medium pt-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
