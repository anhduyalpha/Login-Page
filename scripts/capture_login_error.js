import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '../docs/screenshots');

async function captureLoginError() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const baseUrl = 'http://localhost:3000';

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });

  // Navigate to login
  await page.waitForSelector('#link-go-to-login');
  await page.click('#link-go-to-login');

  // Type invalid credentials
  await page.waitForSelector('#login-email');
  await page.type('#login-email', 'nonexistent@aetherauth.com');
  await page.type('#login-password', 'wrongpassword123');
  await page.click('#btn-submit-login');

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, 'login-error.png') });
  console.log('Successfully captured login-error.png!');

  await browser.close();
}

captureLoginError();
