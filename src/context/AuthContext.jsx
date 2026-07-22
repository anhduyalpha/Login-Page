import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  updateUserProfileData, 
  getCurrentAuthUser,
  auth
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('register'); // 'register', 'login', 'profile'
  const [toastNotification, setToastNotification] = useState(null);

  // Initialize Auth state
  useEffect(() => {
    // Check initial cached / demo user
    const initialUser = getCurrentAuthUser();
    if (initialUser) {
      setCurrentUser(initialUser);
      // Default view if already logged in is profile
      setCurrentView('profile');
    }

    let unsubscribe = () => {};
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(prev => ({
            ...prev,
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            emailVerified: user.emailVerified
          }));
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const showToast = (message, type = 'info') => {
    setToastNotification({ message, type, id: Date.now() });
  };

  const handleRegister = async (email, password) => {
    try {
      const res = await registerUser(email, password);
      setCurrentUser(res.user);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await loginUser(email, password);
      setCurrentUser(res.user);
      setCurrentView('profile');
      showToast('Đăng nhập thành công! Chào mừng bạn trở lại.', 'success');
      return res;
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setCurrentView('login');
      showToast('Đã đăng xuất khỏi tài khoản.', 'info');
    } catch (err) {
      showToast('Không thể đăng xuất. Vui lòng thử lại.', 'error');
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const res = await updateUserProfileData(profileData);
      setCurrentUser(res.user);
      showToast('Cập nhật thông tin cá nhân thành công!', 'success');
      return res;
    } catch (err) {
      showToast(err.message || 'Cập nhật thất bại. Vui lòng thử lại.', 'error');
      throw err;
    }
  };

  const navigateTo = (viewName) => {
    setCurrentView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthContext.Provider value={{
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
    }}>
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
