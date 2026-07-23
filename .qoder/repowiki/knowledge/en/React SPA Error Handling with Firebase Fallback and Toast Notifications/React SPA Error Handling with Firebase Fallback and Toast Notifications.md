---
kind: error_handling
name: React SPA Error Handling with Firebase Fallback and Toast Notifications
category: error_handling
scope:
    - '**'
source_files:
    - src/services/firebase.js
    - src/context/AuthContext.jsx
    - src/pages/LoginPage.jsx
    - src/components/AlertMessage.jsx
---

This repository implements a React + Vite authentication single-page application with a layered error handling strategy spanning service-layer translation, context-level propagation, and UI-level presentation.

Service layer — centralized error translation and fallback
- src/services/firebase.js defines translateFirebaseError, a switch-based mapper from Firebase Auth error codes (auth/email-already-in-use, auth/wrong-password, auth/invalid-credential, auth/user-not-found, auth/weak-password, auth/invalid-email, auth/network-request-failed, auth/too-many-requests) to localized Vietnamese user-facing messages. All auth operations (registerUser, loginUser) catch raw Firebase errors, rethrow them as plain Error objects whose .message is the translated string, and fall back to a local-storage demo engine when live Firebase is unavailable.
- The same file wraps every localStorage read/write in try/catch blocks that silently swallow failures (returning empty arrays or null), making the demo engine resilient to storage quota or corruption.
- Firestore setDoc/getDoc/updateDoc calls are wrapped in independent try/catch blocks that log warnings but do not break the flow, so profile persistence is best-effort.

Context layer — unified async action handlers
- src/context/AuthContext.jsx exposes register, login, logout, and updateProfile as async functions. Each handler:
  - Calls the corresponding service function.
  - On success, updates currentUser state and shows a toast via showToast(message, type).
  - On failure, catches the thrown Error, displays a toast of type 'error' with err.message, and rethrows so the page component can also react.
  - handleLogout swallows its own error and still clears state; it never rethrows.
- A global toastNotification state plus clearToast are provided through the context for transient notifications.

Page layer — per-form error banners
- src/pages/LoginPage.jsx (and analogous Register/Profile pages) maintain a local errorMessage state. After calling useAuth().login(), they catch the propagated error, set errorMessage to err.message or a fallback message, and render an AlertMessage type='error' banner above the form. Success transitions set an isSuccess flag used by the submit button's visual state.

UI components — typed alert and toast surfaces
- src/components/AlertMessage.jsx renders a styled, accessible alert (role="alert", aria-live="polite") with three types: success (emerald), info (neutral), error (red). It accepts an optional id prop for test selectors.
- src/components/NotificationToast.jsx (referenced by the context) provides the floating toast surface consumed by showToast.

Architecture and conventions
- Errors propagate upward as plain JavaScript Error objects with human-readable .message strings produced by translateFirebaseError; callers never inspect error.code directly.
- Service functions never display UI — they only throw or return data. UI rendering of errors lives exclusively in pages and the context's toast system.
- There is no custom error class hierarchy, sentinel values, or middleware; error handling is distributed across the three layers described above.
- No panic/recover equivalent exists (not applicable to JS); unhandled promise rejections are not globally caught at the app root.

Rules developers should follow
- Wrap all async Firebase/localStorage calls in try/catch; on known auth codes, rethrow new Error(translateFirebaseError(code)).
- Keep service functions free of UI side effects — let context/page layers decide whether to show a toast or a banner.
- Use AlertMessage with explicit type='error'/'success'/'info' for inline form feedback; use showToast for transient global notifications.
- When catching errors in context handlers, always call showToast(err.message, 'error') before rethrowing, so both toast and page banner receive consistent text.