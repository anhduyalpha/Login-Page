import React from 'react';
import { Check, ShieldAlert } from 'lucide-react';

export const PasswordMeter = ({ password = '', confirmPassword = '' }) => {
  const checks = [
    { label: 'Ít nhất 6 ký tự', valid: password.length >= 6 },
    { label: 'Gồm chữ cái hoặc số', valid: /[a-zA-Z0-9]/.test(password) }
  ];

  const isMatch = confirmPassword.length > 0 && confirmPassword === password;
  const isMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <div className="mt-2 space-y-2 text-xs">
      <div className="flex items-center gap-3">
        {checks.map((item, index) => (
          <div key={index} className={`flex items-center gap-1.5 font-mono ${item.valid ? 'text-emerald-400' : 'text-slate-500'}`}>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${item.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
              {item.valid ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {confirmPassword.length > 0 && (
        <div className={`flex items-center gap-1.5 font-mono ${isMatch ? 'text-emerald-400' : 'text-red-400'}`}>
          {isMatch ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mật khẩu trùng khớp</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Mật khẩu nhập lại chưa khớp</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
