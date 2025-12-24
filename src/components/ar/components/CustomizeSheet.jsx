import React from "react";
import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import { HiOutlineCube } from "react-icons/hi2";

const COLOR_HEX_MAP = {
  white: "#FFFFFF",
  black: "#1a1a1a",
  gray: "#6B7280",
  grey: "#6B7280",
  brown: "#8B4513",
  beige: "#F5F5DC",
  navy: "#1e3a5f",
  green: "#2d5a27",
  red: "#B91C1C",
  blue: "#2563EB",
  natural: "#D4A574",
  cream: "#FFFDD0",
  charcoal: "#36454F",
  walnut: "#5D432C",
  oak: "#C4A35A",
  mahogany: "#4a1c03",
  teak: "#B8860B",
  ivory: "#FFFFF0",
  tan: "#D2B48C",
  burgundy: "#800020",
  olive: "#556B2F",
  mustard: "#FFDB58",
  coral: "#FF7F50",
  teal: "#008080",
  pink: "#FFC0CB",
  purple: "#7C3AED",
  orange: "#F97316",
  yellow: "#FCD34D",
};

const getColorHex = (colorName) => {
  if (!colorName) return null;
  const normalized = colorName.toLowerCase().trim();
  return COLOR_HEX_MAP[normalized] || null;
};

const formatNPR = (amount) => `Nrs. ${amount?.toLocaleString("en-IN") || "0"}`;

const CustomizeSheet = ({
  show,
  onClose,
  selectedProduct,
  customization,
  onCustomize,
  currentAnchor,
  setModelColor,
  triggerHaptic,
  getProductImage,
  calculateTotalPrice,
}) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-200 animate-[fade-in_0.2s_ease]"
      onClick={onClose}
    >
      <div
        className="w-full bg-black/80 backdrop-blur-xl rounded-t-3xl flex flex-col animate-[slide-up_0.35s_cubic-bezier(0.4,0,0.2,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20">
              {getProductImage(selectedProduct) ? (
                <img
                  src={getProductImage(selectedProduct)}
                  alt={selectedProduct?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <HiOutlineCube size={16} className="text-white/40" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white text-sm font-medium">
                {selectedProduct?.name}
              </h3>
              <p className="text-teal-400 text-sm font-semibold">
                {formatNPR(calculateTotalPrice())}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 text-white/70 flex items-center justify-center"
            >
              <IoClose size={16} />
            </button>
          </div>

          {/* Color Options */}
          {selectedProduct?.colors && selectedProduct.colors.length > 0 && (
            <div className="mb-4">
              <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
                Color{" "}
                {customization?.color && (
                  <span className="text-teal-400 capitalize">
                    • {customization.color}
                  </span>
                )}
              </label>
              <div className="flex gap-3 flex-wrap">
                {selectedProduct.colors.map((color, idx) => {
                  const hexColor = getColorHex(color);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onCustomize?.({ ...customization, color });
                        if (currentAnchor && hexColor) {
                          setModelColor(currentAnchor, hexColor);
                        }
                        triggerHaptic("light");
                      }}
                      className="group"
                      title={color}
                    >
                      <div
                        style={{ backgroundColor: hexColor || "#888" }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-all border-2 ${
                          customization?.color === color
                            ? "ring-2 ring-offset-2 ring-offset-black/80 ring-teal-400 scale-110 border-white/50"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        {customization?.color === color && (
                          <IoCheckmarkCircle size={18} />
                        )}
                      </div>
                      <span className="text-[9px] text-white/50 mt-1 block text-center capitalize">
                        {color}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Material Options */}
          {selectedProduct?.materials && selectedProduct.materials.length > 0 && (
            <div className="mb-4">
              <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
                Material
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.materials.map((material, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onCustomize?.({ ...customization, material });
                      triggerHaptic("light");
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
                      customization?.material === material
                        ? "bg-teal-500 text-white"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No customization options */}
          {(!selectedProduct?.colors || selectedProduct.colors.length === 0) &&
            (!selectedProduct?.materials || selectedProduct.materials.length === 0) && (
              <div className="mb-4 p-4 bg-white/5 rounded-xl text-center">
                <p className="text-white/50 text-sm">
                  No customization options available for this product.
                </p>
                <p className="text-white/30 text-xs mt-1">
                  Colors and materials can be added in admin panel.
                </p>
              </div>
            )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-teal-500 text-white rounded-full text-sm font-medium active:scale-[0.98] transition-all mb-6"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export { CustomizeSheet, COLOR_HEX_MAP, getColorHex };
export default CustomizeSheet;
