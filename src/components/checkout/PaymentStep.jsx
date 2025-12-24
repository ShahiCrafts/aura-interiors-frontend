import { CreditCard, Truck, Check, Shield } from "lucide-react";
import useCheckoutStore from "../../store/checkoutStore";

// eSewa Logo Component
const EsewaLogo = () => (
  <div className="w-12 h-12 rounded-full bg-[#60BB46] flex items-center justify-center">
    <span className="text-white font-bold text-xs">eSewa</span>
  </div>
);

export default function PaymentStep() {
  const { paymentMethod, setPaymentMethod } = useCheckoutStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100 mb-6">
        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
          <CreditCard size={16} className="text-teal-600" />
        </div>
        <h2 className="text-lg font-playfair text-neutral-900">
          <span className="font-bold">Payment</span>{" "}
          <span className="italic text-teal-700">Method</span>
        </h2>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        {/* eSewa Option */}
        <button
          type="button"
          onClick={() => setPaymentMethod("esewa")}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
            paymentMethod === "esewa"
              ? "border-[#60BB46] bg-green-50"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <EsewaLogo />
          <div className="flex-1">
            <p className={`font-medium font-dm-sans ${
              paymentMethod === "esewa" ? "text-neutral-900" : "text-neutral-900"
            }`}>
              eSewa
            </p>
            <p className="text-sm text-neutral-500 font-dm-sans">
              Pay with your digital wallet
            </p>
          </div>
          {paymentMethod === "esewa" && (
            <div className="w-6 h-6 rounded-full bg-[#60BB46] flex items-center justify-center">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
          )}
        </button>

        {/* Credit/Debit Card Option */}
        <button
          type="button"
          onClick={() => setPaymentMethod("card")}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
            paymentMethod === "card"
              ? "border-teal-500 bg-teal-50"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            paymentMethod === "card" ? "bg-teal-100" : "bg-neutral-100"
          }`}>
            <CreditCard size={24} className={paymentMethod === "card" ? "text-teal-600" : "text-neutral-500"} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-neutral-900 font-dm-sans">
              Credit / Debit Card
            </p>
            <p className="text-sm text-neutral-500 font-dm-sans">
              Visa, Mastercard, and more via Stripe
            </p>
          </div>
          {paymentMethod === "card" && (
            <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
          )}
        </button>

        {/* Cash on Delivery Option */}
        <button
          type="button"
          onClick={() => setPaymentMethod("cod")}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
            paymentMethod === "cod"
              ? "border-teal-500 bg-teal-50"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            paymentMethod === "cod" ? "bg-teal-100" : "bg-neutral-100"
          }`}>
            <Truck size={24} className={paymentMethod === "cod" ? "text-teal-600" : "text-neutral-500"} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-neutral-900 font-dm-sans">
              Cash on Delivery
            </p>
            <p className="text-sm text-neutral-500 font-dm-sans">
              Pay when your order arrives
            </p>
          </div>
          {paymentMethod === "cod" && (
            <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
          )}
        </button>
      </div>

      {/* Secure Payment Notice */}
      {(paymentMethod === "esewa" || paymentMethod === "card") && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 font-dm-sans">Secure Payment</p>
              <p className="text-sm text-amber-700 font-dm-sans mt-1">
                Your payment information is encrypted and secure. You'll be redirected to {paymentMethod === "esewa" ? "eSewa" : "Stripe"} to complete your payment.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
