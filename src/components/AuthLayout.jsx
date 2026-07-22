import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { LogOut } from 'lucide-react';

export const AuthLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  // Desktop Pointer Parallax Displacement (max 8-14px)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 60, damping: 25 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    // Only enable on desktop pointer devices
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY, shouldReduceMotion]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#060606] text-[#f5f5f5] selection:bg-white/20 selection:text-white relative overflow-hidden font-sans">
      
      {/* BACKGROUND LAYER 1 & 5: Dark Base & Subtle Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Layer 2: Radial White Light top right */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        
        {/* Layer 3: Soft Graphite Light Field bottom left */}
        <div className="absolute -bottom-40 -left-40 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)] blur-3xl pointer-events-none" />

        {/* Layer 4: Parallax Geometric Ellipse Surface */}
        <motion.div 
          style={shouldReduceMotion ? {} : { x: parallaxX, y: parallaxY }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-[100%] bg-gradient-to-tr from-white/[0.04] to-transparent blur-[80px] pointer-events-none"
        />

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      </div>

      {/* Minimal Header only when logged in */}
      {currentUser && (
        <header className="w-full h-14 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between relative z-20 glass-level-3">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black font-bold text-xs shadow-sm">
              A
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#f5f5f5]">
              AuthPortal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-[#a3a3a3]">
              {currentUser.email}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#a3a3a3] hover:text-white transition-colors cursor-pointer"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>
      )}

      {/* Centered Content Viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        {children}
      </main>

    </div>
  );
};
