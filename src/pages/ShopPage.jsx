import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ChevronRight, ChevronDown, Grid3X3, List, Loader2, Search } from "lucide-react";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import ProductCard from "../components/shop/ProductCard";
import FilterSidebar from "../components/shop/FilterSidebar";
import { useCategory, useCategoryProducts, useCategoryTree } from "../hooks/useCategoryTan";
import { useProducts } from "../hooks/useProductTan";

export default function ShopPage() {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const limit = 12;

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get("minPrice")) || 0,
    max: Number(searchParams.get("maxPrice")) || 500000,
  });
  const [selectedColors, setSelectedColors] = useState(
    searchParams.get("colors")?.split(",").filter(Boolean) || []
  );
  const [selectedMaterials, setSelectedMaterials] = useState(
    searchParams.get("materials")?.split(",").filter(Boolean) || []
  );
  const [selectedRating, setSelectedRating] = useState(
    Number(searchParams.get("rating")) || 0
  );

  // Sort options
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
  ];

  // Fetch category tree for sidebar
  const { data: categoryTreeData } = useCategoryTree();
  const categories = categoryTreeData?.data?.categories || [];

  // Fetch current category details (if category is selected)
  const { data: categoryData, isLoading: isCategoryLoading } = useCategory(categorySlug, {
    enabled: !!categorySlug,
  });
  const currentCategory = categoryData?.data?.category;

  // Build query params for products
  const getProductParams = () => {
    const params = { page, limit, status: "active" };

    if (searchQuery) {
      params.search = searchQuery;
    }

    // Map sort values to API params (backend uses "-field" for descending)
    switch (sortBy) {
      case "newest":
        params.sort = "-createdAt";
        break;
      case "price_low":
        params.sort = "price";
        break;
      case "price_high":
        params.sort = "-price";
        break;
      case "rating":
        params.sort = "-rating.average";
        break;
      case "featured":
      default:
        params.sort = "-isFeatured,-createdAt";
        break;
    }

    // Add filter params
    if (selectedCategories.length > 0) {
      params.categories = selectedCategories.join(",");
    }
    if (priceRange.min > 0) {
      params.minPrice = priceRange.min;
    }
    if (priceRange.max < 500000) {
      params.maxPrice = priceRange.max;
    }
    if (selectedColors.length > 0) {
      params.colors = selectedColors.join(",");
    }
    if (selectedMaterials.length > 0) {
      params.materials = selectedMaterials.join(",");
    }
    if (selectedRating > 0) {
      params.minRating = selectedRating;
    }

    return params;
  };

  // Fetch products - either by category or all products
  const {
    data: productsData,
    isLoading: isProductsLoading,
  } = categorySlug
    ? useCategoryProducts(categorySlug, getProductParams())
    : useProducts(getProductParams());

  const products = productsData?.data?.products || [];

  const pagination = productsData?.data?.pagination || {
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  };

  // Update URL when search, sort, or filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (sortBy !== "featured") params.set("sort", sortBy);
    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
    if (priceRange.min > 0) params.set("minPrice", priceRange.min.toString());
    if (priceRange.max < 500000) params.set("maxPrice", priceRange.max.toString());
    if (selectedColors.length > 0) params.set("colors", selectedColors.join(","));
    if (selectedMaterials.length > 0) params.set("materials", selectedMaterials.join(","));
    if (selectedRating > 0) params.set("rating", selectedRating.toString());
    setSearchParams(params, { replace: true });
  }, [searchQuery, sortBy, selectedCategories, priceRange, selectedColors, selectedMaterials, selectedRating]);

  // Reset page when search, sort, or filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy, categorySlug, selectedCategories, priceRange, selectedColors, selectedMaterials, selectedRating]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    setShowSortDropdown(false);
  };

  // Handle reset all filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 500000 });
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedRating(0);
    setSearchQuery("");
    setSearchInput("");
  };

  // Build breadcrumb trail
  const buildBreadcrumbs = () => {
    const crumbs = [{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }];

    if (currentCategory) {
      if (currentCategory.parent) {
        crumbs.push({
          name: currentCategory.parent.name,
          path: `/shop/${currentCategory.parent.slug}`,
        });
      }
      crumbs.push({
        name: currentCategory.name,
        path: `/shop/${currentCategory.slug}`,
      });
    }

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // Page title
  const pageTitle = currentCategory?.name || "All Products";
  const totalProducts = pagination.total;

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading = isCategoryLoading || isProductsLoading;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 pt-20 font-lato">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <ChevronRight size={14} className="text-neutral-400" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-neutral-500 font-lato">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-neutral-600 hover:text-teal-700 transition-colors font-lato"
                  >
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-playfair text-neutral-900">
                {currentCategory ? (
                  <>
                    <span className="font-bold">{pageTitle.split(" ")[0]}</span>{" "}
                    <span className="italic text-teal-700">
                      {pageTitle.split(" ").slice(1).join(" ") || "Furniture"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-bold">All</span>{" "}
                    <span className="italic text-teal-700">Products</span>
                  </>
                )}
              </h1>
              <p className="text-neutral-500 font-lato mt-1">
                Showing <span className="font-semibold text-neutral-700">{totalProducts}</span>{" "}
                products
                {currentCategory?.description && (
                  <span> for your perfect {currentCategory.name.toLowerCase()}</span>
                )}
              </p>
            </div>

            {/* Search, Sort, and View Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="sm:w-64">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm font-lato placeholder:text-neutral-400 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-colors"
                  />
                </div>
              </form>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm font-lato hover:border-neutral-300 transition-colors"
                >
                  <span className="text-neutral-500">Sort by:</span>
                  <span className="font-medium text-neutral-700">
                    {sortOptions.find(opt => opt.value === sortBy)?.label}
                  </span>
                  <ChevronDown size={16} className={`text-neutral-400 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                </button>

                {showSortDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSortDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`w-full text-left px-4 py-2 text-sm font-lato hover:bg-neutral-50 transition-colors ${
                            sortBy === option.value ? "text-teal-700 bg-teal-50" : "text-neutral-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-teal-700 text-white"
                      : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-teal-700 text-white"
                      : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <FilterSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                priceRange={{ min: 0, max: 500000 }}
                selectedPriceRange={priceRange}
                onPriceChange={setPriceRange}
                selectedColors={selectedColors}
                onColorChange={setSelectedColors}
                selectedMaterials={selectedMaterials}
                onMaterialChange={setSelectedMaterials}
                selectedRating={selectedRating}
                onRatingChange={setSelectedRating}
                onResetFilters={handleResetFilters}
              />
            </aside>

            {/* Products Section */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 size={32} className="text-teal-700 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-neutral-100">
                  <p className="text-neutral-500 font-lato">
                    {searchQuery
                      ? `No products found for "${searchQuery}"`
                      : "No products found in this category."
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                      }}
                      className="inline-block mt-4 text-teal-700 font-semibold hover:underline font-lato"
                    >
                      Clear search
                    </button>
                  )}
                  <Link
                    to="/shop"
                    className="inline-block mt-4 ml-4 text-teal-700 font-semibold hover:underline font-lato"
                  >
                    Browse all products
                  </Link>
                </div>
              ) : (
                <>
                  {/* Product Grid */}
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                        : "flex flex-col gap-4"
                    }
                  >
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} viewMode={viewMode} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-neutral-100">
                      <p className="text-sm text-neutral-500 font-lato">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} results
                      </p>

                      <div className="flex items-center gap-2">
                        {/* Previous */}
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                          className="px-3 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-lato"
                        >
                          &lt;
                        </button>

                        {/* Page Numbers */}
                        {[...Array(pagination.pages)].map((_, i) => {
                          const pageNum = i + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === pagination.pages ||
                            (pageNum >= page - 1 && pageNum <= page + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors font-lato ${
                                  pageNum === page
                                    ? "bg-teal-700 text-white"
                                    : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          if (pageNum === page - 2 || pageNum === page + 2) {
                            return (
                              <span key={pageNum} className="px-2 text-neutral-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}

                        {/* Next */}
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === pagination.pages}
                          className="px-3 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-lato"
                        >
                          &gt;
                        </button>
                      </div>

                      {/* Items per page */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500 font-lato">Show:</span>
                        <select
                          value={limit}
                          className="px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white font-lato focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none"
                          disabled
                        >
                          <option value={12}>12</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
