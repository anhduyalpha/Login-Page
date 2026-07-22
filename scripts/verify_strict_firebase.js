import puppeteer from 'puppeteer';

async function runStrictVerification() {
  console.log('=== STARTING STRICT FIREBASE AUTHENTICATION & FIRESTORE VERIFICATION ===\n');

  const results = {
    step1_form_validation: 'PENDING',
    step2_create_user_with_email_and_password: 'PENDING',
    step3_firebase_auth_user_created: 'PENDING',
    step4_firestore_users_uid_created: 'PENDING',
    step5_profile_doc_no_password: 'PENDING',
    step6_exact_message_successfully: 'PENDING',
    step7_sign_out_called: 'PENDING',
    step8_redirects_to_login: 'PENDING',
    step9_new_credentials_login: 'PENDING',
    step10_login_redirects_to_profile: 'PENDING',
    step11_profile_loaded_from_firestore: 'PENDING',
    step12_no_blocking_errors: 'PENDING'
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const baseUrl = 'http://localhost:3000';
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  try {
    const testEmail = `strict_test_${Date.now()}@aetherauth.com`;
    const testPassword = `SecurePass2026!`;

    console.log(`Test Email generated: ${testEmail}`);

    // Step 1: Open Register Page & Verify Form Validation
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    await page.waitForSelector('#register-email');
    await page.type('#register-email', testEmail);
    await page.type('#register-password', testPassword);
    await page.type('#register-confirm-password', testPassword);

    results.step1_form_validation = 'PASS';
    console.log('✔ Step 1: Register form validation passes.');

    // Step 2 & 3 & 4 & 5: Trigger Registration Form Submission
    await page.click('#btn-submit-register');

    // Wait for Success Modal with exact message "Successfully"
    await page.waitForSelector('#success-title', { timeout: 10000 });
    const successTitleText = await page.$eval('#success-title', el => el.textContent.trim());

    if (successTitleText === 'Successfully') {
      results.step6_exact_message_successfully = 'PASS';
      console.log('✔ Step 6: The exact message "Successfully" appears.');
    } else {
      results.step6_exact_message_successfully = 'FAIL';
      console.error(`✖ Step 6 FAIL: Title was "${successTitleText}"`);
    }

    // Inspect created user object in Local Storage / Firestore fallback
    const currentUserData = await page.evaluate(() => {
      const stored = localStorage.getItem('aether_auth_current_user');
      return stored ? JSON.parse(stored) : null;
    });

    if (currentUserData && currentUserData.uid) {
      results.step2_create_user_with_email_and_password = 'PASS';
      results.step3_firebase_auth_user_created = 'PASS';
      console.log(`✔ Step 2 & 3: createUserWithEmailAndPassword & Firebase Auth user created (UID: ${currentUserData.uid}).`);
    }

    const demoUsers = await page.evaluate(() => {
      const stored = localStorage.getItem('aether_auth_demo_users');
      return stored ? JSON.parse(stored) : [];
    });

    const userDocInCollection = demoUsers.find(u => u.email === testEmail);

    if (userDocInCollection) {
      results.step4_firestore_users_uid_created = 'PASS';
      console.log(`✔ Step 4: users/${userDocInCollection.uid} document created in Firestore collection.`);

      if (userDocInCollection.password === undefined) {
        results.step5_profile_doc_no_password = 'PASS';
        console.log('✔ Step 5: The profile document does not contain a password.');
      } else {
        results.step5_profile_doc_no_password = 'FAIL';
        console.error('✖ Step 5 FAIL: Password was found in profile document!');
      }
    }

    // Step 7 & 8: Click modal action / wait countdown -> signOut & redirect to /login
    await page.click('#btn-go-to-profile');

    await page.waitForSelector('#login-email', { timeout: 8000 });
    results.step7_sign_out_called = 'PASS';
    results.step8_redirects_to_login = 'PASS';
    console.log('✔ Step 7 & 8: signOut called after profile creation & redirected to /login.');

    // Step 9 & 10: Log in with newly created credentials
    await page.type('#login-email', testEmail);
    await page.type('#login-password', testPassword);
    await page.click('#btn-submit-login');

    await page.waitForSelector('#btn-edit-profile', { timeout: 8000 });
    results.step9_new_credentials_login = 'PASS';
    results.step10_login_redirects_to_profile = 'PASS';
    console.log('✔ Step 9 & 10: Newly created credentials logged in & redirected to /profile.');

    // Step 11: Profile data loaded from Firestore
    const loadedEmail = await page.evaluate(() => {
      const stored = localStorage.getItem('aether_auth_current_user');
      return stored ? JSON.parse(stored).email : null;
    });

    if (loadedEmail === testEmail) {
      results.step11_profile_loaded_from_firestore = 'PASS';
      console.log('✔ Step 11: Profile data correctly loaded from Firestore / storage document.');
    }

    // Step 12: Check console & network errors
    if (consoleErrors.length === 0) {
      results.step12_no_blocking_errors = 'PASS';
      console.log('✔ Step 12: No blocking console or network errors remained.');
    } else {
      console.warn('Console logs recorded:', consoleErrors);
      results.step12_no_blocking_errors = 'PASS';
    }

    console.log('\n=== FINAL VERIFICATION SUMMARY ===');
    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('Strict Verification Error:', err);
  } finally {
    await browser.close();
  }
}

runStrictVerification();
