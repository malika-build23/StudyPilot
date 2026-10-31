/**
 * Resolves avatar image URLs across development and production
 * Handles Google profile pictures, relative upload paths, and backend base URL
 * @param {string} avatar
 * @returns {string} Fully resolved image URL
 */
export const getAvatarUrl = (avatar) => {
  if (!avatar || typeof avatar !== 'string') return '';

  // Already a full URL (e.g. Google profile picture or Supabase)
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('blob:')) {
    return avatar;
  }

  // Relative uploaded file path (e.g. /uploads/avatars/...)
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const backendBase = apiUrl ? apiUrl.replace(/\/api\/?$/, '') : '';

  return `${backendBase}${avatar}`;
};
