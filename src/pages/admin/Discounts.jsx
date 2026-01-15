import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Percent,
  Tag,
  Loader2,
  Ticket,
  ChevronDown,
} from "lucide-react";
import ConfirmationDialog from "../../components/modals/ConfirmationDialog";
import {
  useDiscounts,
  useCreateDiscount,
  useUpdateDiscount,
  useDeleteDiscount,
} from "../../hooks/admin/useDiscountTan";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import formatError from "../../utils/errorHandler";

export default function Discounts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState({
    code: "",
    description: "",
    discountPercentage: "",
    minimumOrderAmount: "0",
    maxUsageLimit: "",
    expiryDate: "",
    isActive: true,
  });

  // Fetch discounts
  const {
    data: discountsData,
    isLoading,
    error,
  } = useDiscounts({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: pageSize,
  });

  const discounts = discountsData?.data?.discounts || [];
  const pagination = discountsData?.data?.pagination || { total: 0, pages: 1 };

  // Mutations
  const createMutation = useCreateDiscount();
  const updateMutation = useUpdateDiscount();
  const deleteMutation = useDeleteDiscount();

  const handleOpenModal = (discount = null) => {
    if (discount) {
      setEditingDiscount(discount);
      setDiscountForm({
        code: discount.code,
        description: discount.description || "",
        discountPercentage: discount.discountPercentage.toString(),
        minimumOrderAmount: discount.minimumOrderAmount?.toString() || "0",
        maxUsageLimit: discount.maxUsageLimit?.toString() || "",
        expiryDate: discount.expiryDate
          ? new Date(discount.expiryDate).toISOString().split("T")[0]
          : "",
        isActive: discount.isActive,
      });
    } else {
      setEditingDiscount(null);
      setDiscountForm({
        code: "",
        description: "",
        discountPercentage: "",
        minimumOrderAmount: "0",
        maxUsageLimit: "",
        expiryDate: "",
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSaveDiscount = async () => {
    if (
      !discountForm.code ||
      !discountForm.discountPercentage ||
      !discountForm.expiryDate
    ) {
      return toast.error("Please fill in required fields");
    }

    const formData = {
      code: discountForm.code.toUpperCase(),
      description: discountForm.description,
      discountPercentage: parseInt(discountForm.discountPercentage),
      minimumOrderAmount: parseInt(discountForm.minimumOrderAmount) || 0,
      maxUsageLimit: discountForm.maxUsageLimit
        ? parseInt(discountForm.maxUsageLimit)
        : null,
      expiryDate: new Date(discountForm.expiryDate).toISOString(),
      isActive: discountForm.isActive,
    };

    if (editingDiscount) {
      updateMutation.mutate(
        { id: editingDiscount._id, data: formData },
        {
          onSuccess: () => {
            toast.success("Discount updated");
            setModalOpen(false);
          },
          onError: (err) => {
            toast.error(formatError(err, "Operation failed"));
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Discount created");
          setModalOpen(false);
        },
        onError: (err) => {
          toast.error(formatError(err, "Operation failed"));
        },
      });
    }
  };

  const confirmDelete = (id) => {
    setSelectedDiscountId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteDiscount = async () => {
    deleteMutation.mutate(selectedDiscountId, {
      onSuccess: () => {
        toast.success("Discount deleted successfully");
        setDeleteModalOpen(false);
      },
      onError: (err) => {
        toast.error(formatError(err, "Failed to delete discount"));
      },
    });
  };

  const getStatusBadge = (discount) => {
    const isExpired = new Date(discount.expiryDate) < new Date();
    const isLimitReached =
      discount.maxUsageLimit &&
      discount.currentUsageCount >= discount.maxUsageLimit;

    if (!discount.isActive)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
          Inactive
        </span>
      );
    if (isExpired)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
          Expired
        </span>
      );
    if (isLimitReached)
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
          Limit Reached
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-700">
        Active
      </span>
    );
  };

  const filteredDiscounts = discounts.filter((d) =>
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Create and manage coupon codes for your shop
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add New Discount
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search codes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer min-w-40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              Error Loading Discounts
            </h2>
            <p className="text-gray-500">{formatError(error)}</p>
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="py-20 text-center">
            <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-gray-900 font-semibold">No discounts found</h3>
            <p className="text-gray-500 text-sm mt-1">
              Try changing your filters or add a new code.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Discount Code
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Requirement
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Usage
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
                {filteredDiscounts.map((discount) => (
                  <motion.tr
                    key={discount._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded w-fit text-sm">
                          {discount.code}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {discount.description || "Coupon code"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        {discount.discountPercentage}% OFF
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600 font-medium">
                        Min: Rs. {discount.minimumOrderAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">
                          {discount.currentUsageCount}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">
                          Limit: {discount.maxUsageLimit || "∞"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(discount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(discount)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(discount._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Save Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingDiscount ? "Edit Discount" : "New Discount Code"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={discountForm.code}
                      onChange={(e) =>
                        setDiscountForm({
                          ...discountForm,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-teal-500 outline-none font-mono font-bold"
                      placeholder="SALE50"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                      Discount % *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={discountForm.discountPercentage}
                        onChange={(e) =>
                          setDiscountForm({
                            ...discountForm,
                            discountPercentage: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-teal-500 outline-none"
                        placeholder="20"
                      />
                      <Percent
                        size={14}
                        className="absolute right-3 top-3 text-gray-400"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                    Description
                  </label>
                  <input
                    value={discountForm.description}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-teal-500 outline-none text-sm"
                    placeholder="Holiday season sale..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                      Min. Order (Rs.)
                    </label>
                    <input
                      type="number"
                      value={discountForm.minimumOrderAmount}
                      onChange={(e) =>
                        setDiscountForm({
                          ...discountForm,
                          minimumOrderAmount: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                      Max Usage
                    </label>
                    <input
                      type="number"
                      value={discountForm.maxUsageLimit}
                      onChange={(e) =>
                        setDiscountForm({
                          ...discountForm,
                          maxUsageLimit: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-teal-500 outline-none"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={discountForm.expiryDate}
                      onChange={(e) =>
                        setDiscountForm({
                          ...discountForm,
                          expiryDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-teal-500 outline-none text-sm"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg w-full">
                      <input
                        type="checkbox"
                        checked={discountForm.isActive}
                        onChange={(e) =>
                          setDiscountForm({
                            ...discountForm,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <span className="text-xs font-bold text-gray-600 uppercase">
                        Active Now
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDiscount}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal-700 shadow-md flex items-center justify-center gap-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : editingDiscount ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={deleteModalOpen}
        title="Delete Discount?"
        message="Are you sure you want to remove this discount code? This action cannot be undone."
        onConfirm={handleDeleteDiscount}
        onCancel={() => setDeleteModalOpen(false)}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
