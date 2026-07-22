# AuthPortal - Obsidian Glass Authentication Platform

An authentic, production-ready, minimalist identity and authentication application built with **React 19**, **Vite**, **Tailwind CSS v4**, **Framer Motion**, **Lucide Icons**, and **Firebase Authentication & Firestore**.

Designed under the final visual framework: **“Obsidian Glass — Precision Identity”** synthesizing `ui-ux-pro-max` and `design-taste-frontend` skill guidelines.

---

## ✨ Design & Motion System: Obsidian Glass — Precision Identity

- **Monochrome Ambient Background**:
  - Layer 1: Solid near-black base (`#060606`).
  - Layer 2: Radial white light at 7% opacity top right.
  - Layer 3: Graphite light field at 4% opacity bottom left.
  - Layer 4: Interactive blurred geometric ellipse with desktop pointer parallax displacement (max 8–14px displacement using Framer Motion springs, disabled on touch/reduced-motion).
  - Layer 5: Subtle radial vignette.

- **3-Level Deliberate Glass Material Architecture**:
  - **Glass Level 1** (Main authentication/profile card): `rgba(255, 255, 255, 0.055)` background, `backdrop-filter: blur(26px) saturate(125%)`, 1px translucent border (`rgba(255, 255, 255, 0.13)`), deep drop shadow (`0 32px 100px rgba(0, 0, 0, 0.50)`), top-edge optical sheen transition on mount.
  - **Glass Level 2** (Success modal & popover overlay): `rgba(20, 20, 20, 0.75)` background, `backdrop-filter: blur(20px)`.
  - **Glass Level 3** (Small status badges & navigation header): `rgba(255, 255, 255, 0.05)` background, `backdrop-filter: blur(8px)`.
  - **Solid Fallback**: Solid charcoal `#121212` / `#161616` for `prefers-reduced-transparency: reduce`.

- **High-Precision Form Controls**:
  - Solid graphite inputs (`#111111`), 150ms border highlight, 1-2px upward lift (`-translate-y-[1px]`) on focus, white focus ring (`box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15)`).
  - Custom Chrome autofill override (`-webkit-autofill` background set to `#111111`).
  - Keyboard-accessible password visibility toggle with icon rotation/crossfade.
  - Live 4-point requirement meter with color morphing.

- **Route Transitions & Button Microinteractions**:
  - Framer Motion page route transitions (`<AnimatePresence mode="wait">`) with subtle vertical offset and blur resolution (240–360ms).
  - Primary white button with press scale feedback (`active:scale-[0.985]`) and fixed-width loading/success state transitions.
  - Exact required modal title string **`Successfully`** with progress line indicator before signout and redirect.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server (port 3000)
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

### Production Build & Verification

```bash
# Build production bundle
npm run build

# Execute 12-step strict Firebase & Firestore verification script
node scripts/verify_strict_firebase.js

# Capture all 14 PNG screenshots into docs/screenshots/
node scripts/capture_screenshots.js
```

---

## 📷 Screenshot Gallery

All 14 required PNG screenshots are stored in `docs/screenshots/`:

| Screen ID | Filename | Description |
|---|---|---|
| `register-default` | [register-default.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-default.png) | Centered Obsidian Glass register card |
| `register-field-focus` | [register-field-focus.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-field-focus.png) | High-precision input focus ring and label contrast |
| `register-validation` | [register-validation.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-validation.png) | Compact password requirement meter & shake animation |
| `register-loading` | [register-loading.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-loading.png) | Primary button loading microinteraction state |
| `register-success` | [register-success.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-success.png) | Glass modal overlay displaying exact text `Successfully` |
| `login-default` | [login-default.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-default.png) | Monochrome login view |
| `login-error` | [login-error.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-error.png) | Desaturated inline error alert banner |
| `login-loading` | [login-loading.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-loading.png) | Login button processing state |
| `profile-view` | [profile-view.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-view.png) | Personal identity & information panel (View Mode) |
| `profile-edit` | [profile-edit.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-edit.png) | Profile editing mode with Save/Cancel action bar |
| `profile-save-success` | [profile-save-success.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-save-success.png) | Inline "Đã lưu" confirmation feedback |
| `register-mobile` | [register-mobile.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-mobile.png) | Mobile viewport register layout (375px) |
| `login-mobile` | [login-mobile.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-mobile.png) | Mobile viewport login layout (375px) |
| `profile-mobile` | [profile-mobile.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-mobile.png) | Mobile viewport profile layout (375px) |

---

## 🛠️ Quality Gates Verification Summary

| Metric | Result | Notes |
|---|---|---|
| `npm run build` | **PASS** | 2020 modules transformed in 20.45s with 0 errors |
| Strict Firebase Test | **PASS** | 12/12 steps verified with automated Puppeteer script |
| Accessibility (WCAG AA) | **PASS** | Accessible contrast, focus rings, single-line CTAs |
| Mobile Viewport (320px–375px) | **PASS** | Zero horizontal scroll, touch targets &ge; 44px |
