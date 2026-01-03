import { useState } from "react";
import { Star, ThumbsUp, MoreVertical, Edit2, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { useMarkHelpful, useDeleteReview } from "../../hooks/useReviewTan";
import useAuthStore from "../../store/authStore";
import { toast } from "../ui/Toast";

export default function ReviewItem({ review, productId, onEdit, isOwner }) {
  const [showMenu, setShowMenu] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  
  const { mutate: markHelpful, isPending: isMarkingHelpful } = useMarkHelpful();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

  const hasVoted = isAuthenticated && review.helpfulVotes?.includes(user?._id);

  const handleMarkHelpful = () => {
    if (!isAuthenticated) {
      toast.error("Please login to mark reviews as helpful");
      return;
    }

    markHelpful(
      { productId, reviewId: review._id },
      {
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Failed to mark as helpful");
        },
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      deleteReview(
        { productId, reviewId: review._id },
        {
          onSuccess: () => {
            toast.success("Review deleted successfully");
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to delete review");
          },
        }
      );
    }
    setShowMenu(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const getUserAvatar = () => {
    if (review.user?.avatar) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
      if (review.user.avatar.startsWith("http")) {
        return review.user.avatar;
      }
      return `${baseUrl.replace("/api/v1", "")}/uploads/avatars/${review.user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${review.user?.firstName || ""} ${review.user?.lastName || ""}`
    )}&background=0d9488&color=fff`;
  };

  const getUserName = () => {
    return `${review.user?.firstName || "Anonymous"} ${review.user?.lastName || ""}`.trim();
  };

  return (
    <div className="bg-white border border-neutral-100 rounded-xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <img
          src={getUserAvatar()}
          alt={getUserName()}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-neutral-900 font-dm-sans">
                  {getUserName()}
                </span>
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-dm-sans">
                    <CheckCircle size={12} />
                    Verified Purchase
                  </span>
                )}
              </div>

              {/* Rating and Date */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-neutral-200 text-neutral-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-400 font-dm-sans">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions Menu */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <MoreVertical size={18} />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                      <button
                        onClick={() => {
                          onEdit?.(review);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 font-dm-sans"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-dm-sans"
                      >
                        {isDeleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Review Title */}
          {review.title && (
            <h4 className="font-medium text-neutral-900 font-dm-sans mb-1">
              {review.title}
            </h4>
          )}

          {/* Review Comment */}
          <p className="text-sm text-neutral-600 font-dm-sans leading-relaxed mb-3">
            {review.comment}
          </p>

          {/* Admin Response */}
          {review.adminResponse?.comment && (
            <div className="bg-neutral-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-teal-700 mb-1 font-dm-sans">
                Response from Aura Interiors
              </p>
              <p className="text-sm text-neutral-600 font-dm-sans">
                {review.adminResponse.comment}
              </p>
            </div>
          )}

          {/* Helpful Button */}
          <button
            onClick={handleMarkHelpful}
            disabled={isMarkingHelpful}
            className={`flex items-center gap-1.5 text-sm transition-colors font-dm-sans ${
              hasVoted
                ? "text-teal-700"
                : "text-neutral-500 hover:text-teal-700"
            }`}
          >
            {isMarkingHelpful ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ThumbsUp size={14} className={hasVoted ? "fill-teal-700" : ""} />
            )}
            Helpful ({review.helpfulCount || 0})
          </button>
        </div>
      </div>
    </div>
  );
}
