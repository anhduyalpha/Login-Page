---
kind: configuration_system
name: Vite Environment Variables with Firebase Config Fallback
category: configuration_system
scope:
    - '**'
source_files:
    - src/services/firebase.js
    - vite.config.js
---

This project uses Vite's built-in environment variable system for runtime configuration. There is no dedicated config file or centralized configuration loader — instead, configuration is handled through a simple pattern:

Environment Variable Loading (Vite)
- Client-side env vars are accessed via import.meta.env.VITE_* prefix in browser code
- Only variables prefixed with VITE_ are exposed to the client bundle (Vite security model)
- Server/dev server config lives in vite.config.js (port 3000, plugins, Tailwind integration)

Firebase Configuration Pattern
The single source of truth for Firebase configuration is src/services/firebase.js:
- Reads VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, and VITE_FIREBASE_APP_ID from environment
- Uses hardcoded demo values as fallbacks when env vars are missing (enables local development without Firebase setup)
- Detects real vs demo mode by checking if API key exists and does not contain 'DemoKey'

Configuration Flow
1. Build time: Vite injects VITE_* env vars into the bundled JavaScript
2. Runtime: firebase.js reads these values and initializes Firebase Auth/Firestore
3. Fallback: If no real Firebase config is detected, all auth operations fall back to localStorage-based demo engine

No .env files present — the project relies on environment variables being provided at build/run time rather than committing .env files to version control.

Node.js scripts (in scripts/ and .agents/skills/) use standard process.env for their own configuration needs, separate from the frontend configuration system.