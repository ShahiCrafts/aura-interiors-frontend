import {
  getProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
} from '../store/api/profileApi';

export const getProfileService = async () => {
  try {
    const response = await getProfile();
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch profile';
  }
};

export const updateProfileService = async (data) => {
  try {
    const response = await updateProfile(data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};

export const updateAvatarService = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await updateAvatar(formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update avatar';
  }
};

export const removeAvatarService = async () => {
  try {
    const response = await removeAvatar();
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to remove avatar';
  }
};
