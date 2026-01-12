import React from "react";
import { AlertCircle, BellOff, CheckCheck, Archive } from "lucide-react";

const NotificationDropdown = ({
  notifications = [],
  loading,
  unreadCount,
  onNotificationClick,
  onMarkAllAsRead,
  onArchive,
  error,
}) => {
  console.log(
    "🎨 [Dropdown Render] Notifications count:",
    notifications.length
  );

  const formatTime = (date) => {
    if (!date) return "";
    const notificationDate = new Date(date);
    return notificationDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">
          Notifications ({notifications.length})
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {loading && notifications.length === 0 ? (
          <div className="p-10 text-center text-xs text-gray-500">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <BellOff className="mx-auto mb-2 opacity-20" size={32} />
            <p className="text-sm">No notifications found.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n, index) => {
              // DEBUG: Log the first few notifications to see their actual structure

              // Standardizing fields based on your JSON example
              const id = n._id || n.id;
              const title = n.title || n.notification?.title || "No Title";
              const message =
                n.message || n.notification?.description || "No Message";
              const isRead = n.isRead === true;
              const createdAt = n.createdAt;

              return (
                <div
                  key={id || index}
                  className={`group relative flex items-start px-4 py-3 border-b border-gray-50 cursor-pointer transition-all ${!isRead
                      ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"
                    }`}
                  onClick={() => onNotificationClick(n)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm ${!isRead ? "font-bold" : "font-medium"
                          } text-gray-900 truncate`}
                      >
                        {title}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {formatTime(createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
        <a
          href="/notifications"
          className="text-xs font-semibold text-gray-500 hover:text-blue-600"
        >
          View All Notifications
        </a>
      </div>
    </div>
  );
};

export default NotificationDropdown;
