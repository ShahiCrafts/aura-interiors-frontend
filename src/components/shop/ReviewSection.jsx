import { useState } from "react";
import { Star, ChevronDown, Loader2, PenLine } from "lucide-react";
import { useProductReviews, useCanReview, useUserReview } from "../../hooks/useReviewTan";
import useAuthStore from "../../store/authStore";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";

export default function ReviewSection({ productId }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [filter, setFilter] = useState({
    page: 1,
    limit: 5,
    sort: "-createdAt",
    rating: undefined,
  });

  const { isAuthenticated, user } = useAuthStore();

  // Fetch reviews
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    isFetching,
  } = useProductReviews(productId, filter);

  // Check if user can review
  const { data: canReviewData } = useCanReview(productId, {
    enabled: isAuthenticated,
  });

  // Get user's review if exists
  const { data: userReviewData } = useUserReview(productId);

  const reviews = reviewsData?.data?.reviews || [];
  const breakdown = reviewsData?.data?.breakdown || [];
  const stats = reviewsData?.data?.stats || { average: 0, total: 0 };
  const pagination = reviewsData?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const canReview = canReviewData?.data?.canReview;
  const hasReviewed = canReviewData?.data?.hasReviewed;
  const hasPurchased = canReviewData?.data?.hasPurchased;
  const userReview = userReviewData?.data?.review;

  const handleFilterChange = (newFilter) => {
    setFilter({ ...filter, ...newFilter, page: 1 });
  };

  const handleLoadMore = () => {
    setFilter({ ...filter, page: filter.page + 1 });
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleFormClose = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const sortOptions = [
    { value: "-createdAt", label: "Most Recent" },
    { value: "createdAt", label: "Oldest First" },
    { value: "-rating", label: "Highest Rated" },
    { value: "rating", label: "Lowest Rated" },
    { value: "-helpfulCount", label: "Most Helpful" },
  ];

  return (
    <div className="py-8">
      <h2 className="text-xl sm:text-2xl font-playfair font-semibold text-neutral-900 mb-6">
        Customer Reviews
      </h2>

      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 mb-8">
        {/* Overall Rating */}
        <div className="text-center sm:text-left">
          <div className="text-4xl sm:text-5xl font-bold text-neutral-900 font-playfair">
            {stats.average.toFixed(1)}
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-0.5 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className={
                  i < Math.round(stats.average)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-neutral-200 text-neutral-200"
                }
              />
            ))}
          </div>
          <p className="text-sm text-neutral-500 font-dm-sans mt-1">
            Based on {stats.total} {stats.total === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1 w-full sm:max-w-sm space-y-2">
          {breakdown.map((item) => (
            <button
              key={item.stars}
              onClick={() =>
                handleFilterChange({
                  rating: filter.rating === item.stars ? undefined : item.stars,
                })
              }
              className={`w-full flex items-center gap-3 py-1 group transition-colors ${
                filter.rating === item.stars ? "opacity-100" : "opacity-70 hover:opacity-100"
              }`}
            >
              <span className="text-sm text-neutral-600 font-dm-sans w-12 text-left">
                {item.stars} star
              </span>
              <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    filter.rating === item.stars ? "bg-teal-600" : "bg-amber-400"
                  }`}
                  style={{
                    width: stats.total > 0 ? `${(item.count / stats.total) * 100}%` : "0%",
                  }}
                />
              </div>
              <span className="text-sm text-neutral-500 font-dm-sans w-10 text-right">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Write Review Button / Login Prompt */}
      {isAuthenticated ? (
        hasReviewed ? (
          <div className="mb-6 p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-teal-700 font-dm-sans">
              You have already reviewed this product.{" "}
              <button
                onClick={() => handleEditReview(userReview)}
                className="font-semibold underline hover:no-underline"
              >
                Edit your review
              </button>
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowReviewForm(true)}
            className="mb-6 inline-flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors font-dm-sans"
          >
            <PenLine size={18} />
            Write a Review
          </button>
        )
      ) : (
        <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-600 font-dm-sans">
            <a href="/login" className="text-teal-700 font-semibold hover:underline">
              Login
            </a>{" "}
            to write a review
          </p>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6">
          <ReviewForm
            productId={productId}
            existingReview={editingReview}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
          {!hasPurchased && !editingReview && (
            <p className="mt-2 text-xs text-neutral-500 font-dm-sans">
              Note: Reviews from verified purchases get a special badge.
            </p>
          )}
        </div>
      )}

      {/* Filters and Sort */}
      {stats.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
          {/* Filter by Rating */}
          {filter.rating && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 font-dm-sans">
                Showing {filter.rating}-star reviews
              </span>
              <button
                onClick={() => handleFilterChange({ rating: undefined })}
                className="text-sm text-teal-700 font-semibold hover:underline font-dm-sans"
              >
                Clear
              </button>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative ml-auto">
            <select
              value={filter.sort}
              onChange={(e) => handleFilterChange({ sort: e.target.value })}
              className="appearance-none bg-white border border-neutral-200 rounded-lg pl-4 pr-10 py-2 text-sm text-neutral-700 font-dm-sans focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* Reviews List */}
      {isLoadingReviews ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-teal-700 animate-spin" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              productId={productId}
              onEdit={handleEditReview}
              isOwner={user?._id === review.user?._id}
            />
          ))}

          {/* Load More */}
          {pagination.page < pagination.pages && (
            <button
              onClick={handleLoadMore}
              disabled={isFetching}
              className="w-full mt-4 py-3 border border-neutral-200 rounded-lg text-neutral-700 font-semibold hover:bg-neutral-50 transition-colors font-dm-sans disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isFetching && <Loader2 size={18} className="animate-spin" />}
              {isFetching ? "Loading..." : "Load More Reviews"}
            </button>
          )}

          <p className="text-center text-sm text-neutral-500 font-dm-sans">
            Showing {reviews.length} of {pagination.total} reviews
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-500 font-dm-sans mb-2">
            No reviews yet for this product.
          </p>
          <p className="text-sm text-neutral-400 font-dm-sans">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
}
