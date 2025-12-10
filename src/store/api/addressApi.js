import api from '../../store/api/api';

export const getAllAddresses = () => api.get('/addresses');
export const getAddress = (id) => api.get(`/addresses/${id}`);
export const createAddress = (data) => api.post('/addresses', data);
export const updateAddress = (id, data) => api.patch(`/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);
export const setDefaultAddress = (id) => api.patch(`/addresses/${id}/set-default`);
