---
kind: dependency_management
name: npm + lockfile-based dependency management
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - vite.config.js
---

This repository uses the standard npm ecosystem for a single-package React + Vite SPA. All third-party and development dependencies are declared in `package.json` and pinned by the committed `package-lock.json` (lockfileVersion 3). There is no vendoring, private registry configuration, or multi-workspace setup — every developer installs from the public npm registry with `npm install`.

Runtime dependencies (`dependencies`) are kept minimal: React 19, Firebase SDK, Framer Motion for animations, and Lucide icons. Build-time tooling lives under `devDependencies`: Vite 6 as the bundler/dev server, `@vitejs/plugin-react`, Tailwind CSS v4 via its new Vite plugin, Puppeteer for screenshot/smoke-test scripts, and TypeScript type packages for React. The project is marked `"type": "module"` so all source files use ESM imports; `vite.config.js` wires the React and Tailwind plugins and pins the dev server to port 3000.

No `.npmrc`, `.yarnrc`, `pnpm-workspace.yaml`, or `bun.lockb` exists, so there is no custom registry, no workspace monorepo layout, and no alternative package manager. Scripts in `package.json` expose `dev`, `build`, `preview`, and a `capture-screenshots` command that runs the Puppeteer script — this is the only build/test surface area. Because `package-lock.json` is committed, reproducible installs across machines are expected.