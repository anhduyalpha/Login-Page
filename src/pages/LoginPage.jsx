import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IdentitySphere } from '../components/IdentitySphere';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, HelpCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login, navigateTo, showToast } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMessage(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordDemo = (e) => {
    e.preventDefault();
    setShowForgotPasswordModal(false);
    showToast('Hướng dẫn khôi phục mật khẩu đã được gửi tới email của bạn.', 'success');
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      
      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-cyan-500/30 text-left space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-white">Khôi phục mật khẩu</h3>
                <p className="text-slate-400 text-xs">Nhập email đăng ký tài khoản AetherAuth</p>
              </div>
            </div>

            <input
              type="email"
              placeholder="Nhập địa chỉ email của bạn"
              defaultValue={email}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="btn-secondary flex-1 py-2.5 rounded-xl text-sm"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleResetPasswordDemo}
                className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-semibold"
              >
                Gửi liên kết
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Form Card */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="w-full max-w-xl mx-auto p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
            
            {/* Header Title & Subtitle */}
            <div className="text-center sm:text-left space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
                Chào mừng trở lại
              </h1>
              <p className="text-slate-400 text-sm">
                Vui lòng đăng nhập để tiếp tục
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div 
                id="login-error-banner"
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-in"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
              
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
                    id="login-email"
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
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                    Mật khẩu <span className="text-cyan-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-mono transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="glass-input w-full pl-11 pr-11 py-3 rounded-xl text-sm transition-all"
                    autoComplete="current-password"
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
              </div>

              {/* Checkbox: Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="remember-me" className="text-xs text-slate-300 select-none cursor-pointer">
                  Ghi nhớ phiên đăng nhập an toàn
                </label>
              </div>

              {/* Action Button: Đăng nhập */}
              <button
                id="btn-submit-login"
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3.5 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-2 mt-4 shadow-xl shadow-cyan-500/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Separator & Register Link */}
            <div className="pt-4 border-t border-white/10 text-center space-y-3">
              <div className="text-slate-400 text-sm">
                Chưa có tài khoản?{' '}
                <button
                  id="link-go-to-register"
                  type="button"
                  onClick={() => navigateTo('register')}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-all focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-md px-1"
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Interactive Identity Visual Panel */}
        <div className="lg:col-span-5 flex">
          <IdentitySphere mode="login" />
        </div>

      </div>
    </div>
  );
};
