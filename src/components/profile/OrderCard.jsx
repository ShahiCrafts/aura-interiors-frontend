import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  FileText,
  Star,
  ShoppingCart,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  RotateCcw,
} from "lucide-react";
import OrderTrackingTimeline from "./OrderTrackingTimeline";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  processing: "bg-orange-50 text-orange-600 border-orange-200",
  shipped: "bg-purple-50 text-purple-600 border-purple-200",
  delivered: "bg-green-50 text-green-600 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const RETURN_STATUS_COLORS = {
  requested: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-green-50 text-green-600 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  completed: "bg-blue-50 text-blue-600 border-blue-200",
};

const RETURN_STATUS_LABELS = {
  requested: "Return Requested",
  approved: "Return Approved",
  rejected: "Return Rejected",
  completed: "Return Completed",
};

export default function OrderCard({ order, onCancelOrder, onRequestReturn }) {
  const [showTracking, setShowTracking] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

  const getImageUrl = (item) => {
    if (item.image) {
      if (item.image.startsWith("http")) return item.image;
      return `${baseUrl.replace("/api/v1", "")}/uploads/products/${item.image}`;
    }
    return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEstimatedDelivery = () => {
    if (order.deliveredAt) {
      return `Delivered on ${formatDate(order.deliveredAt)}`;
    }
    const baseDate = order.orderedAt ? new Date(order.orderedAt) : new Date();
    const deliveryDate = new Date(baseDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return `Estimated delivery: ${formatDate(deliveryDate)}`;
  };

  const isDelivered = order.orderStatus === "delivered";
  const isCancelled = order.orderStatus === "cancelled";
  const canCancel = ["pending", "confirmed"].includes(order.orderStatus);
  const canTrack = !isDelivered && !isCancelled;

  // Return request logic
  const returnStatus = order.returnRequest?.status;
  const hasReturnRequest = returnStatus && returnStatus !== "none";
  const canRequestReturn = isDelivered && !hasReturnRequest;

  // Check if return window is still open (7 days)
  const deliveredDate = order.deliveredAt || order.updatedAt;
  const daysSinceDelivery = deliveredDate
    ? Math.floor((Date.now() - new Date(deliveredDate)) / (1000 * 60 * 60 * 24))
    : 0;
  const returnWindowOpen = daysSinceDelivery <= 7;

  // Show only first 2 items, rest expandable
  const visibleItems = showAllItems ? order.items : order.items?.slice(0, 2);
  const hasMoreItems = order.items?.length > 2;

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      {/* Order Header */}
      <div className="px-6 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <Package size={20} className="text-teal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 font-dm-sans">
              {order.orderId}
            </h3>
            <p className="text-sm text-neutral-500 font-dm-sans">
              {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} •
              Placed on {formatDate(order.orderedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              STATUS_COLORS[order.orderStatus]
            }`}
          >
            {STATUS_LABELS[order.orderStatus]}
          </span>
          {hasReturnRequest && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                RETURN_STATUS_COLORS[returnStatus]
              }`}
            >
              {RETURN_STATUS_LABELS[returnStatus]}
            </span>
          )}
          {!isCancelled && (
            <span className="text-sm text-neutral-500 font-dm-sans hidden sm:block">
              {getEstimatedDelivery()}
            </span>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {visibleItems?.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                <img
                  src={getImageUrl(item)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-neutral-900 font-dm-sans truncate">
                  {item.name}
                </h4>
                {item.variant && Object.keys(item.variant).length > 0 && (
                  <p className="text-sm text-neutral-500 font-dm-sans">
                    {Object.entries(item.variant)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" • ")}
                  </p>
                )}
                <p className="text-sm text-neutral-500 font-dm-sans">
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-teal-700 font-dm-sans">
                  NRs. {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Items Button */}
        {hasMoreItems && (
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="mt-4 flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium font-dm-sans"
          >
            {showAllItems ? (
              <>
                <ChevronUp size={16} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show {order.items.length - 2} more item
                {order.items.length - 2 > 1 ? "s" : ""}
              </>
            )}
          </button>
        )}
      </div>

      {/* Order Tracking Timeline */}
      {showTracking && !isCancelled && (
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700 font-dm-sans">
              Order Tracking
            </span>
          </div>
          <OrderTrackingTimeline status={order.orderStatus} />
        </div>
      )}

      {/* Order Footer */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 font-dm-sans">Total:</span>
          <span className="text-lg font-bold text-neutral-900 font-dm-sans">
            NRs. {order.total?.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isDelivered && (
            <>
              {canRequestReturn && returnWindowOpen && (
                <button
                  onClick={() => onRequestReturn?.(order._id)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-amber-200 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors font-dm-sans"
                >
                  <RotateCcw size={16} />
                  Request Return
                </button>
              )}
              {canRequestReturn && !returnWindowOpen && (
                <span className="text-sm text-neutral-400 font-dm-sans">
                  Return window expired
                </span>
              )}
              <button className="flex items-center gap-1.5 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-white transition-colors font-dm-sans">
                <FileText size={16} />
                Invoice
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-white transition-colors font-dm-sans">
                <Star size={16} />
                Review
              </button>
              <Link
                to="/shop"
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors font-dm-sans"
              >
                <ShoppingCart size={16} />
                Buy Again
              </Link>
            </>
          )}

          {canCancel && (
            <button
              onClick={() => onCancelOrder?.(order._id)}
              className="flex items-center gap-1.5 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors font-dm-sans"
            >
              <X size={16} />
              Cancel Order
            </button>
          )}

          {canTrack && (
            <button
              onClick={() => setShowTracking(!showTracking)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors font-dm-sans"
            >
              <Package size={16} />
              {showTracking ? "Hide Tracking" : "Track Order"}
            </button>
          )}

          {isCancelled && (
            <Link
              to="/shop"
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors font-dm-sans"
            >
              <ShoppingCart size={16} />
              Shop Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
