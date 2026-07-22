import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthLayout } from './components/AuthLayout';
import { NotificationToast } from './components/NotificationToast';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const pageTransition = {
  duration: 0.32,
  ease: [0.16, 1, 0.3, 1],
};

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const MainContent = () => {
  const { currentView, loading } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion ? reducedVariants : pageVariants;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303] text-[#f5f5f5]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-4 p-8 glass-level-1 rounded-2xl max-w-xs text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black font-bold text-lg shadow-md">
            A
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#f5f5f5]">AuthPortal</h3>
            <p className="text-xs text-[#737373]">Đang khởi tạo hệ thống...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {currentView === 'register' && (
          <motion.div
            key="register"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full flex justify-center"
          >
            <RegisterPage />
          </motion.div>
        )}

        {currentView === 'login' && (
          <motion.div
            key="login"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full flex justify-center"
          >
            <LoginPage />
          </motion.div>
        )}

        {currentView === 'profile' && (
          <motion.div
            key="profile"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full flex justify-center"
          >
            <ProfilePage />
          </motion.div>
        )}
      </AnimatePresence>
      <NotificationToast />
    </AuthLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
