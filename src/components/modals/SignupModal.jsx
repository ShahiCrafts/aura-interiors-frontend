import { useState, useEffect } from "react";
import { API_V1_URL } from "../../config/constants";
import { X, Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/authStore";
import { useSignup } from "../../hooks/auth/useSignupTan";
import EmailVerificationModal from "./EmailVerificationModal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../utils/validationSchemas";

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [signupData, setSignupData] = useState(null);

  const { signIn } = useAuthStore();
  const { mutate: signup, isPending, isError, error } = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      agreeToTerms: false,
    }
  });

  const email = watch("email");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const onSubmit = (data) => {
    const { firstName, lastName, email, password } = data;
    signup(
      { firstName, lastName, email, password },
      {
        onSuccess: (data) => {
          setSignupData(data);
          toast.success("Account created! Please verify your email.");
          setShowVerificationModal(true);
        },
        onError: (err) => {
          toast.error(formatError(err, "Signup failed. Please try again."));
        },
      }
    );
  };

  const handleVerificationSuccess = () => {
    if (signupData) {
      signIn(signupData.data.user, signupData.token);
    }
    setShowVerificationModal(false);
    toast.success("Email verified! Welcome to Aura Interiors.");
    onClose();
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_V1_URL}/auth/google`;
  };

  if (!isOpen) return null;

  if (showVerificationModal) {
    return (
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={email}
        onSuccess={handleVerificationSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeInScale font-dm-sans"
          style={{
            animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>

          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-playfair text-neutral-900">
              <span className="font-medium">Create your</span>{" "}
              <span className="italic text-teal-700">account</span>
            </h2>
            <p className="text-neutral-500 mt-1 font-dm-sans text-sm sm:text-base">
              Join us & start designing your space...
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("firstName")}
                  placeholder="Saugat"
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.firstName ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"
                    }`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("lastName")}
                  placeholder="Shahi"
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.lastName ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"
                    }`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-2 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your password"
                  className={`w-full pl-11 pr-11 py-2 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register("agreeToTerms")}
                className="w-5 h-5 mt-0.5 rounded border-neutral-300 accent-teal-700 focus:ring-teal-700 cursor-pointer"
              />
              <label className="text-sm text-neutral-700 font-dm-sans leading-relaxed">
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Privacy Policy
                </a>{" "}
                of Aura Interiors.
              </label>
            </div>

            {isError && (
              <p className="text-red-500 text-sm font-dm-sans">{formatError(error)}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-full font-dm-sans"
            >
              {isPending ? <Loader className="animate-spin mx-auto" size={20} /> : "Sign Up"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-sm text-neutral-400 font-dm-sans">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full py-3 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-full flex items-center justify-center gap-3 transition-all duration-300 font-dm-sans"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-neutral-700 font-semibold">
              Continue with Google
            </span>
          </button>

          <p className="text-center mt-4 text-neutral-500 font-dm-sans">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-teal-700 font-semibold hover:underline"
            >
              Login Now
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
