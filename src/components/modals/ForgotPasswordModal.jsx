import { useState, useEffect } from "react";
import { X, Mail, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useForgotPassword } from "../../hooks/auth/usePasswordTan";
import formatError from "../../utils/errorHandler";

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onBackToLogin,
}) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const { mutate: forgotPassword, isPending } = useForgotPassword();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setEmail("");
      setEmailSent(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPassword(email, {
      onSuccess: () => {
        setEmailSent(true);
        toast.success("Reset link sent to your email!");
      },
      onError: (err) => {
        toast.error(formatError(err, "Failed to send reset link"));
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto">
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

          {!emailSent ? (
            <>
              <div className="mb-6">
                <button
                  onClick={onBackToLogin}
                  className="flex items-center gap-1 text-sm text-teal-700 hover:text-neutral-700 mb-4 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </button>
                <h2 className="text-xl sm:text-2xl font-playfair text-neutral-900">
                  <span className="font-medium">Forgot</span>{" "}
                  <span className="italic text-teal-700">password?</span>
                </h2>
                <p className="text-neutral-500 mt-2 font-dm-sans text-sm sm:text-base">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-full font-dm-sans mt-3"
                >
                  {isPending ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-teal-700" />
              </div>
              <h2 className="text-2xl font-playfair text-neutral-900 mb-2">
                <span className="font-bold">Check your</span>{" "}
                <span className="italic text-teal-700">email</span>
              </h2>
              <p className="text-neutral-500 font-dm-sans text-sm mb-1">
                We've sent a password reset link to
              </p>
              <p className="text-neutral-800 font-semibold font-dm-sans mb-6">
                {email}
              </p>
              <p className="text-neutral-400 font-dm-sans text-xs mb-6">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-teal-700 hover:underline"
                >
                  try again
                </button>
              </p>
              <button
                onClick={onBackToLogin}
                className="text-teal-700 font-semibold hover:underline font-dm-sans"
              >
                Back to login
              </button>
            </div>
          )}
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
