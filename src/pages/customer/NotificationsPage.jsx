import { useState, useEffect } from "react";
import {
  Bell,
  Trash2,
  Check,
  Box,
  Percent,
  Palette,
  Info,
  Settings,
  ChevronRight,
  Package,
  Clock,
  CheckCheck
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import Navbar from "../../layouts/customer/Navbar";
import notificationApi from "../../api/notificationApi";
import useNotificationSocket from "../../hooks/notification/useNotificationSocket";
import { Link } from "react-router-dom";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all"); // all, unread, orders, promos, designs, system

  // Real-time updates
  const { unreadCount } = useNotificationSocket(
    localStorage.getItem("authToken"),
    user?._id
  );

  const fetchNotifications = async (pageNum = 1) => {
    if (!user) return;
    setLoading(true);
    try {
      // Map UI filters to backend params if needed, or filter client side if backend doesn't support specific 'category' well yet.
      // Assuming backend supports 'category' or we fetch all and filter.
      // For now, let's pass 'isRead' for unread filter, and everything else we might need to handle.

      let params = { page: pageNum, limit: 20 };
      if (filter === "unread") params.isRead = false;
      // if (filter !== 'all' && filter !== 'unread') params.category = filter; // If backend supports it

      const response = await notificationApi.getNotifications(params.page, params.limit, {
        isRead: params.isRead
      });

      // FIX: handle API response structure correctly
      const fetchedList = response?.data?.notifications || response?.notifications || [];
      const pagination = response?.data?.pagination || response?.pagination || {};

      setNotifications(fetchedList);
      setPage(pagination.page || 1);
      setTotalPages(pagination.totalPages || 1);

    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [filter]); // In a real app with backend filtering, this dep makes sense.

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Logic for marking all visible or all in DB
      const ids = notifications.filter(n => !n.isRead).map(n => n._id);
      if (ids.length === 0) return;

      await notificationApi.markMultipleAsRead(ids);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.archiveNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // Helper: Get Icon based on type/category
  const getIcon = (type, category) => {
    // Map backend types/categories to UI icons
    if (type?.includes("order") || category === "order") return <Box className="w-5 h-5 text-blue-600" />;
    if (type?.includes("promo") || category === "promotion") return <Percent className="w-5 h-5 text-emerald-600" />;
    if (category === "design") return <Palette className="w-5 h-5 text-purple-600" />;
    if (type === "system") return <Settings className="w-5 h-5 text-gray-600" />;

    // Default fallback
    return <Package className="w-5 h-5 text-teal-600" />;
  };

  const getIconBg = (type, category) => {
    if (type?.includes("order") || category === "order") return "bg-blue-50";
    if (type?.includes("promo") || category === "promotion") return "bg-emerald-50";
    if (category === "design") return "bg-purple-50";
    if (type === "system") return "bg-gray-50";
    return "bg-teal-50";
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    // Simple client-side filtering for demo if backend param isn't strictly ready
    if (filter === 'orders') return n.type?.includes('order') || n.category === 'order';
    if (filter === 'promos') return n.type?.includes('promo') || n.category === 'promotion';
    if (filter === 'designs') return n.category === 'design';
    if (filter === 'system') return n.type === 'system';
    return true;
  });

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  // Filter Tabs
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'orders', label: 'Orders' },
    { id: 'promos', label: 'Promos' },
    { id: 'designs', label: 'Designs' },
    { id: 'system', label: 'System' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 font-dm-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Your <span className="text-teal-700 italic">Notifications</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">Stay updated with orders, offers, and more</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.id
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {f.label}
                {f.count > 0 && (
                  <span className={`flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] ${filter === f.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                    }`}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-500">Loading your updates...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No notifications found</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                  {filter === 'all'
                    ? "You haven't received any notifications yet. We'll alert you when something happens!"
                    : `No ${filter} notifications found at the moment.`}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n._id}
                  className={`group relative flex gap-4 p-5 rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md`}
                >
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg(n.type, n.category)}`}>
                    {getIcon(n.type, n.category)}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-4 mb-0.5">
                      <div className="flex items-center gap-2 pr-8">
                        <h3 className={`text-base text-gray-900 ${!n.isRead ? 'font-bold' : 'font-medium'}`}>
                          {n.title}
                        </h3>
                        {!n.isRead && (
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" />
                        )}
                      </div>

                      <div className="hidden sm:flex items-center gap-2">
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(n._id)}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-3 pr-4">
                      {n.message || n.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeAgo(n.createdAt)}
                      </span>
                      {(n.actionUrl || n.data?.orderId) && (
                        <Link
                          to={n.actionUrl || `/profile/orders/${n.data?.orderId}`}
                          className="flex items-center gap-1 text-teal-600 hover:text-teal-700 hover:underline"
                        >
                          View details <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 sm:hidden flex flex-col gap-2">
                    <button
                      onClick={() => handleDelete(n._id)}
                      className="text-gray-400 hover:text-red-500 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More / Pagination (Simple implementation) */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <button
                disabled={page >= totalPages}
                onClick={() => fetchNotifications(page + 1)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Load More Notifications
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
