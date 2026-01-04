import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { useCreateReview, useUpdateReview } from "../../hooks/useReviewTan";
import { toast } from "../ui/Toast";

export default function ReviewForm({
  productId,
  existingReview,
  onClose,
  onSuccess,
}) {
  const isEditing = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [errors, setErrors] = useState({});

  const { mutate: createReview, isPending: isCreating } = useCreateReview();
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview();

  const isSubmitting = isCreating || isUpdating;

  const validateForm = () => {
    const newErrors = {};

    if (!rating) {
      newErrors.rating = "Please select a rating";
    }

    if (!comment.trim()) {
      newErrors.comment = "Please write a review";
    } else if (comment.trim().length < 10) {
      newErrors.comment = "Review must be at least 10 characters";
    } else if (comment.trim().length > 1000) {
      newErrors.comment = "Review cannot exceed 1000 characters";
    }

    if (title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const reviewData = {
      rating,
      title: title.trim(),
      comment: comment.trim(),
    };

    if (isEditing) {
      updateReview(
        { productId, reviewId: existingReview._id, data: reviewData },
        {
          onSuccess: () => {
            toast.success("Review updated successfully");
            onSuccess?.();
            onClose?.();
          },
          onError: (error) => {
            toast.error(
              error?.response?.data?.message || "Failed to update review"
            );
          },
        }
      );
    } else {
      createReview(
        { productId, data: reviewData },
        {
          onSuccess: () => {
            toast.success("Review submitted successfully");
            onSuccess?.();
            onClose?.();
          },
          onError: (error) => {
            toast.error(
              error?.response?.data?.message || "Failed to submit review"
            );
          },
        }
      );
    }
  };

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 font-playfair">
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2 font-dm-sans">
            Your Rating *
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-neutral-200 text-neutral-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoveredRating || rating) > 0 && (
              <span className="text-sm text-neutral-600 font-dm-sans">
                {ratingLabels[hoveredRating || rating]}
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-500 font-dm-sans">
              {errors.rating}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="review-title"
            className="block text-sm font-medium text-neutral-700 mb-2 font-dm-sans"
          >
            Review Title (Optional)
          </label>
          <input
            type="text"
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-dm-sans"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500 font-dm-sans">
              {errors.title}
            </p>
          )}
          <p className="mt-1 text-xs text-neutral-400 font-dm-sans text-right">
            {title.length}/100
          </p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="review-comment"
            className="block text-sm font-medium text-neutral-700 mb-2 font-dm-sans"
          >
            Your Review *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product. What did you like or dislike?"
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none font-dm-sans"
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-500 font-dm-sans">
              {errors.comment}
            </p>
          )}
          <p className="mt-1 text-xs text-neutral-400 font-dm-sans text-right">
            {comment.length}/1000
          </p>
        </div>

        <div className="flex gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-neutral-200 rounded-lg text-neutral-700 font-semibold hover:bg-neutral-50 transition-colors font-dm-sans"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition-colors font-dm-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Submitting..."
              : isEditing
              ? "Update Review"
              : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
