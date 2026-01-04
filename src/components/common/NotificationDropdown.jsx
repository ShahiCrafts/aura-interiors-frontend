import React from "react";

const NotificationDropdown = ({
  notifications,
  loading,
  unreadCount,
  hasMore,
  onNotificationClick,
  onLoadMore,
  onMarkAllAsRead,
  onArchive,
}) => {
  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <div className="absolute top-full right-0 w-96 bg-white rounded-xl shadow-lg z-1000 mt-2 overflow-hidden flex flex-col max-h-96 animate-slideDown md:w-full md:max-w-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h3 className="m-0 text-lg font-semibold text-gray-900">
          Notifications
        </h3>
        {unreadCount > 0 && (
          <button
            className="bg-none border-none text-blue-600 cursor-pointer text-xs px-2 py-1 rounded transition-all duration-200 hover:bg-blue-50 hover:text-blue-800"
            onClick={onMarkAllAsRead}
            title="Mark all as read"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-24 max-h-64">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-600 text-center">
            <div className="w-7 h-7 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="mt-3 text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-600 text-center">
            <svg
              className="w-10 h-10 text-gray-300 opacity-50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => {
              const category = notification.notification?.category || "info";
              const categoryColors = {
                success: "border-l-4 border-l-green-500",
                warning: "border-l-4 border-l-amber-400",
                error: "border-l-4 border-l-red-500",
                info: "border-l-4 border-l-blue-600",
                system: "border-l-4 border-l-purple-600",
              };

              const categoryBgColors = {
                success: "bg-green-50",
                warning: "bg-amber-50",
                error: "bg-red-50",
                info: "bg-blue-50",
                system: "bg-purple-50",
              };

              const categoryBadgeColors = {
                success: "bg-green-100 text-green-700",
                warning: "bg-amber-100 text-amber-700",
                error: "bg-red-100 text-red-700",
                info: "bg-blue-100 text-blue-700",
                system: "bg-purple-100 text-purple-700",
              };

              return (
                <div
                  key={notification._id}
                  className={`flex items-start px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors duration-200 bg-white hover:bg-gray-50 ${
                    !notification.isRead
                      ? `${categoryBgColors[category]} hover:opacity-90`
                      : ""
                  } ${categoryColors[category]}`}
                >
                  <div
                    className="flex-1 min-w-0 flex items-start gap-2"
                    onClick={() => onNotificationClick(notification)}
                  >
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1.5" />
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="m-0 text-sm font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                        {notification.notification?.title}
                      </h4>
                      <p className="m-1 mt-0 text-xs text-gray-700 line-clamp-2">
                        {notification.notification?.description}
                      </p>
                      <span className="block text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase shrink-0 ml-2 ${categoryBadgeColors[category]}`}
                    >
                      {category}
                    </span>
                  </div>

                  <div className="flex gap-2 ml-2 opacity-0 transition-opacity duration-200 hover:opacity-100">
                    <button
                      className="bg-none border-none cursor-pointer p-1 text-gray-700 flex items-center justify-center rounded transition-all duration-200 hover:text-red-500 hover:bg-red-100"
                      onClick={() => onArchive(notification._id)}
                      title="Archive"
                      aria-label="Archive"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="w-4 h-4 stroke-2"
                      >
                        <path d="M21 15V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="flex justify-center gap-4 p-3 border-t border-gray-100 bg-gray-50">
          {hasMore && (
            <button
              className="bg-none border-none text-blue-600 cursor-pointer text-xs px-2 py-1 rounded font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-800 disabled:text-gray-600 disabled:cursor-not-allowed"
              onClick={onLoadMore}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          )}
          <a
            href="/notifications"
            className="text-blue-600 no-underline text-xs px-2 py-1 rounded font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-800"
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
