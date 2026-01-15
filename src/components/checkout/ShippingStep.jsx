import { MapPin, Truck } from "lucide-react";
import useCheckoutStore from "../../store/checkoutStore";
import { useFormContext } from "react-hook-form";

export default function ShippingStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const { shippingMethod, setShippingMethod } = useCheckoutStore();

  const inputClasses = "w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 focus:bg-white transition-all";
  const labelClasses = "block text-sm font-medium text-neutral-700 mb-1.5";

  return (
    <div className="space-y-8 font-dm-sans">
      {/* Shipping Address Section */}
      <div className="space-y-5">
        {/* Heading */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
            <MapPin size={16} className="text-teal-600" />
          </div>
          <h2 className="text-lg font-playfair text-neutral-900">
            <span className="font-bold">Shipping</span>{" "}
            <span className="italic text-teal-700">Address</span>
          </h2>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register("firstName")}
                className={`${inputClasses} ${errors.firstName ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register("lastName")}
                className={`${inputClasses} ${errors.lastName ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                className={`${inputClasses} ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                {...register("phone")}
                className={`${inputClasses} ${errors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder="+977 9812345678"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
            {/* Street Address */}
            <div className="sm:col-span-2">
              <label className={labelClasses}>
                Street Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register("addressLine1")}
                className={`${inputClasses} ${errors.addressLine1 ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder="123 Main Street, Apt 4B"
              />
              {errors.addressLine1 && (
                <p className="text-xs text-red-500 mt-1">{errors.addressLine1.message}</p>
              )}
            </div>

            {/* City & State/Province */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("city")}
                  className={`${inputClasses} ${errors.city ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  placeholder="Kathmandu"
                />
                {errors.city && (
                  <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
                )}
              </div>
              <div>
                <label className={labelClasses}>
                  State/Province
                </label>
                <input
                  type="text"
                  {...register("state")}
                  className={inputClasses}
                  placeholder="Bagmati"
                />
              </div>
            </div>

            {/* ZIP Code & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  ZIP Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("postalCode")}
                  className={`${inputClasses} ${errors.postalCode ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  placeholder="44600"
                />
                {errors.postalCode && (
                  <p className="text-xs text-red-500 mt-1">{errors.postalCode.message}</p>
                )}
              </div>
              <div>
                <label className={labelClasses}>
                  Country <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("country")}
                  className={`${inputClasses} ${errors.country ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  placeholder="Nepal"
                />
                {errors.country && (
                  <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Method Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
              <Truck size={16} className="text-teal-600" />
            </div>
            <h2 className="text-lg font-playfair text-neutral-900">
              <span className="font-bold">Shipping</span>{" "}
              <span className="italic text-teal-700">Method</span>
            </h2>
          </div>

          <div className="space-y-3">
            {/* Standard Delivery */}
            <button
              type="button"
              onClick={() => setShippingMethod("standard")}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${shippingMethod === "standard"
                ? "border-teal-500 bg-teal-50/50"
                : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${shippingMethod === "standard"
                      ? "border-teal-500"
                      : "border-neutral-300"
                      }`}
                  >
                    {shippingMethod === "standard" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      Standard Delivery
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      5-7 business days
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-neutral-800">
                  FREE
                </span>
              </div>
            </button>

            {/* Express Delivery */}
            <button
              type="button"
              onClick={() => setShippingMethod("express")}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${shippingMethod === "express"
                ? "border-teal-500 bg-teal-50/50"
                : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${shippingMethod === "express"
                      ? "border-teal-500"
                      : "border-neutral-300"
                      }`}
                  >
                    {shippingMethod === "express" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      Express Delivery
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      2-3 business days
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-neutral-800">
                  $100
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
