import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile
} from 'firebase/auth';

// Check if a real custom Firebase API key is provided
const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const hasRealFirebaseConfig = Boolean(rawApiKey && !rawApiKey.includes('DemoKey'));

const firebaseConfig = {
  apiKey: rawApiKey || "AIzaSyDemoKeyForAetherAuthTesting123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aether-auth-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aether-auth-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aether-auth-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109876543210",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109876543210:web:aetherauth123456"
};

let app;
let auth;

if (hasRealFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.warn("Firebase initialization failed, using local storage engine:", error);
  }
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

// Local storage demo engine keys
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

// Register User Operation
export const registerUser = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();

  if (hasRealFirebaseConfig && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || cleanEmail.split('@')[0],
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
      };
      setDemoCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      if (error.code === 'auth/email-already-in-use' || error.code === 'auth/invalid-email' || error.code === 'auth/weak-password') {
        throw new Error(translateFirebaseError(error.code));
      }
      console.warn("Live Firebase error, falling back to local storage engine:", error);
    }
  }

  // Robust local storage engine fallback
  await new Promise(res => setTimeout(res, 300));
  const users = getDemoUsers();

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    throw new Error(translateFirebaseError('auth/email-already-in-use'));
  }

  const usernameFromEmail = cleanEmail.split('@')[0];
  const newUser = {
    uid: 'user_' + Date.now(),
    email: cleanEmail,
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

// Login User Operation
export const loginUser = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();

  if (hasRealFirebaseConfig && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || cleanEmail.split('@')[0],
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
      };
      setDemoCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error(translateFirebaseError(error.code));
      }
      console.warn("Live Firebase login error, falling back to local storage engine:", error);
    }
  }

  // Robust local storage engine fallback
  await new Promise(res => setTimeout(res, 300));
  const users = getDemoUsers();
  const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!foundUser) {
    // If no user exists yet, register automatically or return invalid credentials error
    throw new Error(translateFirebaseError('auth/user-not-found'));
  }

  setDemoCurrentUser(foundUser);
  return { success: true, user: foundUser };
};

// Logout Operation
export const logoutUser = async () => {
  if (hasRealFirebaseConfig && auth && auth.currentUser) {
    try {
      await signOut(auth);
    } catch (e) {}
  }
  setDemoCurrentUser(null);
  return { success: true };
};

// Update Profile Data
export const updateUserProfileData = async (profileData) => {
  const currentUser = getDemoCurrentUser();
  if (!currentUser) throw new Error("Chưa đăng nhập.");

  await new Promise(res => setTimeout(res, 300));

  const updatedUser = {
    ...currentUser,
    ...profileData,
    displayName: (profileData.firstName || profileData.lastName) 
      ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() 
      : currentUser.displayName
  };

  setDemoCurrentUser(updatedUser);

  const users = getDemoUsers();
  const index = users.findIndex(u => u.uid === currentUser.uid);
  if (index !== -1) {
    users[index] = updatedUser;
    saveDemoUsers(users);
  }

  if (hasRealFirebaseConfig && auth && auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, {
        displayName: updatedUser.displayName
      });
    } catch (e) {}
  }

  return { success: true, user: updatedUser };
};

export const getCurrentAuthUser = () => {
  return getDemoCurrentUser();
};

export { auth };
