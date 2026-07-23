import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock the Firebase SDK so we can assert OUR control flow deterministically ──
const mockCreateUser = vi.fn();
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockDeleteUser = vi.fn();
const mockUpdateProfile = vi.fn();
const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockUpdateDoc = vi.fn();

const authState = { currentUser: null };

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'test-app' }))
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => authState),
  connectAuthEmulator: vi.fn(),
  createUserWithEmailAndPassword: (...args) => mockCreateUser(...args),
  signInWithEmailAndPassword: (...args) => mockSignIn(...args),
  signOut: (...args) => mockSignOut(...args),
  updateProfile: (...args) => mockUpdateProfile(...args),
  deleteUser: (...args) => mockDeleteUser(...args)
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ name: 'test-db' })),
  connectFirestoreEmulator: vi.fn(),
  doc: vi.fn((_db, col, id) => ({ col, id })),
  setDoc: (...args) => mockSetDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args)
}));

const {
  getMissingFirebaseEnvVars,
  buildFirebaseConfig,
  translateFirebaseError,
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfileData,
  fetchUserProfile
} = await import('./firebase.js');

beforeEach(() => {
  vi.clearAllMocks();
  authState.currentUser = null;
});

describe('environment validation', () => {
  it('reports every missing required variable', () => {
    expect(getMissingFirebaseEnvVars({})).toEqual([
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ]);
  });

  it('treats blank/whitespace values as missing', () => {
    expect(getMissingFirebaseEnvVars({ VITE_FIREBASE_API_KEY: '   ' })).toContain(
      'VITE_FIREBASE_API_KEY'
    );
  });

  it('buildFirebaseConfig throws a clear error when config is incomplete', () => {
    expect(() => buildFirebaseConfig({})).toThrow(/Missing required environment variable/);
  });

  it('buildFirebaseConfig returns a config object when all vars are present', () => {
    const cfg = buildFirebaseConfig({
      VITE_FIREBASE_API_KEY: 'k',
      VITE_FIREBASE_AUTH_DOMAIN: 'd',
      VITE_FIREBASE_PROJECT_ID: 'p',
      VITE_FIREBASE_STORAGE_BUCKET: 's',
      VITE_FIREBASE_MESSAGING_SENDER_ID: 'm',
      VITE_FIREBASE_APP_ID: 'a'
    });
    expect(cfg).toMatchObject({ apiKey: 'k', projectId: 'p', appId: 'a' });
  });
});

describe('translateFirebaseError', () => {
  it('maps known auth codes to Vietnamese messages', () => {
    expect(translateFirebaseError('auth/email-already-in-use')).toMatch(/đã được đăng ký/);
    expect(translateFirebaseError('auth/invalid-credential')).toMatch(/không chính xác/);
  });

  it('falls back to a generic message for unknown codes', () => {
    expect(translateFirebaseError('auth/whatever')).toMatch(/Đã xảy ra lỗi/);
  });
});

describe('registerUser', () => {
  it('creates the auth user, writes the profile, then signs out', async () => {
    mockCreateUser.mockResolvedValue({ user: { uid: 'u1' } });
    mockSetDoc.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);

    const res = await registerUser('New@Example.com ', 'Passw0rd!');

    expect(res).toEqual({ success: true, uid: 'u1', email: 'new@example.com' });
    expect(mockSetDoc).toHaveBeenCalledOnce();
    const [, profile] = mockSetDoc.mock.calls[0];
    expect(profile).toMatchObject({ uid: 'u1', email: 'new@example.com' });
    expect(profile.password).toBeUndefined();
    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it('rolls back the auth user when the Firestore write fails (no swallow)', async () => {
    mockCreateUser.mockResolvedValue({ user: { uid: 'u2' } });
    mockSetDoc.mockRejectedValue(new Error('permission-denied'));
    mockDeleteUser.mockResolvedValue(undefined);

    await expect(registerUser('a@b.com', 'Passw0rd!')).rejects.toThrow(
      /Đăng ký đã được hủy/
    );
    expect(mockDeleteUser).toHaveBeenCalledOnce();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('surfaces a translated auth error and never touches Firestore', async () => {
    mockCreateUser.mockRejectedValue({ code: 'auth/email-already-in-use' });

    await expect(registerUser('a@b.com', 'x')).rejects.toThrow(/đã được đăng ký/);
    expect(mockSetDoc).not.toHaveBeenCalled();
  });
});

describe('loginUser', () => {
  it('signs in then loads the users/{uid} profile', async () => {
    mockSignIn.mockResolvedValue({
      user: { uid: 'u1', email: 'a@b.com', emailVerified: true }
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'u1', email: 'a@b.com', firstName: 'Ada' })
    });

    const res = await loginUser('a@b.com', 'pw');
    expect(res.user).toMatchObject({ uid: 'u1', email: 'a@b.com', firstName: 'Ada' });
  });

  it('does NOT swallow Firestore getDoc errors', async () => {
    mockSignIn.mockResolvedValue({ user: { uid: 'u1', email: 'a@b.com' } });
    mockGetDoc.mockRejectedValue(new Error('unavailable'));

    await expect(loginUser('a@b.com', 'pw')).rejects.toThrow('unavailable');
  });

  it('throws when the profile document is missing', async () => {
    mockSignIn.mockResolvedValue({ user: { uid: 'u1', email: 'a@b.com' } });
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });

    await expect(loginUser('a@b.com', 'pw')).rejects.toThrow(/Không tìm thấy hồ sơ/);
  });

  it('surfaces a translated auth error', async () => {
    mockSignIn.mockRejectedValue({ code: 'auth/invalid-credential' });
    await expect(loginUser('a@b.com', 'pw')).rejects.toThrow(/không chính xác/);
  });
});

describe('logoutUser', () => {
  it('calls Firebase signOut', async () => {
    mockSignOut.mockResolvedValue(undefined);
    await logoutUser();
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});

describe('updateUserProfileData', () => {
  it('throws when there is no authenticated user', async () => {
    authState.currentUser = null;
    await expect(updateUserProfileData({ firstName: 'X' })).rejects.toThrow(/Chưa đăng nhập/);
  });

  it('writes to Firestore and updates the auth displayName', async () => {
    authState.currentUser = { uid: 'u1' };
    mockUpdateDoc.mockResolvedValue(undefined);
    mockUpdateProfile.mockResolvedValue(undefined);
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'u1', firstName: 'New', lastName: 'Name' })
    });

    const res = await updateUserProfileData({ firstName: 'New', lastName: 'Name' });
    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    expect(mockUpdateProfile).toHaveBeenCalledWith(authState.currentUser, {
      displayName: 'New Name'
    });
    expect(res.user).toMatchObject({ uid: 'u1', firstName: 'New' });
  });

  it('does NOT swallow Firestore updateDoc errors', async () => {
    authState.currentUser = { uid: 'u1' };
    mockUpdateDoc.mockRejectedValue(new Error('permission-denied'));
    await expect(updateUserProfileData({ firstName: 'X' })).rejects.toThrow('permission-denied');
  });
});

describe('fetchUserProfile', () => {
  it('returns the document data merged with uid', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ email: 'a@b.com' })
    });
    await expect(fetchUserProfile('u1')).resolves.toEqual({ uid: 'u1', email: 'a@b.com' });
  });

  it('throws when the document does not exist', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    await expect(fetchUserProfile('u1')).rejects.toThrow(/Không tìm thấy hồ sơ/);
  });
});
