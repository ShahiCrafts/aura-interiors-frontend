import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useCheckoutStore from "../../store/checkoutStore";
import useAuthStore from "../../store/authStore";
import useGuestCartStore from "../../store/guestCartStore";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
} from "../../hooks/cart/useCartTan";
import { useApplyDiscount } from "../../hooks/admin/useDiscountTan";
import { useGuestCheckout, useCheckout } from "../../hooks/order/useOrderTan";
import Navbar from "../../layouts/customer/Navbar";
import Footer from "../../layouts/customer/Footer";
import ShippingStep from "../../components/checkout/ShippingStep";
import PaymentStep from "../../components/checkout/PaymentStep";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  Plus,
  Minus,
  Trash2,
  Tag,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { getProductImageUrl } from "../../utils/imageUrl";
import formatError from "../../utils/errorHandler";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { shippingSchema } from "../../utils/validationSchemas";

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
    currentStep,
    nextStep,
    prevStep,
    setStep,
    getGuestCheckoutData,
    getAuthenticatedCheckoutData,
    reset,
  } = useCheckoutStore();

  const { data: cartData, isLoading: isCartLoading } = useCart({
    enabled: isAuthenticated,
  });

  const {
    items: guestCartItems,
    getCartTotals: getGuestCartTotals,
    clearCart: clearGuestCart,
    updateItemQuantity: updateGuestCartQuantity,
    removeItem: removeGuestCartItem,
  } = useGuestCartStore();

  const { mutate: updateCartItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();
  const applyDiscountMutation = useApplyDiscount();
  const guestCheckoutMutation = useGuestCheckout();
  const authenticatedCheckoutMutation = useCheckout();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const methods = useForm({
    resolver: yupResolver(shippingSchema),
    defaultValues: {
      firstName: guestInfo.firstName || "",
      lastName: guestInfo.lastName || "",
      email: guestInfo.email || "",
      phone: guestInfo.phone || "",
      addressLine1: shippingAddress.addressLine1 || "",
      city: shippingAddress.city || "",
      postalCode: shippingAddress.postalCode || "",
      country: shippingAddress.country || "",
    },
    mode: "onTouched",
  });

  const { reset: resetForm, handleSubmit: handleFormSubmit, watch } = methods;

  const watchedGuestInfo = watch(["firstName", "lastName", "email", "phone"]);
  const watchedShippingFields = watch([
    "addressLine1",
    "city",
    "postalCode",
    "country",
    "state",
  ]);
  const [fName, lName, mail, ph] = watchedGuestInfo;
  const [addr1, cty, zip, cntry, st] = watchedShippingFields;

  useEffect(() => {
    if (currentStep === 1) {
      const state = useCheckoutStore.getState();
      if (
        fName !== state.guestInfo.firstName ||
        lName !== state.guestInfo.lastName ||
        mail !== state.guestInfo.email ||
        ph !== state.guestInfo.phone
      ) {
        setGuestInfo({
          firstName: fName || "",
          lastName: lName || "",
          email: mail || "",
          phone: ph || "",
        });
      }
      const shippingUpdates = {
        addressLine1: addr1 || "",
        city: cty || "",
        postalCode: zip || "",
        country: cntry || "",
        state: st || "",
      };
      Object.entries(shippingUpdates).forEach(([key, value]) => {
        if (value !== state.shippingAddress[key])
          state.updateShippingField(key, value);
      });
    }
  }, [
    fName,
    lName,
    mail,
    ph,
    addr1,
    cty,
    zip,
    cntry,
    st,
    currentStep,
    setGuestInfo,
  ]);

  const cart = cartData?.data?.cart;
  const guestTotals = getGuestCartTotals();
  const cartItems = isAuthenticated ? cart?.items || [] : guestCartItems;
  const subtotal = isAuthenticated ? cart?.subtotal || 0 : guestTotals.subtotal;
  const promoDiscount = appliedPromo?.discount?.discountAmount || 0;
  const shippingCost = shippingMethod === "express" ? 100 : 0;
  const taxRate = 0.13;
  const taxAmount = Math.round((subtotal - promoDiscount) * taxRate);
  const total = subtotal - promoDiscount + shippingCost + taxAmount;

  const getImageUrl = (product) => getProductImageUrl(product);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userData = {
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      };
      setGuestInfo(userData);
      resetForm((prev) => ({ ...prev, ...userData }));
    }
  }, [isAuthenticated, user, setGuestInfo, resetForm]);

  useEffect(() => {
    setStep(1);
    if (!paymentMethod) setPaymentMethod("cod");
  }, [setStep, setPaymentMethod]);

  useEffect(() => {
    if (isSubmitting) return;
    if (!isCartLoading && cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/");
    }
  }, [
    isCartLoading,
    isAuthenticated,
    cartItems.length,
    navigate,
    isSubmitting,
  ]);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (!isAuthenticated) {
      updateGuestCartQuantity(itemId, newQuantity);
      return;
    }
    updateCartItem(
      { itemId, quantity: newQuantity },
      {
        onError: (err) =>
          toast.error(formatError(err, "Failed to update quantity")),
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
      onError: (err) => toast.error(formatError(err, "Invalid promo code")),
    });
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.success("Promo code removed");
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let result;
      if (isAuthenticated) {
        result = await authenticatedCheckoutMutation.mutateAsync(
          getAuthenticatedCheckoutData()
        );
      } else {
        const formattedItems = guestCartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          variant: item.variant || {},
        }));
        result = await guestCheckoutMutation.mutateAsync(
          getGuestCheckoutData(formattedItems)
        );
      }
      const order = result.data?.order;
      if (paymentMethod === "esewa" && result.data?.esewa) {
        const esewaData = result.data.esewa;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = esewaData.payment_url;
        Object.entries(esewaData).forEach(([key, value]) => {
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
      if (!isAuthenticated) clearGuestCart();
      reset();
      navigate(
        `/order-confirmation/${order.orderId}?email=${encodeURIComponent(
          order.email || guestInfo.email
        )}&emailSent=${result.data?.emailSent ? "true" : "false"}`
      );
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
      <main className="min-h-screen bg-neutral-50 pt-16 sm:pt-20 font-dm-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <nav className="flex flex-wrap items-center gap-y-2 gap-x-2 text-[10px] sm:text-xs md:text-sm mb-6 sm:mb-8 overflow-hidden">
            <Link
              to="/"
              className="text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
            >
              Home
            </Link>
            <span className="text-neutral-300 shrink-0">/</span>
            <Link
              to="/shop"
              className="text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
            >
              Collections
            </Link>
            <span className="text-neutral-300 shrink-0">/</span>
            <span className="text-teal-700 font-medium shrink-0">Checkout</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            <div className="order-2 md:order-1 md:col-span-7 lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 sm:p-6 md:p-8">
                <FormProvider {...methods}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      currentStep === 1
                        ? handleFormSubmit(() => nextStep())(e)
                        : handlePlaceOrder();
                    }}
                  >
                    {currentStep === 1 ? <ShippingStep /> : <PaymentStep />}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                      {currentStep === 2 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm order-2 sm:order-1"
                        >
                          <ChevronLeft size={18} />
                          <span>Back</span>
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`${
                          currentStep === 2 ? "sm:flex-2" : "w-full"
                        } py-3 bg-teal-700 text-white font-semibold rounded-xl hover:bg-teal-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm order-1 sm:order-2`}
                      >
                        {isSubmitting ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            <span>
                              {currentStep === 1
                                ? "Continue to Payment"
                                : "Place Order"}
                            </span>
                            <ChevronRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </FormProvider>
              </div>
            </div>

            <div className="order-1 md:order-2 md:col-span-5 lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 sm:p-6 md:sticky md:top-24">
                <h2 className="text-lg sm:text-xl font-playfair text-neutral-900 mb-6">
                  <span className="font-bold">Order</span>{" "}
                  <span className="italic text-teal-700">Summary</span>
                </h2>
                <div className="space-y-4 sm:space-y-5 mb-6 max-h-[50vh] md:max-h-none overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const product = item.product || {};
                    const price = product.salePrice || product.price || 0;
                    return (
                      <div key={item._id} className="flex gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                          <img
                            src={getImageUrl(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[13px] sm:text-sm font-medium text-neutral-800 leading-tight line-clamp-2">
                              {product.name}
                            </h4>
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-orange-400 hover:text-orange-500 transition-colors p-0.5 shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden scale-90 sm:scale-100 origin-left">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item._id,
                                    item.quantity - 1
                                  )
                                }
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-500 hover:bg-neutral-50"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-semibold text-neutral-800 border-x border-neutral-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item._id,
                                    item.quantity + 1
                                  )
                                }
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-500 hover:bg-neutral-50"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-teal-700">
                              NRs. {(price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mb-6">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-teal-50/50 border border-teal-100 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Tag className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-teal-700 truncate">
                          {appliedPromo.discount.code} applied
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-teal-600 hover:text-teal-700 text-xs sm:text-sm font-medium shrink-0 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300"
                        />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) =>
                            setPromoCode(e.target.value.toUpperCase())
                          }
                          placeholder="Promo code"
                          className="w-full pl-8 sm:pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-xs sm:text-sm focus:border-teal-500 outline-none transition-all"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        disabled={
                          applyDiscountMutation.isPending || !promoCode.trim()
                        }
                        className="px-4 py-2 bg-neutral-900 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
                <div className="border-t border-neutral-100 my-4 sm:my-5" />
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="text-neutral-800 font-medium">
                      NRs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-neutral-500">Shipping</span>
                    <span className="text-neutral-800 font-medium">
                      {shippingCost === 0
                        ? "FREE"
                        : `NRs. ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-neutral-500">Tax (13%)</span>
                    <span className="text-neutral-800 font-medium">
                      NRs. {taxAmount.toLocaleString()}
                    </span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm text-teal-600 font-medium">
                      <span>Discount</span>
                      <span>- NRs. {promoDiscount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-neutral-100">
                  <span className="text-sm sm:text-base font-semibold text-neutral-900">
                    Total
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-teal-700">
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
