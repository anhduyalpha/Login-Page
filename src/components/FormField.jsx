import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
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
          className={`block text-xs font-medium transition-colors duration-200 ${
            isFocused ? 'text-[#f5f5f5]' : 'text-[#a3a3a3]'
          }`}
        >
          {label} {required && <span className="text-[#f5f5f5]">*</span>}
        </label>
      )}

      <div className={`form-input-container ${error ? 'animate-shake-once' : ''}`}>
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200">
            <IconComponent className={`w-4 h-4 ${isFocused ? 'text-white' : 'text-[#737373]'}`} />
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
          aria-describedby={error ? `${id}-error` : undefined}
          className={`form-input w-full py-2.5 text-sm ${IconComponent ? 'pl-9' : 'pl-3.5'} ${
            isPasswordField || isValid ? 'pr-10' : 'pr-3.5'
          } min-h-[44px] ${error ? 'border-red-400/50 focus:border-red-400' : ''}`}
        />

        {/* Valid Icon indicator with smooth transition */}
        <AnimatePresence>
          {isValid && !isPasswordField && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400 pointer-events-none"
            >
              <CheckCircle2 className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password visibility toggle with smooth icon crossfade */}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#f5f5f5] focus:outline-none focus:text-white rounded transition-colors cursor-pointer"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={showPassword ? 'hide' : 'show'}
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 10 }}
                transition={{ duration: 0.15 }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        )}
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-[#737373]">{helperText}</p>
      )}

      {/* Error message with icon, smooth reveal */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="text-[11px] text-red-400 font-medium pt-0.5 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
