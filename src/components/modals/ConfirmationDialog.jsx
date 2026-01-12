import { AlertTriangle, Trash2, LogOut, Info, X, Loader2 } from "lucide-react";

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

    const getIcon = () => {
        switch (type) {
            case "danger":
                return <Trash2 className="w-6 h-6 text-red-600" />;
            case "warning":
                return <AlertTriangle className="w-6 h-6 text-amber-600" />;
            case "logout":
                return <LogOut className="w-6 h-6 text-red-600" />;
            default:
                return <Info className="w-6 h-6 text-teal-600" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case "danger":
                return "bg-red-600 hover:bg-red-700 shadow-red-100";
            case "warning":
                return "bg-amber-600 hover:bg-amber-700 shadow-amber-100";
            case "logout":
                return "bg-red-600 hover:bg-red-700 shadow-red-100";
            default:
                return "bg-teal-600 hover:bg-teal-700 shadow-teal-100";
        }
    };

    const getIconBg = () => {
        switch (type) {
            case "danger":
                return "bg-red-50";
            case "warning":
                return "bg-amber-50";
            case "logout":
                return "bg-red-50";
            default:
                return "bg-teal-50";
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                onClick={onCancel}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${getIconBg()} rounded-xl flex items-center justify-center`}>
                            {getIcon()}
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-dm-sans">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-dm-sans">
                        {message}
                    </p>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-white transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 ${getColors()} text-white px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
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
