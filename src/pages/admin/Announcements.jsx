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
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Megaphone,
  Pin,
  Archive,
  FileText,
  AlertTriangle,
  Info,
  Users,
  Link as LinkIcon,
  Image,
  Tag,
} from "lucide-react";
import ConfirmationDialog from "../../components/modals/ConfirmationDialog";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useScheduleAnnouncement,
  useArchiveAnnouncement,
  useAnnouncementStats,
} from "../../hooks/admin/useAnnouncementTan";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import formatError from "../../utils/errorHandler";

const TYPE_OPTIONS = [
  { value: "general", label: "General", icon: Info, color: "bg-blue-500" },
  { value: "maintenance", label: "Maintenance", icon: AlertTriangle, color: "bg-yellow-500" },
  { value: "update", label: "Update", icon: CheckCircle, color: "bg-green-500" },
  { value: "promotion", label: "Promotion", icon: Megaphone, color: "bg-purple-500" },
  { value: "policy", label: "Policy", icon: FileText, color: "bg-gray-500" },
  { value: "event", label: "Event", icon: Calendar, color: "bg-pink-500" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "text-gray-500" },
  { value: "normal", label: "Normal", color: "text-blue-500" },
  { value: "high", label: "High", color: "text-orange-500" },
  { value: "critical", label: "Critical", color: "text-red-500" },
];

const TARGET_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "customers", label: "Customers Only" },
  { value: "admins", label: "Admins Only" },
];

const STATUS_BADGE = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "Scheduled" },
  published: { bg: "bg-green-100", text: "text-green-700", label: "Published" },
  archived: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Archived" },
};

export default function Announcements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    summary: "",
    type: "general",
    priority: "normal",
    targetAudienceType: "all",
    isPinned: false,
    imageUrl: "",
    actionUrl: "",
    actionLabel: "",
    expiresAt: "",
    tags: "",
    targetRoles: [],
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    type: "danger",
    isLoading: false,
  });

  // Fetch announcements
  const { data: announcementsData, isLoading } = useAnnouncements({
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    page,
    limit: pageSize,
  });
  const announcements = announcementsData?.data?.announcements || [];
  const pagination = announcementsData?.data?.pagination || {};

  // Fetch stats
  const { data: statsData } = useAnnouncementStats();
  const stats = statsData?.data?.stats || {};

  // Mutations
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const publishMutation = usePublishAnnouncement();
  const scheduleMutation = useScheduleAnnouncement();
  const archiveMutation = useArchiveAnnouncement();

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({
        title: announcement.title,
        content: announcement.content || "",
        summary: announcement.summary || "",
        type: announcement.type || "general",
        priority: announcement.priority || "normal",
        targetAudienceType: announcement.targetAudience?.type || "all",
        isPinned: announcement.isPinned || false,
        imageUrl: announcement.imageUrl || "",
        actionUrl: announcement.actionUrl || "",
        actionLabel: announcement.actionLabel || "",
        expiresAt: announcement.expiresAt
          ? new Date(announcement.expiresAt).toISOString().split("T")[0]
          : "",
        tags: announcement.tags?.join(", ") || "",
      });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({
        title: "",
        content: "",
        summary: "",
        type: "general",
        priority: "normal",
        targetAudienceType: "all",
        isPinned: false,
        imageUrl: "",
        actionUrl: "",
        actionLabel: "",
        expiresAt: "",
        tags: "",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSaveAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      toast.error("Please fill in title and content");
      return;
    }

    const formData = {
      title: announcementForm.title,
      content: announcementForm.content,
      summary: announcementForm.summary || undefined,
      type: announcementForm.type,
      priority: announcementForm.priority,
      targetAudience: {
        type: announcementForm.targetAudienceType,
      },
      isPinned: announcementForm.isPinned,
      imageUrl: announcementForm.imageUrl || undefined,
      actionUrl: announcementForm.actionUrl || undefined,
      actionLabel: announcementForm.actionLabel || undefined,
      expiresAt: announcementForm.expiresAt
        ? new Date(announcementForm.expiresAt).toISOString()
        : undefined,
      tags: announcementForm.tags
        ? announcementForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
    };

    try {
      if (editingAnnouncement) {
        await updateMutation.mutateAsync({
          id: editingAnnouncement._id,
          data: formData,
        });
        toast.success("Announcement updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Announcement created successfully");
      }
      handleCloseModal();
    } catch (err) {
      toast.error(formatError(err, "Something went wrong"));
    }
  };

  const handlePublish = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Publish Announcement?",
      message: "Are you sure you want to publish this announcement? Users will be notified.",
      type: "info",
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await publishMutation.mutateAsync(id);
          toast.success("Announcement published successfully");
          setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false });
        } catch (err) {
          toast.error(formatError(err, "Failed to publish"));
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const handleSchedule = async () => {
    if (!scheduledTime) {
      toast.error("Please select a date and time");
      return;
    }
    try {
      await scheduleMutation.mutateAsync({
        id: scheduleModal._id,
        scheduledAt: new Date(scheduledTime).toISOString(),
      });
      toast.success("Announcement scheduled successfully");
      setScheduleModal(null);
      setScheduledTime("");
    } catch (err) {
      toast.error(formatError(err, "Failed to schedule"));
    }
  };

  const handleArchive = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Archive Announcement?",
      message: "Are you sure you want to archive this announcement?",
      type: "warning",
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await archiveMutation.mutateAsync(id);
          toast.success("Announcement archived successfully");
          setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false });
        } catch (err) {
          toast.error(formatError(err, "Failed to archive"));
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Announcement?",
      message: "Are you sure you want to delete this announcement? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await deleteMutation.mutateAsync(id);
          toast.success("Announcement deleted successfully");
          setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false });
        } catch (err) {
          toast.error(formatError(err, "Failed to delete"));
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Filter announcements by search
  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeInfo = (type) => TYPE_OPTIONS.find((t) => t.value === type) || TYPE_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-playfair">
            Announcements
          </h1>
          <p className="text-gray-500 mt-1 font-dm-sans">
            Manage announcements and share updates with users
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500 font-dm-sans">Draft</div>
          <div className="text-2xl font-bold text-gray-700">{stats.byStatus?.draft || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500 font-dm-sans">Scheduled</div>
          <div className="text-2xl font-bold text-blue-600">{stats.byStatus?.scheduled || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500 font-dm-sans">Published</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.byStatus?.published || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500 font-dm-sans">Total Views</div>
          <div className="text-2xl font-bold text-teal-600">{stats.totalViews || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
        >
          <option value="all">All Types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
          <p className="text-gray-500 mb-4">Create your first announcement to share updates with users</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Announcement
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Announcement</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Target</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Views</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Created</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAnnouncements.map((announcement) => {
                  const typeInfo = getTypeInfo(announcement.type);
                  const TypeIcon = typeInfo.icon;
                  const statusBadge = STATUS_BADGE[announcement.status] || STATUS_BADGE.draft;

                  return (
                    <tr key={announcement._id} className="hover:bg-gray-50/50">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeInfo.color}`}>
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{announcement.title}</p>
                              {announcement.isPinned && (
                                <Pin className="w-4 h-4 text-teal-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                              {announcement.summary || announcement.content}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {TARGET_OPTIONS.find(t => t.value === announcement.targetAudience?.type)?.label || "All Users"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                        {announcement.scheduledAt && announcement.status === "scheduled" && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(announcement.scheduledAt).toLocaleDateString()}{" "}
                            {new Date(announcement.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{announcement.viewCount || 0}</span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-600">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {announcement.status === "draft" && (
                            <>
                              <button
                                onClick={() => handlePublish(announcement._id)}
                                className="p-2 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Publish Now"
                              >
                                <Send className="w-4 h-4 text-teal-600" />
                              </button>
                              <button
                                onClick={() => setScheduleModal(announcement)}
                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Schedule"
                              >
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </button>
                            </>
                          )}
                          {announcement.status === "scheduled" && (
                            <button
                              onClick={() => handlePublish(announcement._id)}
                              className="p-2 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Publish Now"
                            >
                              <Send className="w-4 h-4 text-teal-600" />
                            </button>
                          )}
                          {announcement.status === "published" && (
                            <button
                              onClick={() => handleArchive(announcement._id)}
                              className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4 text-amber-600" />
                            </button>
                          )}
                          {announcement.status !== "published" && (
                            <>
                              <button
                                onClick={() => handleOpenModal(announcement)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => handleDelete(announcement._id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={pagination.pages}
        pageSize={pageSize}
        totalItems={pagination.total}
        onPageChange={setPage}
      />

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
                  {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
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
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    placeholder="Enter announcement title"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    maxLength={200}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    placeholder="Enter announcement content"
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                    maxLength={5000}
                  />
                  <p className="text-xs text-gray-400 mt-1">{announcementForm.content.length}/5000</p>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary (Optional)
                  </label>
                  <input
                    type="text"
                    value={announcementForm.summary}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, summary: e.target.value })}
                    placeholder="Short summary for notifications"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    maxLength={300}
                  />
                </div>

                {/* Type and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={announcementForm.type}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Target Audience
                  </label>
                  <select
                    value={announcementForm.targetAudienceType}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, targetAudienceType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    {TARGET_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Pin Option */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={announcementForm.isPinned}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="isPinned" className="text-sm text-gray-700 flex items-center gap-1">
                    <Pin className="w-4 h-4" />
                    Pin this announcement (shows at top)
                  </label>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" />
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={announcementForm.imageUrl}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Action URL and Label */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <LinkIcon className="w-4 h-4 inline mr-1" />
                      Action URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={announcementForm.actionUrl}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, actionUrl: e.target.value })}
                      placeholder="https://example.com/promo"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={announcementForm.actionLabel}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, actionLabel: e.target.value })}
                      placeholder="Learn More"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      maxLength={50}
                    />
                  </div>
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Expires At (Optional)
                  </label>
                  <input
                    type="date"
                    value={announcementForm.expiresAt}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={announcementForm.tags}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, tags: e.target.value })}
                    placeholder="important, sale, new-feature"
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
                  onClick={handleSaveAnnouncement}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {scheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setScheduleModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 font-playfair flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Schedule Announcement
                </h2>
                <button
                  onClick={() => setScheduleModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Schedule "<span className="font-medium">{scheduleModal.title}</span>" to be published automatically.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setScheduleModal(null)}
                  className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={scheduleMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {scheduleMutation.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
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
