import React, { useState, useEffect, useRef } from "react";
import { Bell, BellRing } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import useAdminNotificationSocket from "../../hooks/admin/useAdminNotificationSocket";
import notificationApi from "../../api/notificationApi";

const NotificationBell = ({ user, token }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef(null);

  const {
    adminNotifications,
    unreadAdminCount,
    setAdminNotifications,
    setUnreadAdminCount,
  } = useAdminNotificationSocket(token, user?._id, user?.role);

  // Log whenever notifications or unread count changes
  useEffect(() => {
  }, [adminNotifications, unreadAdminCount]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications(1, 10);

      const fetchedList = response?.data?.notifications || response?.notifications || [];

      setAdminNotifications(fetchedList);

      const unread = Array.isArray(fetchedList) ? fetchedList.filter((n) => !n.isRead).length : 0;
      setUnreadAdminCount(unread);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDropdown) fetchNotifications();
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setShowDropdown(false);
    };
    if (showDropdown)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setAdminNotifications((prev) =>
        prev.map((n) =>
          n._id === id || n.id === id ? { ...n, isRead: true } : n
        )
      );
      setUnreadAdminCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
    }
  };

  return (
    <div className="relative inline-flex" ref={bellRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${showDropdown
          ? "bg-slate-100 text-slate-900"
          : "bg-transparent text-slate-500 hover:bg-slate-50"
          }`}
      >
        {unreadAdminCount > 0 ? (
          <BellRing className="w-5 h-5 text-red-600" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadAdminCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1.5 items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-white">
            {unreadAdminCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 z-50 min-w-[320px] sm:min-w-[380px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden origin-top-right">
          <NotificationDropdown
            notifications={adminNotifications}
            loading={loading}
            unreadCount={unreadAdminCount}
            onNotificationClick={(n) => {
              console.log("🖱️ [NotificationBell] Clicked notification:", n);
              if (!n.isRead) handleMarkAsRead(n._id || n.id);
              if (n.actionUrl) window.location.href = n.actionUrl;
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
