import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Search,
  ShoppingCart,
  ChevronDown,
  Star,
  Eye,
  Loader2,
  Share2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useWishlist, useRemoveFromWishlist } from "../../hooks/cart/useWishlistTan";
import { useAddToCart } from "../../hooks/cart/useCartTan";
import { getProductImageUrl } from "../../utils/imageUrl";
import formatError from "../../utils/errorHandler";

export default function Wishlist() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data, isLoading, error } = useWishlist();
  const { mutate: removeFromWishlist, isPending: isRemoving } =
    useRemoveFromWishlist();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const wishlistItems = data?.data?.wishlist?.items || [];

  const categories = [
    ...new Set(
      wishlistItems.map((item) => item.product?.category?.name).filter(Boolean)
    ),
  ];

  const filteredItems = wishlistItems
    .filter((item) => {
      const product = item.product;
      if (!product) return false;

      const matchesSearch =
        searchQuery === "" ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category?.name === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.addedAt) - new Date(a.addedAt);
      }
      if (sortBy === "price-low") {
        return (a.product?.price || 0) - (b.product?.price || 0);
      }
      if (sortBy === "price-high") {
        return (b.product?.price || 0) - (a.product?.price || 0);
      }
      if (sortBy === "name") {
        return (a.product?.name || "").localeCompare(b.product?.name || "");
      }
      return 0;
    });

  const handleRemove = (productId) => {
    removeFromWishlist(productId, {
      onSuccess: () => {
        toast.success("Removed from wishlist");
      },
      onError: (err) => {
        toast.error(formatError(err, "Failed to remove from wishlist"));
      },
    });
  };

  const handleAddToCart = (product) => {
    addToCart(
      { productId: product._id, quantity: 1 },
      {
        onSuccess: () => toast.success(`${product.name} added to cart`),
        onError: (err) => toast.error(formatError(err, "Failed to add to cart")),
      }
    );
  };

  const handleAddAllToCart = () => {
    filteredItems.forEach((item) => {
      if (item.product) {
        addToCart(
          { productId: item.product._id, quantity: 1 },
          {
            onError: (err) =>
              toast.error(formatError(err, `Failed to add ${item.product.name} to cart`)),
          }
        );
      }
    });
    toast.success("Adding all items to cart");
  };

  const handleShareWishlist = async () => {
    const shareData = {
      title: 'My Aura Interiors Wishlist',
      text: `Check out these beautiful pieces I found at Aura Interiors!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Wishlist link copied to clipboard!");
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Wishlist link copied to clipboard!");
      }
    }
  };

  const getImageUrl = (product) => getProductImageUrl(product);

  const getDiscountPercentage = (product) => {
    if (product?.originalPrice && product.originalPrice > product.price) {
      return Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="text-teal-700 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
        <div className="text-center text-red-500 py-8">
          Failed to load wishlist. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div>
          <h2 className="text-2xl font-playfair text-neutral-900">
            <span className="font-medium">My</span>{" "}
            <span className="italic text-teal-700">Wishlist</span>
          </h2>
          <p className="text-neutral-500 font-dm-sans text-sm mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} you love, saved for later
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShareWishlist}
              className="p-3 bg-white border border-neutral-200 rounded-xl text-neutral-500 hover:bg-neutral-50 transition-colors shrink-0"
              title="Share Wishlist"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={handleAddAllToCart}
              disabled={isAddingToCart}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl transition-all duration-300 font-dm-sans text-sm disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              <span className="whitespace-nowrap">{isAddingToCart ? "Adding..." : "Add All to Cart"}</span>
            </button>
          </div>
        )}
      </div>

      {wishlistItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-dm-sans text-sm placeholder:text-neutral-400 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:flex sm:flex-row">
            <div className="relative sm:min-w-[160px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-dm-sans text-sm bg-white appearance-none cursor-pointer text-neutral-600"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>

            <div className="relative sm:min-w-[160px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-dm-sans text-sm bg-white appearance-none cursor-pointer text-neutral-600"
              >
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {wishlistItems.length === 0 && (
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-12 sm:p-20 text-center shadow-sm">
          <div className="w-24 h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transform -rotate-6">
            <Heart size={40} className="text-teal-600" />
          </div>
          <h3 className="text-3xl font-playfair font-medium text-neutral-900 mb-4 tracking-tight">
            Your Wishlist is <span className="italic text-teal-700">Empty</span>
          </h3>
          <p className="text-neutral-500 font-dm-sans max-w-sm mx-auto mb-10 leading-relaxed">
            Discover pieces that speak to you and save them here for later inspiration.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-full transition-all duration-300 font-dm-sans"
          >
            Start Exploring
          </Link>
        </div>
      )}

      {wishlistItems.length > 0 && filteredItems.length === 0 && (
        <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center shadow-sm italic text-neutral-400 font-dm-sans">
          No items match your search criteria.
        </div>
      )}

      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const product = item.product;
            if (!product) return null;

            const discount = getDiscountPercentage(product);
            const rating = product.rating?.average || 4.5;
            const reviewCount = product.rating?.count || 0;

            return (
              <div
                key={item._id || product._id}
                className="group bg-white rounded-xl border border-neutral-100 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                  <Link to={`/product/${product.slug || product._id}`}>
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {discount && (
                      <span className="px-2.5 py-1 bg-teal-700 text-white text-xs font-semibold rounded-md font-dm-sans">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemove(product._id)}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart size={18} className="fill-red-500 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  {product.category?.name && (
                    <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide font-dm-sans">
                      {product.category.name}
                    </span>
                  )}

                  <Link to={`/product/${product.slug || product._id}`}>
                    <h3 className="text-neutral-900 font-semibold mt-1 line-clamp-1 font-playfair text-base hover:text-teal-700 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="flex items-center">
                      <Star
                        size={14}
                        className="fill-amber-400 text-amber-400"
                      />
                    </div>
                    <span className="text-sm text-neutral-700 font-dm-sans font-medium">
                      {rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-teal-700 font-bold font-playfair text-lg">
                      NRs. {product.price?.toLocaleString()}
                    </p>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <p className="text-neutral-400 line-through text-sm font-dm-sans">
                          NRs. {product.originalPrice?.toLocaleString()}
                        </p>
                      )}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAddingToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors font-dm-sans text-sm disabled:opacity-50"
                    >
                      <ShoppingCart size={16} />
                      {isAddingToCart ? "..." : "Add to Cart"}
                    </button>
                    <Link
                      to={`/product/${product.slug || product._id}`}
                      className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <Eye size={18} className="text-neutral-500" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
