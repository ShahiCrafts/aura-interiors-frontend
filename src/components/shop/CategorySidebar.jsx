import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function CategorySidebar({
  categories,
  currentCategory,
  productCounts,
}) {
  const { categorySlug } = useParams();

  const displayCategories =
    currentCategory?.subcategories?.length > 0
      ? currentCategory.subcategories
      : categories?.filter((cat) => !cat.parent) || [];

  if (!displayCategories.length) return null;

  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-5">
      <h3 className="font-semibold text-neutral-900 font-playfair text-lg mb-4">
        Categories
      </h3>

      <div className="space-y-1">
        {displayCategories.map((category) => {
          const isActive = categorySlug === category.slug;
          const count =
            productCounts?.[category._id] || category.productCount || 0;

          return (
            <Link
              key={category._id}
              to={`/shop/${category.slug}`}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-dm-sans text-sm ${
                isActive
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <div className="flex items-center gap-2">
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-teal-700 rounded-full" />
                )}
                <span>{category.name}</span>
              </div>
              <span
                className={`text-xs ${
                  isActive ? "text-teal-600" : "text-neutral-400"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {currentCategory && (
        <Link
          to="/shop"
          className="flex items-center gap-1 mt-4 pt-4 border-t border-neutral-100 text-sm text-teal-700 font-medium hover:underline font-dm-sans"
        >
          View All Categories
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
