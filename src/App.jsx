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
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
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
import AdminDiscounts from "./pages/admin/Discounts";

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
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:categorySlug" element={<ShopPage />} />
        <Route path="/product/:productSlug" element={<ProductDetailsPage />} />
        <Route path="/ar/:productSlug" element={<ARViewPage />} />
        <Route path="/native-ar" element={<NativeARPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/payment-failed" element={<PaymentFailedPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
          <Route path="discounts" element={<AdminDiscounts />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
