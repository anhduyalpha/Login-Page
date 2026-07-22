import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthCard } from '../components/AuthCard';
import { FormField } from '../components/FormField';
import { PasswordMeter } from '../components/PasswordMeter';
import { SuccessModal } from '../components/SuccessModal';
import { AlertMessage } from '../components/AlertMessage';
import { PrimaryButton } from '../components/PrimaryButton';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const RegisterPage = () => {
  const { register, logout, navigateTo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Compact rules verification
  const isPasswordValid = 
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Mật khẩu cần đáp ứng đủ 4 yêu cầu bảo mật bên dưới.');
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

  const handleModalComplete = async () => {
    try {
      await logout();
    } catch (e) {}
    navigateTo('login');
  };

  return (
    <AuthCard
      title="Tạo tài khoản"
      subtitle="Nhập thông tin cá nhân của bạn để tạo tài khoản mới"
    >
      {/* Success Modal displaying exact title "Successfully" */}
      {showSuccessModal && (
        <SuccessModal onComplete={handleModalComplete} />
      )}

      {/* Error Alert Message */}
      {errorMessage && (
        <AlertMessage id="register-error-banner" type="error" message={errorMessage} />
      )}

      {/* Registration Form */}
      <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left" noValidate>
        
        {/* Email Field */}
        <FormField
          id="register-email"
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
            htmlFor="register-password" 
            className="block text-xs font-medium text-[#a3a3a3]"
          >
            Mật khẩu <span className="text-[#f5f5f5]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="form-input w-full py-2.5 pl-9 pr-10 text-sm min-h-[44px]"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#f5f5f5] focus:outline-none rounded transition-colors"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <PasswordMeter password={password} confirmPassword={confirmPassword} />
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label 
            htmlFor="register-confirm-password" 
            className="block text-xs font-medium text-[#a3a3a3]"
          >
            Nhập lại mật khẩu <span className="text-[#f5f5f5]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="form-input w-full py-2.5 pl-9 pr-10 text-sm min-h-[44px]"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#f5f5f5] focus:outline-none rounded transition-colors"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Register Button */}
        <PrimaryButton
          id="btn-submit-register"
          type="submit"
          loading={submitting}
          className="mt-2"
        >
          Tạo tài khoản
        </PrimaryButton>
      </form>

      {/* Redirection Link */}
      <div className="pt-3 border-t border-white/10 text-center text-xs text-[#a3a3a3]">
        Đã có tài khoản?{' '}
        <button
          id="link-go-to-login"
          type="button"
          onClick={() => navigateTo('login')}
          className="text-white font-semibold hover:underline underline-offset-4 transition-colors cursor-pointer"
        >
          Đăng nhập
        </button>
      </div>

    </AuthCard>
  );
};
