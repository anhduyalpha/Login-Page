import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  Lock,
  Loader2,
  Camera
} from 'lucide-react';

export const ProfilePage = () => {
  const { currentUser, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile Form States
  const [firstName, setFirstName] = useState(currentUser?.firstName || 'Nguyễn Văn');
  const [lastName, setLastName] = useState(currentUser?.lastName || 'A');
  const [phone, setPhone] = useState(currentUser?.phone || '+84 912 345 678');
  const [address, setAddress] = useState(currentUser?.address || 'Tầng 12, Tòa nhà Bitexco Financial Tower, Quận 1, TP. Hồ Chí Minh');
  const [avatarIndex, setAvatarIndex] = useState(0);

  // Avatar preset gradients
  const avatarGradients = [
    'from-cyan-500 via-blue-600 to-violet-600',
    'from-emerald-400 via-teal-600 to-cyan-700',
    'from-amber-400 via-orange-500 to-red-600',
    'from-purple-500 via-pink-500 to-rose-600'
  ];

  const usernameDisplay = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'baochinhvus';
  const emailDisplay = currentUser?.email || 'baochinhvus@gmail.com';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        phone,
        address
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(currentUser?.firstName || 'Nguyễn Văn');
    setLastName(currentUser?.lastName || 'A');
    setPhone(currentUser?.phone || '+84 912 345 678');
    setAddress(currentUser?.address || 'Tầng 12, Tòa nhà Bitexco Financial Tower, Quận 1, TP. Hồ Chí Minh');
    setIsEditing(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* 1. Hero Profile Header Card */}
        <div className="relative w-full rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* User Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative group">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr ${avatarGradients[avatarIndex]} p-[3px] shadow-xl shadow-cyan-500/20`}>
                  <div className="w-full h-full bg-[#0b0f17] rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-widest uppercase">
                      {usernameDisplay.slice(0, 2)}
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => setAvatarIndex((avatarIndex + 1) % avatarGradients.length)}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-cyan-500 text-white shadow-lg hover:scale-110 transition-transform"
                    aria-label="Đổi màu đại diện"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold font-heading text-white tracking-tight">
                  {usernameDisplay}
                </h1>
                <p className="text-xs font-mono text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{emailDisplay}</span>
                </p>
                <div className="pt-1 flex items-center justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Tài khoản đã xác thực
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Action Button */}
            <div>
              {!isEditing ? (
                <button
                  id="btn-edit-profile"
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="btn-secondary px-4 py-2 rounded-xl text-xs font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    id="btn-save-profile"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Lưu</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 2. Personal Information Card */}
        <div className="w-full rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Thông tin cá nhân</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {isEditing ? 'Đang chỉnh sửa' : 'Chế độ xem'}
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Field 1: Họ và tên đệm */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                  Họ và tên đệm
                </label>
                {isEditing ? (
                  <input
                    id="input-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="VD: Nguyễn Văn"
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-surface/80 border border-white/5 text-sm text-slate-200 font-medium">
                    {firstName || <span className="text-slate-500 italic">VD: Nguyễn Văn</span>}
                  </div>
                )}
              </div>

              {/* Field 2: Tên */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                  Tên
                </label>
                {isEditing ? (
                  <input
                    id="input-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="VD: A"
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-surface/80 border border-white/5 text-sm text-slate-200 font-medium">
                    {lastName || <span className="text-slate-500 italic">VD: A</span>}
                  </div>
                )}
              </div>

              {/* Field 3: Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Email</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Cố định
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={emailDisplay}
                    className="glass-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm opacity-70 cursor-not-allowed bg-slate-900/60"
                  />
                </div>
              </div>

              {/* Field 4: Số điện thoại */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="input-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+84 912 345 678"
                      className="glass-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-surface/80 border border-white/5 text-sm text-slate-200 font-mono flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>{phone || <span className="text-slate-500 italic">+84 912 345 678</span>}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Field 5: Địa chỉ */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                Địa chỉ
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    id="input-address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ của bạn"
                    className="glass-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm resize-none"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface/80 border border-white/5 text-sm text-slate-200 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>{address || <span className="text-slate-500 italic">Nhập địa chỉ của bạn</span>}</span>
                </div>
              )}
            </div>

            {/* Save / Cancel Action bar when editing */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary px-4 py-2 rounded-xl text-xs font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  id="btn-submit-save-profile"
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Lưu thông tin</span>
                </button>
              </div>
            )}

          </form>
        </div>

      </div>
    </div>
  );
};
