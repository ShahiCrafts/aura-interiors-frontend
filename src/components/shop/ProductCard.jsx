import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function ProductCard({ product, viewMode = "grid" }) {
  const {
    _id,
    name,
    slug,
    price,
    images,
    category,
    rating,
    arAvailable,
    shortDescription,
  } = product;

  // Get primary image or first image
  const primaryImage = images?.find((img) => img.isPrimary)?.url || images?.[0]?.url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
  const imageUrl = primaryImage
    ? `${baseUrl.replace("/api/v1", "")}/uploads/products/${primaryImage}`
    : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop";

  // Format price
  const formattedPrice = `NRs. ${price?.toLocaleString() || 0}`;

  // Get rating value - use actual rating or generate consistent mock rating based on product id
  const getRating = () => {
    if (rating?.average > 0) return rating.average;
    // Generate a consistent mock rating between 4.0 and 5.0 based on product id
    const hash = (_id || name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 4.0 + (hash % 10) / 10;
  };

  const displayRating = getRating();

  // List view layout
  if (viewMode === "list") {
    return (
      <Link
        to={`/product/${slug || _id}`}
        className="group flex bg-white rounded-xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative w-48 sm:w-56 shrink-0 overflow-hidden bg-neutral-100">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {arAvailable && (
            <div className="absolute top-3 left-3 bg-teal-700 text-white text-xs font-semibold px-2.5 py-1 rounded-md font-lato">
              AR
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
          {category?.name && (
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide font-lato">
              {category.name}
            </span>
          )}

          <h3 className="text-neutral-900 font-semibold mt-1 font-playfair text-lg sm:text-xl line-clamp-1">
            {name}
          </h3>

          {shortDescription && (
            <p className="text-neutral-500 text-sm font-lato mt-2 line-clamp-2 hidden sm:block">
              {shortDescription}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(displayRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-neutral-200 text-neutral-200"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-neutral-500 font-lato">
              {displayRating.toFixed(1)}
            </span>
          </div>

          <p className="text-teal-700 font-bold mt-2 font-playfair text-lg sm:text-xl">
            {formattedPrice}
          </p>
        </div>
      </Link>
    );
  }

  // Grid view layout (default)
  return (
    <Link
      to={`/product/${slug || _id}`}
      className="group bg-white rounded-xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-all duration-300"
    >
      {/* Image Container - 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* AR Badge */}
        {arAvailable && (
          <div className="absolute top-3 right-3 bg-teal-700 text-white text-xs font-semibold px-2.5 py-1 rounded-md font-lato">
            AR
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category Label */}
        {category?.name && (
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide font-lato">
            {category.name}
          </span>
        )}

        {/* Product Name */}
        <h3 className="text-neutral-900 font-semibold mt-1 line-clamp-1 font-playfair text-base">
          {name}
        </h3>

        {/* Rating - Always show */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.round(displayRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-neutral-200 text-neutral-200"
                }
              />
            ))}
          </div>
          <span className="text-sm text-neutral-500 font-lato">
            {displayRating.toFixed(1)}
          </span>
        </div>

        {/* Price */}
        <p className="text-teal-700 font-bold mt-2 font-playfair text-lg">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
}
