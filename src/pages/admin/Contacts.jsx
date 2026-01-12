import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Mail,
  MailOpen,
  Trash2,
  Eye,
  Send,
  User,
  Calendar,
  Phone,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Inbox,
  Tag,
  Flag,
} from "lucide-react";
import {
  useContacts,
  useContact,
  useUpdateContact,
  useMarkAsRead,
  useRespondToContact,
  useDeleteContact,
} from "../../hooks/admin/useContactTan";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import formatError from "../../utils/errorHandler";

const categoryLabels = {
  general: "General Inquiry",
  support: "Customer Support",
  sales: "Sales",
  partnership: "Partnership",
  feedback: "Feedback",
  other: "Other",
};

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal States
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [responseText, setResponseText] = useState("");

  const queryParams = {
    page,
    limit: pageSize,
    ...(searchQuery && { search: searchQuery }),
    ...(filterStatus !== "all" && { status: filterStatus }),
    ...(filterCategory !== "all" && { category: filterCategory }),
    ...(filterRead !== "all" && { isRead: filterRead === "read" }),
  };

  const { data: contactsData, isLoading, error } = useContacts(queryParams);
  const { data: contactDetail } = useContact(selectedContactId);
  const updateMutation = useUpdateContact();
  const markAsReadMutation = useMarkAsRead();
  const respondMutation = useRespondToContact();
  const deleteMutation = useDeleteContact();

  const contacts = contactsData?.data?.contacts || [];
  const pagination = contactsData?.data?.pagination || { total: 0, pages: 1 };
  const selectedContact = contactDetail?.data?.contact;

  const handleUpdateStatus = async (contactId, status) => {
    try {
      await updateMutation.mutateAsync({ id: contactId, data: { status } });
      toast.success("Status updated");
    } catch (err) {
      toast.error(formatError(err, "Update failed"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedContactId);
      toast.success("Message deleted");
      setShowDeleteModal(false);
      setSelectedContactId(null);
    } catch (err) {
      toast.error(formatError(err, "Delete failed"));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "new":
        return "bg-teal-50 text-teal-700 border-teal-100 dot-teal-500";
      case "in-progress":
        return "bg-amber-50 text-amber-700 border-amber-100 dot-amber-500";
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 dot-emerald-500";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100 dot-gray-500";
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;
    try {
      await respondMutation.mutateAsync({
        id: selectedContactId,
        message: responseText.trim(),
      });
      toast.success("Response sent successfully");
      setShowResponseModal(false);
      setResponseText("");
    } catch (err) {
      toast.error(formatError(err, "Failed to send response"));
    }
  };

  if (error)
    return (
      <div className="p-10 text-center text-red-500 bg-white rounded-xl border border-red-50">
        <h2 className="text-lg font-bold mb-2">Error Loading Messages</h2>
        <p className="text-sm opacity-80">{formatError(error)}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Inbox</h1>
        <p className="text-gray-500 mt-0.5 text-sm">
          Manage customer inquiries and support tickets
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or subject..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer min-w-[130px]"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer min-w-[130px]"
              >
                <option value="all">All Categories</option>
                {Object.keys(categoryLabels).map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-16 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-1">
              No messages found
            </h3>
            <p className="text-sm text-gray-500">
              Your inbox is currently empty
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contacts.map((contact) => (
                  <motion.tr
                    key={contact._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-gray-50/50 transition-colors ${!contact.isRead ? "bg-teal-50/20" : ""
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${!contact.isRead
                            ? "bg-teal-100 text-teal-700"
                            : "bg-gray-100 text-gray-500"
                            }`}
                        >
                          {contact.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm truncate ${!contact.isRead
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-700"
                              }`}
                          >
                            {contact.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px]">
                        <p
                          className={`text-sm truncate ${!contact.isRead
                            ? "text-gray-900 font-semibold"
                            : "text-gray-600"
                            }`}
                        >
                          {contact.subject}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        <Tag size={10} />
                        {categoryLabels[contact.category] || contact.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={contact.status}
                        onChange={(e) =>
                          handleUpdateStatus(contact._id, e.target.value)
                        }
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border-0 cursor-pointer outline-none ${getStatusStyle(
                          contact.status
                        )}`}
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">
                        <p className="font-medium text-gray-700">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px]">
                          {new Date(contact.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedContactId(contact._id);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContactId(contact._id);
                            setResponseText("");
                            setShowResponseModal(true);
                          }}
                          className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            await markAsReadMutation.mutateAsync({
                              id: contact._id,
                              isRead: !contact.isRead,
                            });
                            toast.success(
                              `Marked as ${contact.isRead ? "unread" : "read"}`
                            );
                          }}
                          className={`p-2 rounded-lg transition-colors ${!contact.isRead
                            ? "text-teal-600 hover:bg-teal-50"
                            : "text-gray-400 hover:bg-gray-100"
                            }`}
                        >
                          {contact.isRead ? (
                            <MailOpen size={16} />
                          ) : (
                            <Mail size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContactId(contact._id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
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

      {/* Modals */}
      <AnimatePresence>
        {/* Detail Modal */}
        {showDetailModal && selectedContact && (
          <Modal
            title="Inquiry Details"
            onClose={() => setShowDetailModal(false)}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm text-teal-600 font-bold">
                  {selectedContact.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedContact.name}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail size={12} /> {selectedContact.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">
                    Priority
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Flag
                      size={14}
                      className={
                        selectedContact.priority === "high"
                          ? "text-red-500"
                          : "text-blue-500"
                      }
                    />
                    {selectedContact.priority.toUpperCase()}
                  </div>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">
                    Time Received
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Clock size={14} className="text-gray-400" />
                    {new Date(selectedContact.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-2">
                  Message
                </p>
                <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-100 italic">
                  "{selectedContact.message}"
                </div>
              </div>

              {selectedContact.response?.message && (
                <div>
                  <p className="text-[10px] uppercase text-teal-600 font-bold mb-2">
                    Admin Response
                  </p>
                  <div className="p-4 bg-teal-50/50 rounded-xl text-sm text-teal-900 border border-teal-100">
                    {selectedContact.response.message}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowResponseModal(true);
                  }}
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Respond Now
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Response Modal */}
        {showResponseModal && (
          <Modal
            title="Send Response"
            onClose={() => setShowResponseModal(false)}
          >
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                Responding to: <strong>{selectedContact?.subject}</strong>
              </div>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your reply to the customer..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none resize-none"
                rows={6}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={respondMutation.isPending || !responseText.trim()}
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center justify-center gap-2"
                >
                  {respondMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Send Reply
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <Modal
            title="Delete Conversation"
            onClose={() => setShowDeleteModal(false)}
          >
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                Are you sure you want to delete this message? This will remove
                all history of this inquiry permanently.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Internal Modal Component (Consistent with previous pages)
function Modal({ title, children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-100"
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
