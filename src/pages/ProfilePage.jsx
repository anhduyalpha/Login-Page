import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateAvatarFileContent } from '../services/firebase';
import { PrimaryButton, SecondaryButton } from '../components/PrimaryButton';
import { AlertMessage } from '../components/AlertMessage';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit3,
  Save,
  LogOut,
  ShieldCheck,
  Check,
  Camera
} from 'lucide-react';

const getInitials = (profile) => {
  const parts = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  const fallback = profile?.displayName || profile?.email?.split('@')[0] || 'U';
  return fallback.slice(0, 2).toUpperCase();
};

export const ProfilePage = () => {
  const { currentUser, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const avatarInputRef = useRef(null);
  const mountedRef = useRef(true);
  const selectionRequestRef = useRef(0);
  const successTimeoutRef = useRef(null);

  // Form Field States — seeded ONLY from the authenticated user's Firestore
  // profile. No fabricated demo values.
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  const emailDisplay = currentUser?.email || '';
  const fullNameDisplay = (firstName || lastName)
    ? `${firstName} ${lastName}`.trim()
    : (currentUser?.displayName || 'Người dùng AuthPortal');
  const avatarUrl = avatarPreviewUrl || currentUser?.photoURL || '';
  const avatarInitials = getInitials({
    ...currentUser,
    firstName,
    lastName,
    email: emailDisplay
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      selectionRequestRef.current += 1;
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [currentUser?.photoURL, avatarPreviewUrl]);

  useEffect(() => () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
  }, [avatarPreviewUrl]);

  const clearAvatarSelection = () => {
    selectionRequestRef.current += 1;
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl('');
    setUploadProgress(0);
    setAvatarLoadFailed(false);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleAvatarSelection = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const requestId = selectionRequestRef.current + 1;
    selectionRequestRef.current = requestId;
    const validationError = await validateAvatarFileContent(file);

    if (!mountedRef.current || requestId !== selectionRequestRef.current) return;

    if (validationError) {
      setErrorMessage(validationError);
      input.value = '';
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setSelectedAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setAvatarLoadFailed(false);
    setUploadProgress(0);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    setSaving(true);
    setSaveSuccess(false);
    setSuccessMessage('');
    setErrorMessage('');
    setUploadProgress(0);

    try {
      await updateProfile(
        {
          firstName,
          lastName,
          phone,
          address,
          bio,
          updatedAt: new Date().toISOString()
        },
        selectedAvatarFile
          ? {
              avatarFile: selectedAvatarFile,
              previousPhotoPath: currentUser?.photoPath || '',
              onProgress: (progress) => {
                if (mountedRef.current) setUploadProgress(progress);
              }
            }
          : {}
      );

      if (!mountedRef.current) return;

      const avatarWasUpdated = Boolean(selectedAvatarFile);
      clearAvatarSelection();
      setSaveSuccess(true);
      setSuccessMessage(
        avatarWasUpdated
          ? 'Ảnh đại diện và thông tin cá nhân đã được cập nhật!'
          : 'Cập nhật thông tin cá nhân thành công!'
      );
      successTimeoutRef.current = window.setTimeout(() => {
        if (!mountedRef.current) return;
        setSaveSuccess(false);
        setIsEditing(false);
        successTimeoutRef.current = null;
      }, 500);
    } catch (err) {
      if (mountedRef.current) {
        setErrorMessage(err.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
      }
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (saving) return;
    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    setFirstName(currentUser?.firstName || '');
    setLastName(currentUser?.lastName || '');
    setPhone(currentUser?.phone || '');
    setAddress(currentUser?.address || '');
    setBio(currentUser?.bio || '');
    clearAvatarSelection();
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">

      {/* Messages */}
      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      {/* Header Profile Identity Glass Card */}
      <div className="p-6 sm:p-8 glass-level-1 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => isEditing && avatarInputRef.current?.click()}
                disabled={!isEditing || saving}
                aria-label={isEditing ? 'Đổi ảnh đại diện' : `Ảnh đại diện của ${fullNameDisplay}`}
                className={`group relative w-20 h-20 rounded-full border border-white/20 p-1 bg-[#111111] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] transition-all duration-200 ${
                  isEditing
                    ? 'cursor-pointer hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]'
                    : 'cursor-default'
                }`}
              >
                {avatarUrl && !avatarLoadFailed ? (
                  <img
                    src={avatarUrl}
                    alt={`Ảnh đại diện của ${fullNameDisplay}`}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <span
                    className="w-full h-full rounded-full flex items-center justify-center bg-white/10 text-[#f5f5f5] text-xl font-semibold tracking-wide"
                    aria-label={`Chữ viết tắt ${avatarInitials}`}
                  >
                    {avatarInitials}
                  </span>
                )}

                {isEditing && (
                  <span className="absolute inset-1 rounded-full bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" aria-hidden="true" />
                  </span>
                )}
              </button>

              <input
                ref={avatarInputRef}
                id="input-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelection}
                disabled={saving}
                className="sr-only"
                aria-label="Chọn ảnh đại diện JPG, PNG hoặc WebP"
              />

              {isEditing && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={saving}
                  className="min-h-[44px] px-2 text-xs font-medium text-[#d4d4d4] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition-colors"
                >
                  Đổi ảnh đại diện
                </button>
              )}

              {isEditing && selectedAvatarFile && (
                <p className="max-w-40 text-[11px] text-[#a3a3a3] truncate" title={selectedAvatarFile.name}>
                  {selectedAvatarFile.name}
                </p>
              )}

              <div className="min-h-4" aria-live="polite" aria-atomic="true">
                {saving && selectedAvatarFile && (
                  <p className="text-[11px] text-[#d4d4d4]">
                    Đang tải ảnh... {uploadProgress}%
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] tracking-tight">
                {fullNameDisplay}
              </h1>
              <p className="text-xs text-[#a3a3a3] flex items-center justify-center sm:justify-start gap-1.5 break-all">
                <Mail className="w-3.5 h-3.5 text-[#a3a3a3] shrink-0" />
                <span>{emailDisplay}</span>
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[#f5f5f5] text-[11px] glass-level-3">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Đã xác thực</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <SecondaryButton id="btn-edit-profile" onClick={() => setIsEditing(true)}>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </SecondaryButton>
            ) : (
              <SecondaryButton onClick={handleCancelEdit} disabled={saving}>
                <span>Hủy</span>
              </SecondaryButton>
            )}

            <button
              onClick={logout}
              disabled={saving}
              className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 hover:border-red-500/35 text-xs font-medium flex items-center gap-1.5 min-h-[38px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] active:translate-y-0 active:scale-[0.97]"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>

        </div>
      </div>

      {/* Information Glass Card */}
      <div className="p-6 sm:p-8 glass-level-1 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm font-semibold text-[#f5f5f5] flex items-center gap-2">
            <User className="w-4 h-4 text-[#a3a3a3]" />
            <span>Thông tin cá nhân</span>
          </h2>
          <span className="text-xs text-[#737373]">
            {isEditing ? 'Chế độ chỉnh sửa' : 'Chế độ xem'}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Field 1: Họ và tên đệm */}
            <div>
              <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
                Họ và tên đệm
              </label>
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <input
                      id="input-first-name"
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="VD: Nguyễn Văn"
                      className="form-input w-full py-2 px-3 text-sm"
                    />
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2.5 rounded-lg bg-[#111111] border border-white/10 text-sm text-[#f5f5f5]">
                    {firstName || <span className="text-[#737373] italic">Chưa nhập</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field 2: Tên */}
            <div>
              <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
                Tên
              </label>
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <input
                      id="input-last-name"
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="VD: A"
                      className="form-input w-full py-2 px-3 text-sm"
                    />
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2.5 rounded-lg bg-[#111111] border border-white/10 text-sm text-[#f5f5f5]">
                    {lastName || <span className="text-[#737373] italic">Chưa nhập</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field 3: Email */}
            <div>
              <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
                Email
              </label>
              <div className="p-2.5 rounded-lg bg-[#111111] border border-white/10 text-sm text-[#a3a3a3] flex items-center gap-2 break-all">
                <Mail className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                <span>{emailDisplay}</span>
              </div>
            </div>

            {/* Field 4: Số điện thoại */}
            <div>
              <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
                Số điện thoại
              </label>
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <input
                      id="input-phone"
                      type="text"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+84 912 345 678"
                      className="form-input w-full py-2 px-3 text-sm"
                    />
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2.5 rounded-lg bg-[#111111] border border-white/10 text-sm text-[#f5f5f5] flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                    <span>{phone || <span className="text-[#737373] italic">Chưa nhập</span>}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Field 5: Địa chỉ */}
          <div>
            <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
              Địa chỉ
            </label>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <textarea
                    id="input-address"
                    rows={2}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Nhập địa chỉ"
                    className="form-input w-full py-2 px-3 text-sm resize-none"
                  />
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2.5 rounded-lg bg-[#111111] border border-white/10 text-sm text-[#f5f5f5] flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#737373] mt-0.5 shrink-0" />
                  <span>{address || <span className="text-[#737373] italic">Chưa nhập</span>}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Field 6: Bio */}
          <div>
            <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
              Giới thiệu bản thân (Bio)
            </label>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <textarea
                    id="input-bio"
                    rows={3}
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Nhập phần giới thiệu ngắn..."
                    className="form-input w-full py-2 px-3 text-sm resize-none"
                  />
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2.5 rounded-lg bg-[#111111] border border-white/10 text-sm text-[#f5f5f5] flex items-start gap-2 leading-relaxed">
                  <FileText className="w-3.5 h-3.5 text-[#737373] mt-0.5 shrink-0" />
                  <span>{bio || <span className="text-[#737373] italic">Chưa nhập</span>}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Edit action controls */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <SecondaryButton onClick={handleCancelEdit} disabled={saving}>
                Hủy
              </SecondaryButton>
              <PrimaryButton
                id="btn-submit-save-profile"
                type="submit"
                loading={saving}
                success={saveSuccess}
                disabled={saving}
                className="w-auto px-5"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thông tin</span>
                  </>
                )}
              </PrimaryButton>
            </div>
          )}

        </form>
      </div>

    </div>
  );
};
