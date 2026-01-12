import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFeaturedProducts } from "../../hooks/product/useProductTan";
import { getProductImageUrl } from "../../utils/imageUrl";
import { useAddToWishlist, useRemoveFromWishlist, useCheckWishlist } from "../../hooks/cart/useWishlistTan";
import { useAddToCart } from "../../hooks/cart/useCartTan";
import useAuthStore from "../../store/authStore";
import useGuestCartStore from "../../store/guestCartStore";
import { toast } from "react-toastify";
import Skeleton from "../../components/common/Skeleton";
import formatError from "../../utils/errorHandler";

export default function FeaturedPieces() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: featuredData, isLoading: isFeaturedLoading } = useFeaturedProducts(4);
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { addItem: addToGuestCart } = useGuestCartStore();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const rawProducts = featuredData?.data?.products || [];

  const products = rawProducts.map((p) => ({
    _id: p._id,
    slug: p.slug,
    category: p.category?.name || "COLLECTION",
    name: p.name,
    price: p.price,
    formattedPrice: `NRs. ${p.price.toLocaleString()}`,
    originalPrice: p.originalPrice,
    formattedOriginalPrice: p.originalPrice ? `NRs. ${p.originalPrice.toLocaleString()}` : null,
    image: getProductImageUrl(p),
    badge: p.isNewArrival ? "New" : (p.originalPrice > p.price ? "Sale" : null),
  }));

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToGuestCart(product, 1);
      toast.success("Added to cart");
      return;
    }

    addToCart(
      { productId: product._id, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: (err) => toast.error(formatError(err, "Failed to add to cart")),
      }
    );
  };

  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    // Since we don't have individual isInWishlist state for multiple products easily here
    // We'll just try to add, if it's already there backend should handle or we could fetch individual status
    // For simplicity and speed in sections, let's just use addToWishlist.
    addToWishlist(product._id, {
      onSuccess: () => toast.success("Added to wishlist"),
      onError: (err) => {
        if (err?.response?.status === 400 && err?.response?.data?.message?.includes('already in wishlist')) {
          removeFromWishlist(product._id, {
            onSuccess: () => toast.success("Removed from wishlist"),
            onError: (err) => toast.error(formatError(err, "Failed to remove from wishlist")),
          });
        } else {
          toast.error(formatError(err, "Failed to update wishlist"));
        }
      },
    });
  };

  return (
    <section
      ref={sectionRef}
      className="bg-white py-16 sm:py-20 px-4 sm:px-6 md:px-12 lg:px-20 font-dm-sans"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-10 sm:mb-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <div className="inline-block mb-4">
            <span className="text-xs font-semibold tracking-[0.2em] text-zinc-700 uppercase bg-zinc-100 px-6 py-2 font-dm-sans">
              Our Collection
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-900 mb-4 tracking-tight font-playfair">
            Featured <span className="italic text-teal-700">Masterpieces</span>
          </h2>
          <p className="text-zinc-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-dm-sans">
            Curated pieces that blend timeless elegance with contemporary
            innovation.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:gap-x-6 md:gap-y-12 lg:gap-8">
          {isFeaturedLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-square md:aspect-4/5 lg:aspect-3/4" />
                <div className="space-y-2">
                  <Skeleton className="w-1/3 h-3" />
                  <Skeleton className="w-3/4 h-5" />
                  <Skeleton className="w-1/2 h-6" />
                </div>
              </div>
            ))
          ) : (
            products.map((p, i) => (
              <div
                key={i}
                className={`group cursor-pointer relative transition-all duration-700 ${isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
                  }`}
                style={{
                  transitionDelay: isVisible ? `${150 + i * 100}ms` : "0ms",
                }}
                onClick={() => navigate(`/product/${p.slug || p._id}`)}
              >
                <div className="relative w-full aspect-square md:aspect-4/5 lg:aspect-3/4 overflow-hidden bg-zinc-100">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />

                  {p.badge && (
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                      <span
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-full ${p.badge === "New"
                          ? "bg-teal-700 text-white"
                          : "bg-amber-500 text-white"
                          }`}
                      >
                        {p.badge}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <button
                      onClick={(e) => handleWishlistToggle(e, p)}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 hover:text-white transition-colors"
                    >
                      <Heart size={14} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 hover:text-white transition-colors"
                    >
                      <ShoppingBag
                        size={14}
                        className="sm:w-[18px] sm:h-[18px]"
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-1.5">
                  <p className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] text-zinc-500 uppercase font-dm-sans">
                    {p.category}
                  </p>
                  <h3 className="text-sm sm:text-base md:text-lg font-medium text-zinc-900 group-hover:text-teal-700 transition-colors duration-300 font-playfair leading-snug">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-base sm:text-lg md:text-xl font-bold text-teal-700 font-playfair">
                      {p.formattedPrice}
                    </p>
                    {p.formattedOriginalPrice && (
                      <p className="text-xs sm:text-sm text-zinc-400 line-through font-dm-sans">
                        {p.formattedOriginalPrice}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className={`text-center mt-10 sm:mt-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          style={{ transitionDelay: isVisible ? "600ms" : "0ms" }}
        >
          <button className="group inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-teal-700 text-white hover:bg-teal-800 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl">
            <span className="text-sm sm:text-base font-semibold tracking-wide">
              Explore Full Collection
            </span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
