import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    subscribeNewsletter,
    unsubscribeNewsletter,
    getNewsletterSubscribers,
    sendTrendEmail,
    getNewsletterStats,
} from '../../api/newsletterApi';
import { toast } from 'react-toastify';
import { formatError } from '../../utils/errorHandler';

/**
 * Hook to subscribe to newsletter
 */
export const useNewsletterSubscribe = () => {
    return useMutation({
        mutationFn: (data) => subscribeNewsletter(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Successfully subscribed to newsletter!');
        },
        onError: (error) => {
            const message = formatError(error);
            toast.error(message);
        },
    });
};

/**
 * Hook to unsubscribe from newsletter
 */
export const useNewsletterUnsubscribe = () => {
    return useMutation({
        mutationFn: (email) => unsubscribeNewsletter(email),
        onSuccess: (data) => {
            toast.success(data.message || 'Successfully unsubscribed from newsletter');
        },
        onError: (error) => {
            const message = formatError(error);
            toast.error(message);
        },
    });
};

/**
 * Hook to get newsletter subscribers (Admin)
 */
export const useNewsletterSubscribers = (params) => {
    return useQuery({
        queryKey: ['newsletter-subscribers', params],
        queryFn: () => getNewsletterSubscribers(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Hook to send trend email (Admin)
 */
export const useSendTrendEmail = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => sendTrendEmail(data),
        onSuccess: (data) => {
            toast.success(`Email sent successfully to ${data.data.successful} subscribers`);
            queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
        },
        onError: (error) => {
            const message = formatError(error);
            toast.error(message);
        },
    });
};

/**
 * Hook to get newsletter statistics (Admin)
 */
export const useNewsletterStats = () => {
    return useQuery({
        queryKey: ['newsletter-stats'],
        queryFn: getNewsletterStats,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};
