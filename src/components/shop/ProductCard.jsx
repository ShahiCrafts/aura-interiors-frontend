import { Link } from "react-router-dom";
import { Star, View } from "lucide-react";

export default function ProductCard({ product }) {
  const {
    _id,
    name,
    slug,
    price,
    images,
    category,
    rating,
    arAvailable,
  } = product;

  // Get primary image or first image
  const primaryImage = images?.find((img) => img.isPrimary)?.url || images?.[0]?.url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
  const imageUrl = primaryImage
    ? `${baseUrl.replace("/api/v1", "")}/uploads/products/${primaryImage}`
    : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop";

  // Format price
  const formattedPrice = new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(price).replace("NPR", "NRs.");

  return (
    <Link
      to={`/product/${slug || _id}`}
      className="group bg-white rounded-xl overflow-hidden border border-neutral-100 hover:border-neutral-200 hover:shadow-lg transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* AR Badge */}
        {arAvailable && (
          <div className="absolute top-3 right-3 bg-teal-700 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 font-lato">
            <View size={12} />
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
        <h3 className="text-neutral-900 font-medium mt-1 line-clamp-1 group-hover:text-teal-700 transition-colors font-lato">
          {name}
        </h3>

        {/* Rating */}
        {rating?.average > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.round(rating.average)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-neutral-200 text-neutral-200"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500 font-lato">
              {rating.average.toFixed(2)}
            </span>
          </div>
        )}

        {/* Price */}
        <p className="text-teal-700 font-bold mt-2 font-playfair">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
}
