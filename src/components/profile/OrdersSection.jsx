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
} from "lucide-react";
import { useMyOrders, useCancelOrder, useRequestReturn } from "../../hooks/useOrderTan";
import OrderCard from "./OrderCard";
import { toast } from "../ui/Toast";

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

  const { data, isLoading, isError } = useMyOrders(
    { page, limit: ITEMS_PER_PAGE, status: statusFilter || undefined },
    { keepPreviousData: true }
  );

  const cancelOrderMutation = useCancelOrder();
  const requestReturnMutation = useRequestReturn();

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || { total: 0, pages: 1 };

  // Calculate stats from all orders (we'll need to fetch all for accurate stats)
  const stats = useMemo(() => {
    const allOrders = orders;
    return {
      total: pagination.total || allOrders.length,
      processing: allOrders.filter((o) =>
        ["pending", "confirmed", "processing"].includes(o.orderStatus)
      ).length,
      shipped: allOrders.filter((o) => o.orderStatus === "shipped").length,
      delivered: allOrders.filter((o) => o.orderStatus === "delivered").length,
    };
  }, [orders, pagination.total]);

  // Filter and sort orders locally
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(query) ||
          order.items?.some((item) =>
            item.name?.toLowerCase().includes(query)
          )
      );
    }

    // Sort
    if (sortBy === "oldest") {
      result.sort(
        (a, b) => new Date(a.orderedAt) - new Date(b.orderedAt)
      );
    } else {
      result.sort(
        (a, b) => new Date(b.orderedAt) - new Date(a.orderedAt)
      );
    }

    return result;
  }, [orders, searchQuery, sortBy]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? Stock will be restored.")) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync({
        id: orderId,
        data: { reason: "Cancelled by user" },
      });
      toast.success("Order cancelled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleRequestReturn = async (orderId) => {
    const reason = window.prompt("Please provide a reason for return (e.g., defective product, wrong item):");
    
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
      toast.error(err.response?.data?.message || "Failed to submit return request");
    }
  };

  const handleStatusFilterClick = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  if (isLoading && !orders.length) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
          <div className="flex items-center justify-center h-64">
            <Loader2
              size={32}
              className="text-teal-700 animate-spin"
            />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package size={48} className="text-neutral-300 mb-4" />
            <p className="text-neutral-600 font-dm-sans">
              Failed to load orders. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-playfair text-neutral-900">
            <span className="font-bold">Your</span>{" "}
            <span className="italic text-teal-700">Orders</span>
          </h2>
          <p className="text-neutral-500 font-dm-sans text-sm mt-1">
            Track, manage and review your orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => handleStatusFilterClick("")}
            className={`p-4 rounded-xl border-2 transition-all ${
              statusFilter === ""
                ? "border-teal-500 bg-teal-50"
                : "border-neutral-100 bg-neutral-50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  statusFilter === "" ? "bg-teal-100" : "bg-white"
                }`}
              >
                <Package
                  size={20}
                  className={statusFilter === "" ? "text-teal-600" : "text-neutral-500"}
                />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-neutral-900 font-dm-sans">
                  {stats.total}
                </p>
                <p className="text-xs text-neutral-500 font-dm-sans">
                  All Orders
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleStatusFilterClick("processing")}
            className={`p-4 rounded-xl border-2 transition-all ${
              statusFilter === "processing"
                ? "border-orange-500 bg-orange-50"
                : "border-neutral-100 bg-neutral-50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  statusFilter === "processing" ? "bg-orange-100" : "bg-white"
                }`}
              >
                <Clock
                  size={20}
                  className={
                    statusFilter === "processing"
                      ? "text-orange-600"
                      : "text-neutral-500"
                  }
                />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-neutral-900 font-dm-sans">
                  {stats.processing}
                </p>
                <p className="text-xs text-neutral-500 font-dm-sans">
                  Processing
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleStatusFilterClick("shipped")}
            className={`p-4 rounded-xl border-2 transition-all ${
              statusFilter === "shipped"
                ? "border-purple-500 bg-purple-50"
                : "border-neutral-100 bg-neutral-50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  statusFilter === "shipped" ? "bg-purple-100" : "bg-white"
                }`}
              >
                <Truck
                  size={20}
                  className={
                    statusFilter === "shipped"
                      ? "text-purple-600"
                      : "text-neutral-500"
                  }
                />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-neutral-900 font-dm-sans">
                  {stats.shipped}
                </p>
                <p className="text-xs text-neutral-500 font-dm-sans">Shipped</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleStatusFilterClick("delivered")}
            className={`p-4 rounded-xl border-2 transition-all ${
              statusFilter === "delivered"
                ? "border-green-500 bg-green-50"
                : "border-neutral-100 bg-neutral-50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  statusFilter === "delivered" ? "bg-green-100" : "bg-white"
                }`}
              >
                <CheckCircle
                  size={20}
                  className={
                    statusFilter === "delivered"
                      ? "text-green-600"
                      : "text-neutral-500"
                  }
                />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-neutral-900 font-dm-sans">
                  {stats.delivered}
                </p>
                <p className="text-xs text-neutral-500 font-dm-sans">
                  Delivered
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search orders by ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-dm-sans text-sm"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-dm-sans text-sm bg-white appearance-none cursor-pointer min-w-[140px]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-dm-sans text-sm bg-white appearance-none cursor-pointer min-w-[140px]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package size={48} className="text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 font-dm-sans mb-2">
              No orders found
            </h3>
            <p className="text-neutral-500 font-dm-sans text-sm">
              {searchQuery
                ? "Try adjusting your search query"
                : statusFilter
                ? "No orders with this status"
                : "You haven't placed any orders yet"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onCancelOrder={handleCancelOrder}
              onRequestReturn={handleRequestReturn}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 rounded-lg font-medium font-dm-sans transition-colors ${
                  pageNum === page
                    ? "bg-teal-700 text-white"
                    : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
