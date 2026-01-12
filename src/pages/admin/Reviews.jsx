import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Star,
  Loader2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Send,
  Calendar,
  ThumbsUp,
  Shield,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import {
  useAllReviews,
  useAddAdminResponse,
  useToggleApproval,
  useAdminDeleteReview,
} from "../../hooks/review/useReviewTan";
import { toast } from "react-toastify";
import formatError from "../../utils/errorHandler";
import { getAvatarUrl, getImageUrl } from "../../utils/imageUrl";
import Pagination from "../../components/common/Pagination";

export default function Reviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal States
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [responseText, setResponseText] = useState("");

  const queryParams = {
    page,
    limit: pageSize,
    ...(searchQuery && { search: searchQuery }),
    ...(filterRating !== "all" && { rating: filterRating }),
    ...(filterStatus !== "all" && { isApproved: filterStatus === "approved" }),
  };

  const { data: reviewsData, isLoading, error } = useAllReviews(queryParams);
  const addResponseMutation = useAddAdminResponse();
  const toggleApprovalMutation = useToggleApproval();
  const deleteReviewMutation = useAdminDeleteReview();

  const reviews = reviewsData?.data?.reviews || [];
  const pagination = reviewsData?.data?.pagination || { total: 0, pages: 1 };

  const handleToggleApproval = async (review) => {
    try {
      await toggleApprovalMutation.mutateAsync(review._id);
      toast.success(
        `Review ${review.isApproved ? "hidden" : "approved"} successfully`
      );
    } catch (err) {
      toast.error(formatError(err, "Failed to update review status"));
    }
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReviewMutation.mutateAsync(selectedReview._id);
      toast.success("Review deleted permanently");
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(formatError(err, "Failed to delete review"));
    }
  };

  const handleResponseSubmit = async () => {
    if (!responseText.trim()) return;
    try {
      await addResponseMutation.mutateAsync({
        reviewId: selectedReview._id,
        comment: responseText.trim(),
      });
      toast.success("Response submitted");
      setShowResponseModal(false);
      setResponseText("");
    } catch (err) {
      toast.error(formatError(err, "Failed to submit response"));
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={12}
          className={
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );

  if (error)
    return (
      <div className="p-10 text-center text-red-500 bg-white rounded-xl border border-red-50 shadow-sm">
        <h2 className="text-lg font-bold mb-2 text-red-600">Error Loading Reviews</h2>
        <p className="text-sm opacity-80">{formatError(error)}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <p className="text-gray-500 mt-0.5 text-sm">
          Monitor customer feedback and product ratings
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer or product name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Ratings</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Stars
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No reviews found
            </h3>
            <p className="text-gray-500 text-sm max-w-[250px] text-center mt-1">
              We couldn't find any reviews matching your current filters or
              search criteria.
            </p>
            {(searchQuery ||
              filterRating !== "all" ||
              filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterRating("all");
                    setFilterStatus("all");
                  }}
                  className="mt-6 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Clear all filters
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reviews.map((review) => (
                  <motion.tr
                    key={review._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(review.user)}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                          alt=""
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {review.user?.firstName} {review.user?.lastName}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {review.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {review.product?.images?.[0] && (
                          <img
                            src={getImageUrl(
                              review.product.images[0].url ||
                              review.product.images[0],
                              "products"
                            )}
                            className="w-8 h-8 rounded bg-gray-50 object-cover"
                            alt=""
                          />
                        )}
                        <p className="text-sm text-gray-600 max-w-[120px] truncate font-medium">
                          {review.product?.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStars(review.rating)}
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px]">
                        <p className="text-sm text-gray-900 line-clamp-1 font-semibold">
                          {review.title || "Untitled"}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {review.comment}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${review.isApproved
                            ? "bg-teal-50 text-teal-700"
                            : "bg-amber-50 text-amber-700"
                            }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${review.isApproved ? "bg-teal-500" : "bg-amber-500"
                              }`}
                          ></span>
                          {review.isApproved ? "Approved" : "Pending"}
                        </span>
                        {review.adminResponse && (
                          <span className="text-[9px] text-blue-500 font-bold uppercase ml-1">
                            ● Responded
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setResponseText(
                              review.adminResponse?.comment || ""
                            );
                            setShowResponseModal(true);
                          }}
                          className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleApproval(review)}
                          className={`p-2 rounded-lg transition-colors ${review.isApproved
                            ? "text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                            : "text-teal-600 hover:bg-teal-50"
                            }`}
                        >
                          {review.isApproved ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={pagination.pages}
          pageSize={pageSize}
          totalItems={pagination.total}
          onPageChange={setPage}
        />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedReview && (
          <Modal
            title="Review Details"
            onClose={() => setShowDetailModal(false)}
          >
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <img
                  src={getImageUrl(
                    selectedReview.product?.images?.[0]?.url ||
                    selectedReview.product?.images?.[0],
                    "products"
                  )}
                  className="w-12 h-12 rounded-lg object-cover shadow-sm"
                  alt=""
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedReview.product?.name}
                  </p>
                  <div className="mt-1">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {selectedReview.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  "{selectedReview.comment}"
                </p>
              </div>
              <div className="flex flex-wrap gap-4 py-3 border-y border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar size={14} />{" "}
                  {new Date(selectedReview.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ThumbsUp size={14} /> {selectedReview.helpfulCount || 0}{" "}
                  helpful
                </div>
                {selectedReview.isVerifiedPurchase && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-600 uppercase">
                    <Shield size={12} /> Verified Purchase
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </Modal>
        )}

        {/* Response Modal */}
        {showResponseModal && (
          <Modal
            title="Admin Response"
            onClose={() => setShowResponseModal(false)}
          >
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800 font-semibold mb-1">
                  Customer said:
                </p>
                <p className="text-sm text-blue-900 line-clamp-2">
                  "{selectedReview.comment}"
                </p>
              </div>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response to the customer..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none"
                rows={4}
              />
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResponseSubmit}
                  disabled={
                    addResponseMutation.isPending || !responseText.trim()
                  }
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-teal-700"
                >
                  {addResponseMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Send Response
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <Modal
            title="Delete Review"
            onClose={() => setShowDeleteModal(false)}
          >
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                Are you sure you want to delete this review by{" "}
                <span className="font-bold text-gray-900">
                  {selectedReview?.user?.firstName}
                </span>
                ? This action is irreversible.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Global Modal Component used in Users/Reviews
function Modal({ title, children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl max-w-md w-full p-6 border border-gray-100 shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
