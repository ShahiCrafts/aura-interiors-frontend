import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader,
  ShieldCheck,
} from "lucide-react";
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

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  // Password strength logic
  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, text: "", color: "text-gray-400" };
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;

    if (strength <= 1)
      return { level: 1, text: "Weak password", color: "text-red-500" };
    if (strength === 2)
      return { level: 2, text: "Fair password", color: "text-amber-500" };
    if (strength === 3)
      return { level: 3, text: "Good password", color: "text-blue-500" };
    return { level: 4, text: "Strong password", color: "text-teal-600" };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

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

  // Error State UI (If token is missing)
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-dm-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8 border border-white">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl border border-teal-100 bg-teal-50/50 flex items-center justify-center text-teal-700 shrink-0">
            <Lock size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 font-playfair">
              Reset <span className="text-teal-700 italic">Password</span>
            </h2>
            <p className="text-neutral-500 text-sm font-dm-sans mt-1">
              Create a new secure password
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-bold text-neutral-800 mb-2 font-dm-sans">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full px-4 py-3.5 rounded-xl border focus:ring-1 outline-none font-dm-sans text-neutral-900 placeholder:text-neutral-400 bg-white ${errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"
                  }`}
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && !errors.password && (
              <div className="mt-2 flex items-center justify-between text-xs font-dm-sans">
                <div className="flex gap-1 h-1 flex-1 mr-4">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 rounded-full ${level <= strength.level
                        ? strength.color.replace("text-", "bg-")
                        : "bg-neutral-100"
                        }`}
                    />
                  ))}
                </div>
                <span className={`font-medium ${strength.color}`}>
                  {strength.text}
                </span>
              </div>
            )}

            {errors.password && (
              <p className="text-xs text-red-500 mt-1 font-dm-sans flex items-center gap-1.5">
                <AlertCircle size={14} />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-neutral-800 mb-2 font-dm-sans">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`w-full px-4 py-3.5 rounded-xl border focus:ring-1 outline-none font-dm-sans text-neutral-900 placeholder:text-neutral-400 bg-white ${errors.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"
                  }`}
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Match Indicator */}
            {confirmPassword && !errors.confirmPassword && (
              <div className="flex items-center gap-1.5 mt-2">
                {passwordsMatch ? (
                  <>
                    <Check size={14} className="text-teal-600" />
                    <span className="text-xs font-medium text-teal-600 font-dm-sans">
                      Passwords match
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-xs font-medium text-red-500 font-dm-sans">
                      Passwords do not match
                    </span>
                  </>
                )}
              </div>
            )}

            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 font-dm-sans flex items-center gap-1.5">
                <AlertCircle size={14} />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-dm-sans"
          >
            {isPending ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-neutral-500 font-dm-sans text-sm">
            Remember your password?{" "}
            <Link
              to="/"
              className="text-teal-700 font-semibold hover:text-teal-800 transition-colors hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
