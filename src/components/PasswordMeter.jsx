import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const PasswordMeter = ({ password = '', confirmPassword = '' }) => {
  const rules = [
    { label: 'Ít nhất 8 ký tự', valid: password.length >= 8 },
    { label: '1 chữ hoa (A-Z)', valid: /[A-Z]/.test(password) },
    { label: '1 chữ thường (a-z)', valid: /[a-z]/.test(password) },
    { label: '1 ký tự đặc biệt (!@#$...)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
  ];

  const isMatch = confirmPassword.length > 0 && confirmPassword === password;

  return (
    <div className="mt-2.5 space-y-2 text-xs">
      <div className="grid grid-cols-2 gap-2 pt-1">
        {rules.map((rule, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-1.5 text-[11px]"
          >
            <motion.div 
              animate={{ 
                backgroundColor: rule.valid ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: rule.valid ? '#34d399' : '#737373'
              }}
              transition={{ duration: 0.18 }}
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0"
            >
              {rule.valid ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
            </motion.div>
            <motion.span
              animate={{ color: rule.valid ? '#34d399' : '#737373' }}
              transition={{ duration: 0.18 }}
            >
              {rule.label}
            </motion.span>
          </div>
        ))}
      </div>

      {confirmPassword.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-1.5 text-[11px] pt-1 ${
            isMatch ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {isMatch ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mật khẩu trùng khớp</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              <span>Mật khẩu nhập lại chưa khớp</span>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};
