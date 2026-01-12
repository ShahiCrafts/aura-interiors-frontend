import { useState, useMemo } from "react";
import {
  Package,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Truck,
  CheckCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  useMyOrders,
  useCancelOrder,
  useRequestReturn,
} from "../../hooks/order/useOrderTan";
import OrderCard from "./OrderCard";
import { toast } from "react-toastify";
import ConfirmationDialog from "../modals/ConfirmationDialog";

const ITEMS_PER_PAGE = 5;

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export default function OrdersSection() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const { data, isLoading, isError } = useMyOrders(
    { page, limit: ITEMS_PER_PAGE, status: statusFilter || undefined },
    { keepPreviousData: true }
  );

  const cancelOrderMutation = useCancelOrder();
  const requestReturnMutation = useRequestReturn();

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || { total: 0, pages: 1 };

  const stats = useMemo(() => {
    return {
      total: pagination.total || orders.length,
      processing: orders.filter((o) =>
        ["pending", "confirmed", "processing"].includes(o.orderStatus)
      ).length, // This is still technically limited to current page
      shipped: orders.filter((o) => o.orderStatus === "shipped").length,
      delivered: orders.filter((o) => o.orderStatus === "delivered").length,
    };
  }, [orders, pagination.total]);

  const handleCancelOrder = async () => {
    try {
      await cancelOrderMutation.mutateAsync({
        id: orderToCancel,
        data: { reason: "Cancelled by user" },
      });
      toast.success("Order cancelled successfully");
      setCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const confirmCancel = (id) => {
    setOrderToCancel(id);
    setCancelModalOpen(true);
  };

  const handleRequestReturn = async (orderId) => {
    const reason = window.prompt(
      "Please provide a reason for return (e.g., defective product, wrong item):"
    );

    if (!reason) {
      return;
    }

    try {
      await requestReturnMutation.mutateAsync({
        id: orderId,
        data: { reason, description: "" },
      });
      toast.success("Return request submitted successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit return request"
      );
    }
  };

  const handleStatusFilterClick = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  if (isLoading && !orders.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="text-teal-700 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 text-center">
        <Package size={48} className="text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-600 font-dm-sans">
          Failed to load orders. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats Section */}
      <div className="">
        <div className="mb-8">
          <h2 className="text-2xl font-playfair text-neutral-900">
            <span className="font-medium">Your</span>{" "}
            <span className="italic text-teal-700">Orders</span>
          </h2>
          <p className="text-neutral-500 font-dm-sans text-sm mt-1">
            Track, manage and review your orders
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "All Orders", count: stats.total, icon: Package, color: "teal" },
            { label: "Processing", count: stats.processing, icon: Clock, color: "orange" },
            { label: "Shipped", count: stats.shipped, icon: Truck, color: "blue" },
            { label: "Delivered", count: stats.delivered, icon: CheckCircle, color: "green" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            const colorClasses = {
              teal: "text-white bg-teal-600",
              orange: "text-white bg-amber-500",
              blue: "text-white bg-blue-500",
              green: "text-white bg-emerald-500",
            };

            return (
              <div
                key={stat.label}
                className={`flex items-center gap-4 p-5 rounded-2xl border bg-white transition-all border-neutral-200`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[stat.color]}`}>
                  <Icon size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-neutral-400 mb-0.5 font-dm-sans">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-neutral-900 leading-tight font-dm-sans">
                    {stat.count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search orders by ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-dm-sans text-sm placeholder:text-neutral-400"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterClick(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-dm-sans text-sm bg-white appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[140px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-dm-sans text-sm bg-white appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center shadow-sm">
          <Package size={48} className="text-neutral-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 font-dm-sans mb-2">
            No orders found
          </h3>
          <p className="text-neutral-500 font-dm-sans text-sm">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : statusFilter
                ? `You don't have any ${statusFilter} orders yet`
                : "You haven't placed any orders yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onCancelOrder={confirmCancel}
              onRequestReturn={handleRequestReturn}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-medium font-dm-sans transition-all duration-300 ${pageNum === page
                    ? "bg-teal-700 text-white shadow-lg shadow-teal-700/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:border-teal-200 hover:text-teal-700"
                    }`}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <ConfirmationDialog
        isOpen={cancelModalOpen}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? Stock will be restored."
        onConfirm={handleCancelOrder}
        onCancel={() => {
          setCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        confirmText="Cancel Order"
        isLoading={cancelOrderMutation.isPending}
      />
    </div>
  );
}
