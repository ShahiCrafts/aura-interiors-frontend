import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllAddressesService,
  getAddressService,
  createAddressService,
  updateAddressService,
  deleteAddressService,
  setDefaultAddressService,
} from '../services/addressService';

export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: getAllAddressesService,
  });
};

export const useAddress = (id) => {
  return useQuery({
    queryKey: ['address', id],
    queryFn: () => getAddressService(id),
    enabled: !!id,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createAddress'],
    mutationFn: createAddressService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateAddress'],
    mutationFn: ({ id, data }) => updateAddressService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteAddress'],
    mutationFn: deleteAddressService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['setDefaultAddress'],
    mutationFn: setDefaultAddressService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};
