---
kind: frontend_style
name: Obsidian Glass Design System — Tailwind + CSS Variables + WebGL Background
category: frontend_style
scope:
    - '**'
source_files:
    - src/styles/index.css
    - vite.config.js
    - package.json
    - src/components/LiquidGlassBackground.jsx
    - src/components/AuthCard.jsx
    - src/components/PrimaryButton.jsx
---

The AetherAuth portal implements a cohesive obsidian glass aesthetic built on three layers: a Tailwind v4 utility layer, a small set of hand-authored CSS classes for glass and interaction states, and a full-screen WebGL shader background. The system is intentionally minimal with no external UI component library, so visual consistency is enforced through shared CSS variables, reusable glass-level classes, and a handful of React components that compose them.

### What system/approach is used
- Styling stack: Tailwind CSS v4 via @tailwindcss/vite plugin, imported in src/styles/index.css with @import "tailwindcss". No separate tailwind.config.js; configuration lives inline or via the Vite plugin.
- CSS methodology: A hybrid approach — utility-first Tailwind for layout/spacing/typography, plus a small custom stylesheet (src/styles/index.css) that defines semantic class names for glass surfaces, form controls, buttons, and animations.
- Design tokens: Centralized as CSS custom properties under :root in index.css (e.g. --bg-page, --border-subtle, --text-primary, --btn-primary-bg). These are consumed by both Tailwind utilities and custom classes.
- Animation/motion: Framer Motion drives micro-interactions inside React components; CSS @keyframes handle one-off effects (sheen sweep, focus highlight, shake). A full-screen WebGL canvas renders an animated liquid-glass background with pointer-reactive displacement and click ripples.
- Accessibility & reduced motion: prefers-reduced-motion and prefers-reduced-transparency media queries disable animations and swap translucent backgrounds for solid fallbacks. Components use useReducedMotion() to skip Framer Motion transforms on constrained devices.

### Key files and packages
- src/styles/index.css — global CSS variables, glass-level classes (glass-level-1/2/3), form input styles, button primitives (btn-primary, btn-secondary, btn-glass), focus-sweep animation, reduced-motion/transparency overrides.
- vite.config.js — registers @tailwindcss/vite plugin; no extra CSS build pipeline.
- package.json — declares tailwindcss ^4.3.3, @tailwindcss/vite ^4.3.3, framer-motion ^12.42.2, lucide-react ^0.475.0 as styling-related dependencies.
- src/components/LiquidGlassBackground.jsx — self-contained WebGL shader component (vertex + fragment shaders embedded) producing the dark, subtly lit, noise-driven background with pointer velocity displacement and ripple effects; switches to a static shader when prefers-reduced-motion is active.
- src/components/AuthCard.jsx — composes glass-level-1 with Framer Motion optical hover (subtle rotateX/Y + translate) respecting reduced motion and fine-pointer detection.
- src/components/PrimaryButton.jsx — exports PrimaryButton and SecondaryButton that apply btn-primary / btn-secondary classes and animate state transitions (loading spinner, success checkmark) via AnimatePresence.

### Architecture and conventions
- Token-first: All colors, borders, and text shades flow from :root CSS variables; new UI elements should consume these rather than hard-coding hex values.
- Glass hierarchy: Three surface tiers exist:
  - glass-level-1 — main card/modal surface (highest blur, strongest shadow).
  - glass-level-2 — overlays/toasts (slightly more opaque).
  - glass-level-3 — small badges/status chips (minimal blur).
  Each tier can be made interactive by appending .glass-interactive, which adds hover border/shadow transitions.
- Button primitives: Use btn-primary, btn-secondary, or btn-glass classes directly or via the PrimaryButton/SecondaryButton React wrappers. Disabled states are handled uniformly via opacity + cursor.
- Form inputs: Wrap inputs in .form-input-container and style inputs with .form-input to get consistent focus-within lift, top-edge sheen sweep, and Chrome autofill fixes.
- Motion policy: All user-facing animations respect prefers-reduced-motion. On coarse pointers or mobile, the WebGL background disables pointer interaction and uses fewer FBM octaves.
- No design-system package: There is no exported token file or theme provider; tokens live purely in CSS. If you need to extend the palette, add new --var entries in :root and reference them via Tailwind's arbitrary value syntax (e.g. bg-[var(--bg-page)]) or by extending Tailwind's config if it becomes necessary.

### Rules developers should follow
1. Never hard-code colors — pick from --bg-*, --text-*, --border-*, --btn-* variables in :root.
2. Use the glass tiers — choose glass-level-1/2/3 based on z-depth; add .glass-interactive only when hover feedback is needed.
3. Prefer the button primitives — wrap actions in PrimaryButton / SecondaryButton so loading/success/disabled states stay consistent.
4. Wrap inputs in .form-input-container and give inputs the .form-input class to inherit focus/hover/autofill behavior.
5. Respect reduced motion — do not add new animations without checking prefers-reduced-motion; prefer CSS transitions over JS where possible.
6. Keep Tailwind usage utility-first — only reach into index.css for glass surfaces, button primitives, and form control patterns already defined there.
7. Do not modify the WebGL background unless you also update the static fallback shader and the reduced-motion path; the component auto-switches based on user preference.