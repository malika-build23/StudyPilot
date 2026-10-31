import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import SemesterSelect from '../components/common/SemesterSelect';
import { GoogleLogo } from '../components/auth/GoogleSignInButton';
import { getAvatarUrl } from '../utils/avatar';
import {
  Mail,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ShieldCheck,
  GraduationCap,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';

const ProfilePage = () => {
  const { updateProfile, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [nameInput, setNameInput] = useState('');
  const [semesterInput, setSemesterInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile();
      if (res.data?.success) {
        setProfileData(res.data.data);
        setNameInput(res.data.data.name || '');
        setSemesterInput(res.data.data.semester || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrorMessage('Could not load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file size must be less than 5MB.');
      return;
    }

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setErrorMessage('');
    setSuccessMessage('');
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await userAPI.uploadAvatar(formData);
      if (res.data?.success && res.data?.data) {
        const newAvatar = res.data.data.avatar;
        setProfileData((prev) => ({ ...prev, avatar: newAvatar }));
        updateUser({ avatar: newAvatar });
        setAvatarPreview(null);
        setSuccessMessage('Profile picture uploaded and updated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(res.data?.message || 'Failed to upload profile picture.');
        setAvatarPreview(null);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to upload profile picture. Please try again.'
      );
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profileData?.avatar && !avatarPreview) return;

    setErrorMessage('');
    setSuccessMessage('');
    setUploadingAvatar(true);

    try {
      const res = await userAPI.updateProfile({ avatar: '' });
      if (res.data?.success) {
        setProfileData((prev) => ({ ...prev, avatar: '' }));
        setAvatarPreview(null);
        updateUser({ avatar: '' });
        setSuccessMessage('Profile picture removed.');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage('Failed to remove profile picture.');
      }
    } catch (err) {
      console.error('Error removing avatar:', err);
      setErrorMessage('Failed to remove profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsUpdating(true);

    const result = await updateProfile({
      name: nameInput.trim(),
      semester: semesterInput.trim(),
    });
    setIsUpdating(false);

    if (result.success) {
      setProfileData((prev) => ({
        ...prev,
        name: result.data.name,
        semester: result.data.semester,
      }));
      setSuccessMessage('Student profile details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(result.error || 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Loading profile credentials...</p>
      </div>
    );
  }

  const currentAvatar = avatarPreview || getAvatarUrl(profileData?.avatar);
  const isGoogleAvatar =
    Boolean(profileData?.avatar) &&
    (profileData.avatar.includes('googleusercontent.com') || profileData.isGoogleUser);

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-150">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Student Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your account information, profile picture, and academic credentials.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100">
          {/* Avatar Container with Hover Overlay & Quick Actions */}
          <div className="relative group shrink-0 self-start sm:self-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shadow-blue-500/20 border-2 border-white ring-2 ring-slate-100">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={profileData?.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'S'}</span>
              )}
            </div>

            {/* Hover Camera Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs disabled:pointer-events-none"
              title="Click to change profile picture"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  <Camera className="w-6 h-6 mb-1 text-white" />
                  <span className="text-[10px] font-semibold">Change</span>
                </>
              )}
            </button>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileSelect}
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {profileData?.name || 'Student'}
              </h3>
              {profileData?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1 transition-colors"
                  title="Remove current profile picture"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{profileData?.email}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Student
              </span>

              {isGoogleAvatar && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  <GoogleLogo className="w-3 h-3" />
                  Google Profile Photo
                </span>
              )}

              {profileData?.semester && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {profileData.semester}
                </span>
              )}

              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined{' '}
                {profileData?.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Recently'}
              </span>
            </div>

            {/* Quick Upload Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{uploadingAvatar ? 'Uploading Photo...' : 'Upload New Photo'}</span>
              </button>
              <span className="text-[11px] text-slate-400">JPG, PNG, WebP up to 5MB</span>
            </div>
          </div>
        </div>

        {/* Account Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Subjects</p>
              <p className="text-lg font-extrabold text-slate-900">
                {profileData?.totalSubjects ?? 0} courses
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Academic Semester</p>
              <p className="text-lg font-extrabold text-slate-900">
                {profileData?.semester || 'Not Selected'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Name & Semester Form */}
        <div className="pt-6">
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Update Student Information
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Change your display name and academic semester across StudyPilot AI.
          </p>

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 transition-all outline-none"
              />
            </div>

            <SemesterSelect
              value={semesterInput}
              onChange={setSemesterInput}
              label="Academic Semester / Level"
              helperText="Select your active semester or choose Other for custom degrees and terms."
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Permanent ID)
              </label>
              <input
                type="email"
                disabled
                value={profileData?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500 cursor-not-allowed outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Your email is used to securely authenticate your account and isolate your subjects.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isUpdating ||
                  (nameInput.trim() === (profileData?.name || '') &&
                    semesterInput.trim() === (profileData?.semester || ''))
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs shadow-blue-500/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
