import { useState } from "react";
import { Star, Check } from "lucide-react";

// Color options matching the design
const colorOptions = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Beige", hex: "#D2B48C" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Green", hex: "#22c55e" },
  { name: "Navy", hex: "#1e3a5f" },
];

// Material options matching the design
const materialOptions = [
  { name: "Velvet", count: 12 },
  { name: "Leather", count: 19 },
  { name: "Wood", count: 32 },
  { name: "Metal", count: 11 },
  { name: "Fabric", count: 9 },
];

export default function FilterSidebar({
  categories = [],
  selectedCategories = [],
  onCategoryChange,
  priceRange = { min: 0, max: 500000 },
  selectedPriceRange = { min: 0, max: 500000 },
  onPriceChange,
  selectedColors = [],
  onColorChange,
  selectedMaterials = [],
  onMaterialChange,
  selectedRating = 0,
  onRatingChange,
  onResetFilters,
  materialCounts = {},
}) {
  const [localMinPrice, setLocalMinPrice] = useState(selectedPriceRange.min || 5000);
  const [localMaxPrice, setLocalMaxPrice] = useState(selectedPriceRange.max || 200000);

  const handleCategoryToggle = (categorySlug) => {
    if (selectedCategories.includes(categorySlug)) {
      onCategoryChange(selectedCategories.filter((c) => c !== categorySlug));
    } else {
      onCategoryChange([...selectedCategories, categorySlug]);
    }
  };

  const handlePriceSubmit = () => {
    onPriceChange({ min: localMinPrice, max: localMaxPrice });
  };

  const handlePriceReset = () => {
    setLocalMinPrice(5000);
    setLocalMaxPrice(200000);
    onPriceChange({ min: 0, max: 500000 });
  };

  const handleColorToggle = (colorName) => {
    if (selectedColors.includes(colorName)) {
      onColorChange(selectedColors.filter((c) => c !== colorName));
    } else {
      onColorChange([...selectedColors, colorName]);
    }
  };

  const handleMaterialToggle = (material) => {
    if (selectedMaterials.includes(material)) {
      onMaterialChange(selectedMaterials.filter((m) => m !== material));
    } else {
      onMaterialChange([...selectedMaterials, material]);
    }
  };

  // Flatten categories
  const flattenCategories = (cats, depth = 0) => {
    let result = [];
    cats.forEach((cat) => {
      result.push({ ...cat, depth });
      if (cat.subcategories?.length > 0) {
        result = [...result, ...flattenCategories(cat.subcategories, depth + 1)];
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  // Custom Checkbox
  const Checkbox = ({ checked, onChange, label, count }) => (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group" onClick={onChange}>
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          checked
            ? "bg-teal-700 border-teal-700"
            : "border-neutral-300 group-hover:border-neutral-400"
        }`}
      >
        {checked && <Check size={14} className="text-white" strokeWidth={3} />}
      </div>
      <span className="text-sm text-neutral-700 font-dm-sans flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-sm text-neutral-400 font-dm-sans">{count}</span>
      )}
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div>
        <h3 className="text-base font-semibold text-neutral-900 font-dm-sans mb-3">
          Categories
        </h3>
        <div className="space-y-1">
          {flatCategories.map((category) => (
            <Checkbox
              key={category._id || category.slug}
              checked={selectedCategories.includes(category.slug)}
              onChange={() => handleCategoryToggle(category.slug)}
              label={category.name}
              count={category.productCount || 0}
            />
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-neutral-900 font-dm-sans">
            Price Range
          </h3>
          <button
            onClick={handlePriceReset}
            className="text-sm text-teal-700 hover:text-teal-800 font-medium font-dm-sans"
          >
            Reset
          </button>
        </div>

        {/* Price Inputs */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs text-neutral-500 font-dm-sans mb-1 block">
              Min Price
            </label>
            <input
              type="text"
              value={`NRs. ${localMinPrice.toLocaleString()}`}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setLocalMinPrice(Number(val) || 0);
              }}
              onBlur={handlePriceSubmit}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm font-dm-sans focus:border-teal-600 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-neutral-500 font-dm-sans mb-1 block">
              Max Price
            </label>
            <input
              type="text"
              value={`NRs. ${localMaxPrice.toLocaleString()}`}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setLocalMaxPrice(Number(val) || 0);
              }}
              onBlur={handlePriceSubmit}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm font-dm-sans focus:border-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Slider */}
        <div className="relative px-1">
          <div className="h-1 bg-neutral-200 rounded-full">
            <div
              className="h-1 bg-teal-700 rounded-full"
              style={{
                width: `${((localMaxPrice - localMinPrice) / (priceRange.max - priceRange.min)) * 100}%`,
                marginLeft: `${(localMinPrice / priceRange.max) * 100}%`
              }}
            />
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
            onMouseUp={handlePriceSubmit}
            onTouchEnd={handlePriceSubmit}
            className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-teal-700 rounded-full shadow-sm pointer-events-none"
            style={{ left: `${(localMaxPrice / priceRange.max) * 100}%`, marginLeft: '-8px' }}
          />
        </div>
      </div>

      {/* Colors Section */}
      <div>
        <h3 className="text-base font-semibold text-neutral-900 font-dm-sans mb-3">
          Colors
        </h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => {
            const isSelected = selectedColors.includes(color.name);
            const isWhite = color.hex === "#ffffff";
            return (
              <button
                key={color.name}
                onClick={() => handleColorToggle(color.name)}
                className={`w-8 h-8 rounded-full transition-all ${
                  isSelected ? "ring-2 ring-offset-2 ring-teal-700" : ""
                } ${isWhite ? "border border-neutral-300" : ""}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            );
          })}
        </div>
      </div>

      {/* Materials Section */}
      <div>
        <h3 className="text-base font-semibold text-neutral-900 font-dm-sans mb-3">
          Materials
        </h3>
        <div className="space-y-1">
          {materialOptions.map((material) => (
            <Checkbox
              key={material.name}
              checked={selectedMaterials.includes(material.name)}
              onChange={() => handleMaterialToggle(material.name)}
              label={material.name}
              count={materialCounts[material.name] || material.count}
            />
          ))}
        </div>
      </div>

      {/* Rating Section */}
      <div>
        <h3 className="text-base font-semibold text-neutral-900 font-dm-sans mb-3">
          Rating
        </h3>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(selectedRating === rating ? 0 : rating)}
              className={`flex items-center gap-2 w-full py-2 px-2 rounded-lg transition-all ${
                selectedRating === rating
                  ? "bg-teal-50"
                  : "hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-neutral-200 text-neutral-200"
                    }
                  />
                ))}
              </div>
              <span className={`text-sm font-dm-sans ${selectedRating === rating ? "text-teal-700 font-medium" : "text-neutral-600"}`}>{rating} & up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
