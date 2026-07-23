import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
  deleteUser
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  getStorage,
  connectStorageEmulator,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

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

export const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const AVATAR_ALLOWED_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const AVATAR_EXTENSION_BY_MIME = Object.freeze({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
});

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

/** Returns an empty string when the selected avatar is valid. */
export const validateAvatarFile = (file) => {
  if (!file || !AVATAR_ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Vui lòng chọn ảnh JPG, PNG hoặc WebP.';
  }
  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return 'Ảnh đại diện không được vượt quá 5 MB.';
  }
  return '';
};

/** Validates the file signature so an allowed MIME type cannot hide another format. */
export const validateAvatarFileContent = async (file) => {
  const basicError = validateAvatarFile(file);
  if (basicError) return basicError;

  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
      bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
      bytes[6] === 0x1a && bytes[7] === 0x0a;
    const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
      bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 &&
      bytes[10] === 0x42 && bytes[11] === 0x50;

    const signatureMatches =
      (file.type === 'image/jpeg' && isJpeg) ||
      (file.type === 'image/png' && isPng) ||
      (file.type === 'image/webp' && isWebp);

    return signatureMatches
      ? ''
      : 'Nội dung tệp không khớp với định dạng ảnh JPG, PNG hoặc WebP.';
  } catch {
    return 'Không thể đọc tệp ảnh. Vui lòng chọn ảnh khác.';
  }
};

/** Creates a safe filename while deriving the extension from the trusted MIME type. */
export const sanitizeAvatarFilename = (file) => {
  const originalName = String(file?.name || 'avatar');
  const stem = originalName.replace(/\.[^.]*$/, '');
  const safeStem = stem
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'avatar';
  const extension = AVATAR_EXTENSION_BY_MIME[file?.type] || 'jpg';
  return `${safeStem}.${extension}`;
};

export const translateStorageError = (errorCode) => {
  switch (errorCode) {
    case 'storage/unauthorized':
      return 'Bạn không có quyền tải ảnh này lên.';
    case 'storage/canceled':
      return 'Quá trình tải ảnh đã bị hủy.';
    case 'storage/retry-limit-exceeded':
    case 'storage/unknown':
      return 'Không thể kết nối tới Firebase Storage. Vui lòng thử lại.';
    case 'storage/quota-exceeded':
      return 'Dung lượng lưu trữ hiện không khả dụng.';
    default:
      return 'Không thể tải ảnh lên. Vui lòng thử lại.';
  }
};

// Validate + initialize eagerly. A misconfiguration fails loudly at startup
// instead of silently degrading to an insecure fallback.
const firebaseConfig = buildFirebaseConfig(import.meta.env);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Optional: connect to the local Firebase Emulator Suite for automated
// verification/e2e. Enabled ONLY when VITE_FIREBASE_USE_EMULATOR === 'true'.
// Production builds never set this flag, so live traffic is unaffected.
if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
  const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099';
  const fsHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  const fsPort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080);
  const storageHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1';
  const storagePort = Number(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || 9199);
  connectAuthEmulator(auth, authHost, { disableWarnings: true });
  connectFirestoreEmulator(db, fsHost, fsPort);
  connectStorageEmulator(storage, storageHost, storagePort);
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
    console.error('[Firebase] Firestore profile creation failed, rolling back Auth user:', dbError);
    try {
      await deleteUser(credential.user);
    } catch (rollbackError) {
      console.error('[Firebase] Auth rollback (deleteUser) failed:', rollbackError);
    }
    throw new Error('Không thể tạo hồ sơ người dùng. Đăng ký đã được hủy, vui lòng thử lại.');
  }

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
      photoURL: profile.photoURL || credential.user.photoURL || '',
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

const uploadAvatar = async (user, avatarFile, onProgress) => {
  const validationError = await validateAvatarFileContent(avatarFile);
  if (validationError) {
    throw new Error(validationError);
  }

  const safeFilename = sanitizeAvatarFilename(avatarFile);
  const photoPath = `avatars/${user.uid}/${Date.now()}-${safeFilename}`;
  const destination = storageRef(storage, photoPath);
  const task = uploadBytesResumable(destination, avatarFile, {
    contentType: avatarFile.type,
    cacheControl: 'public,max-age=3600'
  });

  const snapshot = await new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (progressSnapshot) => {
        if (typeof onProgress !== 'function') return;
        const total = progressSnapshot.totalBytes || 0;
        const percent = total > 0
          ? Math.round((progressSnapshot.bytesTransferred / total) * 100)
          : 0;
        onProgress(percent);
      },
      reject,
      () => resolve(task.snapshot)
    );
  });

  const photoURL = await getDownloadURL(snapshot.ref);
  return { photoURL, photoPath, uploadedRef: snapshot.ref };
};

const isOwnedAvatarPath = (path, uid) =>
  typeof path === 'string' && path.startsWith(`avatars/${uid}/`);

/**
 * Update the signed-in user's profile in Firestore and Firebase Auth.
 * When avatarOptions.avatarFile is provided, the image is uploaded first and
 * the new Auth/Firestore avatar is committed before the old object is cleaned up.
 */
export const updateUserProfileData = async (profileData, avatarOptions = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Chưa đăng nhập.');
  }

  const derivedDisplayName =
    profileData.firstName || profileData.lastName
      ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
      : undefined;

  const avatarFile = avatarOptions.avatarFile || null;
  const previousPhotoPath = avatarOptions.previousPhotoPath || '';
  const previousAuthProfile = {
    displayName: user.displayName || null,
    photoURL: user.photoURL || null
  };

  let uploadedAvatar = null;
  let authWasUpdated = false;

  try {
    if (avatarFile) {
      uploadedAvatar = await uploadAvatar(user, avatarFile, avatarOptions.onProgress);
    }

    const authPayload = {
      ...(derivedDisplayName ? { displayName: derivedDisplayName } : {}),
      ...(uploadedAvatar ? { photoURL: uploadedAvatar.photoURL } : {})
    };

    if (Object.keys(authPayload).length > 0) {
      await updateAuthProfile(user, authPayload);
      authWasUpdated = true;
    }

    const payload = {
      ...profileData,
      ...(derivedDisplayName ? { displayName: derivedDisplayName } : {}),
      ...(uploadedAvatar
        ? {
            photoURL: uploadedAvatar.photoURL,
            photoPath: uploadedAvatar.photoPath,
            photoUpdatedAt: serverTimestamp()
          }
        : {}),
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'users', user.uid), payload);
    const updatedUser = {
      uid: user.uid,
      ...profileData,
      ...(derivedDisplayName ? { displayName: derivedDisplayName } : {}),
      ...(uploadedAvatar
        ? { photoURL: uploadedAvatar.photoURL, photoPath: uploadedAvatar.photoPath }
        : {})
    };

    if (
      uploadedAvatar &&
      previousPhotoPath !== uploadedAvatar.photoPath &&
      isOwnedAvatarPath(previousPhotoPath, user.uid)
    ) {
      try {
        await deleteObject(storageRef(storage, previousPhotoPath));
      } catch (cleanupError) {
        console.warn('[Firebase] Previous avatar cleanup failed:', cleanupError);
      }
    }

    return { success: true, user: updatedUser };
  } catch (error) {
    if (uploadedAvatar?.uploadedRef) {
      try {
        await deleteObject(uploadedAvatar.uploadedRef);
      } catch (cleanupError) {
        console.warn('[Firebase] Failed to remove unsuccessful avatar upload:', cleanupError);
      }
    }

    if (authWasUpdated) {
      try {
        await updateAuthProfile(user, previousAuthProfile);
      } catch (rollbackError) {
        console.error('[Firebase] Auth profile rollback failed:', rollbackError);
      }
    }

    if (error?.code?.startsWith('storage/')) {
      throw new Error(translateStorageError(error.code));
    }
    throw error;
  }
};

export { auth, db, storage };
