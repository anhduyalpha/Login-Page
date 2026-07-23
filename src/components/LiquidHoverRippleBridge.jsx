import { useEffect } from 'react';

const HOVER_RIPPLE_INTERVAL_MS = 95;
const MIN_POINTER_TRAVEL_PX = 10;
const INTERACTIVE_SELECTOR =
  '.glass-level-1, input, button, a, textarea, select, form, [data-liquid-ignore]';

/**
 * Reuses the existing LiquidGlassBackground pointerdown ripple pipeline without
 * changing its shader, render loop, noise, caustics, refraction, or click logic.
 */
export const LiquidHoverRippleBridge = () => {
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!finePointer || reducedMotion) return undefined;

    let lastRippleAt = 0;
    let lastRippleX = Number.NaN;
    let lastRippleY = Number.NaN;

    const handlePointerMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;

      const target = event.target;
      if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) return;

      const now = performance.now();
      const elapsed = now - lastRippleAt;
      const distance = Number.isNaN(lastRippleX)
        ? Number.POSITIVE_INFINITY
        : Math.hypot(event.clientX - lastRippleX, event.clientY - lastRippleY);

      if (elapsed < HOVER_RIPPLE_INTERVAL_MS || distance < MIN_POINTER_TRAVEL_PX) return;

      lastRippleAt = now;
      lastRippleX = event.clientX;
      lastRippleY = event.clientY;

      // LiquidGlassBackground already listens for pointerdown globally and
      // converts it into the established six-slot WebGL ripple array. Reusing
      // that path keeps the restored water shader visually identical at rest.
      window.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: event.clientX,
          clientY: event.clientY,
          pointerId: event.pointerId,
          pointerType: 'mouse',
          isPrimary: true,
          bubbles: false,
          cancelable: false,
        }),
      );
    };

    const handlePointerLeave = () => {
      lastRippleX = Number.NaN;
      lastRippleY = Number.NaN;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return null;
};
