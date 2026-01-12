import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Loader2,
  KeyRound,
  Phone,
  TrendingUp,
} from "lucide-react";
import Skeleton from "../../components/common/Skeleton";
import ConfirmationDialog from "../../components/modals/ConfirmationDialog";
import {
  useUsers,
  useUpdateUserStatus,
  useDeleteUser,
  useAdminResetPassword,
} from "../../hooks/admin/useUserTan";
import { getAvatarUrl } from "../../utils/imageUrl";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import formatError from "../../utils/errorHandler";

export default function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [pageSize] = useState(10);

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [deactivationReason, setDeactivationReason] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [userToProcess, setUserToProcess] = useState(null);

  const {
    data: usersData,
    isLoading,
    error,
  } = useUsers({
    search,
    page,
    role: role === "all" ? "" : role,
    isActive:
      status === "active"
        ? "true"
        : status === "inactive"
          ? "false"
          : undefined,
    limit: pageSize,
  });

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination || { total: 0, pages: 1 };

  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();
  const resetMutation = useAdminResetPassword();

  const handleOpenStatusModal = (user) => {
    setSelectedUser(user);
    if (user.isActive) {
      setShowStatusModal(true);
    } else {
      setUserToProcess(user);
      setShowReactivateModal(true);
    }
  };

  const handleReactivate = () => {
    updateStatusMutation.mutate(
      { id: userToProcess._id, isActive: true },
      {
        onSuccess: () => {
          toast.success("User reactivated successfully");
          setShowReactivateModal(false);
          setUserToProcess(null);
        },
        onError: (err) => {
          toast.error(formatError(err, "Failed to reactivate user"));
        },
      }
    );
  };

  const handleUpdateStatus = async () => {
    if (!deactivationReason) return toast.error("Please provide a reason");
    updateStatusMutation.mutate(
      { id: selectedUser._id, isActive: false, reason: deactivationReason },
      {
        onSuccess: () => {
          setShowStatusModal(false);
          setDeactivationReason("");
          toast.success("User deactivated");
        },
        onError: (err) => {
          toast.error(formatError(err, "Failed to deactivate user"));
        },
      }
    );
  };

  const handleResetPassword = () => {
    if (newPassword.length < 8)
      return toast.error("Password must be at least 8 characters");
    resetMutation.mutate(
      { id: selectedUser._id, password: newPassword },
      {
        onSuccess: () => {
          setShowResetModal(false);
          setNewPassword("");
          toast.success("Password updated successfully");
        },
        onError: (err) => {
          toast.error(formatError(err, "Failed to update password"));
        },
      }
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Users
          </h2>
          <p className="text-gray-500">{formatError(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Community Management
        </h1>
        <p className="text-gray-500 mt-0.5 text-sm">
          Manage user accounts, roles, and security
        </p>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-20" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-12" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-20" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="px-6 py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="w-8 h-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          {user.avatar ? (
                            <img
                              src={getAvatarUrl(user)}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-xs uppercase">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate max-w-[150px]">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Phone size={12} className="text-gray-400" />
                        <span>{user.phone || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === "admin"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-blue-50 text-blue-700"
                          }`}
                      >
                        {user.role === "admin" ? (
                          <Shield size={10} />
                        ) : (
                          <UserIcon size={10} />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.isActive
                            ? "bg-teal-50 text-teal-700"
                            : "bg-red-50 text-red-700"
                            }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                        {!user.isActive && user.deactivationReason && (
                          <span
                            className="text-[10px] text-red-400 italic truncate max-w-[120px]"
                            title={user.deactivationReason}
                          >
                            {user.deactivationReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900 font-medium">
                          <Clock size={14} className="text-gray-400" />
                          <span>
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <TrendingUp size={11} />
                          <span>{user.loginCount || 0} logins</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetModal(true);
                          }}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenStatusModal(user)}
                          className={`p-2 rounded-lg transition-colors ${user.isActive
                            ? "text-gray-500 hover:bg-red-50 hover:text-red-600"
                            : "text-teal-600 hover:bg-teal-50"
                            }`}
                          title={
                            user.isActive
                              ? "Deactivate User"
                              : "Reactivate User"
                          }
                        >
                          {user.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setUserToProcess(user);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      <AnimatePresence>
        {showResetModal && (
          <Modal
            title="Reset Password"
            onClose={() => setShowResetModal(false)}
          >
            <div className="mb-5">
              <p className="text-sm text-gray-500 mb-4">
                Set a new password for{" "}
                <span className="font-medium text-gray-900">
                  {selectedUser?.email}
                </span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium flex items-center justify-center gap-2"
              >
                {resetMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Reset Password
              </button>
            </div>
          </Modal>
        )}

        {showStatusModal && (
          <Modal
            title="Deactivate Account"
            onClose={() => setShowStatusModal(false)}
          >
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Deactivation
              </label>
              <textarea
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="Explain why this account is being deactivated..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center justify-center gap-2"
              >
                {updateStatusMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Confirm Deactivation
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={showReactivateModal}
        title="Reactivate Account?"
        message={`Are you sure you want to reactivate the account for ${userToProcess?.firstName} ${userToProcess?.lastName}?`}
        onConfirm={handleReactivate}
        onCancel={() => {
          setShowReactivateModal(false);
          setUserToProcess(null);
        }}
        confirmText="Reactivate"
        type="info"
        isLoading={updateStatusMutation.isPending}
      />

      <ConfirmationDialog
        isOpen={showDeleteModal}
        title="Delete Account?"
        message={`Are you sure you want to delete the account for ${userToProcess?.firstName} ${userToProcess?.lastName}? This action cannot be undone.`}
        onConfirm={() => {
          deleteMutation.mutate(userToProcess._id, {
            onSuccess: () => {
              toast.success("User deleted successfully");
              setShowDeleteModal(false);
              setUserToProcess(null);
            },
          });
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setUserToProcess(null);
        }}
        confirmText="Delete"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

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
