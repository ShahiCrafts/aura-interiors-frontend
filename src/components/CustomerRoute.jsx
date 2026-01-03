import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

/**
 * CustomerRoute - Wrapper component for customer-only pages
 * Redirects admin users to admin dashboard
 * Admin users should only access the admin dashboard, not customer-facing pages
 */
export default function CustomerRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  // Admin users should not access customer-facing pages
  // Redirect them to admin dashboard
  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
