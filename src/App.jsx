import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/index.css";
import Navbar from "./layouts/Navbar";
import Hero from "./components/sections/Hero";
import FeaturedPieces from "./components/sections/FeaturedPieces";
import Philosophy from "./components/sections/Philosophy";
import Testimonials from "./components/sections/Testimonials";
import Footer from "./layouts/Footer";
import AuthCallback from "./components/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CustomerRoute from "./components/CustomerRoute";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ARViewPage from "./pages/ARViewPage";
import NativeARPage from "./pages/NativeARPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import useAuthStore from "./store/authStore";

// Admin imports
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/Categories";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminDiscounts from "./pages/admin/Discounts";
import AdminReviews from "./pages/admin/Reviews";
import AdminPromotions from "./pages/admin/Promotions";
import AdminAnnouncements from "./pages/admin/Announcements";
import AnnouncementsPage from "./pages/AnnouncementsPage";

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
        </Route>
      </Routes>
    </>
  );
}

export default App;
