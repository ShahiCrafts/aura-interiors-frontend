import { useState } from "react";
import {
  Plus,
  Home,
  Building2,
  Users,
  MapPin,
  Phone,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "../ui/Toast";
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../../hooks/useAddressTan";
import AddEditAddressModal from "../modals/AddEditAddressModal";

const labelIcons = {
  home: Home,
  office: Building2,
  family: Users,
  other: MapPin,
};

const labelColors = {
  home: "bg-teal-50 text-teal-700",
  office: "bg-blue-50 text-blue-700",
  family: "bg-purple-50 text-purple-700",
  other: "bg-neutral-100 text-neutral-600",
};

export default function SavedAddresses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const { data, isLoading, error } = useAddresses();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefault, isPending: isSettingDefault } = useSetDefaultAddress();

  const addresses = data?.data?.addresses || [];

  const handleEdit = (address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteAddress(id, {
        onSuccess: () => {
          toast.success("Address deleted successfully");
        },
        onError: (err) => {
          toast.error(err || "Failed to delete address");
        },
      });
    }
  };

  const handleSetDefault = (id) => {
    setDefault(id, {
      onSuccess: () => {
        toast.success("Default address updated");
      },
      onError: (err) => {
        toast.error(err || "Failed to set default address");
      },
    });
  };

  const getIcon = (label) => {
    const Icon = labelIcons[label?.toLowerCase()] || MapPin;
    return Icon;
  };

  const getIconColor = (label) => {
    return labelColors[label?.toLowerCase()] || labelColors.other;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
        <div className="text-center text-red-500 py-8">
          Failed to load addresses. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-playfair text-neutral-900">
            <span className="font-bold">Saved</span>{" "}
            <span className="italic text-teal-700">Addresses</span>
          </h1>
          <p className="text-neutral-500 font-dm-sans text-sm mt-1">
            Manage your delivery and billing addresses
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-700/25 font-dm-sans text-sm"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => {
          const Icon = getIcon(address.label);
          const iconColor = getIconColor(address.label);

          return (
            <div
              key={address._id}
              className={`relative p-5 rounded-xl border-2 transition-all ${
                address.isDefault
                  ? "border-teal-200 bg-teal-50/30"
                  : "border-neutral-100 hover:border-neutral-200"
              }`}
            >
              {/* Label & Badges */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 font-dm-sans capitalize">
                      {address.label === "other" ? address.customLabel : address.label}
                    </h3>
                    <p className="text-xs text-neutral-500 font-dm-sans capitalize">
                      {address.type} Address
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {address.isDefault && (
                    <span className="px-2.5 py-1 bg-teal-700 text-white text-xs font-semibold rounded-full font-dm-sans">
                      DEFAULT
                    </span>
                  )}
                  {address.type === "billing" && !address.isDefault && (
                    <span className="px-2.5 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full font-dm-sans">
                      BILLING
                    </span>
                  )}
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-2 mb-4">
                <p className="font-medium text-neutral-800 font-dm-sans">
                  {address.fullName}
                </p>
                <div className="flex items-start gap-2 text-sm text-neutral-600 font-dm-sans">
                  <MapPin size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                  <span>
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                    <br />
                    {address.city}, {address.postalCode}
                    <br />
                    {address.state && `${address.state}, `}{address.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 font-dm-sans">
                  <Phone size={16} className="text-neutral-400" />
                  <span>{address.phone}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                {!address.isDefault && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => handleSetDefault(address._id)}
                      disabled={isSettingDefault}
                      className="w-4 h-4 rounded border-neutral-300 accent-teal-700 cursor-pointer"
                    />
                    <span className="text-sm text-neutral-600 font-dm-sans">
                      Set as Default
                    </span>
                  </label>
                )}
                {address.isDefault && <div />}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors font-dm-sans"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:text-red-600 hover:border-red-200 transition-colors font-dm-sans"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Address Card */}
        <button
          onClick={handleAddNew}
          className="p-5 rounded-xl border-2 border-dashed border-neutral-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group"
        >
          <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
            <Plus size={24} className="text-neutral-400 group-hover:text-teal-700 transition-colors" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-neutral-700 group-hover:text-teal-700 font-dm-sans transition-colors">
              Add New Address
            </p>
            <p className="text-sm text-neutral-500 font-dm-sans">
              Save a new delivery or billing address
            </p>
          </div>
        </button>
      </div>

      {/* Modal */}
      <AddEditAddressModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        address={editingAddress}
      />
    </div>
  );
}
