import React from 'react';
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export const PasswordMeter = ({ password = '', confirmPassword = '', touched = false }) => {
  // Validate criteria
  const checks = [
    { label: 'Ít nhất 8 ký tự', valid: password.length >= 8 },
    { label: 'Ít nhất 1 chữ cái viết hoa (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'Ít nhất 1 chữ cái viết thường (a-z)', valid: /[a-z]/.test(password) },
    { label: 'Ít nhất 1 ký tự đặc biệt (!@#$%^&*)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
  ];

  const validCount = checks.filter(c => c.valid).length;
  const strengthPercent = (validCount / 4) * 100;

  // Determine meter color & label
  let strengthColor = 'bg-slate-700';
  let strengthLabel = 'Chưa nhập';
  if (password.length > 0) {
    if (validCount <= 1) {
      strengthColor = 'bg-red-500';
      strengthLabel = 'Yếu';
    } else if (validCount <= 3) {
      strengthColor = 'bg-amber-500';
      strengthLabel = 'Trung bình';
    } else {
      strengthColor = 'bg-emerald-500';
      strengthLabel = 'Mạnh & An toàn';
    }
  }

  const isMatch = confirmPassword.length > 0 && confirmPassword === password;
  const showMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <div className="mt-3 p-4 rounded-xl bg-surface/60 border border-white/10 backdrop-blur-md space-y-3">
      {/* Strength Gauge Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Độ mạnh mật khẩu:
          </span>
          <span className={`font-semibold ${
            validCount === 4 ? 'text-emerald-400' : validCount >= 2 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {strengthLabel}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${strengthPercent}%` }}
            role="progressbar"
            aria-valuenow={strengthPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        {checks.map((item, index) => {
          const statusClass = item.valid
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : touched && password.length > 0
            ? 'text-slate-400 bg-white/5 border-white/10'
            : 'text-slate-500 bg-white/5 border-white/5';

          return (
            <div 
              key={index}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 ${statusClass}`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                item.valid ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
              }`}>
                {item.valid ? <Check className="w-3 h-3 stroke-[3]" /> : '•'}
              </div>
              <span className="leading-tight">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Confirm Password Match Indicator */}
      {confirmPassword.length > 0 && (
        <div className={`flex items-center gap-2 text-xs p-2.5 rounded-lg border font-mono transition-all duration-200 ${
          isMatch 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {isMatch ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Mật khẩu khớp hoàn toàn</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
              <span>Mật khẩu nhập lại chưa khớp!</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
