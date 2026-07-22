import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FormField } from '../components/FormField';
import { PrimaryButton, SecondaryButton } from '../components/PrimaryButton';
import { AlertMessage } from '../components/AlertMessage';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Edit3, 
  Save, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

export const ProfilePage = () => {
  const { currentUser, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form Field States
  const [firstName, setFirstName] = useState(currentUser?.firstName || 'Nguyễn Văn');
  const [lastName, setLastName] = useState(currentUser?.lastName || 'A');
  const [phone, setPhone] = useState(currentUser?.phone || '+84 912 345 678');
  const [address, setAddress] = useState(currentUser?.address || 'Tầng 12, Tòa nhà Bitexco Financial Tower, Quận 1, TP. Hồ Chí Minh');
  const [bio, setBio] = useState(currentUser?.bio || 'Lập trình viên giao diện web. Đam mê thiết kế tối giản và trải nghiệm người dùng.');

  const emailDisplay = currentUser?.email || 'user@example.com';
  const fullNameDisplay = (firstName || lastName) 
    ? `${firstName} ${lastName}`.trim() 
    : (currentUser?.displayName || 'Người dùng AuthPortal');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await updateProfile({
        firstName,
        lastName,
        phone,
        address,
        bio,
        updatedAt: new Date().toISOString()
      });
      setSuccessMessage('Cập nhật thông tin cá nhân thành công!');
      setIsEditing(false);
    } catch (err) {
      setErrorMessage(err.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(currentUser?.firstName || 'Nguyễn Văn');
    setLastName(currentUser?.lastName || 'A');
    setPhone(currentUser?.phone || '+84 912 345 678');
    setAddress(currentUser?.address || 'Tầng 12, Tòa nhà Bitexco Financial Tower, Quận 1, TP. Hồ Chí Minh');
    setBio(currentUser?.bio || 'Lập trình viên giao diện web. Đam mê thiết kế tối giản và trải nghiệm người dùng.');
    setIsEditing(false);
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      
      {/* Messages */}
      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} />}

      {/* Header Profile Identity Card */}
      <div className="p-6 sm:p-8 auth-card space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-full border border-[#1e293b] p-1 bg-[#090d16] shrink-0">
              <img 
                src="/avatar.svg" 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {fullNameDisplay}
              </h1>
              <p className="text-xs font-mono text-[#94a3b8] flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{emailDisplay}</span>
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                  <ShieldCheck className="w-3 h-3" />
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
              <SecondaryButton onClick={handleCancelEdit}>
                <span>Hủy</span>
              </SecondaryButton>
            )}

            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors flex items-center gap-1.5 min-h-[38px]"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>

        </div>
      </div>

      {/* Information Form Card */}
      <div className="p-6 sm:p-8 auth-card space-y-6">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Thông tin cá nhân</span>
          </h2>
          <span className="text-xs font-mono text-[#64748b]">
            {isEditing ? 'Chế độ chỉnh sửa' : 'Chế độ xem'}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Field 1: Họ và tên đệm */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wider mb-1.5">
                Họ và tên đệm
              </label>
              {isEditing ? (
                <input
                  id="input-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="VD: Nguyễn Văn"
                  className="form-input w-full py-2 px-3 text-sm"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-[#131d31] border border-[#1e293b] text-sm text-[#f8fafc]">
                  {firstName || <span className="text-[#64748b] italic">Chưa nhập</span>}
                </div>
              )}
            </div>

            {/* Field 2: Tên */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wider mb-1.5">
                Tên
              </label>
              {isEditing ? (
                <input
                  id="input-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="VD: A"
                  className="form-input w-full py-2 px-3 text-sm"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-[#131d31] border border-[#1e293b] text-sm text-[#f8fafc]">
                  {lastName || <span className="text-[#64748b] italic">Chưa nhập</span>}
                </div>
              )}
            </div>

            {/* Field 3: Email */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="p-2.5 rounded-lg bg-[#090d16] border border-[#1e293b] text-sm text-[#64748b] font-mono flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{emailDisplay}</span>
              </div>
            </div>

            {/* Field 4: Số điện thoại */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wider mb-1.5">
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  id="input-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+84 912 345 678"
                  className="form-input w-full py-2 px-3 text-sm"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-[#131d31] border border-[#1e293b] text-sm text-[#f8fafc] flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{phone || <span className="text-[#64748b] italic">Chưa nhập</span>}</span>
                </div>
              )}
            </div>

          </div>

          {/* Field 5: Địa chỉ */}
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wider mb-1.5">
              Địa chỉ
            </label>
            {isEditing ? (
              <textarea
                id="input-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ"
                className="form-input w-full py-2 px-3 text-sm resize-none"
              />
            ) : (
              <div className="p-2.5 rounded-lg bg-[#131d31] border border-[#1e293b] text-sm text-[#f8fafc] flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>{address || <span className="text-[#64748b] italic">Chưa nhập</span>}</span>
              </div>
            )}
          </div>

          {/* Field 6: Bio */}
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wider mb-1.5">
              Giới thiệu bản thân (Bio)
            </label>
            {isEditing ? (
              <textarea
                id="input-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Nhập phần giới thiệu ngắn..."
                className="form-input w-full py-2 px-3 text-sm resize-none"
              />
            ) : (
              <div className="p-2.5 rounded-lg bg-[#131d31] border border-[#1e293b] text-sm text-[#f8fafc] flex items-start gap-2 leading-relaxed">
                <FileText className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>{bio || <span className="text-[#64748b] italic">Chưa nhập</span>}</span>
              </div>
            )}
          </div>

          {/* Edit action controls */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e293b]">
              <SecondaryButton onClick={handleCancelEdit}>
                Hủy
              </SecondaryButton>
              <PrimaryButton id="btn-submit-save-profile" type="submit" loading={saving} className="w-auto px-5">
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thông tin</span>
              </PrimaryButton>
            </div>
          )}

        </form>
      </div>

    </div>
  );
};
