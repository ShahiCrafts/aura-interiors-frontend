import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProductTan';
import { useCategories } from '../../hooks/useCategoryTan';
import { useAllOrders } from '../../hooks/useOrderTan';

export default function Dashboard() {
  const { data: productsData } = useProducts({ limit: 5 });
  const { data: categoriesData } = useCategories();
  const { data: ordersData } = useAllOrders({ limit: 1 }); // Only need 1 order since we use stats

  const products = productsData?.data?.products || [];
  const totalProducts = productsData?.data?.pagination?.total || 0;
  const categories = categoriesData?.data?.categories || [];
  const totalOrders = ordersData?.data?.pagination?.total || 0;
  const totalRevenue = ordersData?.data?.stats?.totalRevenue || 0;

  // Format revenue display
  const formatRevenue = (amount) => {
    if (amount >= 100000) {
      return `NRs. ${(amount / 100000).toFixed(1)}L`; // Lakhs
    } else if (amount >= 1000) {
      return `NRs. ${(amount / 1000).toFixed(0)}K`;
    }
    return `NRs. ${amount.toLocaleString()}`;
  };

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Categories',
      value: categories.length,
      change: '+3%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-emerald-500',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      change: '+15%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Revenue',
      value: formatRevenue(totalRevenue),
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link
              to="/admin/products"
              className="text-sm text-[#025E5D] font-medium flex items-center gap-1 hover:underline"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                  </div>
                  <p className="font-semibold text-gray-900">NRs. {product.price?.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No products yet</p>
            )}
          </div>
        </div>

        {/* Categories Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <Link
              to="/admin/categories"
              className="text-sm text-[#025E5D] font-medium flex items-center gap-1 hover:underline"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {categories.length > 0 ? (
              categories.slice(0, 5).map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#025E5D]/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#025E5D]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.productCount || 0} products</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    category.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No categories yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/products"
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Package className="w-6 h-6 text-[#025E5D]" />
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </Link>
          <Link
            to="/admin/categories"
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-[#025E5D]" />
            <span className="text-sm font-medium text-gray-700">Add Category</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Users className="w-6 h-6 text-[#025E5D]" />
            <span className="text-sm font-medium text-gray-700">View Orders</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-[#025E5D]" />
            <span className="text-sm font-medium text-gray-700">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
