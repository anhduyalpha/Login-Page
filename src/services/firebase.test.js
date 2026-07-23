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
const mockStorageRef = vi.fn((_storage, path) => ({ fullPath: path }));
const mockUploadBytesResumable = vi.fn();
const mockGetDownloadURL = vi.fn();
const mockDeleteObject = vi.fn();

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
  updateDoc: (...args) => mockUpdateDoc(...args),
  serverTimestamp: vi.fn(() => 'server-timestamp')
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({ name: 'test-storage' })),
  connectStorageEmulator: vi.fn(),
  ref: (...args) => mockStorageRef(...args),
  uploadBytesResumable: (...args) => mockUploadBytesResumable(...args),
  getDownloadURL: (...args) => mockGetDownloadURL(...args),
  deleteObject: (...args) => mockDeleteObject(...args)
}));

const {
  AVATAR_MAX_SIZE_BYTES,
  getMissingFirebaseEnvVars,
  buildFirebaseConfig,
  translateFirebaseError,
  translateStorageError,
  validateAvatarFile,
  validateAvatarFileContent,
  sanitizeAvatarFilename,
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfileData,
  fetchUserProfile
} = await import('./firebase.js');

const makeFile = (bytes, name, type) => {
  const content = Uint8Array.from(bytes);
  return {
    name,
    type,
    size: content.byteLength,
    slice: (start, end) => {
      const sliced = content.slice(start, end);
      return { arrayBuffer: async () => sliced.buffer };
    }
  };
};

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

describe('avatar validation', () => {
  it.each([
    ['JPEG', makeFile([0xff, 0xd8, 0xff, 0x00], 'photo.jpg', 'image/jpeg')],
    ['PNG', makeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'photo.png', 'image/png')],
    ['WebP', makeFile([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], 'photo.webp', 'image/webp')]
  ])('accepts %s images', async (_label, file) => {
    expect(validateAvatarFile(file)).toBe('');
    await expect(validateAvatarFileContent(file)).resolves.toBe('');
  });

  it('rejects unsupported MIME types', () => {
    const file = makeFile([0x47, 0x49, 0x46], 'avatar.gif', 'image/gif');
    expect(validateAvatarFile(file)).toMatch(/JPG, PNG hoặc WebP/);
  });

  it('rejects files over 5 MB', () => {
    const file = { name: 'large.png', type: 'image/png', size: AVATAR_MAX_SIZE_BYTES + 1 };
    expect(validateAvatarFile(file)).toMatch(/5 MB/);
  });

  it('rejects spoofed file contents even when MIME is allowed', async () => {
    const file = makeFile([0x4d, 0x5a, 0x90, 0x00], 'not-really.png', 'image/png');
    await expect(validateAvatarFileContent(file)).resolves.toMatch(/không khớp/);
  });

  it('sanitizes names and derives extension from MIME', () => {
    expect(sanitizeAvatarFilename({ name: 'Ảnh Hồ Sơ.exe', type: 'image/webp' }))
      .toBe('anh-ho-so.webp');
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

describe('translateStorageError', () => {
  it('maps common Storage errors to safe Vietnamese messages', () => {
    expect(translateStorageError('storage/unauthorized')).toMatch(/không có quyền/);
    expect(translateStorageError('storage/quota-exceeded')).toMatch(/không khả dụng/);
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
      user: { uid: 'u1', email: 'a@b.com', emailVerified: true, photoURL: 'auth-photo' }
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'u1', email: 'a@b.com', firstName: 'Ada' })
    });

    const res = await loginUser('a@b.com', 'pw');
    expect(res.user).toMatchObject({
      uid: 'u1',
      email: 'a@b.com',
      firstName: 'Ada',
      photoURL: 'auth-photo'
    });
  });

  it('prefers the Firestore photoURL over the Auth fallback', async () => {
    mockSignIn.mockResolvedValue({
      user: { uid: 'u1', email: 'a@b.com', photoURL: 'auth-photo' }
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'u1', email: 'a@b.com', photoURL: 'firestore-photo' })
    });

    const res = await loginUser('a@b.com', 'pw');
    expect(res.user.photoURL).toBe('firestore-photo');
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

  it('uploads an avatar, syncs Auth and Firestore, then deletes the owned old avatar', async () => {
    authState.currentUser = {
      uid: 'u1',
      displayName: 'Old Name',
      photoURL: 'https://example.com/old.png'
    };
    const file = makeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'My Photo.PNG', 'image/png');
    const uploadedRef = { fullPath: 'avatars/u1/new.png' };
    const onProgress = vi.fn();

    mockUploadBytesResumable.mockReturnValue({
      snapshot: { ref: uploadedRef },
      on: (_event, progress, _error, complete) => {
        progress({ bytesTransferred: 50, totalBytes: 100 });
        complete();
      }
    });
    mockGetDownloadURL.mockResolvedValue('https://example.com/new.png');
    mockUpdateProfile.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'u1', firstName: 'New', lastName: 'Name' })
    });
    mockDeleteObject.mockResolvedValue(undefined);

    const res = await updateUserProfileData(
      { firstName: 'New', lastName: 'Name' },
      {
        avatarFile: file,
        previousPhotoPath: 'avatars/u1/old.png',
        onProgress
      }
    );

    expect(onProgress).toHaveBeenCalledWith(50);
    expect(mockUpdateProfile).toHaveBeenCalledWith(authState.currentUser, {
      displayName: 'New Name',
      photoURL: 'https://example.com/new.png'
    });
    const [, payload] = mockUpdateDoc.mock.calls[0];
    expect(payload).toMatchObject({
      photoURL: 'https://example.com/new.png',
      photoUpdatedAt: 'server-timestamp'
    });
    expect(payload.photoPath).toMatch(/^avatars\/u1\/\d+-my-photo\.png$/);
    expect(mockDeleteObject).toHaveBeenCalledWith({ fullPath: 'avatars/u1/old.png' });
    expect(res.user.photoURL).toBe('https://example.com/new.png');
  });

  it('does not delete an old path outside the authenticated UID folder', async () => {
    authState.currentUser = { uid: 'u1' };
    const file = makeFile([0xff, 0xd8, 0xff], 'photo.jpg', 'image/jpeg');
    const uploadedRef = { fullPath: 'avatars/u1/new.jpg' };

    mockUploadBytesResumable.mockReturnValue({
      snapshot: { ref: uploadedRef },
      on: (_event, _progress, _error, complete) => complete()
    });
    mockGetDownloadURL.mockResolvedValue('https://example.com/new.jpg');
    mockUpdateProfile.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ uid: 'u1' }) });

    await updateUserProfileData(
      { firstName: '' },
      { avatarFile: file, previousPhotoPath: 'avatars/u2/not-owned.jpg' }
    );

    expect(mockDeleteObject).not.toHaveBeenCalled();
  });

  it('preserves the previous avatar when Storage upload fails', async () => {
    authState.currentUser = {
      uid: 'u1',
      displayName: 'Old Name',
      photoURL: 'https://example.com/old.png'
    };
    const file = makeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'photo.png', 'image/png');

    mockUploadBytesResumable.mockReturnValue({
      snapshot: { ref: { fullPath: 'avatars/u1/new.png' } },
      on: (_event, _progress, error) => error({ code: 'storage/unauthorized' })
    });

    await expect(
      updateUserProfileData(
        { firstName: 'New' },
        { avatarFile: file, previousPhotoPath: 'avatars/u1/old.png' }
      )
    ).rejects.toThrow(/không có quyền/);

    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(mockUpdateDoc).not.toHaveBeenCalled();
    expect(mockDeleteObject).not.toHaveBeenCalled();
    expect(authState.currentUser.photoURL).toBe('https://example.com/old.png');
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
