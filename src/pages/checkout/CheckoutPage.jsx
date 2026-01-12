import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useCheckoutStore from "../../store/checkoutStore";
import useAuthStore from "../../store/authStore";
import useGuestCartStore from "../../store/guestCartStore";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "../../hooks/cart/useCartTan";
import { useApplyDiscount } from "../../hooks/admin/useDiscountTan";
import { useGuestCheckout, useCheckout } from "../../hooks/order/useOrderTan";
import Navbar from "../../layouts/customer/Navbar";
import Footer from "../../layouts/customer/Footer";
import ShippingStep from "../../components/checkout/ShippingStep";
import PaymentStep from "../../components/checkout/PaymentStep";
import { toast } from "react-toastify";
import { ChevronLeft, Plus, Minus, Trash2, Tag, ChevronRight, Loader2 } from "lucide-react";
import { getProductImageUrl } from "../../utils/imageUrl";
import formatError from "../../utils/errorHandler";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const {
    guestInfo,
    setGuestInfo,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    setPaymentMethod,
    isShippingValid,
    getGuestCheckoutData,
    getAuthenticatedCheckoutData,
    reset,
    currentStep,
    nextStep,
    prevStep,
    setStep,
  } = useCheckoutStore();

  const { data: cartData, isLoading: isCartLoading } = useCart({
    enabled: isAuthenticated,
  });

  // Guest cart store
  const {
    items: guestCartItems,
    getCartTotals: getGuestCartTotals,
    clearCart: clearGuestCart,
    updateItemQuantity: updateGuestCartQuantity,
    removeItem: removeGuestCartItem,
  } = useGuestCartStore();

  // Cart mutations
  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();
  const applyDiscountMutation = useApplyDiscount();

  const guestCheckoutMutation = useGuestCheckout();
  const authenticatedCheckoutMutation = useCheckout();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use appropriate cart based on authentication status
  const cart = cartData?.data?.cart;
  const guestTotals = getGuestCartTotals();
  const cartItems = isAuthenticated ? (cart?.items || []) : guestCartItems;
  const subtotal = isAuthenticated ? (cart?.subtotal || 0) : guestTotals.subtotal;
  const promoDiscount = appliedPromo?.discount?.discountAmount || 0;
  const shippingCost = shippingMethod === "express" ? 100 : 0;
  const taxRate = 0.13;
  const taxAmount = Math.round((subtotal - promoDiscount) * taxRate);
  const total = subtotal - promoDiscount + shippingCost + taxAmount;

  const getImageUrl = (product) => getProductImageUrl(product);

  // Pre-fill guest info for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      setGuestInfo({
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
  }, [isAuthenticated, user, setGuestInfo]);

  // Reset to step 1 on mount and set default payment method
  useEffect(() => {
    setStep(1);
    if (!paymentMethod) {
      setPaymentMethod("cod");
    }
  }, [setStep, setPaymentMethod]);

  // Mark as initialized after first render
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if cart is empty (only after initialization and not during submission)
  useEffect(() => {
    // Don't redirect if not initialized or if we're submitting an order
    if (!isInitialized || isSubmitting) return;

    const isLoading = isAuthenticated && isCartLoading;
    if (!isLoading && cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/");
    }
  }, [isCartLoading, isAuthenticated, cartItems.length, navigate, isInitialized, isSubmitting]);

  // Cart handlers
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    if (!isAuthenticated) {
      updateGuestCartQuantity(itemId, newQuantity);
      return;
    }

    updateCartItem(
      { itemId, quantity: newQuantity },
      {
        onError: (err) => toast.error(formatError(err, "Failed to update quantity")),
      }
    );
  };

  const handleRemoveItem = (itemId) => {
    if (!isAuthenticated) {
      removeGuestCartItem(itemId);
      toast.success("Item removed");
      return;
    }

    removeFromCart(itemId, {
      onSuccess: () => toast.success("Item removed"),
      onError: (err) => toast.error(formatError(err, "Failed to remove item")),
    });
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    applyDiscountMutation.mutate(promoCode, {
      onSuccess: (data) => {
        setAppliedPromo(data.data);
        setPromoCode("");
        toast.success("Promo code applied!");
      },
      onError: (err) => {
        toast.error(formatError(err, "Invalid promo code"));
      },
    });
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.success("Promo code removed");
  };

  const canProceedToPayment = () => {
    return (
      guestInfo.firstName &&
      guestInfo.lastName &&
      guestInfo.email &&
      guestInfo.phone &&
      shippingAddress.addressLine1 &&
      shippingAddress.city &&
      cartItems.length > 0
    );
  };

  const canPlaceOrder = () => {
    return canProceedToPayment() && paymentMethod;
  };

  const handleContinueToPayment = () => {
    if (!canProceedToPayment()) {
      toast.error("Please fill in all required shipping fields");
      return;
    }
    nextStep();
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting || !canPlaceOrder()) return;

    setIsSubmitting(true);

    try {
      let result;

      if (isAuthenticated) {
        const checkoutData = getAuthenticatedCheckoutData();
        result = await authenticatedCheckoutMutation.mutateAsync(checkoutData);
      } else {
        const formattedItems = guestCartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          variant: item.variant || {},
        }));
        const checkoutData = getGuestCheckoutData(formattedItems);
        result = await guestCheckoutMutation.mutateAsync(checkoutData);
      }

      const order = result.data?.order;

      // Handle eSewa payment (ePay v2)
      if (paymentMethod === "esewa" && result.data?.esewa) {
        const esewaData = result.data.esewa;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = esewaData.payment_url;

        // eSewa ePay v2 fields
        const fields = {
          amount: esewaData.amount,
          tax_amount: esewaData.tax_amount,
          product_service_charge: esewaData.product_service_charge,
          product_delivery_charge: esewaData.product_delivery_charge,
          total_amount: esewaData.total_amount,
          transaction_uuid: esewaData.transaction_uuid,
          product_code: esewaData.product_code,
          success_url: esewaData.success_url,
          failure_url: esewaData.failure_url,
          signed_field_names: esewaData.signed_field_names,
          signature: esewaData.signature,
        };

        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // Clear guest cart after successful COD order
      if (!isAuthenticated) {
        clearGuestCart();
      }

      reset();

      // Redirect to order confirmation with email and emailSent status
      const customerEmail = order.email || guestInfo.email;
      const emailSent = result.data?.emailSent ? 'true' : 'false';
      navigate(`/order-confirmation/${order.orderId}?email=${encodeURIComponent(customerEmail)}&emailSent=${emailSent}`);
    } catch (error) {
      toast.error(formatError(error, "Failed to place order"));
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && isCartLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <Loader2 size={48} className="text-teal-700 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 pt-20 font-dm-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link to="/" className="text-neutral-400 hover:text-neutral-600 transition-colors">
              Home
            </Link>
            <span className="text-neutral-300">/</span>
            <Link to="/shop" className="text-neutral-400 hover:text-neutral-600 transition-colors">
              Collections
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-400">Cart</span>
            <span className="text-neutral-300">/</span>
            <span className="text-teal-700 font-medium">Checkout</span>
          </nav>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left - Form Steps */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
                {/* Step 1: Shipping */}
                {currentStep === 1 && <ShippingStep />}

                {/* Step 2: Payment */}
                {currentStep === 2 && <PaymentStep />}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  {/* Back Button (only on step 2) */}
                  {currentStep === 2 && (
                    <button
                      onClick={prevStep}
                      className="flex-1 py-4 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={18} />
                      <span>Back</span>
                    </button>
                  )}

                  {/* Continue to Payment (step 1) */}
                  {currentStep === 1 && (
                    <button
                      onClick={handleContinueToPayment}
                      disabled={!canProceedToPayment()}
                      className="flex-1 py-4 bg-teal-700 text-white font-medium rounded-xl hover:bg-teal-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <span>Continue to Payment</span>
                      <ChevronRight size={18} />
                    </button>
                  )}

                  {/* Place Order (step 2) */}
                  {currentStep === 2 && (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting || !canPlaceOrder()}
                      className="flex-1 py-4 bg-teal-700 text-white font-medium rounded-xl hover:bg-teal-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Place Order</span>
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sticky top-24">
                <h2 className="text-xl font-playfair text-neutral-900 mb-6">
                  <span className="font-bold">Order</span>{" "}
                  <span className="italic text-teal-700">Summary</span>
                </h2>

                {/* Cart Items */}
                <div className="space-y-5 mb-6">
                  {cartItems.map((item) => {
                    const product = item.product || {};
                    const price = product.salePrice || product.price || 0;

                    return (
                      <div key={item._id} className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          <img
                            src={getImageUrl(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          {/* Category */}
                          {product.category?.name && (
                            <p className="text-[11px] text-neutral-400 uppercase tracking-wide mb-0.5">
                              {product.category.name}
                            </p>
                          )}

                          {/* Name & Delete */}
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-sm font-medium text-neutral-800 leading-tight">
                              {product.name}
                            </h4>
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={isRemoving}
                              className="text-orange-400 hover:text-orange-500 transition-colors disabled:opacity-50 flex-shrink-0 p-0.5"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Quantity & Price */}
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-9 h-8 flex items-center justify-center text-sm font-medium text-neutral-800 border-x border-neutral-200 bg-neutral-50/50">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                disabled={isUpdating}
                                className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="text-sm font-semibold text-teal-700">
                              NRs. {(price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-teal-50/50 border border-teal-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-medium text-teal-700">
                          {appliedPromo.discount.code} ({appliedPromo.discount.discountPercentage}% OFF)
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Promo code"
                          className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-neutral-300"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        disabled={applyDiscountMutation.isPending || !promoCode.trim()}
                        className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {applyDiscountMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-100 my-5" />

                {/* Pricing */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="text-neutral-800 font-medium">
                      NRs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Shipping</span>
                    <span className="text-neutral-800 font-medium">
                      {shippingCost === 0 ? "FREE" : `NRs. ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Tax (13%)</span>
                    <span className="text-neutral-800 font-medium">
                      NRs. {taxAmount.toLocaleString()}
                    </span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-teal-600">
                      <span>Discount</span>
                      <span>- NRs. {promoDiscount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-5 mt-5 border-t border-neutral-100">
                  <span className="text-base font-semibold text-neutral-900">Total</span>
                  <span className="text-xl font-bold text-teal-700">
                    NRs. {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
