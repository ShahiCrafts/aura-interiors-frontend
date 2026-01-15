import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, AlertCircle, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { useResetPassword } from "../../hooks/auth/usePasswordTan";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordSchema } from "../../utils/validationSchemas";
import formatError from "../../utils/errorHandler";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onTouched",
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const onSubmit = (data) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    resetPassword(
      { token, password: data.password },
      {
        onSuccess: () => {
          toast.success("Password reset successful!");
          setTimeout(() => {
            navigate("/?login=true");
          }, 1500);
        },
        onError: (err) => {
          toast.error(formatError(err, "Failed to reset password"));
        },
      }
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-dm-sans">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">
            Invalid Link
          </h2>
          <p className="text-gray-600 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <Link
            to="/"
            className="text-teal-700 hover:text-teal-800 font-medium hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-teal-900 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
              <Lock size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 font-playfair">
              Reset Password
            </h2>
            <p className="text-teal-100 font-dm-sans">
              Create a strong password for your account
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-dm-sans">
                New Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full pl-5 pr-12 py-3.5 rounded-xl border bg-gray-50 focus:bg-white outline-none transition-all font-dm-sans placeholder:text-gray-400 ${errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    }`}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent p-1 rounded-full hover:bg-gray-100"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1.5 font-dm-sans flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-dm-sans">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`w-full pl-5 pr-12 py-3.5 rounded-xl border bg-gray-50 focus:bg-white outline-none transition-all font-dm-sans placeholder:text-gray-400 ${errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    }`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent p-1 rounded-full hover:bg-gray-100"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && !errors.confirmPassword && (
                <div className="flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1">
                  <Check size={14} className="text-teal-600" />
                  <span className="text-xs font-medium text-teal-600 font-dm-sans">
                    Passwords match
                  </span>
                </div>
              )}

              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1.5 font-dm-sans flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 font-dm-sans mt-4"
            >
              {isPending ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-500 font-dm-sans text-sm">
            Remember your password?{" "}
            <Link
              to="/"
              className="text-teal-700 font-bold hover:text-teal-800 transition-colors"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
