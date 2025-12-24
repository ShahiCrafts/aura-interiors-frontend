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
  Calendar,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  useDiscounts,
  useCreateDiscount,
  useUpdateDiscount,
  useDeleteDiscount,
} from "../../hooks/useDiscountTan";
import { toast } from "../../components/ui/Toast";

export default function Discounts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState({
    code: "",
    description: "",
    discountPercentage: "",
    minimumOrderAmount: "",
    maxUsageLimit: "",
    expiryDate: "",
    isActive: true,
  });

  // Fetch discounts
  const { data: discountsData, isLoading } = useDiscounts({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const discounts = discountsData?.data?.discounts || [];
  const pagination = discountsData?.data?.pagination || {};

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

  const handleCloseModal = () => {
    setModalOpen(false);
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
  };

  const handleSaveDiscount = async () => {
    if (
      !discountForm.code ||
      !discountForm.discountPercentage ||
      !discountForm.expiryDate
    ) {
      toast.error("Please fill in required fields");
      return;
    }

    const formData = {
      code: discountForm.code.toUpperCase(),
      description: discountForm.description,
      discountPercentage: parseFloat(discountForm.discountPercentage),
      minimumOrderAmount: parseFloat(discountForm.minimumOrderAmount) || 0,
      maxUsageLimit: discountForm.maxUsageLimit
        ? parseInt(discountForm.maxUsageLimit)
        : null,
      expiryDate: new Date(discountForm.expiryDate).toISOString(),
      isActive: discountForm.isActive,
    };

    try {
      if (editingDiscount) {
        await updateMutation.mutateAsync({
          id: editingDiscount._id,
          data: formData,
        });
        toast.success("Discount updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Discount created successfully");
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (confirm("Are you sure you want to delete this discount code?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Discount deleted successfully");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete discount");
      }
    }
  };

  const getStatusBadge = (discount) => {
    if (!discount.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <XCircle className="w-3.5 h-3.5" />
          Inactive
        </span>
      );
    }
    if (new Date(discount.expiryDate) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <Clock className="w-3.5 h-3.5" />
          Expired
        </span>
      );
    }
    if (
      discount.maxUsageLimit &&
      discount.currentUsageCount >= discount.maxUsageLimit
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          <Users className="w-3.5 h-3.5" />
          Limit Reached
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <CheckCircle className="w-3.5 h-3.5" />
        Active
      </span>
    );
  };

  // Filter by search query
  const filteredDiscounts = discounts.filter((d) =>
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-playfair">
            Discount Codes
          </h1>
          <p className="text-gray-500 mt-1 font-dm-sans">
            {pagination.total || 0} total discounts
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded-xl font-medium hover:bg-teal-800 transition-colors font-dm-sans"
        >
          <Plus className="w-5 h-5" />
          Add Discount
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-dm-sans"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "expired", "inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors font-dm-sans ${
                  statusFilter === status
                    ? "bg-teal-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-4 font-dm-sans">
                    Code
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-4 font-dm-sans">
                    Discount
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-4 font-dm-sans">
                    Min. Order
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-4 font-dm-sans">
                    Usage
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-4 font-dm-sans">
                    Expiry
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-4 font-dm-sans">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-4 font-dm-sans">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDiscounts.map((discount) => (
                  <motion.tr
                    key={discount._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-teal-700" />
                        <span className="font-mono font-semibold text-gray-900">
                          {discount.code}
                        </span>
                      </div>
                      {discount.description && (
                        <p className="text-xs text-gray-500 mt-1 font-dm-sans">
                          {discount.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-teal-700 font-dm-sans">
                        <Percent className="w-4 h-4" />
                        {discount.discountPercentage}% OFF
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-dm-sans">
                      Rs. {discount.minimumOrderAmount?.toLocaleString() || 0}
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-dm-sans">
                      {discount.currentUsageCount}
                      {discount.maxUsageLimit
                        ? ` / ${discount.maxUsageLimit}`
                        : " / Unlimited"}
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-dm-sans">
                      {new Date(discount.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(discount)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(discount)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteDiscount(discount._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredDiscounts.length === 0 && (
          <div className="p-12 text-center">
            <Percent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1 font-playfair">
              No discounts found
            </h3>
            <p className="text-sm text-gray-500 font-dm-sans">
              Create your first discount code to get started
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Discount Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 font-playfair">
                  {editingDiscount ? "Edit Discount" : "Add New Discount"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-dm-sans">
                    Discount Code *
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-mono uppercase"
                    placeholder="SAVE20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-dm-sans">
                    Description
                  </label>
                  <input
                    type="text"
                    value={discountForm.description}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-dm-sans"
                    placeholder="20% off on orders above Rs. 5000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-dm-sans">
                      Discount Percentage *
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
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-dm-sans"
                        placeholder="20"
                        min="1"
                        max="100"
                      />
                      <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-dm-sans">
                      Min. Order Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-dm-sans">
                        Rs.
                      </span>
                      <input
                        type="number"
                        value={discountForm.minimumOrderAmount}
                        onChange={(e) =>
                          setDiscountForm({
                            ...discountForm,
                            minimumOrderAmount: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-dm-sans"
                        placeholder="5000"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-dm-sans">
                      Usage Limit
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-dm-sans"
                      placeholder="Unlimited"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-dm-sans">
                      Leave empty for unlimited
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-dm-sans">
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-dm-sans"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountForm.isActive}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 font-dm-sans">
                    Active (can be used immediately)
                  </span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors font-dm-sans"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDiscount}
                  disabled={
                    !discountForm.code ||
                    !discountForm.discountPercentage ||
                    !discountForm.expiryDate ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  className="flex-1 bg-teal-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-dm-sans"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : editingDiscount ? (
                    "Update Discount"
                  ) : (
                    "Create Discount"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
