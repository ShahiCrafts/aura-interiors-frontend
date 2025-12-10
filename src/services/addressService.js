import {
  getAllAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../store/api/addressApi';

export const getAllAddressesService = async () => {
  try {
    const response = await getAllAddresses();
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch addresses';
  }
};

export const getAddressService = async (id) => {
  try {
    const response = await getAddress(id);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch address';
  }
};

export const createAddressService = async (data) => {
  try {
    const response = await createAddress(data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create address';
  }
};

export const updateAddressService = async (id, data) => {
  try {
    const response = await updateAddress(id, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update address';
  }
};

export const deleteAddressService = async (id) => {
  try {
    const response = await deleteAddress(id);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete address';
  }
};

export const setDefaultAddressService = async (id) => {
  try {
    const response = await setDefaultAddress(id);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to set default address';
  }
};
