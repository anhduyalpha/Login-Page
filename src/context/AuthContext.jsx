import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfileData,
  fetchUserProfile,
  auth
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('register'); // 'register' | 'login' | 'profile'
  const [toastNotification, setToastNotification] = useState(null);

  // Suppress transient auth events while registerUser creates the account and
  // then signs it out again. registerUser owns that lifecycle.
  const registrationInProgressRef = useRef(false);
  // Auto-navigate to profile only on the very first restored session.
  const initializedRef = useRef(false);

  const showToast = (message, type = 'info') => {
    setToastNotification({ message, type, id: Date.now() });
  };

  // Firebase Auth is the single source of truth for the session.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // During registration, ignore the transient signed-in state.
      if (registrationInProgressRef.current) {
        if (!user) setCurrentUser(null);
        setLoading(false);
        initializedRef.current = true;
        return;
      }

      if (user) {
        // Load users/{uid} ONLY after Firebase Auth confirms the user.
        try {
          const profile = await fetchUserProfile(user.uid);
          setCurrentUser({
            ...profile,
            photoURL: profile.photoURL || user.photoURL || '',
            email: user.email,
            emailVerified: user.emailVerified
          });
          if (!initializedRef.current) {
            setCurrentView('profile');
          }
        } catch (err) {
          // Never swallow a profile-load failure: fail closed.
          console.error('[Auth] Failed to load user profile:', err);
          setCurrentUser(null);
          showToast(err.message || 'Không thể tải hồ sơ người dùng.', 'error');
          try {
            await logoutUser();
          } catch (signOutErr) {
            console.error('[Auth] Sign-out after profile failure also failed:', signOutErr);
          }
          setCurrentView('login');
        }
      } else {
        // A null Firebase user ALWAYS clears the local session.
        setCurrentUser(null);
      }

      setLoading(false);
      initializedRef.current = true;
    });

    return () => unsubscribe();
  }, []);

  const handleRegister = async (email, password) => {
    registrationInProgressRef.current = true;
    try {
      // Resolves only after BOTH Auth and Firestore succeed; then signs out.
      return await registerUser(email, password);
    } finally {
      registrationInProgressRef.current = false;
    }
  };

  const handleLogin = async (email, password) => {
    // Errors (auth + Firestore) propagate to the caller — no fallback.
    const res = await loginUser(email, password);
    setCurrentUser(res.user);
    setCurrentView('profile');
    showToast('Đăng nhập thành công! Chào mừng bạn trở lại.', 'success');
    return res;
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentView('login');
      showToast('Đã đăng xuất khỏi tài khoản.', 'info');
      // currentUser is cleared by onAuthStateChanged(null).
    } catch (err) {
      console.error('[Auth] Logout failed:', err);
      showToast('Không thể đăng xuất. Vui lòng thử lại.', 'error');
    }
  };

  const handleUpdateProfile = async (profileData, avatarOptions = {}) => {
    try {
      const res = await updateUserProfileData(profileData, avatarOptions);
      setCurrentUser((prev) => ({ ...prev, ...res.user }));
      showToast(
        avatarOptions.avatarFile
          ? 'Ảnh đại diện và thông tin cá nhân đã được cập nhật!'
          : 'Cập nhật thông tin cá nhân thành công!',
        'success'
      );
      return res;
    } catch (err) {
      console.error('[Auth] Profile update failed:', err);
      showToast(err.message || 'Cập nhật thất bại. Vui lòng thử lại.', 'error');
      throw err;
    }
  };

  const navigateTo = (viewName) => {
    setCurrentView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        currentView,
        navigateTo,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
        updateProfile: handleUpdateProfile,
        toastNotification,
        showToast,
        clearToast: () => setToastNotification(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
