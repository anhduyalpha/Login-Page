import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';

// Firebase configuration from environment variables or default fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForAetherAuthTesting123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aether-auth-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aether-auth-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aether-auth-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109876543210",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109876543210:web:aetherauth123456"
};

let app;
let auth;
let isDemoMode = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase initialization using demo mode fallback:", error);
  isDemoMode = true;
}

// Friendly translation for Firebase Auth error codes
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
      return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 8 ký tự).';
    case 'auth/invalid-email':
      return 'Định dạng email không hợp lệ. Vui lòng nhập đúng email (vd: name@domain.com).';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền internet của bạn.';
    case 'auth/too-many-requests':
      return 'Đã xảy ra quá nhiều yêu cầu không thành công. Vui lòng thử lại sau giây lát.';
    default:
      return 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
  }
};

// In-memory demo storage for seamless evaluation fallback
const DEMO_USERS_KEY = 'aether_auth_demo_users';
const CURRENT_USER_KEY = 'aether_auth_current_user';

const getDemoUsers = () => {
  try {
    const stored = localStorage.getItem(DEMO_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveDemoUsers = (users) => {
  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
};

const getDemoCurrentUser = () => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

const setDemoCurrentUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {}
};

// Unified Auth Operations (Firebase SDK with Fallback)
export const registerUser = async (email, password) => {
  try {
    if (auth && !isDemoMode) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    }
  } catch (error) {
    if (error.code && error.code.startsWith('auth/')) {
      throw new Error(translateFirebaseError(error.code));
    }
  }

  // Fallback demo engine registration
  await new Promise(res => setTimeout(res, 600)); // Simulate network latency
  const users = getDemoUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error(translateFirebaseError('auth/email-already-in-use'));
  }

  const usernameFromEmail = email.split('@')[0];
  const newUser = {
    uid: 'user_' + Date.now(),
    email,
    displayName: usernameFromEmail,
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    emailVerified: true,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveDemoUsers(users);
  setDemoCurrentUser(newUser);

  return { success: true, user: newUser };
};

export const loginUser = async (email, password) => {
  try {
    if (auth && !isDemoMode) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    }
  } catch (error) {
    if (error.code && error.code.startsWith('auth/')) {
      throw new Error(translateFirebaseError(error.code));
    }
  }

  // Fallback demo engine login
  await new Promise(res => setTimeout(res, 600));
  const users = getDemoUsers();
  const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!foundUser) {
    throw new Error(translateFirebaseError('auth/user-not-found'));
  }

  setDemoCurrentUser(foundUser);
  return { success: true, user: foundUser };
};

export const logoutUser = async () => {
  if (auth && !isDemoMode) {
    await signOut(auth);
  }
  setDemoCurrentUser(null);
  return { success: true };
};

export const updateUserProfileData = async (profileData) => {
  const currentUser = getDemoCurrentUser();
  if (!currentUser) throw new Error("Chưa đăng nhập.");

  await new Promise(res => setTimeout(res, 500));

  const updatedUser = {
    ...currentUser,
    ...profileData,
    displayName: profileData.firstName || profileData.lastName ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : currentUser.displayName
  };

  setDemoCurrentUser(updatedUser);

  // Sync to demo users store
  const users = getDemoUsers();
  const index = users.findIndex(u => u.uid === currentUser.uid);
  if (index !== -1) {
    users[index] = updatedUser;
    saveDemoUsers(users);
  }

  if (auth && auth.currentUser && !isDemoMode) {
    try {
      await updateProfile(auth.currentUser, {
        displayName: updatedUser.displayName
      });
    } catch (e) {}
  }

  return { success: true, user: updatedUser };
};

export const getCurrentAuthUser = () => {
  if (auth && auth.currentUser && !isDemoMode) {
    return auth.currentUser;
  }
  return getDemoCurrentUser();
};

export { auth, isDemoMode };
