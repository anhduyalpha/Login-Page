import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '../docs/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function capture() {
  console.log('Starting bulletproof screenshot capture pipeline...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const baseUrl = 'http://localhost:3000';

  const setViewportDesktop = async () => {
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  };

  const setViewportMobile = async () => {
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  };

  try {
    // 1. Register Desktop
    await setViewportDesktop();
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#register-email', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, 'register-desktop.png') });
    console.log('Captured register-desktop.png');

    // 2. Register Mobile
    await setViewportMobile();
    await page.screenshot({ path: path.join(screenshotsDir, 'register-mobile.png') });
    console.log('Captured register-mobile.png');

    // 3. Register Validation State
    await setViewportDesktop();
    await page.type('#register-email', 'invalid-email');
    await page.type('#register-password', '123');
    await page.type('#register-confirm-password', '1234');
    await page.click('#btn-submit-register');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'register-validation.png') });
    console.log('Captured register-validation.png');

    // 4. Register Success & Profile Navigation
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#register-email');
    const uniqueEmail = `user_${Date.now()}@aetherauth.com`;
    await page.type('#register-email', uniqueEmail);
    await page.type('#register-password', 'AetherAuth2026');
    await page.type('#register-confirm-password', 'AetherAuth2026');
    await page.click('#btn-submit-register');
    
    await page.waitForSelector('#btn-edit-profile', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, 'register-success.png') });
    console.log('Captured register-success.png');

    // 8. Profile Desktop
    await setViewportDesktop();
    await page.screenshot({ path: path.join(screenshotsDir, 'profile-desktop.png') });
    console.log('Captured profile-desktop.png');

    // 9. Profile Mobile
    await setViewportMobile();
    await page.screenshot({ path: path.join(screenshotsDir, 'profile-mobile.png') });
    console.log('Captured profile-mobile.png');

    // 10. Profile Edit Mode
    await setViewportDesktop();
    await page.click('#btn-edit-profile');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, 'profile-edit.png') });
    console.log('Captured profile-edit.png');

    // Clear session to test Login
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#link-go-to-login');
    await page.click('#link-go-to-login');
    await page.waitForSelector('#login-email', { timeout: 5000 });

    // 5. Login Desktop
    await setViewportDesktop();
    await page.screenshot({ path: path.join(screenshotsDir, 'login-desktop.png') });
    console.log('Captured login-desktop.png');

    // 6. Login Mobile
    await setViewportMobile();
    await page.screenshot({ path: path.join(screenshotsDir, 'login-mobile.png') });
    console.log('Captured login-mobile.png');

    // 7. Login Error State
    await setViewportDesktop();
    await page.type('#login-email', 'nonexistent@aetherauth.com');
    await page.type('#login-password', 'wrongpass');
    await page.click('#btn-submit-login');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(screenshotsDir, 'login-error.png') });
    console.log('Captured login-error.png');

    console.log('🎉 ALL 10 SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (error) {
    console.error('Screenshot generation error:', error);
  } finally {
    await browser.close();
  }
}

capture();
