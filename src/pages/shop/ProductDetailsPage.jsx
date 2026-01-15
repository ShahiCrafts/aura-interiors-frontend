import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Star,
  Minus,
  Plus,
  RotateCcw,
  Truck,
  ShieldCheck,
  Loader2,
  Heart,
  Share2,
} from "lucide-react";
import Navbar from "../../layouts/customer/Navbar";
import Footer from "../../layouts/customer/Footer";
import { useProduct, useRelatedProducts } from "../../hooks/product/useProductTan";
import { useAddToWishlist, useRemoveFromWishlist, useCheckWishlist } from "../../hooks/cart/useWishlistTan";
import { useAddToCart } from "../../hooks/cart/useCartTan";
import useAuthStore from "../../store/authStore";
import useGuestCartStore from "../../store/guestCartStore";
import { toast } from "react-toastify";
import ProductCard from "../../components/shop/ProductCard";
import ImageMagnifier from "../../components/shop/ImageMagnifier";
import ARViewModal from "../../components/modals/ARViewModal";
import ReviewSection from "../../components/shop/ReviewSection";
import arIcon from "../../assets/icons/ar_icon.png";
import { getImageUrl as getImageUrlUtil } from "../../utils/imageUrl";
import formatError from "../../utils/errorHandler";

export default function ProductDetailsPage() {
  const { productSlug } = useParams();
  const { isAuthenticated } = useAuthStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [expandedSections, setExpandedSections] = useState({});
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const reviewsSectionRef = useRef(null);

  // Fetch product data
  const { data: productData, isLoading, error } = useProduct(productSlug);
  const product = productData?.data?.product;

  // Wishlist hooks
  const { data: wishlistCheck } = useCheckWishlist(product?._id, { enabled: isAuthenticated && !!product?._id });
  const { mutate: addToWishlist, isPending: isAddingToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemovingFromWishlist } = useRemoveFromWishlist();

  const isInWishlist = wishlistCheck?.data?.inWishlist || false;
  const isWishlistLoading = isAddingToWishlist || isRemovingFromWishlist;

  // Cart hooks
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { addItem: addToGuestCart } = useGuestCartStore();

  const handleAddToCart = () => {
    const variant = {};
    if (selectedColor) {
      variant.color = typeof selectedColor === "object" ? selectedColor.name : selectedColor;
    }
    if (selectedSize) {
      variant.size = typeof selectedSize === "object" ? selectedSize.name : selectedSize;
    }

    if (!isAuthenticated) {
      // Use guest cart for unauthenticated users
      addToGuestCart(product, quantity, variant);
      toast.success("Added to cart");
      setQuantity(1);
      return;
    }

    addToCart(
      { productId: product._id, quantity, variant },
      {
        onSuccess: () => {
          toast.success("Added to cart");
          setQuantity(1);
        },
        onError: (err) => {
          toast.error(formatError(err, "Failed to add to cart"));
        },
      }
    );
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(product._id, {
        onSuccess: () => toast.success("Removed from wishlist"),
        onError: (err) => toast.error(formatError(err, "Failed to remove from wishlist")),
      });
    } else {
      addToWishlist(product._id, {
        onSuccess: () => toast.success("Added to wishlist"),
        onError: (err) => toast.error(formatError(err, "Failed to add to wishlist")),
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Aura Interiors`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      // Ignore abort errors from user cancelling share
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
        toast.error("Failed to share");
      }
    }
  };

  // Fetch related products
  const { data: relatedData } = useRelatedProducts(product?._id, 4);
  const relatedProducts = relatedData?.data?.products || [];

  // Set default selections when product loads
  useEffect(() => {
    if (product) {
      if (product.colors?.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes?.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  // Build breadcrumbs
  const buildBreadcrumbs = () => {
    const crumbs = [{ name: "Home", path: "/" }];
    if (product?.category) {
      if (product.category.parent) {
        crumbs.push({
          name: product.category.parent.name,
          path: `/shop/${product.category.parent.slug}`,
        });
      }
      crumbs.push({
        name: product.category.name,
        path: `/shop/${product.category.slug}`,
      });
    }
    if (product) {
      crumbs.push({ name: product.name, path: "#" });
    }
    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // Get product images
  const getImages = () => {
    if (!product?.images?.length) {
      return [{ url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop" }];
    }
    return product.images;
  };

  const images = getImages();

  const getImageUrl = (image) => getImageUrlUtil(image?.url, "products");

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NP", {
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate discount
  const getDiscount = () => {
    if (product?.originalPrice && product?.price) {
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      return discount > 0 ? discount : null;
    }
    return null;
  };

  // Calculate savings
  const getSavings = () => {
    if (product?.originalPrice && product?.price) {
      return product.originalPrice - product.price;
    }
    return 0;
  };

  // Toggle accordion section
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  // Product details sections - only include sections with actual content
  const detailSections = [
    product?.warranty && { id: "warranty", title: "Warranty", content: product.warranty },
    product?.shippingInfo && { id: "shipping", title: "Shipping & Delivery", content: product.shippingInfo },
    product?.careInstructions && { id: "care", title: "Care Instructions", content: product.careInstructions },
    product?.dimensions && { id: "dimensions", title: "Dimensions & Specifications", content: `Width: ${product.dimensions.width}cm, Height: ${product.dimensions.height}cm, Depth: ${product.dimensions.depth}cm` },
  ].filter(Boolean);

  const colors = product?.colors || [];
  const sizes = product?.sizes || [];

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white pt-20 font-dm-sans">
          <div className="flex items-center justify-center h-96">
            <Loader2 size={40} className="text-teal-700 animate-spin" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white pt-20 font-dm-sans">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-playfair text-neutral-900 mb-4">Product Not Found</h1>
            <p className="text-neutral-500 font-dm-sans mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/shop"
              className="inline-block bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors font-dm-sans"
            >
              Browse Products
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const discount = getDiscount();
  const savings = getSavings();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-20 font-dm-sans pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto pb-2">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                {index > 0 && <ChevronRight size={14} className="text-neutral-400 shrink-0" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-neutral-500 font-dm-sans truncate max-w-[200px]">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-neutral-600 hover:text-teal-700 transition-colors font-dm-sans"
                  >
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative mb-4">
                <ImageMagnifier
                  src={getImageUrl(images[selectedImage])}
                  alt={product.name}
                  magnifierSize={180}
                  zoomLevel={2.5}
                  className="aspect-[4/3] w-full"
                />

                {/* Bestseller Badge */}
                {product.isFeatured && (
                  <div className="absolute top-4 left-4 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide font-dm-sans">
                    Bestseller
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    disabled={isWishlistLoading}
                    className="w-10 h-10 bg-white rounded-xl border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    <Heart
                      size={18}
                      className={isInWishlist ? "fill-red-500 text-red-500" : "text-neutral-600"}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 bg-white rounded-xl border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                  >
                    <Share2 size={18} className="text-neutral-600" />
                  </button>
                </div>

                {/* 3D/AR View Button */}
                <button
                  onClick={() => setIsARModalOpen(true)}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-xl border border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                  <img src={arIcon} alt="AR View" className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails - Horizontal */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                      ? "border-teal-700"
                      : "border-transparent hover:border-neutral-300"
                      }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Category Label */}
              {product.category?.name && (
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider font-dm-sans">
                  {product.category.name}
                </span>
              )}

              {/* Product Name */}
              <h1 className="text-2xl sm:text-3xl font-playfair text-neutral-900 mt-2 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.round(product?.rating?.average || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-neutral-200 text-neutral-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-neutral-900 font-dm-sans">
                  {(product?.rating?.average || 0).toFixed(1)}
                </span>
                <span className="text-sm text-neutral-500 font-dm-sans">
                  ({product?.rating?.count || 0} reviews)
                </span>
                <span className="text-sm text-neutral-500 font-dm-sans">
                  {product.soldCount || "2.5k"} Sold
                </span>
              </div>

              {/* Price Card */}
              <div className="inline-block bg-teal-50 rounded-xl px-4 py-3 mb-5">
                {/* Price */}
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-playfair">
                    NRs. {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-base text-neutral-400 line-through font-dm-sans">
                      NRs. {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {discount && (
                    <span className="text-xs font-semibold text-white bg-red-500 px-2.5 py-1 rounded font-dm-sans">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* EMI Info */}
                <p className="text-sm text-neutral-600 font-dm-sans">
                  {savings > 0 && (
                    <span className="text-teal-700 font-medium">Save NRs. {formatPrice(savings)}</span>
                  )}
                  {savings > 0 && " • "}
                  EMI from NRs. {formatPrice(Math.round(product.price / 12))}/month
                </p>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-neutral-600 font-dm-sans mb-6 leading-relaxed text-sm">
                  {product.description}
                </p>
              )}

              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-neutral-700 font-dm-sans mb-3">
                    Color: <span className="text-neutral-500">{selectedColor && typeof selectedColor === "object" ? selectedColor.name : selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color, index) => {
                      const colorValue = typeof color === "object" ? color.hex : color;
                      const isSelected = selectedColor === color || (!selectedColor && index === 0);
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full transition-all border border-neutral-100 ${isSelected
                            ? "ring-2 ring-teal-700 ring-offset-2 scale-110"
                            : "hover:ring-2 hover:ring-neutral-200 hover:ring-offset-2"
                            }`}
                          style={{ backgroundColor: colorValue }}
                          title={typeof color === "object" ? color.name : color}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-neutral-700 font-dm-sans mb-3">Size:</p>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size, index) => {
                      const sizeName = typeof size === "object" ? size.name : size;
                      const sizeDimensions = typeof size === "object" ? size.dimensions : null;
                      const isSelected = selectedSize === size || (!selectedSize && index === 0);
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-3 rounded-lg border transition-all font-dm-sans text-center min-w-[100px] ${isSelected
                            ? "border-teal-700 bg-white"
                            : "border-neutral-200 hover:border-neutral-400 bg-white"
                            }`}
                        >
                          <span className="block text-sm font-medium text-neutral-900">{sizeName}</span>
                          {sizeDimensions && (
                            <span className="block text-xs text-neutral-500 mt-0.5">
                              {sizeDimensions}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-6 mb-8">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-1 text-neutral-700 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={22} strokeWidth={2} />
                  </button>
                  <div className="w-11 h-11 flex items-center justify-center border border-neutral-300 rounded-lg font-semibold text-neutral-900 font-dm-sans text-base">
                    {quantity}
                  </div>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 10)}
                    className="p-1 text-neutral-700 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={22} strokeWidth={2} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex-1 bg-teal-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-800 transition-colors font-dm-sans disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="flex items-start gap-4 p-4 sm:p-5 bg-neutral-50 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                <RotateCcw size={20} className="text-neutral-700 sm:size-[22px]" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 font-dm-sans mb-1">30 Day Returns</p>
                <p className="text-sm text-neutral-500 font-dm-sans leading-relaxed">
                  Enjoy hassle-free returns with our 30-day policy for peace of mind.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 sm:p-5 bg-neutral-50 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                <Truck size={20} className="text-neutral-700 sm:size-[22px]" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 font-dm-sans mb-1">Next Day Delivery</p>
                <p className="text-sm text-neutral-500 font-dm-sans leading-relaxed">
                  Get your order delivered fast with our reliable next-day delivery service.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 sm:p-5 bg-neutral-50 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-neutral-700 sm:size-[22px]" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 font-dm-sans mb-1">Secure Payments</p>
                <p className="text-sm text-neutral-500 font-dm-sans leading-relaxed">
                  Shop confidently with our secure and seamless payment process.
                </p>
              </div>
            </div>
          </div>

          {/* Product Details and Reviews Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Product Details Accordion */}
            {detailSections.length > 0 && (
              <div>
                <h2 className="text-xl font-playfair font-semibold text-neutral-900 mb-4">
                  Product Details
                </h2>
                <div className="divide-y divide-neutral-200">
                  {detailSections.map((section) => (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between py-4 text-left hover:text-teal-700 transition-colors"
                      >
                        <span className="font-medium text-neutral-900 font-dm-sans">
                          {section.title}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`text-neutral-400 transition-transform ${expandedSections[section.id] ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                      {expandedSections[section.id] && (
                        <div className="pb-4 text-neutral-600 font-dm-sans text-sm leading-relaxed">
                          {section.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div ref={reviewsSectionRef} className="mb-12">
            <ReviewSection productId={product._id} />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-20">
              <div className="flex flex-col mb-8">
                <span className="text-teal-700 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Recommendations</span>
                <h2 className="text-3xl font-playfair font-bold text-neutral-900">
                  Complete your space
                </h2>
                <p className="text-neutral-500 text-sm mt-2 font-dm-sans">
                  Handpicked items that perfectly match the {product.style || product.category?.name} aesthetic.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* AR View Modal */}
      <ARViewModal
        isOpen={isARModalOpen}
        onClose={() => setIsARModalOpen(false)}
        product={product}
      />

      {/* Mobile Sticky Add to Cart */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-linear-to-t from-white via-white/95 to-transparent pointer-events-none">
        <div className="bg-white rounded-2xl border border-neutral-100 p-3 shadow-2xl flex items-center gap-3 pointer-events-auto">
          {/* Main Price Mini Info */}
          <div className="flex-1 pl-1">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Total Price</p>
            <p className="text-base font-bold text-neutral-900 font-playfair">
              NRs. {formatPrice(product.price * quantity)}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="flex-3 bg-teal-700 text-white h-12 rounded-xl font-bold text-sm hover:bg-teal-800 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isAddingToCart ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
