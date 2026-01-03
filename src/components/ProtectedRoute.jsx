import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Admin users should not access customer-only routes
  // Redirect them to admin dashboard
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
