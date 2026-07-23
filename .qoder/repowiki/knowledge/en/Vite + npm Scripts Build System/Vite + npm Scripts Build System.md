---
kind: build_system
name: Vite + npm Scripts Build System
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.js
    - index.html
    - scripts/capture_screenshots.js
---

The project uses a minimal, npm-driven build system centered on Vite for a React single-page application. There is no Makefile, Dockerfile, or CI pipeline — all build and verification commands are declared in `package.json` scripts and executed via `npm run ...`.

**Build toolchain**
- **Vite 6** (`vite.config.js`) with the official React plugin (`@vitejs/plugin-react`) and Tailwind CSS v4 via `@tailwindcss/vite`. The dev server runs on port 3000 and does not auto-open the browser.
- **Tailwind CSS v4** configured through the Vite plugin; styles live in `src/styles/index.css` and are consumed by JSX components.
- **React 19** app entry at `index.html` → `/src/main.jsx`, bundled into static assets under `dist/` by `vite build`.

**NPM scripts (the only orchestration layer)**
- `npm run dev` — starts the Vite dev server with HMR.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serves the built `dist/` locally for smoke checks.
- `npm run capture-screenshots` — launches a headless Puppeteer browser against `http://localhost:3000`, navigates through 14 UI states (register/login/profile, desktop & mobile), and writes PNGs into `docs/screenshots/`. This script is the project's end-to-end / visual regression harness.

**Artifacts & output**
- Development artifacts: in-memory bundle served from the Vite dev server.
- Production artifacts: static files emitted to `dist/` by `vite build`; these are what `npm run preview` serves.
- Documentation screenshots: generated PNGs written to `docs/screenshots/` by the Puppeteer script.

**Conventions & constraints**
- All build/test logic lives in `package.json` scripts and Node scripts under `scripts/`; there is no external task runner (no Makefile, no shell wrappers).
- The E2E screenshot script assumes the dev server is already running on port 3000 and that Firebase credentials are available (or the local-storage demo fallback is active); it is intended to be run manually rather than as part of an automated CI step.
- No containerization, cross-compilation, or release tagging exists — versioning is a flat `1.0.0` in `package.json`.