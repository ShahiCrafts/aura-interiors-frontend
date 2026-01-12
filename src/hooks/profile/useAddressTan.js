import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../api/addressApi';

export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await getAllAddresses();
      return response.data;
    },
  });
};

export const useAddress = (id) => {
  return useQuery({
    queryKey: ['address', id],
    queryFn: async () => {
      const response = await getAddress(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createAddress'],
    mutationFn: async (data) => {
      try {
        const response = await createAddress(data);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateAddress'],
    mutationFn: async ({ id, data }) => {
      try {
        const response = await updateAddress(id, data);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteAddress'],
    mutationFn: async (id) => {
      try {
        const response = await deleteAddress(id);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['setDefaultAddress'],
    mutationFn: async (id) => {
      try {
        const response = await setDefaultAddress(id);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};
