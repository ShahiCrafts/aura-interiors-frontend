import { useState, useEffect } from "react";
import { X, Lock, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import { toast } from "../ui/Toast";
import { useUpdatePassword } from "../../hooks/usePasswordTan";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { mutate: updatePassword, isPending } = useUpdatePassword();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1)
      return { level: 1, text: "Weak password", color: "text-red-500" };
    if (strength === 2)
      return { level: 2, text: "Fair password", color: "text-amber-500" };
    if (strength === 3)
      return { level: 3, text: "Good password", color: "text-blue-500" };
    return { level: 4, text: "Strong password", color: "text-teal-600" };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const passwordsMatch =
    formData.newPassword &&
    formData.confirmPassword &&
    formData.newPassword === formData.confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    updatePassword(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated successfully!");
          onClose();
        },
        onError: (err) => {
          toast.error(err || "Failed to update password");
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8"
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

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <Lock size={24} className="text-teal-700" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-playfair text-neutral-900">
                <span className="font-bold">Change</span>{" "}
                <span className="italic text-teal-700">Password</span>
              </h2>
              <p className="text-neutral-500 font-dm-sans text-sm">
                Keep your account secure
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Create a new password"
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.newPassword && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <ShieldCheck size={14} className={passwordStrength.color} />
                  <span
                    className={`text-xs font-medium ${passwordStrength.color}`}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  required
                  className={`w-full px-4 py-2.5 pr-11 rounded-lg border outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${
                    formData.confirmPassword
                      ? passwordsMatch
                        ? "border-teal-500 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-teal-50/30"
                        : "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {passwordsMatch ? (
                    <>
                      <Check size={14} className="text-teal-600" />
                      <span className="text-xs font-medium text-teal-600">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-red-500">
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-full transition-all duration-300 font-dm-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !passwordsMatch}
                className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-700/25 font-dm-sans"
              >
                {isPending ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
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
