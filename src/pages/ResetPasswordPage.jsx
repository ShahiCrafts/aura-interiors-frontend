import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, ShieldCheck, CheckCircle } from "lucide-react";
import { toast } from "../components/ui/Toast";
import { useResetPassword } from "../hooks/usePasswordTan";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });
  const [resetSuccess, setResetSuccess] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

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

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, text: "Weak password", color: "text-red-500" };
    if (strength === 2) return { level: 2, text: "Fair password", color: "text-amber-500" };
    if (strength === 3) return { level: 3, text: "Good password", color: "text-blue-500" };
    return { level: 4, text: "Strong password", color: "text-teal-600" };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    resetPassword(
      { token, password: formData.password },
      {
        onSuccess: () => {
          setResetSuccess(true);
          toast.success("Password reset successfully!");
        },
        onError: (err) => {
          toast.error(err || "Failed to reset password. The link may have expired.");
        },
      }
    );
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-teal-700" />
          </div>
          <h2 className="text-2xl font-playfair text-neutral-900 mb-2">
            <span className="font-bold">Password</span>{" "}
            <span className="italic text-teal-700">Reset!</span>
          </h2>
          <p className="text-neutral-500 font-lato text-sm mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-700/25 font-lato"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
            <Lock size={24} className="text-teal-700" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-playfair text-neutral-900">
              <span className="font-bold">Reset</span>{" "}
              <span className="italic text-teal-700">Password</span>
            </h2>
            <p className="text-neutral-500 font-lato text-sm">
              Create your new password
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.password ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a new password"
                required
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("password")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPasswords.password ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.password && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <ShieldCheck size={14} className={passwordStrength.color} />
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.text}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                required
                className={`w-full px-4 py-2.5 pr-11 rounded-lg border outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400 ${
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
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className="flex items-center gap-1.5 mt-1.5">
                {passwordsMatch ? (
                  <>
                    <Check size={14} className="text-teal-600" />
                    <span className="text-xs font-medium text-teal-600">Passwords match</span>
                  </>
                ) : (
                  <span className="text-xs font-medium text-red-500">Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending || !passwordsMatch}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-700/25 font-lato"
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Back to Home */}
        <p className="text-center mt-5 text-neutral-500 font-lato">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-teal-700 font-semibold hover:underline"
          >
            Go back
          </button>
        </p>
      </div>
    </div>
  );
}
