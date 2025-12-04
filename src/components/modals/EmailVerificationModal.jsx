import { useState, useEffect, useRef } from "react";
import { X, Mail } from "lucide-react";
import { toast } from "../ui/Toast";
import { useVerifyEmail, useResendVerificationCode } from "../../hooks/useSignupTan";

export default function EmailVerificationModal({ isOpen, onClose, email, onSuccess }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const { mutate: verifyEmail, isPending, isError, error } = useVerifyEmail();
  const { mutate: resendCode, isPending: isResending } = useResendVerificationCode();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus first input when modal opens
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset code when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode(["", "", "", "", "", ""]);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    // Focus last filled input or next empty one
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) return;

    verifyEmail(verificationCode, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err || "Verification failed. Please try again.");
      },
    });
  };

  const handleResendCode = () => {
    if (email) {
      resendCode(email, {
        onSuccess: () => {
          toast.success("Verification code sent!");
        },
        onError: (err) => {
          toast.error(err || "Failed to resend code. Please try again.");
        },
      });
    }
  };

  if (!isOpen) return null;

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        {/* Modal */}
        <div
          className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeInScale"
          style={{
            animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-teal-700" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-playfair text-neutral-900">
              <span className="font-bold">Verify your</span>{" "}
              <span className="italic text-teal-700">email</span>
            </h2>
            <p className="text-neutral-500 mt-2 font-lato text-sm sm:text-base">
              We've sent a 6-digit code to
            </p>
            <p className="text-neutral-800 font-semibold font-lato">
              {email || "your email"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP Input */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900"
                />
              ))}
            </div>

            {/* Error Message */}
            {isError && (
              <p className="text-red-500 text-sm font-lato text-center">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !isCodeComplete}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-700/25 font-lato"
            >
              {isPending ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          {/* Resend Code */}
          <p className="text-center mt-5 text-neutral-500 font-lato">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-teal-700 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Sending..." : "Resend"}
            </button>
          </p>
        </div>
      </div>

      {/* Animation Keyframes */}
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
