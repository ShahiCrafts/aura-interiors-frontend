import { useSearchParams, Link } from "react-router-dom";
import { XCircle, RefreshCw, Home, HelpCircle } from "lucide-react";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const orderId = searchParams.get("orderId");

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "missing_data":
        return "Payment data was not received properly.";
      case "invalid_response":
        return "Invalid response from payment gateway.";
      case "signature_mismatch":
        return "Payment verification failed. Please contact support.";
      case "order_not_found":
        return "Order not found. Please try again.";
      case "payment_incomplete":
        return "Payment was not completed.";
      default:
        return "Something went wrong with your payment.";
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-red-50/50 to-white pt-20">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Failed Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            {/* Failed Icon */}
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-white" strokeWidth={2} />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl md:text-3xl font-playfair text-neutral-900 mb-2">
              Payment <span className="italic text-red-500">Failed</span>
            </h1>
            <p className="text-neutral-600 font-dm-sans mb-4">
              {getErrorMessage(error)}
            </p>

            {orderId && (
              <p className="text-sm text-neutral-500 font-dm-sans mb-8">
                Order Reference: <span className="font-semibold">{orderId}</span>
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 text-white font-medium rounded-xl hover:bg-teal-800 transition-colors font-dm-sans"
              >
                <RefreshCw size={18} />
                Try Again
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors font-dm-sans"
              >
                <Home size={18} />
                Go Home
              </Link>
            </div>

            {/* Help Section */}
            <div className="pt-6 border-t border-neutral-200">
              <p className="text-neutral-600 font-dm-sans mb-4">
                Need help with your payment?
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 font-medium font-dm-sans"
              >
                <HelpCircle size={16} />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
