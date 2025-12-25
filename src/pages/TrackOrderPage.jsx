import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Package,
  Search,
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
} from "lucide-react";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import { useTrackOrder } from "../hooks/useOrderTan";
import OrderTrackingTimeline from "../components/profile/OrderTrackingTimeline";

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

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const initialEmail = searchParams.get("email") || "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState(initialEmail);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const trackOrderMutation = useTrackOrder();

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

  // Auto-track if params are provided
  useEffect(() => {
    if (initialOrderId && initialEmail) {
      handleTrackOrder();
    }
  }, []);

  const handleTrackOrder = (e) => {
    e?.preventDefault();
    setError("");

    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both Order ID and Email");
      return;
    }

    trackOrderMutation.mutate(
      { orderId: orderId.trim(), email: email.trim() },
      {
        onSuccess: (data) => {
          setOrder(data.data.order);
          setError("");
        },
        onError: (err) => {
          setOrder(null);
          setError(
            err.response?.data?.message ||
              "Order not found. Please check your order ID and email."
          );
        },
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getImageUrl = (item) => {
    if (item.image) {
      if (item.image.startsWith("http")) return item.image;
      return `${baseUrl.replace("/api/v1", "")}/uploads/products/${item.image}`;
    }
    return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop";
  };

  const getEstimatedDelivery = () => {
    if (order?.deliveredAt) {
      return formatDate(order.deliveredAt);
    }
    const baseDate = order?.orderedAt ? new Date(order.orderedAt) : new Date();
    const deliveryDate = new Date(baseDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return formatDate(deliveryDate);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 font-dm-sans"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-playfair text-neutral-900 mb-2">
              Track Your <span className="italic text-teal-700">Order</span>
            </h1>
            <p className="text-neutral-600 font-dm-sans">
              Enter your order ID and email to track your delivery status
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 mb-8">
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 font-dm-sans">
                    Order ID
                  </label>
                  <div className="relative">
                    <Package
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      type="text"
                      placeholder="e.g., AU1234567890"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-dm-sans"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 font-dm-sans">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-dm-sans"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                  <AlertCircle size={18} />
                  <span className="text-sm font-dm-sans">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={trackOrderMutation.isPending}
                className="w-full py-3 bg-teal-700 text-white font-medium rounded-xl hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-dm-sans"
              >
                {trackOrderMutation.isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Track Order
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 font-dm-sans">
                      Order #{order.orderId}
                    </h2>
                    <p className="text-neutral-500 font-dm-sans mt-1">
                      Placed on {formatDate(order.orderedAt)}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      STATUS_COLORS[order.orderStatus]
                    }`}
                  >
                    {STATUS_LABELS[order.orderStatus]}
                  </span>
                </div>

                {/* Tracking Timeline */}
                {order.orderStatus !== "cancelled" && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-700 mb-4 font-dm-sans flex items-center gap-2">
                      <MapPin size={16} />
                      Order Tracking
                    </h3>
                    <OrderTrackingTimeline status={order.orderStatus} />
                  </div>
                )}

                {/* Delivery Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-teal-600" />
                    <div>
                      <p className="text-xs text-neutral-500 font-dm-sans">
                        {order.orderStatus === "delivered"
                          ? "Delivered On"
                          : "Est. Delivery"}
                      </p>
                      <p className="font-medium text-neutral-900 font-dm-sans">
                        {getEstimatedDelivery()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-teal-600" />
                    <div>
                      <p className="text-xs text-neutral-500 font-dm-sans">
                        Payment Method
                      </p>
                      <p className="font-medium text-neutral-900 font-dm-sans">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "eSewa"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-teal-600" />
                    <div>
                      <p className="text-xs text-neutral-500 font-dm-sans">
                        Total Items
                      </p>
                      <p className="font-medium text-neutral-900 font-dm-sans">
                        {order.items?.length} item
                        {order.items?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-neutral-900 font-dm-sans mb-4">
                  Order Items
                </h3>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img
                          src={getImageUrl(item)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 font-dm-sans">
                          {item.name}
                        </h4>
                        {item.variant && Object.keys(item.variant).length > 0 && (
                          <p className="text-sm text-neutral-500 font-dm-sans mt-1">
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

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t border-neutral-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 font-dm-sans">Subtotal</span>
                    <span className="text-neutral-900 font-dm-sans">
                      NRs. {order.subtotal?.toLocaleString()}
                    </span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="font-dm-sans">
                        Discount{" "}
                        {order.discountCode?.code && `(${order.discountCode.code})`}
                      </span>
                      <span className="font-dm-sans">
                        -NRs. {order.discountAmount?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 font-dm-sans">Shipping</span>
                    <span className="text-neutral-900 font-dm-sans">
                      {order.shippingCost > 0
                        ? `NRs. ${order.shippingCost?.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500 font-dm-sans">Tax</span>
                      <span className="text-neutral-900 font-dm-sans">
                        NRs. {order.tax?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-neutral-200">
                    <span className="text-lg font-semibold text-neutral-900 font-dm-sans">
                      Total
                    </span>
                    <span className="text-xl font-bold text-teal-700 font-dm-sans">
                      NRs. {order.total?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-neutral-900 font-dm-sans mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-teal-600" />
                  Shipping Address
                </h3>
                <div className="text-neutral-600 font-dm-sans space-y-1">
                  <p className="font-medium text-neutral-900">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {order.shippingAddress?.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress?.city}
                    {order.shippingAddress?.state &&
                      `, ${order.shippingAddress.state}`}{" "}
                    {order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                  <p className="flex items-center gap-2 mt-2 text-neutral-500">
                    <Phone size={14} />
                    {order.shippingAddress?.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
