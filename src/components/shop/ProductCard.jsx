import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useCheckWishlist,
} from "../../hooks/cart/useWishlistTan";
import useAuthStore from "../../store/authStore";
import { toast } from "react-toastify";
import { getProductImageUrl } from "../../utils/imageUrl";
import { useAddToCart } from "../../hooks/cart/useCartTan";
import useGuestCartStore from "../../store/guestCartStore";
import { ShoppingBag } from "lucide-react";
import formatError from "../../utils/errorHandler";

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

  const { isAuthenticated } = useAuthStore();
  const { data: wishlistCheck } = useCheckWishlist(_id, {
    enabled: isAuthenticated,
  });
  const { mutate: addToWishlist, isPending: isAdding } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemoving } =
    useRemoveFromWishlist();

  const isInWishlist = wishlistCheck?.data?.inWishlist || false;
  const isWishlistLoading = isAdding || isRemoving;

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { addItem: addToGuestCart } = useGuestCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToGuestCart(product, 1);
      toast.success("Added to cart");
      return;
    }

    addToCart(
      { productId: _id, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: (err) => toast.error(formatError(err, "Failed to add to cart")),
      }
    );
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(_id, {
        onSuccess: () => toast.success("Removed from wishlist"),
        onError: (err) => toast.error(formatError(err, "Failed to remove from wishlist")),
      });
    } else {
      addToWishlist(_id, {
        onSuccess: () => toast.success("Added to wishlist"),
        onError: (err) => toast.error(formatError(err, "Failed to add to wishlist")),
      });
    }
  };

  const imageUrl = getProductImageUrl(product);

  const formattedPrice = `NRs. ${price?.toLocaleString() || 0}`;

  const getRating = () => {
    if (rating?.average > 0) return rating.average;
    const hash = (_id || name || "")
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 4.0 + (hash % 10) / 10;
  };

  const displayRating = getRating();

  if (viewMode === "list") {
    return (
      <Link
        to={`/product/${slug || _id}`}
        className="group flex h-40 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div className="relative w-40 sm:w-48 shrink-0 overflow-hidden bg-white">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {arAvailable && (
            <div className="absolute top-3 left-3 bg-teal-700 text-white text-xs font-semibold px-2.5 py-1 rounded-md font-dm-sans">
              AR
            </div>
          )}
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Heart
              size={16}
              className={
                isInWishlist ? "fill-red-500 text-red-500" : "text-neutral-400"
              }
            />
          </button>
        </div>

        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center">
          {category?.name && (
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide font-dm-sans">
              {category.name}
            </span>
          )}

          <h3 className="text-neutral-900 font-semibold mt-1 font-playfair text-lg sm:text-xl line-clamp-1">
            {name}
          </h3>

          {shortDescription && (
            <p className="text-neutral-500 text-sm font-dm-sans mt-2 line-clamp-2 hidden sm:block">
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
            <span className="text-sm text-neutral-500 font-dm-sans">
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

  return (
    <Link
      to={`/product/${slug || _id}`}
      className="group flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-white">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />

        {arAvailable && (
          <div className="absolute top-2 left-2 bg-teal-700 text-white text-[10px] font-semibold px-2 py-1 uppercase tracking-wider font-dm-sans">
            AR View
          </div>
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 translate-x-0 lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-300 z-10">
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className="w-11 h-11 lg:w-9 lg:h-9 bg-white/95 backdrop-blur-sm border border-neutral-100 rounded-full flex items-center justify-center hover:bg-teal-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <Heart
              size={20}
              className={`lg:w-4 lg:h-4 ${isInWishlist ? "fill-red-500 text-red-500" : "text-neutral-600"}`}
            />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-11 h-11 lg:w-9 lg:h-9 bg-white/95 backdrop-blur-sm border border-neutral-100 rounded-full flex items-center justify-center hover:bg-teal-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <ShoppingBag size={20} className="lg:w-4 lg:h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1">
        {category?.name && (
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] text-zinc-500 uppercase font-dm-sans">
            {category.name}
          </p>
        )}

        <h3 className="text-sm sm:text-base font-medium text-zinc-900 group-hover:text-teal-700 transition-colors duration-300 font-playfair leading-snug line-clamp-1">
          {name}
        </h3>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.round(displayRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-zinc-200 text-zinc-200"
                }
              />
            ))}
          </div>
          <span className="text-xs text-zinc-500 font-dm-sans">
            ({displayRating.toFixed(1)})
          </span>
        </div>

        <p className="text-base font-bold text-teal-700 font-playfair">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
}
