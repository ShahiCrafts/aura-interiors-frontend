import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  RotateCcw,
  Download,
  Star,
  Check,
  ClipboardList,
  Cog,
  Truck,
  Home,
  Calendar,
  Hash,
} from "lucide-react";
import { getImageUrl as getImageUrlUtil } from "../../utils/imageUrl";

const STATUS_CONFIG = {
  pending: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  processing: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
  shipped: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderCard({ order, onCancelOrder }) {
  const [showTracking, setShowTracking] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  const getImageUrl = (item) => getImageUrlUtil(item.image, "products");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDeliveryStatusText = () => {
    if (order.orderStatus === "delivered") {
      return `Delivered on ${formatDate(order.deliveredAt || order.updatedAt)}`;
    }
    if (order.orderStatus === "cancelled") {
      return "Order was cancelled";
    }
    const baseDate = order.orderedAt ? new Date(order.orderedAt) : new Date();
    const deliveryDate = new Date(baseDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return `Expected by ${formatDate(deliveryDate)}`;
  };

  const isDelivered = order.orderStatus === "delivered";
  const isCancelled = order.orderStatus === "cancelled";
  const canCancel = ["pending", "confirmed"].includes(order.orderStatus);
  const canTrack = !isDelivered && !isCancelled;

  const visibleItems = showAllItems ? order.items : order.items?.slice(0, 2);
  const hasMoreItems = order.items?.length > 2;

  const steps = [
    { id: "pending", label: "Order Placed", icon: ClipboardList },
    { id: "confirmed", label: "Confirmed", icon: Check },
    { id: "processing", label: "Processing", icon: Cog },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "delivered", label: "Delivered", icon: Home },
  ];

  const currentIdx = steps.findIndex((s) => s.id === order.orderStatus);
  const statusConfig = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Order Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <Package size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-neutral-900 font-dm-sans">
                  {order.orderId}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                  {STATUS_LABELS[order.orderStatus]}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500 font-dm-sans">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-neutral-400" />
                  {formatDate(order.orderedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Package size={14} className="text-neutral-400" />
                  {order.items?.length} {order.items?.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>
          </div>

          {/* Price & Delivery */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100">
            <p className="text-xl font-bold text-neutral-900 font-dm-sans">
              NRs. {order.total?.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500 font-dm-sans">
              {getDeliveryStatusText()}
            </p>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
        <div className="bg-neutral-50 rounded-xl p-4">
          <div className="space-y-3">
            {visibleItems?.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-3 bg-white rounded-xl border border-neutral-100"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                  <img
                    src={getImageUrl(item)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-semibold text-neutral-900 font-dm-sans text-sm sm:text-base truncate">
                    {item.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-neutral-500 font-dm-sans">
                    {item.variant &&
                      Object.entries(item.variant).map(([key, value]) => (
                        <span key={key} className="flex items-center gap-1">
                          <span className="capitalize text-neutral-400">{key}:</span>
                          <span className="text-neutral-700 font-medium">{value}</span>
                        </span>
                      ))}
                    <span className="flex items-center gap-1">
                      <span className="text-neutral-400">Qty:</span>
                      <span className="text-neutral-700 font-medium">{item.quantity}</span>
                    </span>
                  </div>
                  <p className="font-bold text-teal-700 font-dm-sans mt-2 text-sm">
                    NRs. {item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasMoreItems && (
            <button
              onClick={() => setShowAllItems(!showAllItems)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 font-dm-sans py-2 transition-colors"
            >
              {showAllItems ? (
                <>
                  <ChevronUp size={16} />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show {order.items.length - 2} more {order.items.length - 2 > 1 ? "items" : "item"}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tracking Section */}
      {showTracking && !isCancelled && (
        <div className="px-5 sm:px-6 py-8 sm:py-10 bg-neutral-50 border-t border-neutral-100">
          {/* Desktop Horizontal Stepper */}
          <div className="hidden sm:flex max-w-2xl mx-auto relative items-center justify-between">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-neutral-200" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-teal-600 transition-all duration-500"
              style={{
                width: `${(currentIdx / (steps.length - 1)) * 100}%`,
              }}
            />

            {steps.map((step, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isPast
                      ? "bg-teal-600 text-white shadow-sm"
                      : isCurrent
                        ? "bg-white border-2 border-teal-600 text-teal-600 shadow-sm"
                        : "bg-white border-2 border-neutral-200 text-neutral-300"
                      }`}
                  >
                    {isPast ? (
                      <Check size={20} strokeWidth={2.5} />
                    ) : (
                      <StepIcon size={18} strokeWidth={isCurrent ? 2 : 1.5} />
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-7 text-xs font-semibold whitespace-nowrap transition-colors ${isPast || isCurrent ? "text-teal-700" : "text-neutral-400"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Stepper */}
          <div className="sm:hidden space-y-0 relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-neutral-200" />
            <div
              className="absolute left-5 top-5 w-0.5 bg-teal-600 transition-all duration-500"
              style={{ height: `${(currentIdx / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="relative flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${isPast
                      ? "bg-teal-600 text-white"
                      : isCurrent
                        ? "bg-white border-2 border-teal-600 text-teal-600"
                        : "bg-white border-2 border-neutral-200 text-neutral-300"
                      }`}
                  >
                    {isPast ? (
                      <Check size={18} strokeWidth={2.5} />
                    ) : (
                      <StepIcon size={16} strokeWidth={isCurrent ? 2 : 1.5} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold transition-colors ${isPast || isCurrent ? "text-neutral-900" : "text-neutral-400"
                        }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-xs text-teal-600 font-medium mt-0.5">
                        Current status
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-5 sm:px-6 py-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          {canTrack && (
            <>
              {canCancel && (
                <button
                  onClick={() => onCancelOrder?.(order._id)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-dm-sans"
                >
                  <X size={16} />
                  Cancel Order
                </button>
              )}
              <button
                onClick={() => setShowTracking(!showTracking)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-all font-dm-sans"
              >
                <MapPin size={16} />
                {showTracking ? "Hide Tracking" : "Track Order"}
              </button>
            </>
          )}

          {isDelivered && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all font-dm-sans">
                <Download size={16} />
                Invoice
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all font-dm-sans">
                <Star size={16} />
                Write Review
              </button>
              <Link
                to="/shop"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-all font-dm-sans"
              >
                <RotateCcw size={16} />
                Buy Again
              </Link>
            </div>
          )}

          {isCancelled && (
            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-all font-dm-sans"
            >
              <ShoppingCart size={16} />
              Continue Shopping
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
