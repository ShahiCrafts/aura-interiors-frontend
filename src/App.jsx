import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/index.css";
import Navbar from "./layouts/customer/Navbar";
import Hero from "./components/sections/Hero";
import FeaturedPieces from "./components/sections/FeaturedPieces";
import Philosophy from "./components/sections/Philosophy";
import Testimonials from "./components/sections/Testimonials";
import Footer from "./layouts/customer/Footer";
import AuthCallback from "./components/auth/AuthCallback";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import CustomerRoute from "./components/auth/CustomerRoute";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProfilePage from "./pages/customer/ProfilePage";
import NotificationsPage from "./pages/customer/NotificationsPage";
import ShopPage from "./pages/shop/ShopPage";
import BlogsPage from "./pages/blog/BlogsPage";
import BlogDetailsPage from "./pages/blog/BlogDetailsPage";
import ProductDetailsPage from "./pages/shop/ProductDetailsPage";
import ARViewPage from "./pages/shop/ARViewPage";
import NativeARPage from "./pages/shop/NativeARPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderConfirmationPage from "./pages/customer/OrderConfirmationPage";
import PaymentFailedPage from "./pages/checkout/PaymentFailedPage";
import TrackOrderPage from "./pages/customer/TrackOrderPage";
import ContactPage from "./pages/info/ContactPage";
import FAQPage from "./pages/info/FAQPage";
import NotFoundPage from "./pages/info/NotFoundPage";
import useAuthStore from "./store/authStore";

// Admin imports
import AdminLayout from "./layouts/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/Categories";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminDiscounts from "./pages/admin/Discounts";
import AdminReviews from "./pages/admin/Reviews";
import AdminPromotions from "./pages/admin/Promotions";
import AdminAnnouncements from "./pages/admin/Announcements";
import AnnouncementsPage from "./pages/info/AnnouncementsPage";
import AdminSupportChats from "./pages/admin/SupportChats";
import AdminContacts from "./pages/admin/Contacts";
import AdminUsers from "./pages/admin/Users";

// Chat Widget
import ChatWidget from "./components/chat/ChatWidget";

function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  // Redirect admin users to admin dashboard
  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <Hero />
        <FeaturedPieces />
        <Philosophy />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}

function App() {
  return (
    <>
      <AuthCallback />
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Customer-facing routes - redirect admins to admin dashboard */}
        <Route path="/shop" element={<CustomerRoute><ShopPage /></CustomerRoute>} />
        <Route path="/shop/:categorySlug" element={<CustomerRoute><ShopPage /></CustomerRoute>} />
        <Route path="/product/:productSlug" element={<CustomerRoute><ProductDetailsPage /></CustomerRoute>} />
        <Route path="/ar/:productSlug" element={<CustomerRoute><ARViewPage /></CustomerRoute>} />
        <Route path="/native-ar" element={<CustomerRoute><NativeARPage /></CustomerRoute>} />
        <Route path="/checkout" element={<CustomerRoute><CheckoutPage /></CustomerRoute>} />
        <Route path="/checkout/payment-failed" element={<CustomerRoute><PaymentFailedPage /></CustomerRoute>} />
        <Route path="/order-confirmation/:orderId" element={<CustomerRoute><OrderConfirmationPage /></CustomerRoute>} />
        <Route path="/track-order" element={<CustomerRoute><TrackOrderPage /></CustomerRoute>} />

        <Route path="/blog" element={<BlogsPage />} />
        <Route path="/blog/:slug" element={<BlogDetailsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />

        {/* Public route - password reset */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected customer routes - requires auth + not admin */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="discounts" element={<AdminDiscounts />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="support" element={<AdminSupportChats />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Chat Widget - Only for customers */}
      <ChatWidget />
    </>
  );
}

export default App;
