import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { toast } from "react-toastify";
import { getProfile } from "../../api/profileApi";

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
        navigate("/", { replace: true });
      }
    };

    handleOAuthCallback();
  }, [signIn, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <div className="text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-2xl font-playfair text-neutral-900">
            <span className="font-medium">Aura</span>{" "}
            <span className="italic text-teal-700">Interiors</span>
          </h1>
        </div>

        {/* Spinner */}
        <div className="relative w-12 h-12 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-neutral-200"></div>
          <div className="absolute inset-0 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
        </div>

        {/* Text */}
        <p className="text-neutral-600 font-dm-sans text-sm">
          Signing you in...
        </p>
      </div>
    </div>
  );
}
