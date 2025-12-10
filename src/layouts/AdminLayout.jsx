import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Search,
  Menu,
  X,
  BarChart3,
  Tag,
  MessageSquare,
  FileText,
  Layers,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders', badge: 5 },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'categories', label: 'Categories', icon: Tag, path: '/admin/categories' },
    { id: 'designs', label: '3D Designs', icon: Layers, path: '/admin/designs' },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
    { id: 'content', label: 'Content', icon: FileText, path: '/admin/content' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="font-playfair font-bold text-lg">Aura Admin</h1>
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {sidebarOpen && (
            <Link to="/admin" className="font-playfair font-bold text-xl text-gray-900">
              Aura Admin
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-[#025E5D] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive(item.path) ? 'bg-white/20' : 'bg-red-100 text-red-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#025E5D] focus:ring-2 focus:ring-[#025E5D]/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-xl relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 bg-[#025E5D] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-gray-500 text-xs">{user?.email || 'admin@aura.com'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 pt-20 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
