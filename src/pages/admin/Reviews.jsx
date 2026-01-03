import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronDown,
  Star,
  Loader2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Send,
  Filter,
  User,
  Package,
  Calendar,
  ThumbsUp,
  Shield,
} from 'lucide-react';
import {
  useAllReviews,
  useAddAdminResponse,
  useToggleApproval,
  useAdminDeleteReview,
} from '../../hooks/useReviewTan';
import { toast } from '../../components/ui/Toast';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const getUserAvatar = (user) => {
  if (user?.avatar) {
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return `${API_URL.replace('/api/v1', '')}/uploads/avatars/${user.avatar}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${user?.firstName || ''} ${user?.lastName || ''}`
  )}&background=0d9488&color=fff`;
};

export default function Reviews() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  const queryParams = {
    page,
    limit: pageSize,
    ...(searchQuery && { search: searchQuery }),
    ...(filterRating !== 'all' && { rating: filterRating }),
    ...(filterStatus !== 'all' && { isApproved: filterStatus === 'approved' }),
  };

  const { data: reviewsData, isLoading, error } = useAllReviews(queryParams);
  const addResponseMutation = useAddAdminResponse();
  const toggleApprovalMutation = useToggleApproval();
  const deleteReviewMutation = useAdminDeleteReview();

  const reviews = reviewsData?.data?.reviews || [];
  const pagination = reviewsData?.data?.pagination || { total: 0, pages: 1 };

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const handleOpenResponse = (review) => {
    setSelectedReview(review);
    setResponseText(review.adminResponse?.comment || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      await addResponseMutation.mutateAsync({
        reviewId: selectedReview._id,
        comment: responseText.trim(),
      });
      toast.success('Response added successfully');
      setShowResponseModal(false);
      setSelectedReview(null);
      setResponseText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add response');
    }
  };

  const handleToggleApproval = async (review) => {
    try {
      await toggleApprovalMutation.mutateAsync(review._id);
      toast.success(`Review ${review.isApproved ? 'hidden' : 'approved'} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review status');
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      await deleteReviewMutation.mutateAsync(selectedReview._id);
      toast.success('Review deleted successfully');
      setShowDeleteModal(false);
      setSelectedReview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const openDeleteModal = (review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating, size = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 mt-1">Manage customer product reviews</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-xl font-bold text-gray-900">{pagination.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-xl font-bold text-gray-900">
                {reviews.filter((r) => r.isApproved).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                {reviews.filter((r) => !r.isApproved).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">With Response</p>
              <p className="text-xl font-bold text-gray-900">
                {reviews.filter((r) => r.adminResponse).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews by user, product, or content..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
            />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Failed to load reviews. Please try again.
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getUserAvatar(review.user)}
                          alt={`${review.user?.firstName || 'User'} avatar`}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.user?.firstName} {review.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{review.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {review.product?.images?.[0] && (
                          <img
                            src={`${API_URL.replace('/api/v1', '')}/uploads/products/${review.product.images[0].url || review.product.images[0]}`}
                            alt={review.product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div className="max-w-[150px]">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {review.product?.name || 'Unknown Product'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">({review.rating})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px]">
                        {review.title && (
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {review.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 truncate">{review.comment}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {review.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <Shield size={12} />
                              Verified
                            </span>
                          )}
                          {review.helpfulCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <ThumbsUp size={12} />
                              {review.helpfulCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          review.isApproved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {review.isApproved ? (
                          <>
                            <CheckCircle size={12} />
                            Approved
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            Pending
                          </>
                        )}
                      </span>
                      {review.adminResponse && (
                        <span className="block mt-1 text-xs text-blue-600">
                          Has response
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(review)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenResponse(review)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Add Response"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleApproval(review)}
                          className={`p-2 rounded-lg transition-colors ${
                            review.isApproved
                              ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={review.isApproved ? 'Hide Review' : 'Approve Review'}
                        >
                          {review.isApproved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => openDeleteModal(review)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {page} of {pagination.pages} ({pagination.total} reviews)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Review Details</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={getUserAvatar(selectedReview.user)}
                    alt={`${selectedReview.user?.firstName || 'User'} avatar`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedReview.user?.firstName} {selectedReview.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedReview.user?.email}</p>
                  </div>
                  {selectedReview.isVerifiedPurchase && (
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <Shield size={12} />
                      Verified Purchase
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  {selectedReview.product?.images?.[0] && (
                    <img
                      src={`${API_URL.replace('/api/v1', '')}/uploads/products/${selectedReview.product.images[0].url || selectedReview.product.images[0]}`}
                      alt={selectedReview.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedReview.product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-sm text-gray-500">
                      NRs. {selectedReview.product?.price?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                {/* Rating & Review */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(selectedReview.rating, 20)}
                    <span className="text-lg font-semibold text-gray-900">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                  {selectedReview.title && (
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedReview.title}</h3>
                  )}
                  <p className="text-gray-600">{selectedReview.comment}</p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(selectedReview.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {selectedReview.helpfulCount || 0} found helpful
                  </span>
                </div>

                {/* Admin Response */}
                {selectedReview.adminResponse && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-2">Admin Response</p>
                    <p className="text-sm text-blue-900">{selectedReview.adminResponse.comment}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      {formatDate(selectedReview.adminResponse.respondedAt)}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenResponse(selectedReview);
                  }}
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  {selectedReview.adminResponse ? 'Edit Response' : 'Add Response'}
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Modal */}
      <AnimatePresence>
        {showResponseModal && selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowResponseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedReview.adminResponse ? 'Edit Response' : 'Add Response'}
                  </h2>
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Review Summary */}
                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm font-medium text-gray-900">
                      by {selectedReview.user?.firstName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{selectedReview.comment}</p>
                </div>

                {/* Response Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write a professional response to this review..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={handleSubmitResponse}
                  disabled={!responseText.trim() || addResponseMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addResponseMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  Submit Response
                </button>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
                  Delete Review?
                </h2>
                <p className="text-sm text-gray-500 text-center">
                  This will permanently delete the review by{' '}
                  <span className="font-medium text-gray-700">
                    {selectedReview.user?.firstName} {selectedReview.user?.lastName}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  disabled={deleteReviewMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteReviewMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
