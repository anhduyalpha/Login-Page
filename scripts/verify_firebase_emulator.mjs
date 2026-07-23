/**
 * REAL Firebase verification against the Firebase Emulator Suite.
 *
 * This script proves the production auth flow works against a genuine Firebase
 * backend (Auth + Firestore emulators, real Firebase Web SDK) — NOT localStorage.
 *
 * It is intended to be launched via the Firebase CLI so the emulators are live:
 *
 *   firebase emulators:exec --project demo-authportal \
 *     "node scripts/verify_firebase_emulator.mjs"
 *
 * (npm run verify:firebase wraps this.)
 *
 * What it verifies end-to-end in a real browser (Puppeteer):
 *   1. Registration succeeds only after BOTH Auth + Firestore writes complete.
 *   2. A REAL Firebase Auth user exists (queried via the Auth emulator REST API).
 *   3. A REAL Firestore users/{uid} document exists (queried via Firestore REST).
 *   4. The profile document contains NO password field.
 *   5. The exact "Successfully" confirmation is shown.
 *   6. The user is signed out and returned to Login after registration.
 *   7. The new credentials can log in and reach the profile screen.
 *   8. NO console errors and NO failed network requests occurred.
 *
 * Any failure exits with a non-zero status.
 */
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import puppeteer from 'puppeteer';

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-authportal';
const APP_PORT = 3100;
const APP_URL = `http://localhost:${APP_PORT}`;
const AUTH_EMU = process.env.FIREBASE_AUTH_EMULATOR_HOST
  ? `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`
  : 'http://127.0.0.1:9099';
const FS_EMU = process.env.FIRESTORE_EMULATOR_HOST
  ? `http://${process.env.FIRESTORE_EMULATOR_HOST}`
  : 'http://127.0.0.1:8080';

const fail = (msg) => {
  console.error(`\n✖ VERIFICATION FAILED: ${msg}`);
  process.exitCode = 1;
};

// Dummy client config — the emulator ignores the real values but the SDK
// requires non-empty strings. No real credentials are used anywhere.
const viteEnv = {
  ...process.env,
  VITE_FIREBASE_USE_EMULATOR: 'true',
  VITE_FIREBASE_AUTH_EMULATOR_URL: AUTH_EMU,
  VITE_FIREBASE_FIRESTORE_EMULATOR_HOST: new URL(FS_EMU).hostname,
  VITE_FIREBASE_FIRESTORE_EMULATOR_PORT: new URL(FS_EMU).port || '8080',
  VITE_FIREBASE_API_KEY: 'demo-emulator-key',
  VITE_FIREBASE_AUTH_DOMAIN: `${PROJECT_ID}.firebaseapp.com`,
  VITE_FIREBASE_PROJECT_ID: PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: `${PROJECT_ID}.appspot.com`,
  VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
  VITE_FIREBASE_APP_ID: '1:000000000000:web:demoauthportalemulator'
};

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      /* not ready yet */
    }
    await delay(500);
  }
  throw new Error(`Dev server at ${url} did not become ready in ${timeoutMs}ms`);
}

async function getAuthUserByEmail(email) {
  // The Auth emulator does not allow GET /accounts (405). Use the Identity
  // Toolkit admin query endpoint (POST) with the emulator's owner bearer.
  const res = await fetch(
    `${AUTH_EMU}/identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:query`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer owner',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }
  );
  if (!res.ok) throw new Error(`Auth emulator query failed: HTTP ${res.status}`);
  const data = await res.json();
  return (data.userInfo || []).find((u) => u.email === email.toLowerCase());
}

async function getFirestoreUserDoc(uid) {
  // 'Bearer owner' makes the Firestore emulator treat this as an admin request
  // that bypasses security rules — appropriate for out-of-band verification.
  // (A rules-enforced anonymous read correctly returns 403, proving isolation.)
  const res = await fetch(
    `${FS_EMU}/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`,
    { headers: { Authorization: 'Bearer owner' } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore emulator query failed: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  console.log('=== REAL FIREBASE EMULATOR VERIFICATION ===');
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Auth emulator:      ${AUTH_EMU}`);
  console.log(`Firestore emulator: ${FS_EMU}\n`);

  // Sanity: emulators must be reachable.
  await fetch(`${AUTH_EMU}/`).catch(() => {
    throw new Error(`Auth emulator not reachable at ${AUTH_EMU}. Run via 'firebase emulators:exec'.`);
  });

  const vite = spawn('npx', ['vite', '--port', String(APP_PORT), '--strictPort'], {
    env: viteEnv,
    shell: process.platform === 'win32',
    stdio: 'inherit'
  });

  const browserRef = { browser: null };
  const cleanup = async () => {
    if (browserRef.browser) await browserRef.browser.close().catch(() => {});
    // Kill the whole Vite process tree. On Windows a shell-spawned child is not
    // reliably terminated by SIGTERM, so use taskkill /T to reap descendants.
    if (vite.pid) {
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', String(vite.pid), '/T', '/F']);
      } else if (!vite.killed) {
        vite.kill('SIGTERM');
      }
    }
  };

  try {
    await waitForServer(APP_URL);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    browserRef.browser = browser;
    const page = await browser.newPage();

    // Strict failure collectors.
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.toString()));
    page.on('requestfailed', (req) => {
      const errorText = req.failure()?.errorText || '';
      const url = req.url();
      // The Firestore Web SDK uses long-lived WebChannel streams (Listen/Write).
      // These are ABORTED by the browser on navigation / sign-out teardown,
      // which is expected behaviour and NOT an application failure.
      const isFirestoreStreamAbort =
        errorText === 'net::ERR_ABORTED' && url.includes('/google.firestore.v1.Firestore/');
      if (isFirestoreStreamAbort) return;
      failedRequests.push(`${req.method()} ${url} — ${errorText}`);
    });
    page.on('response', (res) => {
      const url = res.url();
      // Ignore Vite HMR/dev noise; flag genuine app/API failures.
      if (res.status() >= 400 && !url.includes('/@vite') && !url.includes('/node_modules/')) {
        failedRequests.push(`HTTP ${res.status()} ${url}`);
      }
    });

    const testEmail = `verify_${Date.now()}@authportal.test`;
    const testPassword = 'SecurePass2026!';
    console.log(`Test account: ${testEmail}`);

    // ── Registration ────────────────────────────────────────────────────────
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#register-email');
    await page.type('#register-email', testEmail);
    await page.type('#register-password', testPassword);
    await page.type('#register-confirm-password', testPassword);
    await page.click('#btn-submit-register');

    await page.waitForSelector('#success-title', { timeout: 15000 });
    const successText = await page.$eval('#success-title', (el) => el.textContent.trim());
    if (successText !== 'Successfully') {
      fail(`Expected "Successfully", got "${successText}"`);
      return;
    }
    console.log('✔ "Successfully" shown after registration.');

    // ── Verify REAL Firebase Auth user ───────────────────────────────────────
    const authUser = await getAuthUserByEmail(testEmail);
    if (!authUser || !authUser.localId) {
      fail('No real Firebase Auth user found in the Auth emulator.');
      return;
    }
    const uid = authUser.localId;
    console.log(`✔ Real Firebase Auth user exists (uid: ${uid}).`);

    // ── Verify REAL Firestore users/{uid} document ───────────────────────────
    const docResp = await getFirestoreUserDoc(uid);
    if (!docResp || !docResp.fields) {
      fail(`No real Firestore document at users/${uid}.`);
      return;
    }
    if (docResp.fields.password !== undefined) {
      fail('Profile document unexpectedly contains a password field.');
      return;
    }
    const docEmail = docResp.fields.email?.stringValue;
    if (docEmail !== testEmail.toLowerCase()) {
      fail(`Firestore doc email mismatch: ${docEmail}`);
      return;
    }
    console.log(`✔ Real Firestore users/${uid} document exists (email matches, no password).`);

    // ── Sign-out + redirect to login ─────────────────────────────────────────
    await page.click('#btn-go-to-profile').catch(() => {});
    await page.waitForSelector('#login-email', { timeout: 15000 });
    console.log('✔ Signed out and redirected to Login after registration.');

    // ── Login with the new credentials ───────────────────────────────────────
    await page.type('#login-email', testEmail);
    await page.type('#login-password', testPassword);
    await page.click('#btn-submit-login');
    await page.waitForSelector('#btn-edit-profile', { timeout: 15000 });
    console.log('✔ Logged in with new credentials and reached the profile screen.');

    // ── Strict error gate ────────────────────────────────────────────────────
    await delay(500);
    if (consoleErrors.length > 0) {
      fail(`Console errors detected:\n  - ${consoleErrors.join('\n  - ')}`);
      return;
    }
    if (failedRequests.length > 0) {
      fail(`Failed network requests detected:\n  - ${failedRequests.join('\n  - ')}`);
      return;
    }

    console.log('\n✅ ALL CHECKS PASSED against the real Firebase Emulator Suite.');
  } catch (err) {
    fail(err.message || String(err));
  } finally {
    await cleanup();
  }
}

main().then(() => {
  // Force a clean exit so `firebase emulators:exec` does not wait on any
  // lingering child handles.
  process.exit(process.exitCode || 0);
});