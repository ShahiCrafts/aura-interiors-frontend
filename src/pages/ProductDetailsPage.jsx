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
  ThumbsUp,
  Heart,
  Share2,
} from "lucide-react";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import { useProduct, useRelatedProducts } from "../hooks/useProductTan";
import { useAddToWishlist, useRemoveFromWishlist, useCheckWishlist } from "../hooks/useWishlistTan";
import { useAddToCart } from "../hooks/useCartTan";
import useAuthStore from "../store/authStore";
import useGuestCartStore from "../store/guestCartStore";
import { toast } from "../components/ui/Toast";
import ProductCard from "../components/shop/ProductCard";
import ImageMagnifier from "../components/shop/ImageMagnifier";
import ARViewModal from "../components/modals/ARViewModal";
import arIcon from "../assets/icons/ar_icon.png";

export default function ProductDetailsPage() {
  const { productSlug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [expandedSections, setExpandedSections] = useState({});
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const reviewsSectionRef = useRef(null);

  // Auth state
  const { isAuthenticated } = useAuthStore();

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
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Failed to add to cart");
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
        onError: () => toast.error("Failed to remove from wishlist"),
      });
    } else {
      addToWishlist(product._id, {
        onSuccess: () => toast.success("Added to wishlist"),
        onError: () => toast.error("Failed to add to wishlist"),
      });
    }
  };

  // Fetch related products
  const { data: relatedData } = useRelatedProducts(product?._id, 4);
  const relatedProducts = relatedData?.data?.products || [];

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

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

  const getImageUrl = (image) => {
    if (!image?.url) return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop";
    if (image.url.startsWith("http")) return image.url;
    return `${baseUrl.replace("/api/v1", "")}/uploads/products/${image.url}`;
  };

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

  // Mock reviews data (would come from API in production)
  const mockReviews = {
    average: product?.rating?.average || 4.5,
    total: product?.rating?.count || 150,
    breakdown: [
      { stars: 5, count: 98 },
      { stars: 4, count: 22 },
      { stars: 3, count: 12 },
      { stars: 2, count: 4 },
      { stars: 1, count: 2 },
    ],
    reviews: [
      {
        id: 1,
        user: "Shristi Shrestha",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        verified: true,
        rating: 5,
        date: "2 weeks ago",
        title: "Elegant and comfortable",
        content: "This furniture adds such elegance to my home. It's not only beautiful but also incredibly comfortable.",
        helpful: 24,
      },
      {
        id: 2,
        user: "Krishna Bhandari",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        verified: true,
        rating: 4,
        date: "1 month ago",
        title: "Great quality, minor assembly needed",
        content: "Beautiful piece with excellent quality. Assembly was straightforward but took about 30 minutes.",
        helpful: 15,
      },
      {
        id: 3,
        user: "Akash Chaudhary",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        verified: true,
        rating: 5,
        date: "2 months ago",
        title: "Loved the AR experience!",
        content: "Beautiful piece with excellent quality. Assembly was straightforward but took about 30 minutes.",
        helpful: 24,
      },
    ],
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
      <main className="min-h-screen bg-white pt-20 font-dm-sans">
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
                    className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    <Heart
                      size={18}
                      className={isInWishlist ? "fill-red-500 text-red-500" : "text-neutral-600"}
                    />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-neutral-50 transition-colors">
                    <Share2 size={18} className="text-neutral-600" />
                  </button>
                </div>

                {/* 3D/AR View Button */}
                <button
                  onClick={() => setIsARModalOpen(true)}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                  <img src={arIcon} alt="AR View" className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails - Horizontal */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
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
                        i < Math.round(mockReviews.average)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-neutral-200 text-neutral-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-neutral-900 font-dm-sans">
                  {mockReviews.average.toFixed(2)}
                </span>
                <span className="text-sm text-neutral-500 font-dm-sans">
                  ({mockReviews.total} reviews)
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
                  <div className="flex gap-3">
                    {colors.map((color, index) => {
                      const colorValue = typeof color === "object" ? color.hex : color;
                      const isSelected = selectedColor === color || (!selectedColor && index === 0);
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full transition-all ${
                            isSelected
                              ? "ring-2 ring-teal-700 ring-offset-2"
                              : "hover:ring-2 hover:ring-neutral-300 hover:ring-offset-2"
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
                          className={`px-4 py-3 rounded-lg border transition-all font-dm-sans text-center min-w-[100px] ${
                            isSelected
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
            <div className="flex items-start gap-4 p-5 bg-neutral-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                <RotateCcw size={22} className="text-neutral-700" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 font-dm-sans mb-1">30 Day Returns</p>
                <p className="text-sm text-neutral-500 font-dm-sans leading-relaxed">
                  Enjoy hassle-free returns with our 30-day policy for peace of mind.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-neutral-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                <Truck size={22} className="text-neutral-700" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 font-dm-sans mb-1">Next Day Delivery</p>
                <p className="text-sm text-neutral-500 font-dm-sans leading-relaxed">
                  Get your order delivered fast with our reliable next-day delivery service.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-neutral-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} className="text-neutral-700" />
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
                          className={`text-neutral-400 transition-transform ${
                            expandedSections[section.id] ? "rotate-180" : ""
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

            {/* Customer Reviews */}
            <div ref={reviewsSectionRef}>
              <h2 className="text-xl font-playfair font-semibold text-neutral-900 mb-4">
                Customer Reviews
              </h2>

              {/* Rating Summary */}
              <div className="flex items-start gap-8 mb-6">
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-neutral-900 font-playfair">
                    {mockReviews.average.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(mockReviews.average)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-neutral-200 text-neutral-200"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500 font-dm-sans mt-1">
                    {mockReviews.total} reviews
                  </p>
                </div>

                {/* Rating Breakdown */}
                <div className="flex-1 space-y-1.5">
                  {mockReviews.breakdown.map((item) => (
                    <div key={item.stars} className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600 font-dm-sans w-12">
                        {item.stars} star
                      </span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${(item.count / mockReviews.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-neutral-500 font-dm-sans w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {mockReviews.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-neutral-100 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={review.avatar}
                        alt={review.user}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-neutral-900 font-dm-sans">
                            {review.user}
                          </span>
                          {review.verified && (
                            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-dm-sans">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-neutral-200 text-neutral-200"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs text-neutral-400 font-dm-sans">
                            {review.date}
                          </span>
                        </div>
                        <p className="font-medium text-neutral-900 font-dm-sans mb-1">
                          {review.title}
                        </p>
                        <p className="text-sm text-neutral-600 font-dm-sans leading-relaxed">
                          {review.content}
                        </p>
                        <button className="flex items-center gap-1.5 mt-3 text-sm text-neutral-500 hover:text-teal-700 transition-colors font-dm-sans">
                          <ThumbsUp size={14} />
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Reviews Button */}
              <button className="w-full mt-4 py-3 border border-neutral-200 rounded-full text-neutral-700 font-semibold hover:bg-neutral-50 transition-colors font-dm-sans">
                View All Reviews
              </button>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-playfair font-semibold text-neutral-900 mb-6">
                You May Also Like
              </h2>
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
    </>
  );
}
