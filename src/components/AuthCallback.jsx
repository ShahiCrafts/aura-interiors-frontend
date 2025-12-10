import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { toast } from "./ui/Toast";

export default function AuthCallback() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const userParam = params.get("user");

      if (token && window.location.pathname === "/auth/success") {
        try {
          let user = null;

          // If user data is passed in URL
          if (userParam) {
            user = JSON.parse(decodeURIComponent(userParam));
          } else {
            // Decode user from JWT token payload
            const payload = JSON.parse(atob(token.split(".")[1]));
            user = payload.user || { id: payload.id };
          }

          signIn(user, token);
          toast.success(`Welcome${user.firstName ? `, ${user.firstName}` : ""}!`);

          // Redirect based on role
          if (user.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            window.history.replaceState({}, document.title, "/");
          }
        } catch (error) {
          toast.error("Authentication failed. Please try again.");
          window.history.replaceState({}, document.title, "/");
        }
      }
    };

    handleOAuthCallback();
  }, [signIn, navigate]);

  return null;
}
