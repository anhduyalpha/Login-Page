import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PasswordMeter } from '../components/PasswordMeter';
import { SuccessModal } from '../components/SuccessModal';
import { IdentitySphere } from '../components/IdentitySphere';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register, navigateTo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touchedPassword, setTouchedPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Validation rules
  const isPasswordValid = 
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isEmailValid) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Mật khẩu chưa đáp ứng đủ 4 yêu cầu bảo mật.');
      return;
    }

    if (!isConfirmValid) {
      setErrorMessage('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Show Success Modal when completed */}
      {showSuccessModal && (
        <SuccessModal onComplete={() => navigateTo('profile')} />
      )}

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Interactive Identity Visual Panel */}
        <div className="lg:col-span-5 order-2 lg:order-1 flex">
          <IdentitySphere mode="register" />
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
          <div className="w-full max-w-xl mx-auto p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
            
            {/* Header Title & Subtitle */}
            <div className="text-center sm:text-left space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
                Tạo tài khoản
              </h1>
              <p className="text-slate-400 text-sm">
                Tạo tài khoản mới để tiếp tục
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div 
                id="register-error-banner"
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-in"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-5" noValidate>
              
              {/* Field 1: Email */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                  Email <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email"
                    className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                  Mật khẩu <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!touchedPassword) setTouchedPassword(true);
                    }}
                    onFocus={() => setTouchedPassword(true)}
                    placeholder="Nhập mật khẩu"
                    className="glass-input w-full pl-11 pr-11 py-3 rounded-xl text-sm transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Live Requirement Validator */}
                <PasswordMeter 
                  password={password} 
                  confirmPassword={confirmPassword}
                  touched={touchedPassword} 
                />
              </div>

              {/* Field 3: Confirm Password */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                  Nhập lại mật khẩu <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="glass-input w-full pl-11 pr-11 py-3 rounded-xl text-sm transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? "Ẩn mật khẩu nhập lại" : "Hiện mật khẩu nhập lại"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Action Button: Đăng ký */}
              <button
                id="btn-submit-register"
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3.5 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-2 mt-4 shadow-xl shadow-cyan-500/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng ký</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Separator & Login Redirection Link */}
            <div className="pt-4 border-t border-white/10 text-center space-y-3">
              <div className="text-slate-400 text-sm">
                Đã có tài khoản?{' '}
                <button
                  id="link-go-to-login"
                  type="button"
                  onClick={() => navigateTo('login')}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-all focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-md px-1"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
