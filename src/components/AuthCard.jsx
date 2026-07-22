import React, { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export const AuthCard = ({ title, subtitle, brandMark = true, children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef(null);

  // Subtle optical hover response (max ~0.8deg rotation, ~3px translation)
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const translateX = useMotionValue(0);
  const translateY = useMotionValue(0);

  const springConfig = { stiffness: 120, damping: 22, mass: 0.8 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);
  const smoothTranslateX = useSpring(translateX, springConfig);
  const smoothTranslateY = useSpring(translateY, springConfig);

  const handlePointerMove = useCallback((e) => {
    if (shouldReduceMotion) return;
    // Only on fine pointer (desktop)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Max rotation ~0.8 degrees
    rotateX.set(-y * 0.8);
    rotateY.set(x * 0.8);
    // Max translation ~3px
    translateX.set(x * 3);
    translateY.set(y * 2);
  }, [shouldReduceMotion, rotateX, rotateY, translateX, translateY]);

  const handlePointerLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    translateX.set(0);
    translateY.set(0);
  }, [rotateX, rotateY, translateX, translateY]);

  return (
    <div className="w-full max-w-[460px] mx-auto flex flex-col items-center space-y-4">
      
      {/* Top subtle visual anchor label */}
      <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-[#737373] selection:none">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
        <span>Secure Identity Platform</span>
      </div>

      {/* Main Glass Level 1 Card with optical hover */}
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={shouldReduceMotion ? {} : {
          rotateX: smoothRotateX,
          rotateY: smoothRotateY,
          x: smoothTranslateX,
          y: smoothTranslateY,
          transformPerspective: 1200,
        }}
        className={`w-full p-6 sm:p-8 glass-level-1 space-y-6 ${className}`}
      >
        {brandMark && (
          <div className="flex justify-center mb-1">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-black font-bold text-base shadow-sm">
              A
            </div>
          </div>
        )}
        {(title || subtitle) && (
          <div className="text-center space-y-1.5">
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#a3a3a3]">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
};
