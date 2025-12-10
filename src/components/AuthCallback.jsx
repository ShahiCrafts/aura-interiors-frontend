import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { toast } from "./ui/Toast";
import { getProfile } from "../store/api/profileApi";

export default function AuthCallback() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const isProcessing = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token && window.location.pathname === "/auth/success") {
        // Prevent duplicate execution (React StrictMode)
        if (isProcessing.current) return;
        isProcessing.current = true;

        try {
          // Store token first so axios interceptor can use it
          localStorage.setItem("token", token);

          // Fetch the full user profile from backend
          const response = await getProfile();
          const user = response.data?.data?.user;

          if (!user) {
            throw new Error("Failed to fetch user profile");
          }

          // Now sign in with complete user data
          signIn(user, token);
          toast.success(`Welcome${user.firstName ? `, ${user.firstName}` : ""}!`);

          // Redirect based on role
          if (user.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } catch (error) {
          // Clean up on failure
          localStorage.removeItem("token");
          toast.error("Authentication failed. Please try again.");
          navigate("/", { replace: true });
        }
      }
    };

    handleOAuthCallback();
  }, [signIn, navigate]);

  return null;
}
