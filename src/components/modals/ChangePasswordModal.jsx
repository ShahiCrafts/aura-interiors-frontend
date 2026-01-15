import { useState, useEffect } from "react";
import { X, Lock, Eye, EyeOff, CheckCircle, ShieldCheck, AlertCircle, Loader } from "lucide-react";
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
    if (strength === 2) return { level: 2, text: "Medium", color: "text-amber-500" };
    if (strength === 3) return { level: 3, text: "Good", color: "text-blue-500" };
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
            setIsSuccess(false);
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
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          {/* Header */}
          <div className="bg-neutral-50 px-6 py-4 flex items-center justify-between border-b border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900 font-playfair flex items-center gap-2">
              <Lock size={18} className="text-teal-700" />
              Change Password
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 p-1.5 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5 font-dm-sans">
                    Current Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      {...register("currentPassword")}
                      className={`w-full pl-4 pr-10 py-2.5 rounded-xl border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.currentPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5 font-dm-sans">
                    New Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      {...register("newPassword")}
                      className={`w-full pl-4 pr-10 py-2.5 rounded-xl border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.newPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && !errors.newPassword && (
                    <div className="mt-2 flex items-center justify-between text-xs font-dm-sans transition-all duration-300">
                      <div className="flex gap-1 h-1 flex-1 mr-4">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`flex-1 rounded-full transition-all duration-300 ${level <= strength.level
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

                  {errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5 font-dm-sans">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      className={`w-full pl-4 pr-10 py-2.5 rounded-xl border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Warnings */}
                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex gap-2 items-start font-dm-sans">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <p>
                    Make sure your new password is at least 8 characters long and
                    includes a mix of letters, numbers, and symbols for better security.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-all duration-300 font-dm-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-300 font-dm-sans flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20"
                  >
                    {isPending ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
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
