import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthCard } from '../components/AuthCard';
import { FormField } from '../components/FormField';
import { AlertMessage } from '../components/AlertMessage';
import { PrimaryButton } from '../components/PrimaryButton';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const { login, navigateTo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setSubmitting(true);
    try {
      await login(cleanEmail, password);
    } catch (err) {
      setErrorMessage(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Đăng nhập"
      subtitle="Nhập thông tin đăng nhập của bạn để truy cập tài khoản"
    >
      {/* Error Alert */}
      {errorMessage && (
        <AlertMessage id="login-error-banner" type="error" message={errorMessage} />
      )}

      {/* Login Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-4 text-left" noValidate>
        
        {/* Email Field */}
        <FormField
          id="login-email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          icon={Mail}
        />

        {/* Password Field */}
        <div className="space-y-1.5">
          <label 
            htmlFor="login-password" 
            className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wider font-sans"
          >
            Mật khẩu <span className="text-indigo-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748b]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="form-input w-full py-2.5 pl-9 pr-10 text-sm min-h-[44px]"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748b] hover:text-white"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Login Button */}
        <PrimaryButton
          id="btn-submit-login"
          type="submit"
          loading={submitting}
          className="mt-2"
        >
          Đăng nhập
        </PrimaryButton>
      </form>

      {/* Register Link */}
      <div className="pt-3 border-t border-[#1e293b] text-center text-xs text-[#94a3b8]">
        Chưa có tài khoản?{' '}
        <button
          id="link-go-to-register"
          type="button"
          onClick={() => navigateTo('register')}
          className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors"
        >
          Đăng ký ngay
        </button>
      </div>

    </AuthCard>
  );
};
