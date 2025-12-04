import { useState, useEffect } from "react";
import { X, Home, Building2, Users, MapPin } from "lucide-react";
import { toast } from "../ui/Toast";
import { useCreateAddress, useUpdateAddress } from "../../hooks/useAddressTan";

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

  const [formData, setFormData] = useState({
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

  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (address) {
        setFormData({
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
        setFormData({
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
  }, [isOpen, address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { ...formData };
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
            toast.error(err || "Failed to update address");
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
          toast.error(err || "Failed to add address");
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        {/* Modal */}
        <div
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          style={{
            animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-playfair text-neutral-900">
              <span className="font-bold">{isEditing ? "Edit" : "Add"}</span>{" "}
              <span className="italic text-teal-700">Address</span>
            </h2>
            <p className="text-neutral-500 font-lato text-sm mt-1">
              {isEditing
                ? "Update your address details"
                : "Add a new delivery or billing address"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Label Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2 font-lato">
                Address Label
              </label>
              <div className="grid grid-cols-4 gap-2">
                {labelOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.label === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, label: option.value }))
                      }
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium font-lato">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Label (if Other selected) */}
            {formData.label === "other" && (
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                  Custom Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customLabel"
                  value={formData.customLabel}
                  onChange={handleChange}
                  placeholder="e.g., Parents' Home"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            )}

            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2 font-lato">
                Address Type
              </label>
              <div className="flex gap-3">
                {typeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.type === option.value
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={formData.type === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium font-lato">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+977 98XXXXXXXX"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Street address, P.O. box"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                Address Line 2
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, building, floor, etc."
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            {/* City & Postal Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Kathmandu"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="44600"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* State & Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                  State/Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Bagmati"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Nepal"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Set as Default */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-4 h-4 rounded border-neutral-300 accent-teal-700 cursor-pointer"
              />
              <label className="text-sm text-neutral-700 font-lato cursor-pointer">
                Set as default address
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-full transition-all duration-300 font-lato"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-700/25 font-lato"
              >
                {isPending
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                  ? "Update Address"
                  : "Add Address"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Animation Keyframes */}
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
