import { useParams, Link } from "react-router-dom";
import { Check, Package, MessageSquare, HelpCircle, Mail } from "lucide-react";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();

  // Mock order data - in production, fetch from API using orderId
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Estimate delivery date (7-10 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 10);
  const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

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
              <span className="font-semibold text-neutral-900">
                your email address
              </span>
            </p>

            {/* Order Details */}
            <div className="flex items-center justify-center gap-4 md:gap-8 py-6 px-4 bg-neutral-50 rounded-xl mb-8">
              <div className="text-center">
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-dm-sans mb-1">
                  Order Number
                </p>
                <p className="text-sm md:text-base font-semibold text-teal-700 font-dm-sans">
                  #{orderId || "ORD-2024-001"}
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                to={`/track-order?orderId=${orderId}`}
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
