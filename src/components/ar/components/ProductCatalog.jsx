import React from "react";
import { IoCheckmarkCircle, IoFilter } from "react-icons/io5";
import { HiOutlineCube } from "react-icons/hi2";

const formatNPR = (amount) => `NRs. ${amount?.toLocaleString("en-NP") || "0"}`;

const ProductCatalog = ({
  products,
  selectedProduct,
  onProductSelect,
  onFilterClick,
  hasActiveFilters,
  getProductImage,
}) => {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-xl rounded-t-3xl z-40 safe-bottom"
      data-hide-on-capture
    >
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 bg-white/30 rounded-full" />
      </div>

      <div className="flex justify-between items-center px-5 pb-3 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
            <HiOutlineCube size={18} className="text-teal-400" />
          </div>
          <div>
            <h2
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Collection
            </h2>
            <span className="text-xs text-white/50">
              {products.length} items available
            </span>
          </div>
        </div>
        <button
          onClick={onFilterClick}
          className="relative flex items-center gap-1.5 px-4 py-2 border border-white/20 hover:border-teal-400 hover:bg-white/10 rounded-full text-xs font-medium text-white/80 active:scale-95 transition-all"
        >
          <IoFilter size={14} />
          <span>Filter</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-400 rounded-full border-2 border-black/70" />
          )}
        </button>
      </div>

      <div className="flex gap-3 px-5 pb-5 overflow-x-auto hide-scrollbar">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-6 gap-2">
            <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center">
              <IoFilter size={18} className="text-white/40" />
            </div>
            <span className="text-sm text-white/40">No products found</span>
          </div>
        ) : (
          products.map((product) => {
            const isSelected =
              selectedProduct?._id === product._id ||
              selectedProduct?.id === product.id;
            const imageUrl = getProductImage(product);

            return (
              <button
                key={product._id || product.id}
                onClick={() => onProductSelect(product)}
                className="group shrink-0 flex flex-col items-center p-2 rounded-xl transition-all hover:bg-white/10"
              >
                <div
                  className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all ${
                    isSelected
                      ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-black/70"
                      : "border border-white/20 group-hover:border-teal-400/50"
                  }`}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <HiOutlineCube size={20} className="text-white/40" />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                      <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                        <IoCheckmarkCircle size={14} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="mt-2 text-[10px] font-medium text-white/80 text-center max-w-16 truncate">
                  {product.name}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isSelected ? "text-teal-400" : "text-white/50"
                  }`}
                >
                  {formatNPR(product.price)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
