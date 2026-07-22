import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast = () => {
  const { toastNotification, clearToast } = useAuth();

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        clearToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification, clearToast]);

  if (!toastNotification) return null;

  const { message, type } = toastNotification;

  let bgClass = 'bg-surface border-cyan-500/30 text-cyan-200';
  let icon = <Info className="w-5 h-5 text-cyan-400" />;

  if (type === 'success') {
    bgClass = 'bg-surface border-emerald-500/30 text-emerald-200';
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  } else if (type === 'error') {
    bgClass = 'bg-surface border-red-500/30 text-red-200';
    icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${bgClass}`}>
        <div className="shrink-0">{icon}</div>
        <p className="text-sm font-medium leading-snug flex-1">{message}</p>
        <button
          onClick={clearToast}
          className="shrink-0 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
