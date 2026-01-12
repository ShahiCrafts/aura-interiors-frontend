import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userApi from "../../api/userApi";

const USER_KEYS = {
    all: ["users"],
    list: (params) => [...USER_KEYS.all, "list", params],
    detail: (id) => [...USER_KEYS.all, "detail", id],
};

// Admin: Get all users
export const useUsers = (params = {}) => {
    return useQuery({
        queryKey: USER_KEYS.list(params),
        queryFn: () => userApi.getAll(params),
    });
};

// Admin: Get single user
export const useUser = (id, options = {}) => {
    return useQuery({
        queryKey: USER_KEYS.detail(id),
        queryFn: () => userApi.getById(id),
        enabled: !!id,
        ...options,
    });
};

// Admin: Update user status
export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive, reason }) => userApi.updateStatus(id, isActive, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
            queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(id) });
        },
    });
};

// Admin: Delete user
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => userApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
        },
    });
};

// Admin: Reset user password
export const useAdminResetPassword = () => {
    return useMutation({
        mutationFn: ({ id, password }) => userApi.resetPassword(id, password),
    });
};
