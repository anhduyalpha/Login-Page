# Vercel Production Deployment Checklist — AuthPortal

This app uses **Firebase Authentication + Cloud Firestore** as the *only* auth
source. There is no demo/localStorage fallback: if configuration is missing or a
backend call fails, the app fails loudly instead of pretending to succeed.

Work through every box before shipping to production.

---

## 1. Firebase project setup (one-time)

- [ ] Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
- [ ] **Authentication → Sign-in method →** enable **Email/Password**.
- [ ] **Firestore Database →** create a database in **Production mode**.
- [ ] Copy the Web App SDK config (Project settings → General → *Your apps*).

## 2. Deploy Firestore security rules

The rules enforce strict per-user isolation (`users/{uid}` readable/writable
only by its owner). Deploy them to the **real** project:

```bash
firebase use <your-real-project-id>      # switch off the demo alias
firebase deploy --only firestore:rules
```

- [ ] Rules deployed. Confirm in Console → Firestore → Rules that
      `firestore.rules` from this repo is live.

## 3. Configure Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add all six for the
**Production** (and **Preview**) environments. Values come from step 1.

- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] *(optional)* `VITE_FIREBASE_MEASUREMENT_ID`
- [ ] **Do NOT** set `VITE_FIREBASE_USE_EMULATOR` in production (emulator flag only).

> The build embeds these at build time. If any required variable is missing the
> app throws a clear startup error (see `buildFirebaseConfig` in
> `src/services/firebase.js`).

## 4. Authorize the Vercel domain in Firebase

- [ ] Firebase Console → Authentication → Settings → **Authorized domains** →
      add your `*.vercel.app` domain (and any custom domain).

## 5. Local quality gates (run before every deploy)

```bash
npm ci                 # clean install from package-lock.json
npm run lint           # ESLint — must be clean
npm test               # Vitest unit tests — must pass
npm run verify:firebase # REAL Firebase Emulator e2e (Auth + Firestore)
npm run build          # production build — must succeed
```

- [ ] `npm ci` succeeds (lockfile matches `package.json`).
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run verify:firebase` prints **ALL CHECKS PASSED** (requires the
      Firebase CLI + Java; downloads the emulator jars on first run).
- [ ] `npm run build` succeeds.

## 6. Post-deploy production smoke test

- [ ] Open the deployed URL and register a **real** account.
- [ ] Confirm the exact **"Successfully"** confirmation appears.
- [ ] Firebase Console → Authentication → **Users**: the new user exists.
- [ ] Firebase Console → Firestore → **`users/{uid}`**: the document exists,
      contains the email, and has **no password field**.
- [ ] You are signed out and returned to Login after registration.
- [ ] Log in with the new credentials and confirm the profile loads.
- [ ] Open DevTools → Console/Network: no errors, no failed requests.

## 7. Security review

- [ ] No secrets committed (`.env`, keys, tokens). Only `.env.example` is tracked.
- [ ] `firestore.rules` denies cross-user access and all non-`users` paths.
- [ ] Rotate any Firebase Web API key that was ever exposed in a public commit.
      (Web API keys are not secrets, but tighten them via
      Google Cloud Console → APIs & Services → Credentials → API key restrictions.)

---

### Notes

- **Hosting:** This project deploys as a static Vite SPA. `vercel.json` sets the
  build/output and an SPA rewrite. Firebase Hosting is **not** used;
  `firebase.json` exists only for Firestore rules + the local emulator suite.
- **Emulator verification** (`scripts/verify_firebase_emulator.mjs`) exercises the
  real Firebase Web SDK against the Auth + Firestore emulators and fails on any
  console error or failed network request.
