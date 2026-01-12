import { Loader2, Download, DollarSign, ShoppingBag, Box, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDashboardStats, useRevenueAnalytics, useCategorySales, useTopProducts } from '../../hooks/admin/useAnalyticsTan';
import { useAllOrders } from '../../hooks/order/useOrderTan';

// Extracted Components
import StatCard from '../../components/admin/dashboard/StatCard';
import RevenueChart from '../../components/admin/dashboard/RevenueChart';
import CategorySalesChart from '../../components/admin/dashboard/CategorySalesChart';
import TopProductsTable from '../../components/admin/dashboard/TopProductsTable';
import RecentOrdersTable from '../../components/admin/dashboard/RecentOrdersTable';

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics(30);
  const { data: categoryData, isLoading: categoryLoading } = useCategorySales();
  const { data: topProductsData, isLoading: productsLoading } = useTopProducts();
  const { data: recentOrdersData, isLoading: ordersLoading } = useAllOrders({ limit: 5 });

  const stats = statsData?.data || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  };

  const chartData = revenueData?.data?.chartData || [];
  const pieData = categoryData?.data?.salesByCategory || [];
  const topProducts = topProductsData?.data?.topProducts || [];
  const recentOrders = recentOrdersData?.data?.orders || [];

  const handleDownloadReport = () => {
    try {
      const overviewData = [
        { Metric: 'Net Revenue', Value: stats.totalRevenue },
        { Metric: 'Total Orders', Value: stats.totalOrders },
        { Metric: 'Total Products', Value: stats.totalProducts },
        { Metric: 'Total Customers', Value: stats.totalUsers },
      ];

      const productsData = topProducts.map(p => ({
        Name: p.name,
        Deals: p.sales,
        'Total Value': p.revenue,
      }));

      const ordersData = recentOrders.map(o => ({
        'Order ID': o.orderId,
        Customer: o.user?.fullName || o.guestInfo?.firstName || 'Guest',
        Status: o.orderStatus,
        Total: o.total,
        Date: new Date(o.createdAt).toLocaleDateString(),
      }));

      const wb = XLSX.utils.book_new();
      const wsOverview = XLSX.utils.json_to_sheet(overviewData);
      const wsProducts = XLSX.utils.json_to_sheet(productsData);
      const wsOrders = XLSX.utils.json_to_sheet(ordersData);

      XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');
      XLSX.utils.book_append_sheet(wb, wsProducts, 'Top Products');
      XLSX.utils.book_append_sheet(wb, wsOrders, 'Recent Orders');

      const fileName = `Aura_Interiors_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const formatRevenue = (amount) => {
    if (amount >= 100000) {
      return `NRs. ${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `NRs. ${(amount / 1000).toFixed(0)}K`;
    }
    return `NRs. ${amount.toLocaleString()}`;
  };

  const statCards = [
    {
      label: 'Net Revenue',
      value: formatRevenue(stats.totalRevenue),
      trend: '+0.4%',
      trendUp: true,
      trendLabel: 'vs last month',
      icon: DollarSign,
      color: 'emerald'
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      trend: '+32%',
      trendUp: true,
      trendLabel: 'vs last quarter',
      icon: ShoppingBag,
      color: 'blue'
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      trend: '71%',
      trendUp: true,
      trendLabel: 'Goal: 100',
      icon: Box,
      color: 'orange'
    },
    {
      label: 'Customers',
      value: stats.totalUsers.toLocaleString(),
      trend: '+11%',
      trendUp: true,
      trendLabel: 'vs last quarter',
      icon: Users,
      color: 'purple'
    },
  ];

  if (statsLoading || revenueLoading || categoryLoading || productsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!statsData || !revenueData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <p>Failed to load dashboard data.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={chartData} />
        <CategorySalesChart data={pieData} />
      </div>

      {/* Bottom Section: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsTable products={topProducts} />
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </div>
  );
}
