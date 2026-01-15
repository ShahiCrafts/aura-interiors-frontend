import { X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FilterSidebar from "./FilterSidebar";

export default function MobileFilterDrawer({
    isOpen,
    onClose,
    totalProducts,
    ...filterProps
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] z-[101] flex flex-col max-h-[96vh] font-dm-sans shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.3)] pb-safe"
                    >
                        {/* Drag Handle */}
                        <div className="w-full pt-3 pb-1 flex justify-center shrink-0">
                            <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="shrink-0 px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                                    <SlidersHorizontal size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900">Filters</h2>
                                    <p className="text-xs text-neutral-500">{totalProducts} products found</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
                                aria-label="Close filters"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 pb-24">
                            <FilterSidebar {...filterProps} />
                        </div>

                        {/* Footer / Apply Button */}
                        <div className="shrink-0 p-5 bg-white border-t border-neutral-100 absolute bottom-0 inset-x-0">
                            <button
                                onClick={onClose}
                                className="w-full h-12 bg-teal-700 text-white rounded-xl font-bold hover:bg-teal-800 transition-all active:scale-[0.98]"
                            >
                                Show {totalProducts} Products
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
