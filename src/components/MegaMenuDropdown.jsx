import { Link } from "react-router-dom";
import {
  ChevronRight,
  Sofa,
  Lamp,
  UtensilsCrossed,
  Armchair,
  BedDouble,
  Monitor,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Package,
} from "lucide-react";
import { useCategoryTree } from "../hooks/useCategoryTan";
import { useFeaturedProducts } from "../hooks/useProductTan";

// Map category names/slugs to icons
const categoryIcons = {
  "living-room": Sofa,
  "bedroom": BedDouble,
  "dining": UtensilsCrossed,
  "office": Monitor,
  "accent-seating": Armchair,
  "lighting": Lamp,
  default: Package,
};

const getIconForCategory = (slug) => {
  return categoryIcons[slug] || categoryIcons.default;
};

export default function MegaMenuDropdown({ isOpen, onMouseEnter, onMouseLeave, onClose }) {
  // Fetch categories from API
  const { data: categoryData } = useCategoryTree();
  const categories = categoryData?.data?.categories?.filter(cat => !cat.parent) || [];

  // Fetch featured products
  const { data: featuredData } = useFeaturedProducts(2);
  const featuredProducts = featuredData?.data?.products || [];

  // Get product image URL
  const getProductImageUrl = (product) => {
    const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
    if (primaryImage) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
      return `${baseUrl.replace("/api/v1", "")}/uploads/products/${primaryImage}`;
    }
    return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop";
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(price).replace("NPR", "NRs.");
  };

  return (
    <div
      className={`hidden lg:block fixed top-[73px] left-0 right-0 z-40 transition-all duration-300 ${
        isOpen
          ? "opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-4"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white border-b border-neutral-200 shadow-2xl font-lato">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Categories */}
            <div className="col-span-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-teal-700/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                </div>
                <h3 className="font-semibold text-neutral-900 font-playfair">
                  Shop by Category
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 6).map((category) => {
                  const IconComponent = getIconForCategory(category.slug);
                  return (
                    <Link
                      key={category._id}
                      to={`/shop/${category.slug}`}
                      onClick={onClose}
                      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-teal-700/5 transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center group-hover:bg-teal-700/10 transition-colors">
                        <IconComponent className="w-5 h-5 text-neutral-600 group-hover:text-teal-700 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800 group-hover:text-teal-700 transition-colors font-lato">
                          {category.name}
                        </p>
                        <p className="text-xs text-neutral-500 font-lato">
                          {category.productCount || 0} items
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link
                to="/shop"
                onClick={onClose}
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-teal-700 hover:underline font-lato"
              >
                View All Categories
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trending Now */}
            <div className="col-span-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-teal-700/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-teal-700" />
                </div>
                <h3 className="font-semibold text-neutral-900 font-playfair">
                  Trending Now
                </h3>
              </div>
              <div className="space-y-3">
                {featuredProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product.slug || product._id}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 p-2 rounded-xl hover:bg-neutral-50 transition-all duration-200"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 group-hover:text-teal-700 transition-colors font-lato line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-base font-bold text-teal-700 mt-0.5 font-playfair">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-teal-700/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-teal-700" />
                </div>
                <h3 className="font-semibold text-neutral-900 font-playfair">
                  Quick Links
                </h3>
              </div>
              <div className="space-y-2">
                <Link
                  to="/shop?sort=newest"
                  onClick={onClose}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-teal-700/5 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800 group-hover:text-teal-700 transition-colors font-lato">
                      New Arrivals
                    </p>
                    <p className="text-xs text-neutral-500 font-lato">
                      Latest additions
                    </p>
                  </div>
                </Link>
                <Link
                  to="/shop?sort=price_low"
                  onClick={onClose}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-teal-700/5 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800 group-hover:text-teal-700 transition-colors font-lato">
                      Best Value
                    </p>
                    <p className="text-xs text-neutral-500 font-lato">
                      Budget-friendly picks
                    </p>
                  </div>
                </Link>
                <Link
                  to="/shop?sort=rating"
                  onClick={onClose}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-teal-700/5 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800 group-hover:text-teal-700 transition-colors font-lato">
                      Top Rated
                    </p>
                    <p className="text-xs text-neutral-500 font-lato">
                      Customer favorites
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-neutral-600 font-lato">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Free shipping on orders over NRs. 50,000
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 font-lato">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                30-day returns
              </div>
            </div>
            <Link
              to="/shop"
              onClick={onClose}
              className="flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline font-lato"
            >
              Browse All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 -z-10"
        onClick={onMouseLeave}
      />
    </div>
  );
}
