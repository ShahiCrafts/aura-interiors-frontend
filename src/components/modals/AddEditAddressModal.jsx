import { useEffect } from "react";
import { X, Home, Building2, Users, MapPin, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { useCreateAddress, useUpdateAddress } from "../../hooks/profile/useAddressTan";
import formatError from "../../utils/errorHandler";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addressSchema } from "../../utils/validationSchemas";

const labelOptions = [
  { value: "home", label: "Home", icon: Home },
  { value: "office", label: "Office", icon: Building2 },
  { value: "family", label: "Family", icon: Users },
  { value: "other", label: "Other", icon: MapPin },
];

const typeOptions = [
  { value: "delivery", label: "Delivery Address" },
  { value: "billing", label: "Billing Address" },
];

export default function AddEditAddressModal({ isOpen, onClose, address }) {
  const isEditing = !!address;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addressSchema),
    mode: "onTouched",
    defaultValues: {
      label: "home",
      customLabel: "",
      type: "delivery",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Nepal",
      isDefault: false,
    },
  });

  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const isPending = isCreating || isUpdating;
  const currentLabel = watch("label");
  const currentType = watch("type");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (address) {
        reset({
          label: address.label || "home",
          customLabel: address.customLabel || "",
          type: address.type || "delivery",
          fullName: address.fullName || "",
          phone: address.phone || "",
          addressLine1: address.addressLine1 || "",
          addressLine2: address.addressLine2 || "",
          city: address.city || "",
          state: address.state || "",
          postalCode: address.postalCode || "",
          country: address.country || "Nepal",
          isDefault: address.isDefault || false,
        });
      } else {
        reset({
          label: "home",
          customLabel: "",
          type: "delivery",
          fullName: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "Nepal",
          isDefault: false,
        });
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, address, reset]);

  const onSubmit = (data) => {
    const payload = { ...data };
    if (payload.label !== "other") {
      payload.customLabel = "";
    }

    if (isEditing) {
      updateAddress(
        { id: address._id, data: payload },
        {
          onSuccess: () => {
            toast.success("Address updated successfully");
            onClose();
          },
          onError: (err) => {
            toast.error(formatError(err, "Failed to update address"));
          },
        }
      );
    } else {
      createAddress(payload, {
        onSuccess: () => {
          toast.success("Address added successfully");
          onClose();
        },
        onError: (err) => {
          toast.error(formatError(err, "Failed to add address"));
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          style={{
            animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>

          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-playfair text-neutral-900">
              <span className="font-medium">{isEditing ? "Edit" : "Add"}</span>{" "}
              <span className="italic text-teal-700">Address</span>
            </h2>
            <p className="text-neutral-500 font-dm-sans text-sm mt-1">
              {isEditing
                ? "Update your address details"
                : "Add a new delivery or billing address"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2 font-dm-sans">
                Address Label
              </label>
              <div className="grid grid-cols-4 gap-2">
                {labelOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = currentLabel === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue("label", option.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${isSelected
                        ? "border-neutral-400 bg-teal-50 text-teal-700"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                        }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium font-dm-sans">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentLabel === "other" && (
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                  Custom Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("customLabel")}
                  placeholder="e.g., Parents' Home"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.customLabel ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
                />
                {errors.customLabel && (
                  <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.customLabel.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2 font-dm-sans">
                Address Type
              </label>
              <div className="flex gap-3">
                {typeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${currentType === option.value
                      ? "border-neutral-400 bg-teal-50 text-teal-700"
                      : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                      }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("type")}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium font-dm-sans">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("fullName")}
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.fullName ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register("phone")}
                placeholder="+977 98XXXXXXXX"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("addressLine1")}
                placeholder="Street address, P.O. box"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.addressLine1 ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
              />
              {errors.addressLine1 && (
                <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.addressLine1.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Address Line 2
              </label>
              <input
                type="text"
                {...register("addressLine2")}
                placeholder="Apartment, suite, unit, building, floor, etc."
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("city")}
                  placeholder="Kathmandu"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.city ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
                />
                {errors.city && (
                  <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.city.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("postalCode")}
                  placeholder="44600"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.postalCode ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
                />
                {errors.postalCode && (
                  <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                  State/Province
                </label>
                <input
                  type="text"
                  {...register("state")}
                  placeholder="Bagmati"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("country")}
                  placeholder="Nepal"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 outline-none transition-all font-dm-sans text-neutral-900 placeholder:text-neutral-400 ${errors.country ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-neutral-200 focus:border-teal-700 focus:ring-teal-700"}`}
                />
                {errors.country && (
                  <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("isDefault")}
                className="w-4 h-4 rounded border-neutral-300 accent-teal-700 cursor-pointer"
              />
              <label className="text-sm text-neutral-700 font-dm-sans cursor-pointer">
                Set as default address
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl transition-all duration-300 font-dm-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 font-dm-sans"
              >
                {isPending ? (
                  <Loader className="animate-spin mx-auto" size={20} />
                ) : isEditing ? (
                  "Update Address"
                ) : (
                  "Add Address"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
