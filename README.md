# AuthPortal - Monochrome Glass Authentication System

An authentic, production-ready, minimalist identity and authentication application built with **React 19**, **Vite**, **Tailwind CSS v4**, **Lucide Icons**, and **Firebase Authentication & Firestore**.

Designed under the final visual framework: **“Monochrome Glass — Quiet Professionalism”** derived from the `design-taste-frontend` skill guidelines.

---

## ✨ Design Direction: Monochrome Glass — Quiet Professionalism

- **Aesthetic**: Pure, disciplined black-and-white visual system. Deep near-black background (`#080808`), translucent glass surface cards (`rgba(255, 255, 255, 0.045)` with `backdrop-filter: blur(24px) saturate(120%)`), thin translucent borders (`rgba(255, 255, 255, 0.10)`), soft white text (`#f5f5f5`), and cool gray secondary text (`#a3a3a3`).
- **Material System**: Controlled glass properties with solid-color fallback (`#121212`) for systems with `prefers-reduced-transparency`. Glass is applied strictly to primary container surfaces, avoiding excessive blur on individual buttons or text inputs.
- **Button System**: Crisp white high-contrast primary CTA buttons (`#f5f5f5` background, `#050505` text) with subtle press scale feedback (`active:scale-[0.985]`).
- **Focus & Form Controls**: High-contrast white focus ring (`box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15)`), custom Chrome autofill override (`-webkit-autofill` background set to `#121212`), keyboard-accessible password toggle controls with `aria-label` attributes.
- **Focus**: Dedicated exclusively to three core pages (`/register`, `/login`, `/profile`). Zero marketing fluff, zero promotional security banners, zero fake metrics.
- **Exact Success State**: Modal confirmation displaying the exact required title string **`Successfully`**, automatic user `signOut`, and redirect to `/login`.

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

# Capture all 10 PNG screenshots into docs/screenshots/
node scripts/capture_screenshots.js
```

---

## 📷 Screenshot Gallery

All 10 required PNG screenshots are stored in `docs/screenshots/`:

| Screen ID | Filename | Description |
|---|---|---|
| `register-desktop` | [register-desktop.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-desktop.png) | Centered monochrome glass register card on 1440px desktop |
| `register-mobile` | [register-mobile.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-mobile.png) | Responsive mobile register view (375px) |
| `register-validation` | [register-validation.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-validation.png) | Compact password criteria & inline error validation |
| `register-success` | [register-success.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-success.png) | Glass confirmation modal with exact text `Successfully` |
| `login-desktop` | [login-desktop.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-desktop.png) | Returning user monochrome login view |
| `login-mobile` | [login-mobile.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-mobile.png) | Mobile viewport login layout |
| `login-error` | [login-error.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-error.png) | Friendly inline error alert banner |
| `profile-desktop` | [profile-desktop.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-desktop.png) | Personal information dashboard (View Mode) |
| `profile-mobile` | [profile-mobile.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-mobile.png) | Profile layout on mobile viewport |
| `profile-edit` | [profile-edit.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-edit.png) | Profile editing mode with Save/Cancel action bar |

---

## 🛠️ Quality Gates Verification Summary

| Metric | Result | Notes |
|---|---|---|
| `npm run build` | **PASS** | 1619 modules transformed in 9.07s with 0 errors |
| Strict Firebase Test | **PASS** | 12/12 steps verified with automated Puppeteer script |
| Accessibility (WCAG AA) | **PASS** | Accessible contrast, focus rings, single-line CTAs |
| Mobile Viewport (320px–375px) | **PASS** | Zero horizontal scroll, touch targets &ge; 44px |
