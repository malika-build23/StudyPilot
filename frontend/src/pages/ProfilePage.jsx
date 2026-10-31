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
  Sparkles,
} from 'lucide-react';
import studentDeskImg from '../assets/illustrations/student_desk_dashboard.jpg';

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
        <Loader2 className="w-8 h-8 animate-spin text-[#2D4354]" />
        <p className="text-xs text-[#73766A] font-medium">Loading profile credentials...</p>
      </div>
    );
  }

  const currentAvatar = avatarPreview || getAvatarUrl(profileData?.avatar);
  const isGoogleAvatar =
    Boolean(profileData?.avatar) &&
    (profileData.avatar.includes('googleusercontent.com') || profileData.isGoogleUser);

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-150">
      {/* Academic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2D4354] via-[#534145] to-[#73766A] text-white p-6 sm:p-8 shadow-sm">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#FED7A5]/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-28 w-36 h-36 rounded-full bg-[#9E6752]/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FED7A5]/20 text-[#FED7A5] border border-[#FED7A5]/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Academic Identity
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Student Profile
            </h2>
            <p className="text-xs sm:text-sm text-[#F1F0ED]/90 mt-1.5 leading-relaxed">
              Review your account information, profile picture, and academic credentials across StudyPilot AI.
            </p>
          </div>

          <div className="hidden sm:block shrink-0 relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md transform hover:scale-105 transition-transform animate-float-gentle">
              <img
                src={studentDeskImg}
                alt="Student Desk"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#FED7A5] text-[#20212B] flex items-center justify-center text-[10px] shadow-sm animate-twinkle">
              ★
            </div>
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F1F0ED] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-[#F1F0ED]">
          {/* Avatar Container with Gradient Ring & Quick Actions */}
          <div className="relative group shrink-0 self-start sm:self-center">
            <div className="p-1 rounded-2xl bg-gradient-to-tr from-[#2D4354] via-[#FED7A5] to-[#9E6752] shadow-md shadow-[#2D4354]/15">
              <div className="w-24 h-24 rounded-[14px] overflow-hidden bg-[#2D4354] text-white flex items-center justify-center text-3xl font-extrabold">
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
            </div>

            {/* Hover Camera Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-1 rounded-[14px] bg-[#20212B]/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs disabled:pointer-events-none"
              title="Click to change profile picture"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#FED7A5]" />
              ) : (
                <>
                  <Camera className="w-6 h-6 mb-1 text-[#FED7A5]" />
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
              <h3 className="text-xl sm:text-2xl font-bold text-[#20212B] truncate">
                {profileData?.name || 'Student'}
              </h3>
              {profileData?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="text-xs text-[#9E6752] hover:text-[#534145] hover:bg-[#FFF7EC] px-2.5 py-1 rounded-lg border border-[#9E6752]/30 flex items-center gap-1 transition-colors"
                  title="Remove current profile picture"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#73766A] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#73766A]/70 shrink-0" />
              <span className="truncate">{profileData?.email}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D4354] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#2D4354]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Student
              </span>

              {isGoogleAvatar && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#73766A] bg-[#F1F0ED] px-2.5 py-0.5 rounded-full border border-[#73766A]/20">
                  <GoogleLogo className="w-3 h-3" />
                  Google Profile Photo
                </span>
              )}

              {profileData?.semester && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9E6752] bg-[#FFF7EC] px-2.5 py-0.5 rounded-full border border-[#FED7A5]">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {profileData.semester}
                </span>
              )}

              <span className="text-[11px] text-[#73766A] flex items-center gap-1">
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#73766A]/25 hover:border-[#2D4354] bg-[#FAF8F5] hover:bg-white text-[#2D4354] text-xs font-semibold shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D4354]" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[#73766A]" />
                )}
                <span>{uploadingAvatar ? 'Uploading Photo...' : 'Upload New Photo'}</span>
              </button>
              <span className="text-[11px] text-[#73766A]">JPG, PNG, WebP up to 5MB</span>
            </div>
          </div>
        </div>

        {/* Account Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-[#F1F0ED]">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1F0ED] hover:border-[#FED7A5] hover:shadow-xs transition-all flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#2D4354]/10 text-[#2D4354] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#73766A] font-medium">Total Subjects</p>
              <p className="text-lg font-extrabold text-[#20212B]">
                {profileData?.totalSubjects ?? 0} courses
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1F0ED] hover:border-[#FED7A5] hover:shadow-xs transition-all flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#9E6752]/10 text-[#9E6752] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#73766A] font-medium">Academic Semester</p>
              <p className="text-lg font-extrabold text-[#20212B]">
                {profileData?.semester || 'Not Selected'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Name & Semester Form */}
        <div className="pt-6">
          <h4 className="text-sm font-bold text-[#20212B] mb-1">
            Update Student Information
          </h4>
          <p className="text-xs text-[#73766A] mb-4">
            Change your display name and academic semester across StudyPilot AI.
          </p>

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#FFF7EC] border border-[#FED7A5] text-[#2D4354] text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D4354]" />
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
              <label className="block text-xs font-bold text-[#20212B] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F1F0ED] bg-[#FAF8F5]/60 focus:bg-white focus:border-[#2D4354] focus:ring-2 focus:ring-[#2D4354]/15 text-sm text-[#20212B] transition-all outline-none"
              />
            </div>

            <SemesterSelect
              value={semesterInput}
              onChange={setSemesterInput}
              label="Academic Semester / Level"
              helperText="Select your active semester or choose Other for custom degrees and terms."
            />

            <div>
              <label className="block text-xs font-bold text-[#20212B] uppercase tracking-wider mb-1.5">
                Email Address (Permanent ID)
              </label>
              <input
                type="email"
                disabled
                value={profileData?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-[#F1F0ED] bg-[#F1F0ED]/70 text-sm text-[#73766A] cursor-not-allowed outline-none"
              />
              <p className="text-[11px] text-[#73766A] mt-1">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#2D4354]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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
