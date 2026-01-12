import { useQuery } from '@tanstack/react-query';
import analyticsApi from '../../api/analyticsApi';

export const ANALYTICS_KEYS = {
    all: ['analytics'],
    stats: () => [...ANALYTICS_KEYS.all, 'stats'],
    revenue: (days) => [...ANALYTICS_KEYS.all, 'revenue', { days }],
    categories: () => [...ANALYTICS_KEYS.all, 'categories'],
    topProducts: () => [...ANALYTICS_KEYS.all, 'top-products'],
    salesReports: (range) => [...ANALYTICS_KEYS.all, 'sales-reports', { range }],
};

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ANALYTICS_KEYS.stats(),
        queryFn: analyticsApi.getStats,
    });
};

export const useRevenueAnalytics = (days = 30) => {
    return useQuery({
        queryKey: ANALYTICS_KEYS.revenue(days),
        queryFn: () => analyticsApi.getRevenue(days),
    });
};

export const useCategorySales = () => {
    return useQuery({
        queryKey: ANALYTICS_KEYS.categories(),
        queryFn: analyticsApi.getCategories,
    });
};

export const useTopProducts = () => {
    return useQuery({
        queryKey: ANALYTICS_KEYS.topProducts(),
        queryFn: analyticsApi.getTopProducts,
    });
};

export const useSalesReports = (range = 'month') => {
    return useQuery({
        queryKey: ANALYTICS_KEYS.salesReports(range),
        queryFn: () => analyticsApi.getSalesReports(range),
    });
};
