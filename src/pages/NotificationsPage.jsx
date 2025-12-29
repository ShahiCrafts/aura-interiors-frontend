import { useState, useEffect } from "react";
import { Bell, Trash2, Archive, CheckCircle2, AlertCircle, Info } from "lucide-react";
import useAuthStore from "../store/authStore";
import Navbar from "../layouts/Navbar";
import NotificationService from "../services/notificationService";
import useNotificationSocket from "../hooks/useNotificationSocket";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  // Real-time updates
  const { unreadCount } = useNotificationSocket(
    localStorage.getItem("authToken"),
    user?._id
  );

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, selectedFilter = filter) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const isRead =
        selectedFilter === "unread" ? false : selectedFilter === "read" ? true : undefined;

      const data = await NotificationService.getNotifications(pageNum, 12, {
        isRead,
      });

      setNotifications(data.notifications);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setSelectedNotifications(new Set());
    } catch (err) {
      setError("Failed to load notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount and when filter changes
  useEffect(() => {
    fetchNotifications(1, filter);
  }, [filter]);

  // Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Mark multiple as read
  const handleMarkMultipleAsRead = async () => {
    if (selectedNotifications.size === 0) return;

    try {
      await NotificationService.markMultipleAsRead(Array.from(selectedNotifications));
      setNotifications(
        notifications.map((n) =>
          selectedNotifications.has(n._id) ? { ...n, isRead: true } : n
        )
      );
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Archive notification
  const handleArchive = async (id) => {
    try {
      await NotificationService.archiveNotification(id);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to archive:", err);
    }
  };

  // Toggle notification selection
  const toggleNotificationSelection = (id) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type, category) => {
    if (type === "orderCreated" || type === "orderStatusChanged") {
      return <Bell size={20} className="text-blue-500" />;
    }
    if (category === "warning") {
      return <AlertCircle size={20} className="text-amber-500" />;
    }
    if (category === "success") {
      return <CheckCircle2 size={20} className="text-green-500" />;
    }
    return <Info size={20} className="text-teal-500" />;
  };

  // Get category badge color
  const getCategoryBadgeColor = (category) => {
    const colors = {
      success: "bg-green-100 text-green-700",
      warning: "bg-amber-100 text-amber-700",
      error: "bg-red-100 text-red-700",
      info: "bg-blue-100 text-blue-700",
      system: "bg-neutral-100 text-neutral-700",
    };
    return colors[category] || colors.info;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getAvatarUrl = () => {
    if (user?.avatar) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
      const serverUrl = baseUrl.split("/api")[0];
      return `${serverUrl}/uploads/avatars/${user.avatar}`;
    }
    return null;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 pt-20 font-dm-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Notifications</h1>
                <p className="text-neutral-600">
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                    : "All notifications read"}
                </p>
              </div>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-100">
                <Bell size={32} className="text-teal-700" />
              </div>
            </div>

            {/* Filter and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-2">
                {["all", "unread", "read"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter === f
                        ? "bg-teal-700 text-white shadow-md"
                        : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              {selectedNotifications.size > 0 && (
                <button
                  onClick={handleMarkMultipleAsRead}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all"
                >
                  Mark {selectedNotifications.size} as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-200 mx-auto mb-4 animate-pulse"></div>
                <p className="text-neutral-600">Loading notifications...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
              <div className="flex justify-center mb-4">
                <Bell size={48} className="text-neutral-300" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No notifications</h3>
              <p className="text-neutral-600">
                {filter === "all"
                  ? "You're all caught up! Check back soon."
                  : `No ${filter} notifications yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white border border-neutral-100 rounded-xl p-4 sm:p-6 transition-all hover:shadow-md ${
                    !notification.isRead ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification._id)}
                        onChange={() => toggleNotificationSelection(notification._id)}
                        className="w-5 h-5 rounded border-neutral-300 text-teal-700 cursor-pointer"
                      />
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.category)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-neutral-900 text-sm sm:text-base mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-neutral-600 text-sm mb-3">
                            {notification.description}
                          </p>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryBadgeColor(
                                notification.category
                              )}`}
                            >
                              {notification.category}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {new Date(notification.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {!notification.isRead && (
                              <span className="text-xs font-semibold text-blue-600">Unread</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-all"
                          title="Mark as read"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleArchive(notification._id)}
                        className="p-2 rounded-lg hover:bg-neutral-200 text-neutral-600 transition-all"
                        title="Archive"
                      >
                        <Archive size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => fetchNotifications(page - 1, filter)}
                disabled={page === 1}
                className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 font-medium text-sm"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchNotifications(pageNum, filter)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                        page === pageNum
                          ? "bg-teal-700 text-white"
                          : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => fetchNotifications(page + 1, filter)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 font-medium text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
