import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const AlertMessage = ({ type = 'error', message, id }) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isInfo = type === 'info';

  const styles = isSuccess
    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
    : isInfo
    ? 'bg-white/10 border-white/20 text-[#f5f5f5]'
    : 'bg-red-500/10 border-red-500/25 text-red-300';

  const IconComponent = isSuccess ? CheckCircle2 : isInfo ? Info : AlertCircle;

  return (
    <div 
      id={id}
      className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs leading-relaxed animate-fade-in ${styles}`}
      role="alert"
      aria-live="polite"
    >
      <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
};
