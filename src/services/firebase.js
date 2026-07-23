import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

/**
 * Required Firebase Web SDK environment variables.
 * All of these MUST be provided at build time (Vercel dashboard / .env.local).
 * There are NO demo defaults and NO localStorage fallback.
 */
const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

/**
 * Pure helper (unit-testable): returns the list of required Firebase env vars
 * that are missing or blank in the supplied env object.
 */
export const getMissingFirebaseEnvVars = (env = {}) =>
  REQUIRED_ENV_KEYS.filter((key) => {
    const value = env[key];
    return value === undefined || value === null || String(value).trim() === '';
  });

/**
 * Builds a validated Firebase config from the supplied env object.
 * Throws a clear, actionable error when any required variable is missing.
 */
export const buildFirebaseConfig = (env = {}) => {
  const missing = getMissingFirebaseEnvVars(env);
  if (missing.length > 0) {
    throw new Error(
      `[Firebase] Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Set every VITE_FIREBASE_* variable (Vercel Project Settings → Environment Variables ' +
        'or a local .env.local). See .env.example. The app cannot start without a real Firebase project.'
    );
  }
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    ...(env.VITE_FIREBASE_MEASUREMENT_ID
      ? { measurementId: env.VITE_FIREBASE_MEASUREMENT_ID }
      : {})
  };
};

// Validate + initialize eagerly. A misconfiguration fails loudly at startup
// instead of silently degrading to an insecure fallback.
const firebaseConfig = buildFirebaseConfig(import.meta.env);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Optional: connect to the local Firebase Emulator Suite for automated
// verification/e2e. Enabled ONLY when VITE_FIREBASE_USE_EMULATOR === 'true'.
// Production builds never set this flag, so live traffic is unaffected.
if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
  const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099';
  const fsHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  const fsPort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080);
  connectAuthEmulator(auth, authHost, { disableWarnings: true });
  connectFirestoreEmulator(db, fsHost, fsPort);
}

/** Friendly translation for Firebase Auth error codes. */
export const translateFirebaseError = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Địa chỉ email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản liên kết với email này.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu từ 6 ký tự trở lên.';
    case 'auth/invalid-email':
      return 'Định dạng email không hợp lệ. Vui lòng nhập đúng email (vd: name@domain.com).';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền internet.';
    case 'auth/too-many-requests':
      return 'Đã xảy ra quá nhiều yêu cầu không thành công. Vui lòng thử lại sau.';
    default:
      return 'Đã xảy ra lỗi khi xử lý. Vui lòng kiểm tra lại thông tin.';
  }
};

/**
 * Loads the users/{uid} profile document.
 * Only call AFTER Firebase Auth has confirmed the user.
 * Firestore errors are NOT swallowed — they propagate to the caller.
 */
export const fetchUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) {
    throw new Error('Không tìm thấy hồ sơ người dùng trong hệ thống.');
  }
  return { uid, ...snap.data() };
};

/**
 * Register a new user.
 * 1. Create the Firebase Auth account.
 * 2. Create the users/{uid} Firestore document (no password stored).
 * 3. If the document write fails, ROLL BACK by deleting the Auth user, then throw.
 * 4. On full success, sign the user out (registration must not auto-authenticate).
 * There is NO fallback engine — every failure propagates.
 */
export const registerUser = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();

  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  } catch (error) {
    throw new Error(translateFirebaseError(error.code));
  }

  const uid = credential.user.uid;
  const profileData = {
    uid,
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    bio: '',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'users', uid), profileData);
  } catch (dbError) {
    // Roll back the just-created Auth user so we never leave an account
    // without its profile document.
    console.error('[Firebase] Firestore profile creation failed, rolling back Auth user:', dbError);
    try {
      await deleteUser(credential.user);
    } catch (rollbackError) {
      console.error('[Firebase] Auth rollback (deleteUser) failed:', rollbackError);
    }
    throw new Error('Không thể tạo hồ sơ người dùng. Đăng ký đã được hủy, vui lòng thử lại.');
  }

  // Registration succeeded on BOTH Auth and Firestore. Sign out so the user
  // must explicitly log in.
  await signOut(auth);

  return { success: true, uid, email: cleanEmail };
};

/**
 * Log a user in via Firebase Auth, then load their Firestore profile.
 * Auth and Firestore errors both propagate (no fallback, no swallowing).
 */
export const loginUser = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  } catch (error) {
    throw new Error(translateFirebaseError(error.code));
  }

  const profile = await fetchUserProfile(credential.user.uid);
  return {
    success: true,
    user: {
      ...profile,
      email: credential.user.email,
      emailVerified: credential.user.emailVerified
    }
  };
};

/** Sign the current user out. Errors propagate to the caller. */
export const logoutUser = async () => {
  await signOut(auth);
  return { success: true };
};

/**
 * Update the signed-in user's profile in Firestore (and Auth displayName).
 * Requires an authenticated user. Firestore errors are NOT swallowed.
 */
export const updateUserProfileData = async (profileData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Chưa đăng nhập.');
  }

  const derivedDisplayName =
    profileData.firstName || profileData.lastName
      ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
      : undefined;

  const payload = {
    ...profileData,
    ...(derivedDisplayName ? { displayName: derivedDisplayName } : {}),
    updatedAt: new Date().toISOString()
  };

  await updateDoc(doc(db, 'users', user.uid), payload);

  if (derivedDisplayName) {
    await updateProfile(user, { displayName: derivedDisplayName });
  }

  const snap = await getDoc(doc(db, 'users', user.uid));
  return { success: true, user: { uid: user.uid, ...snap.data() } };
};

export { auth, db };
