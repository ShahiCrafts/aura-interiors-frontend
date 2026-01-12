import { useState, useMemo, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Bell,
  Menu,
  X,
  Tag,
  MessageSquare,
  Percent,
  LogOut,
  Megaphone,
  Headphones,
  Mail,
} from "lucide-react";
import NotificationBell from "../../components/common/NotificationBell";
import ConfirmationDialog from "../../components/modals/ConfirmationDialog";
import useAuthStore from "../../store/authStore";
import useAdminNotificationSocket from "../../hooks/admin/useAdminNotificationSocket";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const token = useMemo(() => localStorage.getItem("token"), []);

  // Admin notification socket hook
  const {
    adminNotifications,
    unreadAdminCount,
    getNotificationIcon,
    dismissNotification,
  } = useAdminNotificationSocket(token, user?._id || user?.id, user?.role);

  // Show toast when new admin notification arrives
  useEffect(() => {
    if (adminNotifications.length > 0) {
      const latestNotification = adminNotifications[0];
      // Only show toast for truly new notifications (check timestamp)
      if (latestNotification.timestamp) {
        const notificationTime = new Date(latestNotification.timestamp).getTime();
        const now = Date.now();
        // Only show toast if notification is less than 5 seconds old
        if (now - notificationTime < 5000) {
          addToast(latestNotification);
        }
      }
    }
  }, [adminNotifications.length]);

  // Add toast notification
  const addToast = (notification) => {
    const toastId = Date.now();
    setToasts((prev) => [...prev, { ...notification, id: toastId }]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 5000);
  };

  // Remove toast
  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleSignOut = () => {
    signOut();
    setLogoutModalOpen(false);
    navigate("/");
  };

  const menuGroups = [
    {
      title: "Overview",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin",
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          id: "products",
          label: "Products",
          icon: Package,
          path: "/admin/products",
        },
        {
          id: "categories",
          label: "Categories",
          icon: Tag,
          path: "/admin/categories",
        },
        {
          id: "orders",
          label: "Orders",
          icon: ShoppingCart,
          path: "/admin/orders",
        },
        { id: "users", label: "Users", icon: Users, path: "/admin/users" },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          id: "support",
          label: "Support Chat",
          icon: Headphones,
          path: "/admin/support",
        },
        {
          id: "contacts",
          label: "Contacts",
          icon: Mail,
          path: "/admin/contacts",
        },
        {
          id: "reviews",
          label: "Reviews",
          icon: MessageSquare,
          path: "/admin/reviews",
        },
      ],
    },
    {
      title: "Marketing",
      items: [
        {
          id: "discounts",
          label: "Discounts",
          icon: Percent,
          path: "/admin/discounts",
        },
        {
          id: "promotions",
          label: "Promotions",
          icon: Megaphone,
          path: "/admin/promotions",
        },
        {
          id: "announcements",
          label: "Announcements",
          icon: Bell,
          path: "/admin/announcements",
        },
      ],
    },
  ];

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);
  const currentLabel =
    menuGroups.flatMap((g) => g.items).find((i) => isActive(i.path))?.label ||
    "Dashboard";

  return (
    <div className="min-h-screen bg-gray-50/50 font-dm-sans text-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-6">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -ml-2 text-slate-600"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-playfair font-black text-xl text-teal-600">
          Aura
        </span>
        <NotificationBell user={user} token={token} />
      </div>

      {/* Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area - No Shadows */}
          <div className="h-20 flex items-center px-8 border-b border-gray-100">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <span className="font-playfair font-bold text-white text-xl">
                  A
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-playfair font-bold text-xl text-gray-900 tracking-wide">
                  Aura
                </span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation - No Shadows on Active */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-7 custom-scrollbar pb-24">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <h3 className="px-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.id}
                      item={item}
                      active={isActive(item.path)}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.firstName?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-gray-900 truncate leading-tight">
                  {user?.firstName}
                </p>
                <p className="text-[12px] font-medium text-gray-500 truncate leading-tight mt-1">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-72 min-h-screen">
        <header className="hidden lg:flex h-20 bg-white border-b border-gray-200 items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">
              PAGES / <span className="text-gray-900">{currentLabel}</span>
            </h2>
          </div>

          <div className="flex items-center gap-5">
            <NotificationBell user={user} token={token} />
            <div className="h-8 w-px bg-gray-100"></div>

            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden xl:block">
                <p className="text-[14px] font-bold text-gray-900 leading-none">
                  {user?.firstName}
                </p>
                <p className="text-[11px] font-bold text-teal-600 mt-1 uppercase tracking-wider">
                  Administrator
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-teal-600/10 flex items-center justify-center text-teal-700 font-bold text-sm border border-teal-100">
                {user?.firstName?.charAt(0)?.toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 pt-24 lg:pt-8 min-h-[calc(100vh-5rem)]">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 animate-slide-in-right flex items-start gap-3"
            style={{
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-lg shrink-0">
              {toast.type === "order:new" && "🛒"}
              {toast.type === "order:cancelled" && "❌"}
              {toast.type === "return:requested" && "↩️"}
              {toast.type === "review:new" && "⭐"}
              {toast.type === "contact:new" && "✉️"}
              {toast.type === "chat:started" && "💬"}
              {!["order:new", "order:cancelled", "return:requested", "review:new", "contact:new", "chat:started"].includes(toast.type) && "🔔"}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {toast.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {toast.description}
              </p>
              {toast.actionUrl && (
                <button
                  onClick={() => {
                    navigate(toast.actionUrl);
                    removeToast(toast.id);
                  }}
                  className="text-xs text-teal-600 font-medium mt-1 hover:text-teal-700"
                >
                  View Details →
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Toast animation styles */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <ConfirmationDialog
        isOpen={logoutModalOpen}
        title="Sign Out?"
        message="Are you sure you want to sign out from the admin panel?"
        onConfirm={handleSignOut}
        onCancel={() => setLogoutModalOpen(false)}
        confirmText="Sign Out"
        type="logout"
      />
    </div>
  );
}

function NavLink({ item, active, onClick }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group flex items-center gap-3.5 px-4.5 py-3 mx-2.5 rounded-xl transition-all duration-200 relative overflow-hidden focus:outline-none ${active
        ? "bg-teal-50/80 text-teal-700 ring-1 ring-teal-100/50"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      {/* Active Indicator Bar - Now Positioned on the Absolute Left */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-600 rounded-r-full"></span>
      )}

      <item.icon
        className={`w-5 h-5 shrink-0 transition-all duration-200 ${active ? "text-teal-600" : "text-gray-400 group-hover:text-gray-900"
          }`}
        strokeWidth={active ? 2.5 : 2}
      />
      <span
        className={`flex-1 text-[15px] tracking-tight ${active ? "font-semibold" : "font-medium"
          }`}
      >
        {item.label}
      </span>
    </Link>
  );
}
