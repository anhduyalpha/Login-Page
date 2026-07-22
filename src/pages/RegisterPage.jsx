import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PasswordMeter } from '../components/PasswordMeter';
import { SuccessModal } from '../components/SuccessModal';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register, navigateTo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    setSubmitting(true);
    try {
      await register(cleanEmail, password);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-12 px-4 flex items-center justify-center">
      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal onComplete={() => navigateTo('profile')} />
      )}

      {/* Centered Registration Card */}
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Tạo tài khoản
          </h1>
          <p className="text-slate-400 text-xs">
            Tạo tài khoản mới để tiếp tục
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div 
            id="register-error-banner"
            className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs animate-fade-in"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
          
          {/* Field 1: Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
              Email <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email"
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Field 2: Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
              Mật khẩu <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="glass-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <PasswordMeter password={password} confirmPassword={confirmPassword} />
          </div>

          {/* Field 3: Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
              Nhập lại mật khẩu <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="glass-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                aria-label={showConfirmPassword ? "Ẩn mật khẩu nhập lại" : "Hiện mật khẩu nhập lại"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Button: Đăng ký */}
          <button
            id="btn-submit-register"
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-4 shadow-lg shadow-cyan-500/25"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : (
              <>
                <span>Đăng ký</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Redirection Link */}
        <div className="pt-3 border-t border-white/10 text-center text-xs text-slate-400">
          Đã có tài khoản?{' '}
          <button
            id="link-go-to-login"
            type="button"
            onClick={() => navigateTo('login')}
            className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline"
          >
            Đăng nhập ngay
          </button>
        </div>

      </div>
    </div>
  );
};
