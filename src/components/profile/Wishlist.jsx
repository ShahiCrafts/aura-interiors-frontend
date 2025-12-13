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
import { toast } from "../ui/Toast";
import { useWishlist, useRemoveFromWishlist } from "../../hooks/useWishlistTan";
import { useAddToCart } from "../../hooks/useCartTan";

export default function Wishlist() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data, isLoading, error } = useWishlist();
  const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const wishlistItems = data?.data?.wishlist?.items || [];
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

  // Get unique categories from wishlist items
  const categories = [...new Set(wishlistItems.map((item) => item.product?.category?.name).filter(Boolean))];

  // Filter and sort items
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
      onError: () => {
        toast.error("Failed to remove from wishlist");
      },
    });
  };

  const handleAddToCart = (product) => {
    addToCart(
      { productId: product._id, quantity: 1 },
      {
        onSuccess: () => toast.success(`${product.name} added to cart`),
        onError: () => toast.error("Failed to add to cart"),
      }
    );
  };

  const handleAddAllToCart = () => {
    filteredItems.forEach((item) => {
      if (item.product) {
        addToCart(
          { productId: item.product._id, quantity: 1 },
          {
            onError: () => toast.error(`Failed to add ${item.product.name} to cart`),
          }
        );
      }
    });
    toast.success("Adding all items to cart");
  };

  const getImageUrl = (product) => {
    const primaryImage = product?.images?.find((img) => img.isPrimary)?.url || product?.images?.[0]?.url;
    if (!primaryImage) {
      return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop";
    }
    if (primaryImage.startsWith("http")) return primaryImage;
    return `${baseUrl.replace("/api/v1", "")}/uploads/products/${primaryImage}`;
  };

  const getDiscountPercentage = (product) => {
    if (product?.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
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
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-playfair text-neutral-900">
            <span className="font-bold">My</span>{" "}
            <span className="italic text-teal-700">Wishlist</span>
          </h1>
          <p className="text-neutral-500 font-lato text-sm mt-1">
            Items you love, saved for later
          </p>
        </div>
        {wishlistItems.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Share2 size={18} className="text-neutral-500" />
            </button>
            <button
              onClick={handleAddAllToCart}
              disabled={isAddingToCart}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-all duration-300 font-lato text-sm disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {isAddingToCart ? "Adding..." : "Add All to Cart"}
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      {wishlistItems.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Search and Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search your wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-sm"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-sm bg-white cursor-pointer"
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

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-sm bg-white cursor-pointer"
                >
                  <option value="recent">Recently Added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Right: Item Count */}
            <span className="text-sm text-neutral-500 font-lato whitespace-nowrap">
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} in wishlist
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {wishlistItems.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 font-lato mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-neutral-500 font-lato mb-6">
            Start adding products you love to your wishlist
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-full transition-all font-lato"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* No Results */}
      {wishlistItems.length > 0 && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 font-lato">
            No items match your search criteria
          </p>
        </div>
      )}

      {/* Wishlist Grid */}
      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                  <Link to={`/product/${product.slug || product._id}`}>
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {discount && (
                      <span className="px-2.5 py-1 bg-teal-700 text-white text-xs font-semibold rounded-md font-lato">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Heart Button */}
                  <button
                    onClick={() => handleRemove(product._id)}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart size={18} className="fill-red-500 text-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category */}
                  {product.category?.name && (
                    <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide font-lato">
                      {product.category.name}
                    </span>
                  )}

                  {/* Name */}
                  <Link to={`/product/${product.slug || product._id}`}>
                    <h3 className="text-neutral-900 font-semibold mt-1 line-clamp-1 font-playfair text-base hover:text-teal-700 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                    </div>
                    <span className="text-sm text-neutral-700 font-lato font-medium">
                      {rating.toFixed(1)}
                    </span>
                    {reviewCount > 0 && (
                      <span className="text-sm text-neutral-400 font-lato">
                        ({reviewCount})
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-teal-700 font-bold font-playfair text-lg">
                      NRs. {product.price?.toLocaleString()}
                    </p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-neutral-400 line-through text-sm font-lato">
                        NRs. {product.originalPrice?.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAddingToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors font-lato text-sm disabled:opacity-50"
                    >
                      <ShoppingCart size={16} />
                      {isAddingToCart ? "Adding..." : "Add to Cart"}
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
