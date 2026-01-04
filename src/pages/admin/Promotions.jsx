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
  Link as LinkIcon,
  Image,
  Tag,
} from "lucide-react";
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useSendPromotion,
  useCancelPromotion,
  usePreviewAudience,
  usePromotionAnalytics,
} from "../../hooks/usePromotionTan";
import { useDiscounts } from "../../hooks/useDiscountTan";
import { toast } from "../../components/ui/Toast";

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

  // Fetch promotions
  const { data: promotionsData, isLoading } = usePromotions({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const promotions = promotionsData?.data?.promotions || [];
  const pagination = promotionsData?.data?.pagination || {};

  // Fetch discounts for dropdown
  const { data: discountsData } = useDiscounts({ status: "active" });
  const discounts = discountsData?.data?.discounts || [];

  // Mutations
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

  const handlePreviewAudience = async () => {
    try {
      const targetAudience = {
        type: promotionForm.targetAudienceType,
        categories:
          promotionForm.targetAudienceType === "category"
            ? promotionForm.targetCategories
            : undefined,
      };
      const result = await previewMutation.mutateAsync(targetAudience);
      toast.info(`Target audience: ${result.data.targetCount} users`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to preview audience");
    }
  };

  const handleSavePromotion = async () => {
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

    try {
      if (editingPromotion) {
        await updateMutation.mutateAsync({
          id: editingPromotion._id,
          data: formData,
        });
        toast.success("Promotion updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Promotion created successfully");
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleSendPromotion = async (id) => {
    if (
      confirm(
        "Are you sure you want to send this promotion now? This action cannot be undone."
      )
    ) {
      try {
        const result = await sendMutation.mutateAsync(id);
        toast.success(result.message || "Promotion sent successfully");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to send promotion");
      }
    }
  };

  const handleCancelPromotion = async (id) => {
    if (confirm("Are you sure you want to cancel this promotion?")) {
      try {
        await cancelMutation.mutateAsync(id);
        toast.success("Promotion cancelled");
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to cancel promotion"
        );
      }
    }
  };

  const handleDeletePromotion = async (id) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Promotion deleted successfully");
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to delete promotion"
        );
      }
    }
  };

  const getStatusBadge = (promotion) => {
    const statusConfig = {
      draft: {
        icon: Clock,
        bg: "bg-gray-100",
        text: "text-gray-600",
        label: "Draft",
      },
      scheduled: {
        icon: Calendar,
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Scheduled",
      },
      sending: {
        icon: Loader2,
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "Sending",
      },
      sent: {
        icon: CheckCircle,
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Sent",
      },
      cancelled: {
        icon: XCircle,
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Cancelled",
      },
    };

    const config = statusConfig[promotion.status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon
          className={`w-3.5 h-3.5 ${
            promotion.status === "sending" ? "animate-spin" : ""
          }`}
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

  // Filter by search query
  const filteredPromotions = promotions.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-playfair">
            Promotional Notifications
          </h1>
          <p className="text-gray-500 mt-1 font-dm-sans">
            {pagination.total || 0} total campaigns
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sent">Sent</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No campaigns found
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first promotional campaign to engage users
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                    Campaign
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                    Target Audience
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                    Metrics
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                    Created
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion._id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {promotion.title}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                            {promotion.shortDescription || promotion.description}
                          </p>
                          {promotion.discount && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                              <Tag className="w-3 h-3" />
                              {promotion.discount.code}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {getAudienceLabel(promotion.targetAudience)}
                        </span>
                      </div>
                      {promotion.metrics?.targetCount > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {promotion.metrics.targetCount} users targeted
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(promotion)}
                      {promotion.scheduledAt &&
                        promotion.status === "scheduled" && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(promotion.scheduledAt).toLocaleDateString()}{" "}
                            {new Date(promotion.scheduledAt).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                        )}
                    </td>
                    <td className="py-4 px-6">
                      {promotion.status === "sent" ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-gray-500">Sent</p>
                              <p className="font-medium">
                                {promotion.metrics?.sentCount || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Read</p>
                              <p className="font-medium">
                                {promotion.metrics?.readCount || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">
                        {new Date(promotion.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {promotion.status === "sent" && (
                          <button
                            onClick={() => setAnalyticsModal(promotion._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                        {(promotion.status === "draft" ||
                          promotion.status === "scheduled") && (
                          <>
                            <button
                              onClick={() => handleSendPromotion(promotion._id)}
                              disabled={sendMutation.isPending}
                              className="p-2 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Send Now"
                            >
                              <Send className="w-4 h-4 text-teal-600" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(promotion)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                          </>
                        )}
                        {promotion.status === "scheduled" && (
                          <button
                            onClick={() => handleCancelPromotion(promotion._id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                        {promotion.status !== "sending" && (
                          <button
                            onClick={() => handleDeletePromotion(promotion._id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 font-playfair">
                  {editingPromotion ? "Edit Campaign" : "Create Campaign"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={promotionForm.title}
                    onChange={(e) =>
                      setPromotionForm({ ...promotionForm, title: e.target.value })
                    }
                    placeholder="e.g., New Year Sale - 30% Off!"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={promotionForm.description}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Full campaign description..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description (for notification)
                  </label>
                  <input
                    type="text"
                    value={promotionForm.shortDescription}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="Brief message shown in notification"
                    maxLength={200}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Target Audience */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Target Audience
                    </label>
                    <button
                      type="button"
                      onClick={handlePreviewAudience}
                      disabled={previewMutation.isPending}
                      className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      {previewMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      Preview Count
                    </button>
                  </div>
                  <select
                    value={promotionForm.targetAudienceType}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        targetAudienceType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="all">All Active Users</option>
                    <option value="subscribers">
                      Promotional Subscribers Only
                    </option>
                    <option value="category">By Category Preferences</option>
                  </select>

                  {promotionForm.targetAudienceType === "category" && (
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <label
                          key={cat.value}
                          className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={promotionForm.targetCategories.includes(
                              cat.value
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPromotionForm({
                                  ...promotionForm,
                                  targetCategories: [
                                    ...promotionForm.targetCategories,
                                    cat.value,
                                  ],
                                });
                              } else {
                                setPromotionForm({
                                  ...promotionForm,
                                  targetCategories:
                                    promotionForm.targetCategories.filter(
                                      (c) => c !== cat.value
                                    ),
                                });
                              }
                            }}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm">{cat.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Linked Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Link Discount Code (Optional)
                  </label>
                  <select
                    value={promotionForm.discount}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        discount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="">No discount</option>
                    {discounts.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.code} - {d.discountPercentage}% off
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    Action URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={promotionForm.actionUrl}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        actionUrl: e.target.value,
                      })
                    }
                    placeholder="/shop?sale=true"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" />
                    Banner Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={promotionForm.imageUrl}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Schedule & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule (Optional)
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Expires On
                  </label>
                  <input
                    type="date"
                    value={promotionForm.expiresAt}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        expiresAt: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={promotionForm.tags}
                    onChange={(e) =>
                      setPromotionForm({ ...promotionForm, tags: e.target.value })
                    }
                    placeholder="sale, new-year, furniture"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePromotion}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editingPromotion ? "Update Campaign" : "Create Campaign"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {analyticsModal && (
          <AnalyticsModal
            promotionId={analyticsModal}
            onClose={() => setAnalyticsModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Analytics Modal Component
function AnalyticsModal({ promotionId, onClose }) {
  const { data, isLoading } = usePromotionAnalytics(promotionId);
  const analytics = data?.data?.analytics;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 font-playfair">
            Campaign Analytics
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {analytics.campaign.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Sent on{" "}
                  {new Date(analytics.campaign.sentAt).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Target Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.metrics.targetCount}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.metrics.sentCount}
                  </p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <p className="text-sm text-emerald-600">Delivered</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {analytics.metrics.deliveredCount}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-600">Read</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {analytics.metrics.readCount}
                  </p>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl">
                  <p className="text-sm text-teal-600">Clicked</p>
                  <p className="text-2xl font-bold text-teal-700">
                    {analytics.metrics.clickCount}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-600">Failed</p>
                  <p className="text-2xl font-bold text-red-700">
                    {analytics.metrics.failedCount}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Performance Rates
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Delivery Rate</span>
                      <span className="font-medium">
                        {analytics.rates.deliveryRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${analytics.rates.deliveryRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Engagement Rate</span>
                      <span className="font-medium">
                        {analytics.rates.engagementRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${analytics.rates.engagementRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Click-through Rate</span>
                      <span className="font-medium">
                        {analytics.rates.clickThroughRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${analytics.rates.clickThroughRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {analytics.discountUsage > 0 && (
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-600">Discount Code Used</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {analytics.discountUsage} times
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No analytics available
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
