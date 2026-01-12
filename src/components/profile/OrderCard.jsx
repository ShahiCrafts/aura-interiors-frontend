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
} from "lucide-react";
import { getImageUrl as getImageUrlUtil } from "../../utils/imageUrl";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  processing: "bg-orange-50 text-orange-600",
  shipped: "bg-purple-50 text-purple-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
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
      return "Order Cancelled";
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

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden transition-all">
      <div className="px-6 py-5 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
            <Package size={24} className="text-teal-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-neutral-900 font-dm-sans">
              {order.orderId}
            </h3>
            <p className="text-sm text-neutral-500 font-dm-sans mt-0.5">
              {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} •
              Placed on {formatDate(order.orderedAt)}
            </p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-2">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              STATUS_COLORS[order.orderStatus]
            }`}
          >
            {STATUS_LABELS[order.orderStatus]}
          </span>
          <p className="text-[11px] font-medium text-neutral-400 font-dm-sans uppercase tracking-widest">
            {getDeliveryStatusText()}
          </p>
        </div>
      </div>

      <div className="px-6 py-2 border-t border-neutral-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {visibleItems?.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-100/50"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-neutral-100">
                <img
                  src={getImageUrl(item)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-bold text-neutral-900 font-dm-sans truncate text-sm">
                  {item.name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-neutral-500 font-dm-sans">
                  {item.variant &&
                    Object.entries(item.variant).map(([key, value]) => (
                      <span key={key}>
                        {key}:{" "}
                        <span className="text-neutral-900 font-medium">
                          {value}
                        </span>
                      </span>
                    ))}
                  <span>
                    Qty:{" "}
                    <span className="text-neutral-900 font-medium">
                      {item.quantity}
                    </span>
                  </span>
                </div>
                <p className="font-bold text-teal-700 font-dm-sans mt-1 text-sm">
                  NRs. {item.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasMoreItems && (
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="mb-4 mx-auto flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wider font-dm-sans py-2"
          >
            {showAllItems ? (
              <>
                <ChevronUp size={14} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                Show {order.items.length - 2} more item
                {order.items.length - 2 > 1 ? "s" : ""}
              </>
            )}
          </button>
        )}
      </div>

      {showTracking && !isCancelled && (
        <div className="px-6 py-12 bg-white border-t border-neutral-100">
          <div className="max-w-2xl mx-auto relative flex items-center justify-between">
            <div className="absolute top-5 left-0 w-full h-[2px] bg-neutral-100" />
            <div
              className="absolute top-5 left-0 h-[2px] bg-teal-600 transition-all duration-500"
              style={{
                width: `${(currentIdx / (steps.length - 1)) * 100}%`,
              }}
            />

            {steps.map((step, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const isFuture = idx > currentIdx;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      isPast
                        ? "bg-teal-600 border-teal-600 text-white"
                        : isCurrent
                        ? "bg-white border-teal-600 text-teal-600 shadow-sm shadow-teal-100"
                        : "bg-neutral-50 border-neutral-200 text-neutral-300"
                    }`}
                  >
                    {isPast ? (
                      <Check size={20} strokeWidth={3} />
                    ) : (
                      <StepIcon size={18} strokeWidth={isCurrent ? 2.5 : 2} />
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-8 text-[14px] font-semibold whitespace-nowrap tracking-tight transition-colors ${
                      isPast || isCurrent ? "text-teal-700" : "text-neutral-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-6 py-4 bg-white border-t border-neutral-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-neutral-400 font-dm-sans">
            Total:
          </span>
          <span className="text-xl font-black text-neutral-900 font-dm-sans">
            NRs. {order.total?.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {canTrack && (
            <>
              {canCancel && (
                <button
                  onClick={() => onCancelOrder?.(order._id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-dm-sans"
                >
                  <X size={18} />
                  Cancel Order
                </button>
              )}
              <button
                onClick={() => setShowTracking(!showTracking)}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-800 text-white rounded-xl text-sm font-bold hover:bg-teal-900 transition-all font-dm-sans ring-1 ring-teal-900"
              >
                <MapPin size={18} />
                {showTracking ? "Hide Status" : "Track Order"}
              </button>
            </>
          )}

          {isDelivered && (
            <>
              <button className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all font-dm-sans">
                <Download size={18} />
                Invoice
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all font-dm-sans">
                <Star size={18} />
                Review
              </button>
              <Link
                to="/shop"
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-800 text-white rounded-xl text-sm font-bold hover:bg-teal-900 transition-all font-dm-sans ring-1 ring-teal-900"
              >
                <RotateCcw size={18} />
                Buy Again
              </Link>
            </>
          )}

          {isCancelled && (
            <Link
              to="/shop"
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-800 text-white rounded-xl text-sm font-bold hover:bg-teal-900 transition-all font-dm-sans shadow-sm"
            >
              <ShoppingCart size={18} />
              Shop Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
