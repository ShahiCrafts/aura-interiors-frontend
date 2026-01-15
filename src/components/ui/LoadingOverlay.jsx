import useLoadingStore from "../../store/loadingStore";

export default function LoadingOverlay() {
    const { isLoading, message } = useLoadingStore();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-[3px] border-neutral-200"></div>
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-teal-600 border-t-transparent animate-spin"></div>
                </div>

                {/* Message */}
                {message && (
                    <p className="text-sm font-medium text-neutral-600 font-dm-sans animate-pulse">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
