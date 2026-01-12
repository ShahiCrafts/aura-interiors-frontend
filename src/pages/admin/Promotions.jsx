import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Send,
  Calendar,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  BarChart3,
  Megaphone,
  Target,
  Bell,
  Image,
  Tag,
} from "lucide-react";
import ConfirmationDialog from "../../components/modals/ConfirmationDialog";
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useSendPromotion,
  useCancelPromotion,
  usePreviewAudience,
  usePromotionAnalytics,
} from "../../hooks/admin/usePromotionTan";
import { useDiscounts } from "../../hooks/admin/useDiscountTan";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import formatError from "../../utils/errorHandler";

const CATEGORY_OPTIONS = [
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "dining", label: "Dining" },
  { value: "office", label: "Office" },
  { value: "outdoor", label: "Outdoor" },
  { value: "storage", label: "Storage" },
  { value: "decor", label: "Decor" },
];

export default function Promotions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyticsModal, setAnalyticsModal] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [promotionForm, setPromotionForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    targetAudienceType: "subscribers",
    targetCategories: [],
    scheduledAt: "",
    discount: "",
    actionUrl: "",
    imageUrl: "",
    priority: "normal",
    tags: "",
    expiresAt: "",
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    type: "danger",
    isLoading: false,
  });

  const { data: promotionsData, isLoading } = usePromotions({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: pageSize,
  });
  const promotions = promotionsData?.data?.promotions || [];
  const pagination = promotionsData?.data?.pagination || { total: 0, pages: 1 };

  const { data: discountsData } = useDiscounts({ status: "active" });
  const discounts = discountsData?.data?.discounts || [];

  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const deleteMutation = useDeletePromotion();
  const sendMutation = useSendPromotion();
  const cancelMutation = useCancelPromotion();
  const previewMutation = usePreviewAudience();

  const handleOpenModal = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setPromotionForm({
        title: promotion.title,
        description: promotion.description || "",
        shortDescription: promotion.shortDescription || "",
        targetAudienceType: promotion.targetAudience?.type || "subscribers",
        targetCategories: promotion.targetAudience?.categories || [],
        scheduledAt: promotion.scheduledAt
          ? new Date(promotion.scheduledAt).toISOString().slice(0, 16)
          : "",
        discount: promotion.discount?._id || "",
        actionUrl: promotion.actionUrl || "",
        imageUrl: promotion.imageUrl || "",
        priority: promotion.priority || "normal",
        tags: promotion.tags?.join(", ") || "",
        expiresAt: promotion.expiresAt
          ? new Date(promotion.expiresAt).toISOString().split("T")[0]
          : "",
      });
    } else {
      setEditingPromotion(null);
      setPromotionForm({
        title: "",
        description: "",
        shortDescription: "",
        targetAudienceType: "subscribers",
        targetCategories: [],
        scheduledAt: "",
        discount: "",
        actionUrl: "",
        imageUrl: "",
        priority: "normal",
        tags: "",
        expiresAt: "",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPromotion(null);
  };

  const handlePreviewAudience = () => {
    const targetAudience = {
      type: promotionForm.targetAudienceType,
      categories:
        promotionForm.targetAudienceType === "category"
          ? promotionForm.targetCategories
          : undefined,
    };
    previewMutation.mutate(targetAudience, {
      onSuccess: (data) => {
        toast.info(`Target audience: ${data.data.targetCount} users`);
      },
      onError: (err) => {
        toast.error(formatError(err, "Failed to preview audience"));
      },
    });
  };

  const handleSavePromotion = () => {
    if (!promotionForm.title || !promotionForm.description) {
      toast.error("Please fill in required fields");
      return;
    }

    const formData = {
      title: promotionForm.title,
      description: promotionForm.description,
      shortDescription: promotionForm.shortDescription || undefined,
      targetAudience: {
        type: promotionForm.targetAudienceType,
        categories:
          promotionForm.targetAudienceType === "category"
            ? promotionForm.targetCategories
            : undefined,
      },
      scheduledAt: promotionForm.scheduledAt
        ? new Date(promotionForm.scheduledAt).toISOString()
        : undefined,
      discount: promotionForm.discount || undefined,
      actionUrl: promotionForm.actionUrl || undefined,
      imageUrl: promotionForm.imageUrl || undefined,
      priority: promotionForm.priority,
      tags: promotionForm.tags
        ? promotionForm.tags.split(",").map((t) => t.trim())
        : undefined,
      expiresAt: promotionForm.expiresAt
        ? new Date(promotionForm.expiresAt).toISOString()
        : undefined,
    };

    if (editingPromotion) {
      updateMutation.mutate(
        { id: editingPromotion._id, data: formData },
        {
          onSuccess: () => {
            toast.success("Promotion updated successfully");
            handleCloseModal();
          },
          onError: (err) => {
            toast.error(formatError(err, "Something went wrong"));
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Promotion created successfully");
          handleCloseModal();
        },
        onError: (err) => {
          toast.error(formatError(err, "Something went wrong"));
        },
      });
    }
  };

  const handleSendPromotion = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Send Promotion?",
      message: "Send this promotion now? This action cannot be undone.",
      type: "info",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        sendMutation.mutate(id, {
          onSuccess: (result) => {
            toast.success(result.message || "Promotion sent successfully");
            setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false });
          },
          onError: (err) => {
            toast.error(formatError(err, "Failed to send promotion"));
            setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          },
        });
      },
    });
  };

  const handleCancelPromotion = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Promotion?",
      message: "Are you sure you want to cancel this promotion?",
      type: "warning",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        cancelMutation.mutate(id, {
          onSuccess: () => {
            toast.success("Promotion cancelled");
            setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false });
          },
          onError: (err) => {
            toast.error(formatError(err, "Failed to cancel promotion"));
            setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          },
        });
      },
    });
  };

  const handleDeletePromotion = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Promotion?",
      message: "Delete this promotion permanently?",
      type: "danger",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        deleteMutation.mutate(id, {
          onSuccess: () => {
            toast.success("Promotion deleted successfully");
            setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false });
          },
          onError: (err) => {
            toast.error(formatError(err, "Failed to delete promotion"));
            setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          },
        });
      },
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        icon: Clock,
        bg: "bg-gray-50",
        text: "text-gray-600",
        label: "Draft",
      },
      scheduled: {
        icon: Calendar,
        bg: "bg-blue-50",
        text: "text-blue-700",
        label: "Scheduled",
      },
      sending: {
        icon: Loader2,
        bg: "bg-amber-50",
        text: "text-amber-700",
        label: "Sending",
      },
      sent: {
        icon: CheckCircle,
        bg: "bg-teal-50",
        text: "text-teal-700",
        label: "Sent",
      },
      cancelled: {
        icon: XCircle,
        bg: "bg-red-50",
        text: "text-red-700",
        label: "Cancelled",
      },
    };
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}
      >
        <Icon
          size={10}
          className={status === "sending" ? "animate-spin" : ""}
        />
        {config.label}
      </span>
    );
  };

  const getAudienceLabel = (targetAudience) => {
    if (!targetAudience) return "All Users";
    switch (targetAudience.type) {
      case "all":
        return "All Users";
      case "subscribers":
        return "Subscribers";
      case "category":
        return `${targetAudience.categories?.length || 0} Categories`;
      case "custom":
        return `${targetAudience.userIds?.length || 0} Users`;
      default:
        return "Unknown";
    }
  };

  const filteredPromotions = promotions.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Promotions & Outreach
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Create and track promotional notification campaigns
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg shadow-sm text-sm font-semibold hover:bg-teal-700 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Promotions Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No campaigns found
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
              Start engaging your users by creating your first promotional
              campaign.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Campaign Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Audience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reach/Metrics
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPromotions.map((promotion) => (
                  <motion.tr
                    key={promotion._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                          <Megaphone size={18} className="text-teal-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                            {promotion.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px] mt-0.5">
                            {promotion.shortDescription ||
                              promotion.description}
                          </p>
                          {promotion.discount && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-50 w-fit px-1.5 py-0.5 rounded">
                              <Tag size={10} /> {promotion.discount.code}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                          <Target size={12} className="text-gray-400" />
                          <span>
                            {getAudienceLabel(promotion.targetAudience)}
                          </span>
                        </div>
                        {promotion.metrics?.targetCount > 0 && (
                          <span className="text-[10px] text-gray-400">
                            {promotion.metrics.targetCount} users targeted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(promotion.status)}
                        {promotion.scheduledAt &&
                          promotion.status === "scheduled" && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Calendar size={10} />{" "}
                              {new Date(
                                promotion.scheduledAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {promotion.status === "sent" ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className="text-[10px] text-gray-400 uppercase">
                            Sent
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase">
                            Read
                          </div>
                          <div className="text-xs font-bold text-gray-900">
                            {promotion.metrics?.sentCount || 0}
                          </div>
                          <div className="text-xs font-bold text-teal-600">
                            {promotion.metrics?.readCount || 0}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">
                          Not sent yet
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {new Date(promotion.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {promotion.status === "sent" && (
                          <button
                            onClick={() => setAnalyticsModal(promotion._id)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        )}
                        {(promotion.status === "draft" ||
                          promotion.status === "scheduled") && (
                            <>
                              <button
                                onClick={() => handleSendPromotion(promotion._id)}
                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Send Now"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenModal(promotion)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        {promotion.status !== "sending" && (
                          <button
                            onClick={() => handleDeletePromotion(promotion._id)}
                            className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingPromotion ? "Edit Campaign" : "New Campaign"}
            onClose={handleCloseModal}
          >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={promotionForm.title}
                  onChange={(e) =>
                    setPromotionForm({
                      ...promotionForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Summer Clearance Sale"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Full Description
                </label>
                <textarea
                  value={promotionForm.description}
                  onChange={(e) =>
                    setPromotionForm({
                      ...promotionForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Audience Type
                  </label>
                  <select
                    value={promotionForm.targetAudienceType}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        targetAudienceType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="all">All Users</option>
                    <option value="subscribers">Subscribers Only</option>
                    <option value="category">Specific Categories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={promotionForm.priority}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {promotionForm.targetAudienceType === "category" && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                    Select Categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <label
                        key={cat.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={promotionForm.targetCategories.includes(
                            cat.value
                          )}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...promotionForm.targetCategories, cat.value]
                              : promotionForm.targetCategories.filter(
                                (c) => c !== cat.value
                              );
                            setPromotionForm({
                              ...promotionForm,
                              targetCategories: updated,
                            });
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-gray-600">
                          {cat.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Schedule
                  </label>
                  <input
                    type="datetime-local"
                    value={promotionForm.scheduledAt}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        scheduledAt: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Discount Link
                  </label>
                  <select
                    value={promotionForm.discount}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        discount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  >
                    <option value="">None</option>
                    {discounts.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.code} ({d.discountPercentage}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePromotion}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-teal-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingPromotion ? "Update Campaign" : "Launch Campaign"}
              </button>
            </div>
          </Modal>
        )}

        {analyticsModal && (
          <AnalyticsModal
            promotionId={analyticsModal}
            onClose={() => setAnalyticsModal(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        confirmText="Confirm"
        type={confirmModal.type}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}

// Reusable Modal Component (Consistent with Users page)
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
        className="bg-white rounded-xl max-w-lg w-full p-6 border border-gray-100 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
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

function AnalyticsModal({ promotionId, onClose }) {
  const { data, isLoading } = usePromotionAnalytics(promotionId);
  const analytics = data?.data?.analytics;

  return (
    <Modal title="Campaign Insights" onClose={onClose}>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : analytics ? (
        <div className="space-y-8">
          {/* Top Row: Primary KPIs */}
          <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            {[
              {
                label: "Target Count",
                val: analytics.metrics.targetCount,
                icon: Target,
              },
              {
                label: "Total Sent",
                val: analytics.metrics.sentCount,
                icon: Send,
              },
              {
                label: "Delivered",
                val: analytics.metrics.deliveredCount,
                icon: CheckCircle,
              },
              {
                label: "Read / Opened",
                val: analytics.metrics.readCount,
                icon: Eye,
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <stat.icon size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stat.val.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Section: Performance Ratios */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={14} className="text-teal-600" />
              Conversion Metrics
            </h4>

            <div className="grid gap-6">
              {[
                {
                  label: "Delivery Rate",
                  rate: analytics.rates.deliveryRate,
                  color: "bg-teal-600",
                },
                {
                  label: "Engagement Rate",
                  rate: analytics.rates.engagementRate,
                  color: "bg-blue-600",
                },
              ].map((bar, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-gray-500">
                      {bar.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {bar.rate}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.rate}%` }}
                      transition={{ duration: 0.8, ease: "circOut" }}
                      className={`h-full ${bar.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-gray-50">
            <button
              onClick={onClose}
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              Close Insights
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-sm text-gray-400 italic">No data available yet.</p>
        </div>
      )}
    </Modal>
  );
}
