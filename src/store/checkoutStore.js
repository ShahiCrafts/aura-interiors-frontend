import { create } from "zustand";

const initialState = {
  // Current step: 1 = shipping, 2 = payment, 3 = review
  currentStep: 1,

  // Guest info
  guestInfo: {
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  },

  // Shipping address
  shippingAddress: {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nepal",
  },

  // Use saved address ID (for authenticated users)
  shippingAddressId: null,

  // Billing
  useSameAddress: true,
  billingAddress: null,
  billingAddressId: null,

  // Shipping method
  shippingMethod: "standard", // 'standard' or 'express'

  // Payment
  paymentMethod: "cod", // 'cod' or 'esewa'

  // Discount
  discountCode: "",
  appliedDiscount: null,

  // Customer note
  customerNote: "",
};

const useCheckoutStore = create((set, get) => ({
  ...initialState,

  // Step navigation
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  // Guest info
  setGuestInfo: (info) =>
    set((state) => ({
      guestInfo: { ...state.guestInfo, ...info },
    })),

  // Shipping address
  setShippingAddress: (address) => set({ shippingAddress: address }),
  setShippingAddressId: (id) => set({ shippingAddressId: id }),
  updateShippingField: (field, value) =>
    set((state) => ({
      shippingAddress: { ...state.shippingAddress, [field]: value },
    })),

  // Billing
  setUseSameAddress: (value) => set({ useSameAddress: value }),
  setBillingAddress: (address) => set({ billingAddress: address }),
  setBillingAddressId: (id) => set({ billingAddressId: id }),

  // Shipping method
  setShippingMethod: (method) => set({ shippingMethod: method }),

  // Payment
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  // Discount
  setDiscountCode: (code) => set({ discountCode: code }),
  setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
  clearDiscount: () => set({ discountCode: "", appliedDiscount: null }),

  // Customer note
  setCustomerNote: (note) => set({ customerNote: note }),

  // Reset checkout state
  reset: () => set(initialState),

  // Validation
  isShippingValid: () => {
    const state = get();
    const { guestInfo, shippingAddress, shippingAddressId } = state;

    // Check guest info
    if (!guestInfo.email || !guestInfo.firstName || !guestInfo.lastName) {
      return false;
    }

    // Check shipping address (either saved or new)
    if (shippingAddressId) return true;

    return (
      shippingAddress.fullName &&
      shippingAddress.phone &&
      shippingAddress.addressLine1 &&
      shippingAddress.city &&
      shippingAddress.postalCode
    );
  },

  // Get checkout data for API
  getGuestCheckoutData: (cartItems) => {
    const state = get();

    // Construct full shipping address with name and phone from guestInfo
    const fullShippingAddress = {
      ...state.shippingAddress,
      fullName: `${state.guestInfo.firstName} ${state.guestInfo.lastName}`.trim(),
      phone: state.guestInfo.phone,
    };

    return {
      email: state.guestInfo.email,
      firstName: state.guestInfo.firstName,
      lastName: state.guestInfo.lastName,
      phone: state.guestInfo.phone,
      items: cartItems.map((item) => ({
        productId: item.product?._id || item.productId,
        quantity: item.quantity,
        variant: item.variant || {},
      })),
      shippingAddress: fullShippingAddress,
      billingAddress: state.useSameAddress
        ? fullShippingAddress
        : state.billingAddress,
      useSameAddress: state.useSameAddress,
      paymentMethod: state.paymentMethod,
      discountCode: state.appliedDiscount?.code || "",
      customerNote: state.customerNote,
    };
  },

  getAuthenticatedCheckoutData: () => {
    const state = get();
    return {
      shippingAddressId: state.shippingAddressId,
      shippingAddress: state.shippingAddressId ? undefined : state.shippingAddress,
      billingAddressId: state.useSameAddress ? undefined : state.billingAddressId,
      billingAddress:
        state.useSameAddress || state.billingAddressId
          ? undefined
          : state.billingAddress,
      useSameAddress: state.useSameAddress,
      paymentMethod: state.paymentMethod,
      discountCode: state.appliedDiscount?.code || "",
      customerNote: state.customerNote,
    };
  },
}));

export default useCheckoutStore;
