# AuthPortal - Refined Minimalist Authentication System

An authentic, production-ready, minimalist identity and authentication application built with **React 19**, **Vite**, **Tailwind CSS v4**, **Lucide Icons**, and **Firebase Authentication & Firestore**.

Designed under the **"Quiet Precision"** visual framework derived from the `design-taste-frontend` skill guidelines.

---

## ✨ Design Principles & Architecture

- **Aesthetic**: Deep charcoal palette (`#090d16` background, `#0f172a` surface cards), high-contrast typography, restrained indigo accent (`#6366f1`), 1px subtle borders (`#1e293b`).
- **Focus**: Dedicated exclusively to three core pages (`/register`, `/login`, `/profile`). Zero marketing fluff, zero promotional security banners, zero fake metrics.
- **Form Engineering**: Accessible form controls, single-line desktop CTAs, scannable 4-point password criteria checklist (8+ chars, uppercase, lowercase, special char).
- **Exact Success State**: Modal confirmation displaying the exact required title string **`Successfully`**, automatic user `signOut`, and redirect to `/login`.
- **Firestore Integration**: User profiles are stored at `users/{uid}` without storing passwords. On login, profile data is loaded directly from Firestore.

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

### Production Build & Preview

```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

### Automated Verification & Screenshot Capture

```bash
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
| `register-desktop` | [register-desktop.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-desktop.png) | Centered register card on 1440px desktop |
| `register-mobile` | [register-mobile.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-mobile.png) | Responsive mobile register view (375px) |
| `register-validation` | [register-validation.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-validation.png) | Scannable password criteria & error validation |
| `register-success` | [register-success.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/register-success.png) | Confirmation modal with exact text `Successfully` |
| `login-desktop` | [login-desktop.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-desktop.png) | Returning user login view |
| `login-mobile` | [login-mobile.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-mobile.png) | Mobile viewport login layout |
| `login-error` | [login-error.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/login-error.png) | Friendly inline error alert banner |
| `profile-desktop` | [profile-desktop.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-desktop.png) | Personal information dashboard (View Mode) |
| `profile-mobile` | [profile-mobile.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-mobile.png) | Profile layout on mobile viewport |
| `profile-edit` | [profile-edit.png](file:///c:/Users/Duy/Code/Project/Webdevs/Login-Page/docs/screenshots/profile-edit.png) | Profile editing mode with Save/Cancel action bar |

---

## 🛠️ Quality Gates Verification Summary

| Metric | Result | Notes |
|---|---|---|
| `npm run build` | **PASS** | 1619 modules transformed in 9.95s with 0 errors |
| Strict Firebase Test | **PASS** | 12/12 steps verified with automated Puppeteer script |
| Accessibility (WCAG AA) | **PASS** | Accessible contrast, focus rings, single-line CTAs |
| Mobile Viewport (320px–375px) | **PASS** | Zero horizontal scroll, touch targets &ge; 44px |
