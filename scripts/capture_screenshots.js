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
  console.log('Starting bulletproof minimalist screenshot capture pipeline...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const baseUrl = 'http://localhost:3000';
  const testEmail = `user_${Date.now()}@authportal.com`;
  const testPassword = `AuthPass2026!`;

  try {
    // 1. Register Desktop
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#register-email');
      await page.screenshot({ path: path.join(screenshotsDir, 'register-desktop.png') });
      console.log('Captured register-desktop.png');
      await page.close();
    }

    // 2. Register Mobile
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

    // 3. Register Validation
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

    // 4. Register Success Modal ("Successfully")
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

    // 5. Login Desktop
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForSelector('#link-go-to-login');
      await page.click('#link-go-to-login');
      await page.waitForSelector('#login-email');
      await page.screenshot({ path: path.join(screenshotsDir, 'login-desktop.png') });
      console.log('Captured login-desktop.png');
      await page.close();
    }

    // 6. Login Mobile
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

    // 7. Login Error
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

    // 8. Profile Desktop, Mobile, and Edit Mode
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });

      // First register user if not already in store
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
      await page.screenshot({ path: path.join(screenshotsDir, 'profile-desktop.png') });
      console.log('Captured profile-desktop.png');

      await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
      await page.screenshot({ path: path.join(screenshotsDir, 'profile-mobile.png') });
      console.log('Captured profile-mobile.png');

      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.click('#btn-edit-profile');
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(screenshotsDir, 'profile-edit.png') });
      console.log('Captured profile-edit.png');
      await page.close();
    }

    console.log('🎉 ALL 10 SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (error) {
    console.error('Screenshot generation error:', error);
  } finally {
    await browser.close();
  }
}

capture();
