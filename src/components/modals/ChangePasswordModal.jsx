import { useState, useEffect } from "react";
import {
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ShieldCheck,
  Loader,
} from "lucide-react";
import { toast } from "react-toastify";
import { useUpdatePassword } from "../../hooks/auth/usePasswordTan";
import formatError from "../../utils/errorHandler";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "../../utils/validationSchemas";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    mode: "onTouched",
  });

  const newPassword = watch("newPassword");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      reset();
      setIsSuccess(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, reset]);

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, text: "Weak", color: "text-red-500" };
    if (strength === 2)
      return { level: 2, text: "Medium", color: "text-amber-500" };
    if (strength === 3)
      return { level: 3, text: "Good", color: "text-blue-500" };
    return { level: 4, text: "Strong", color: "text-green-600" };
  };

  const strength = getPasswordStrength(newPassword);

  const onSubmit = (data) => {
    updatePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("Password changed successfully");
          reset();
          setTimeout(() => {
            onClose();
          }, 2000);
        },
        onError: (err) => {
          toast.error(formatError(err, "Failed to change password"));
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
          style={{
            animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          {/* Header Implementation from Version 2 */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl border border-teal-100 bg-teal-50/50 flex items-center justify-center text-teal-700 shrink-0">
                <Lock size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 font-playfair">
                  Change <span className="text-teal-700 italic">Password</span>
                </h3>
                <p className="text-neutral-500 text-sm font-dm-sans mt-1">
                  Keep your account secure
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>

          {isSuccess ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-xl font-bold text-neutral-900 mb-2 font-playfair">
                Success!
              </h4>
              <p className="text-neutral-500 font-dm-sans">
                Your password has been securely updated.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2 font-dm-sans">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    {...register("currentPassword")}
                    className={`w-full px-4 py-3.5 rounded-xl border focus:ring-1 outline-none font-dm-sans text-neutral-900 placeholder:text-neutral-400 bg-white transition-all ${
                      errors.currentPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"
                    }`}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Lock size={20} />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-dm-sans">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2 font-dm-sans">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...register("newPassword")}
                    className={`w-full px-4 py-3.5 rounded-xl border focus:ring-1 outline-none font-dm-sans text-neutral-900 placeholder:text-neutral-400 bg-white transition-all ${
                      errors.newPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"
                    }`}
                    placeholder="Create a new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Strength Indicator */}
                {newPassword && !errors.newPassword && (
                  <div className="mt-3 flex items-center justify-between text-xs font-dm-sans transition-all duration-300">
                    <div className="flex gap-1.5 h-1.5 flex-1 mr-4">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all duration-500 ${
                            level <= strength.level
                              ? strength.color.replace("text-", "bg-")
                              : "bg-neutral-100"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`font-bold uppercase tracking-wider ${strength.color}`}
                    >
                      {strength.text}
                    </span>
                  </div>
                )}
                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-dm-sans">
                    {errors.newPassword.message}
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
                    className={`w-full px-4 py-3.5 rounded-xl border focus:ring-1 outline-none font-dm-sans text-neutral-900 placeholder:text-neutral-400 bg-white transition-all ${
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-dm-sans">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl font-dm-sans transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-bold rounded-xl font-dm-sans flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/10"
                >
                  {isPending ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
