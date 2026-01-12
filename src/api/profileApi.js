import api from './index';

export const getProfile = () => api.get('/profile');

export const updateProfile = (data) => api.patch('/profile', data);

export const updateAvatar = (formData) =>
    api.patch('/profile/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

export const removeAvatar = () => api.delete('/profile/avatar');
