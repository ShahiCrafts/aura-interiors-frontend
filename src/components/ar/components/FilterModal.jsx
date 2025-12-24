import React from "react";
import { IoClose, IoFilter } from "react-icons/io5";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under Nrs. 10,000", min: 0, max: 10000 },
  { label: "Nrs. 10,000 - 25,000", min: 10000, max: 25000 },
  { label: "Nrs. 25,000 - 50,000", min: 25000, max: 50000 },
  { label: "Above Nrs. 50,000", min: 50000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
];

const FilterModal = ({
  show,
  onClose,
  categoryNames = [],
  filterCategory,
  setFilterCategory,
  filterPriceRange,
  setFilterPriceRange,
  filterSort,
  setFilterSort,
}) => {
  if (!show) return null;

  const handleReset = () => {
    setFilterCategory("All");
    setFilterPriceRange(PRICE_RANGES[0]);
    setFilterSort(SORT_OPTIONS[0]);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-200 animate-[fade-in_0.2s_ease]"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[70vh] bg-black/80 backdrop-blur-xl rounded-t-3xl flex flex-col animate-[slide-up_0.35s_cubic-bezier(0.4,0,0.2,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500/20 rounded-full flex items-center justify-center">
              <IoFilter size={16} className="text-teal-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Filter & Sort</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white/70 flex items-center justify-center active:scale-95 transition-all"
          >
            <IoClose size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="mb-4">
            <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                    filterCategory === cat
                      ? "bg-teal-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
              Price Range
            </label>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => setFilterPriceRange(range)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                    filterPriceRange === range
                      ? "bg-teal-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterSort(option)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                    filterSort.value === option.value
                      ? "bg-teal-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 pt-4 pb-8">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 bg-white/10 text-white/70 rounded-full text-sm font-medium active:scale-[0.98] transition-all"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-[1.5] py-2.5 bg-teal-500 text-white rounded-full text-sm font-medium active:scale-[0.98] transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export { FilterModal, PRICE_RANGES, SORT_OPTIONS };
export default FilterModal;
