---
kind: logging_system
name: No Centralized Logging System
category: logging_system
scope:
    - '**'
---

This repository does not implement a centralized logging system. The React + Vite frontend (src/) and Node.js utility scripts (.agents/skills/*, scripts/) use only the built-in `console.*` API (`console.log`, `console.warn`, `console.error`) with no dedicated logger framework, no structured log fields, no log-level management, and no log routing or sinks. There is no logging configuration file, no shared logger module, and no dependency on third-party logging libraries in `package.json`. Occasional `console.warn` calls appear in `src/services/firebase.js` for Firebase fallback diagnostics, but these are ad-hoc and unstructured. For a project of this scope, the absence of a logging system is expected; if one were to be added, it would likely be introduced as a small shared module under `src/` (e.g., `src/utils/logger.js`) wrapping `console` with level filtering.