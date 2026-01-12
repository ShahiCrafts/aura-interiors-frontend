import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function CustomerRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
