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
  console.log('Starting Obsidian Glass 14-state screenshot capture pipeline...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const baseUrl = 'http://localhost:3000';
  const testEmail = `obsidian_${Date.now()}@authportal.com`;
  const testPassword = `ObsidianPass2026!`;

  try {
    // 1. register-default
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#register-email');
      await page.screenshot({ path: path.join(screenshotsDir, 'register-default.png') });
      console.log('Captured register-default.png');
      await page.close();
    }

    // 2. register-field-focus
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#register-email');
      await page.focus('#register-email');
      await page.type('#register-email', 'focus@authportal.com');
      await new Promise(r => setTimeout(r, 200));
      await page.screenshot({ path: path.join(screenshotsDir, 'register-field-focus.png') });
      console.log('Captured register-field-focus.png');
      await page.close();
    }

    // 3. register-validation
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#register-email');
      await page.type('#register-email', 'invalid-email');
      await page.type('#register-password', '123');
      await page.type('#register-confirm-password', '123');
      await page.click('#btn-submit-register');
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(screenshotsDir, 'register-validation.png') });
      console.log('Captured register-validation.png');
      await page.close();
    }

    // 4. register-loading
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#register-email');
      await page.type('#register-email', 'loading_test@authportal.com');
      await page.type('#register-password', testPassword);
      await page.type('#register-confirm-password', testPassword);
      await page.click('#btn-submit-register');
      await new Promise(r => setTimeout(r, 100));
      await page.screenshot({ path: path.join(screenshotsDir, 'register-loading.png') });
      console.log('Captured register-loading.png');
      await page.close();
    }

    // 5. register-success
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#register-email');
      await page.type('#register-email', testEmail);
      await page.type('#register-password', testPassword);
      await page.type('#register-confirm-password', testPassword);
      await page.click('#btn-submit-register');
      await page.waitForSelector('#success-title', { timeout: 5000 });
      await page.screenshot({ path: path.join(screenshotsDir, 'register-success.png') });
      console.log('Captured register-success.png');
      await page.close();
    }

    // 6. login-default
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#link-go-to-login');
      await page.click('#link-go-to-login');
      await page.waitForSelector('#login-email');
      await page.screenshot({ path: path.join(screenshotsDir, 'login-default.png') });
      console.log('Captured login-default.png');
      await page.close();
    }

    // 7. login-error
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#link-go-to-login');
      await page.click('#link-go-to-login');
      await page.waitForSelector('#login-email');
      await page.type('#login-email', 'nonexistent@authportal.com');
      await page.type('#login-password', 'wrongpass');
      await page.click('#btn-submit-login');
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: path.join(screenshotsDir, 'login-error.png') });
      console.log('Captured login-error.png');
      await page.close();
    }

    // 8. login-loading
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#link-go-to-login');
      await page.click('#link-go-to-login');
      await page.waitForSelector('#login-email');
      await page.type('#login-email', 'someone@authportal.com');
      await page.type('#login-password', 'somepass');
      await page.click('#btn-submit-login');
      await new Promise(r => setTimeout(r, 80));
      await page.screenshot({ path: path.join(screenshotsDir, 'login-loading.png') });
      console.log('Captured login-loading.png');
      await page.close();
    }

    // 9, 10, 11. profile-view, profile-edit, profile-save-success
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      
      // Register
      await page.waitForSelector('#register-email');
      await page.type('#register-email', testEmail);
      await page.type('#register-password', testPassword);
      await page.type('#register-confirm-password', testPassword);
      await page.click('#btn-submit-register');
      await page.waitForSelector('#btn-go-to-profile', { timeout: 5000 });
      await page.click('#btn-go-to-profile');

      // Login
      await page.waitForSelector('#login-email', { timeout: 5000 });
      await page.type('#login-email', testEmail);
      await page.type('#login-password', testPassword);
      await page.click('#btn-submit-login');
      await page.waitForSelector('#btn-edit-profile', { timeout: 5000 });

      // Profile View
      await page.screenshot({ path: path.join(screenshotsDir, 'profile-view.png') });
      await page.screenshot({ path: path.join(screenshotsDir, 'profile-desktop.png') });
      console.log('Captured profile-view.png & profile-desktop.png');

      // Profile Edit
      await page.click('#btn-edit-profile');
      await new Promise(r => setTimeout(r, 300));
      await page.screenshot({ path: path.join(screenshotsDir, 'profile-edit.png') });
      console.log('Captured profile-edit.png');

      // Profile Save Success
      await page.type('#input-first-name', ' Updated');
      await page.click('#btn-submit-save-profile');
      await new Promise(r => setTimeout(r, 200));
      await page.screenshot({ path: path.join(screenshotsDir, 'profile-save-success.png') });
      console.log('Captured profile-save-success.png');
      await page.close();
    }

    // 12. register-mobile
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#register-email');
      await page.screenshot({ path: path.join(screenshotsDir, 'register-mobile.png') });
      console.log('Captured register-mobile.png');
      await page.close();
    }

    // 13. login-mobile
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#link-go-to-login');
      await page.click('#link-go-to-login');
      await page.waitForSelector('#login-email');
      await page.screenshot({ path: path.join(screenshotsDir, 'login-mobile.png') });
      console.log('Captured login-mobile.png');
      await page.close();
    }

    // 14. profile-mobile
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });

      await page.waitForSelector('#register-email');
      await page.type('#register-email', testEmail);
      await page.type('#register-password', testPassword);
      await page.type('#register-confirm-password', testPassword);
      await page.click('#btn-submit-register');
      await page.waitForSelector('#btn-go-to-profile', { timeout: 5000 });
      await page.click('#btn-go-to-profile');

      await page.waitForSelector('#login-email', { timeout: 5000 });
      await page.type('#login-email', testEmail);
      await page.type('#login-password', testPassword);
      await page.click('#btn-submit-login');
      await page.waitForSelector('#btn-edit-profile', { timeout: 5000 });

      await page.screenshot({ path: path.join(screenshotsDir, 'profile-mobile.png') });
      console.log('Captured profile-mobile.png');
      await page.close();
    }

    console.log('🎉 ALL 14 OBSIDIAN GLASS SCREENSHOT STATES CAPTURED SUCCESSFULLY!');
  } catch (error) {
    console.error('Screenshot generation error:', error);
  } finally {
    await browser.close();
  }
}

capture();
