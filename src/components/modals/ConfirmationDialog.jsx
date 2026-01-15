import { AlertTriangle, Trash2, LogOut, Info, X, Loader2, CheckCircle } from "lucide-react";

export default function ConfirmationDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
    isLoading = false,
}) {
    if (!isOpen) return null;

    const config = {
        danger: {
            icon: Trash2,
            iconColor: "text-red-600",
            iconBg: "bg-red-50",
            buttonBg: "bg-red-600 hover:bg-red-700",
        },
        warning: {
            icon: AlertTriangle,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-50",
            buttonBg: "bg-amber-600 hover:bg-amber-700",
        },
        logout: {
            icon: LogOut,
            iconColor: "text-red-600",
            iconBg: "bg-red-50",
            buttonBg: "bg-red-600 hover:bg-red-700",
        },
        info: {
            icon: Info,
            iconColor: "text-teal-600",
            iconBg: "bg-teal-50",
            buttonBg: "bg-teal-700 hover:bg-teal-800",
        },
        success: {
            icon: CheckCircle,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-50",
            buttonBg: "bg-emerald-600 hover:bg-emerald-700",
        },
    };

    const { icon: Icon, iconColor, iconBg, buttonBg } = config[type] || config.info;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                onClick={onCancel}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="p-6 pt-8 text-center">
                    <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`w-7 h-7 ${iconColor}`} />
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-2 font-playfair">
                        {title}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed font-dm-sans max-w-[280px] mx-auto">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-all font-dm-sans disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 ${buttonBg} text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all font-dm-sans flex items-center justify-center gap-2 disabled:opacity-70`}
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
