import { useState, useRef } from 'react';
import { User, Phone, Building2, Lock, Save, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ROLE_BADGE = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  bda: 'bg-blue-100 text-blue-700',
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwForm((p) => ({ ...p, [k]: v }));

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // Handle avatar file selection — convert to base64 and preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  // Save profile (including avatar as base64)
  const handleSaveProfile = async () => {
  if (!form.name) return toast.error('Name is required');
  setSaving(true);
  try {
    const payload = { ...form };

    if (avatarFile) {
      // Compress image using canvas before saving
      const compressed = await compressImage(avatarFile, 200, 200, 0.7);
      payload.avatar = compressed;
    } else if (avatar === null) {
      payload.avatar = null;
    }

    await api.put('/auth/profile', payload);
    updateUser({ ...user, ...payload });
    toast.success('Profile updated!');
    setAvatarFile(null);
  } catch (err) {
    console.error(err);
    toast.error('Failed to update profile');
  } finally {
    setSaving(false);
  }
};

// Add this helper function inside the component above handleSaveProfile
  const compressImage = (file, maxWidth, maxHeight, quality) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
        } else {
          if (height > maxHeight) { width = (width * maxHeight) / height; height = maxHeight; }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('All fields required');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500">Manage your personal information and password</p>
      </div>

      {/* Avatar & Role */}
      <div className="card p-6 flex items-center gap-5">
        {/* Avatar with upload button */}
        <div className="relative flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          {/* Camera button overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <Camera size={14} className="text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className={`badge mt-1 capitalize ${ROLE_BADGE[user?.role]}`}>{user?.role}</span>
          {avatarFile && (
            <p className="text-xs text-indigo-600 mt-1 font-medium">
              ✓ New photo selected — click Save Changes to apply
            </p>
          )}
        </div>

        {/* Remove photo button */}
        {avatar && (
          <button
            onClick={() => { setAvatar(null); setAvatarFile(null); }}
            className="text-xs text-red-400 hover:text-red-600 underline self-start"
          >
            Remove photo
          </button>
        )}
      </div>

      {/* Edit Profile */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <User size={14} /> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="9876543210"
            />
          </div>
          <div>
            <label className="label">Department</label>
            <input
              className="input"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
              placeholder="Sales"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input bg-gray-50 text-gray-400 cursor-not-allowed"
              value={user?.email}
              disabled
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <Lock size={14} /> Change Password
        </h3>
        <div className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              className="input"
              value={pwForm.currentPassword}
              onChange={(e) => setPw('currentPassword', e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              className="input"
              value={pwForm.newPassword}
              onChange={(e) => setPw('newPassword', e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={pwForm.confirmPassword}
              onChange={(e) => setPw('confirmPassword', e.target.value)}
              placeholder="Repeat new password"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleChangePassword} disabled={savingPw} className="btn-primary">
            {savingPw ? 'Updating...' : <><CheckCircle size={14} /> Update Password</>}
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Account Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize text-gray-800">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Department</span>
            <span className="font-medium text-gray-800">{user?.department || '—'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Monthly Target</span>
            <span className="font-medium text-indigo-600">
              ₹{user?.target ? (user.target / 100000).toFixed(1) + 'L' : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}