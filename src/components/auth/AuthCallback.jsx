import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { toast } from "react-toastify";
import { getProfile } from "../../api/profileApi";

export default function AuthCallback() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const isProcessing = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token && window.location.pathname === "/auth/success") {
        if (isProcessing.current) return;
        isProcessing.current = true;

        try {
          localStorage.setItem("token", token);

          const response = await getProfile();
          const user = response.data?.data?.user;

          if (!user) {
            throw new Error("Failed to fetch user profile");
          }

          signIn(user, token);
          toast.success(
            `Welcome${user.firstName ? `, ${user.firstName}` : ""}!`
          );

          if (user.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } catch (error) {
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
