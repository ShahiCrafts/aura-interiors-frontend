import React, { useState, useEffect, useRef } from "react";
import NotificationService from "../../services/notificationService";
import useNotificationSocket from "../../hooks/useNotificationSocket";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = ({ user, token }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const bellRef = useRef(null);

  const { connected, unreadCount, subscribeTopic, markAsReadSocket } =
    useNotificationSocket(token, user?._id);

  const fetchNotifications = async (pageNum = 1) => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await NotificationService.getNotifications(pageNum, 10);
      setNotifications(data.notifications);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    if (nextPage <= totalPages) {
      try {
        const data = await NotificationService.getNotifications(nextPage, 10);
        setNotifications((prev) => [...prev, ...data.notifications]);
        setPage(nextPage);
      } catch (error) {
        console.error("Failed to load more notifications:", error);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await NotificationService.markAsRead(notification._id);
        markAsReadSocket(notification._id);
      }

      if (notification.notification?.actionUrl) {
        window.location.href = notification.notification.actionUrl;
      }
    } catch (error) {
      console.error("Failed to handle notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .map((n) => n._id);

      if (unreadIds.length > 0) {
        await NotificationService.markMultipleAsRead(unreadIds);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleArchive = async (notificationId) => {
    try {
      await NotificationService.archiveNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Failed to archive notification:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDropdown]);

  useEffect(() => {
    if (showDropdown && notifications.length === 0) {
      fetchNotifications();
    }
  }, [showDropdown]);

  return (
    <div className="relative inline-block" ref={bellRef}>
      <button
        className="relative flex items-center justify-center w-10 h-10 bg-transparent border-none rounded-full text-gray-700 cursor-pointer hover:bg-gray-100 hover:text-black active:bg-gray-200 transition-all duration-300"
        onClick={() => setShowDropdown(!showDropdown)}
        title={`${unreadCount} unread notifications`}
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6 stroke-2 stroke-linecap-round stroke-linejoin-round"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-linear-to-br from-red-500 to-red-600 rounded-full shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full transition-all duration-300 ${
            connected ? "bg-green-500 shadow-sm" : "bg-amber-500 animate-blink"
          }`}
        />
      </button>

      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          unreadCount={unreadCount}
          hasMore={page < totalPages}
          onNotificationClick={handleNotificationClick}
          onLoadMore={loadMore}
          onMarkAllAsRead={handleMarkAllAsRead}
          onArchive={handleArchive}
        />
      )}
    </div>
  );
};

export default NotificationBell;
