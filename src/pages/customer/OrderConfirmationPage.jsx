import { useParams, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Check,
  Package,
  MessageSquare,
  HelpCircle,
  Mail,
} from "lucide-react";
import Navbar from "../../layouts/customer/Navbar";
import Footer from "../../layouts/customer/Footer";
import { useTrackOrder } from "../../hooks/order/useOrderTan";
import { toast } from "react-toastify";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const emailSentParam = searchParams.get("emailSent");

  const [order, setOrder] = useState(null);
  const toastShownRef = useRef(false);

  const trackOrderMutation = useTrackOrder();

  // Show toast notification for email confirmation (only once)
  useEffect(() => {
    if (emailSentParam === "true" && email && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success(`Confirmation email sent to ${email}`);
    }
  }, [emailSentParam, email]);

  // Fetch order details when component mounts
  useEffect(() => {
    if (orderId && email) {
      trackOrderMutation.mutate(
        { orderId, email },
        {
          onSuccess: (data) => {
            setOrder(data.data.order);
          },
        }
      );
    }
  }, [orderId, email]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate estimated delivery (7-10 days from order date)
  const getEstimatedDelivery = () => {
    const baseDate = order?.orderedAt ? new Date(order.orderedAt) : new Date();
    const deliveryDate = new Date(baseDate);
    deliveryDate.setDate(deliveryDate.getDate() + 10);
    return deliveryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const orderDate = order?.orderedAt ? formatDate(order.orderedAt) : formatDate(new Date());
  const estimatedDelivery = getEstimatedDelivery();
  const customerEmail = order?.guestInfo?.email || email || "your email address";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white pt-20">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-teal-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-white" strokeWidth={3} />
            </div>

            {/* Thank You Message */}
            <h1 className="text-2xl md:text-3xl font-playfair text-neutral-900 mb-2">
              Thank you for your{" "}
              <span className="italic text-teal-700">purchase!</span>
            </h1>

            <p className="text-neutral-600 font-dm-sans mb-8">
              We've sent a confirmation email to{" "}
              <span className="font-semibold text-neutral-900">{customerEmail}</span>
              {" "}with your order details and tracking information.
            </p>

            {/* Order Details */}
            <div className="flex items-center justify-center gap-4 md:gap-8 py-6 px-4 bg-neutral-50 rounded-xl mb-8">
              <div className="text-center">
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-dm-sans mb-1">
                  Order Number
                </p>
                <p className="text-sm md:text-base font-semibold text-teal-700 font-dm-sans">
                  #{orderId || "N/A"}
                </p>
              </div>
              <div className="w-px h-10 bg-neutral-200" />
              <div className="text-center">
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-dm-sans mb-1">
                  Order Date
                </p>
                <p className="text-sm md:text-base font-semibold text-teal-700 font-dm-sans">
                  {orderDate}
                </p>
              </div>
              <div className="w-px h-10 bg-neutral-200" />
              <div className="text-center">
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-dm-sans mb-1">
                  Est. Delivery
                </p>
                <p className="text-sm md:text-base font-semibold text-teal-700 font-dm-sans">
                  {estimatedDelivery}
                </p>
              </div>
            </div>

            {/* Order Summary (if loaded) */}
            {order && (
              <div className="mb-8 p-4 bg-neutral-50 rounded-xl text-left">
                <h3 className="font-semibold text-neutral-900 font-dm-sans mb-3">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-neutral-600 font-dm-sans"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-medium text-neutral-900">
                        NRs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-600 font-dm-sans pt-2 border-t border-neutral-200">
                      <span>Discount</span>
                      <span>-NRs. {order.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-semibold text-neutral-900 font-dm-sans pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span className="text-teal-700">
                      NRs. {order.total?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                to={`/track-order?orderId=${orderId}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 text-white font-medium rounded-xl hover:bg-teal-800 transition-colors font-dm-sans"
              >
                <Package size={18} />
                Track Your Order
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors font-dm-sans"
              >
                <Check size={18} />
                Continue Shopping
              </Link>
            </div>

            {/* Help Section */}
            <div className="pt-6 border-t border-neutral-200">
              <p className="text-neutral-600 font-dm-sans mb-4">
                Need help with your order?
              </p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 font-medium font-dm-sans"
                >
                  <MessageSquare size={16} />
                  Contact Support
                </a>
                <a
                  href="/faq"
                  className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 font-medium font-dm-sans"
                >
                  <HelpCircle size={16} />
                  FAQs
                </a>
                <a
                  href="mailto:support@aurainteriors.com"
                  className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 font-medium font-dm-sans"
                >
                  <Mail size={16} />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
