import React from 'react';
import { Check } from 'lucide-react';

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
            className={`flex items-center gap-1.5 text-[11px] ${
              rule.valid ? 'text-emerald-400 font-medium' : 'text-[#737373]'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
              rule.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-[#737373]'
            }`}>
              {rule.valid ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
            </div>
            <span>{rule.label}</span>
          </div>
        ))}
      </div>

      {confirmPassword.length > 0 && (
        <div className={`flex items-center gap-1.5 text-[11px] pt-1 ${
          isMatch ? 'text-emerald-400' : 'text-red-400'
        }`}>
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
        </div>
      )}
    </div>
  );
};
