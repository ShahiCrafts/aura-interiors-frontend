import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

const toastTypes = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    iconColor: "text-teal-600",
    textColor: "text-teal-800",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    textColor: "text-red-800",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-600",
    textColor: "text-amber-800",
  },
};

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const config = toastTypes[toast.type] || toastTypes.success;
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
        transform transition-all duration-300 ease-out
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
      `}
      style={{ minWidth: "320px", maxWidth: "420px" }}
    >
      <Icon size={20} className={config.iconColor} />
      <p className={`flex-1 font-lato text-sm ${config.textColor}`}>
        {toast.message}
      </p>
      <button
        onClick={handleClose}
        className="p-1 rounded-full hover:bg-black/5 transition-colors"
      >
        <X size={16} className={config.iconColor} />
      </button>
    </div>
  );
}

let toastId = 0;
let addToastFn = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = (toast) => {
      setToasts((prev) => [...prev, { ...toast, id: ++toastId }]);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

export const toast = {
  success: (message, duration) => {
    addToastFn?.({ type: "success", message, duration });
  },
  error: (message, duration) => {
    addToastFn?.({ type: "error", message, duration });
  },
  warning: (message, duration) => {
    addToastFn?.({ type: "warning", message, duration });
  },
};
