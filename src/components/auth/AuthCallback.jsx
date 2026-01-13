import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { toast } from "react-toastify";
import { getProfile } from "../../api/profileApi";
import { Loader } from "lucide-react";

export default function AuthCallback() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isProcessing = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get("token");

      if (token) {
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
          console.error("Auth callback error:", error);
          localStorage.removeItem("token");
          toast.error("Authentication failed. Please try again.");
          navigate("/", { replace: true });
        }
      } else {
        // No token provided? redirect home
        navigate("/", { replace: true });
      }
    };

    handleOAuthCallback();
  }, [signIn, navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
      <div className="text-center space-y-4">
        <Loader className="w-10 h-10 animate-spin text-teal-700 mx-auto" />
        <h2 className="text-xl font-playfair text-neutral-900">Configuring your account...</h2>
        <p className="text-neutral-500 font-dm-sans">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
