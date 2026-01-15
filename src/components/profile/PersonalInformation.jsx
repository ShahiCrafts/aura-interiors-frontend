import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Lock, Check, Camera, Loader } from "lucide-react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/authStore";
import {
  useProfile,
  useUpdateProfile,
  useUpdateAvatar,
  useRemoveAvatar,
} from "../../hooks/profile/useProfileTan";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import { getAvatarUrl } from "../../utils/imageUrl";
import formatError from "../../utils/errorHandler";

const currentYear = new Date().getFullYear();

export default function PersonalInformation() {
  const fileInputRef = useRef(null);
  const { user: authUser, signIn } = useAuthStore();
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const { data, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: updateAvatar, isPending: isUploadingAvatar } =
    useUpdateAvatar();
  const { mutate: removeAvatar, isPending: isRemovingAvatar } =
    useRemoveAvatar();

  const user = data?.data?.user;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  const handleGenderSelect = (gender) => {
    setFormData((prev) => ({ ...prev, gender }));
    setHasChanges(true);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      });
      setHasChanges(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let dateOfBirth = formData.dateOfBirth || null;

    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      gender: formData.gender || null,
      dateOfBirth,
    };

    updateProfile(updateData, {
      onSuccess: (data) => {
        toast.success("Profile updated successfully");
        setHasChanges(false);
        if (data?.data?.user) {
          const token = localStorage.getItem("token");
          signIn(data.data.user, token);
        }
      },
      onError: (err) => {
        toast.error(formatError(err, "Failed to update profile"));
      },
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      updateAvatar(file, {
        onSuccess: (data) => {
          toast.success("Avatar updated successfully");
          if (data?.data?.user) {
            const token = localStorage.getItem("token");
            signIn(data.data.user, token);
          }
        },
        onError: (err) => {
          toast.error(formatError(err, "Failed to update avatar"));
        },
      });
    }
  };

  const handleRemoveAvatar = () => {
    removeAvatar(undefined, {
      onSuccess: (data) => {
        toast.success("Avatar removed successfully");
        if (data?.data?.user) {
          const token = localStorage.getItem("token");
          signIn(data.data.user, token);
        }
      },
      onError: (err) => {
        toast.error(formatError(err, "Failed to remove avatar"));
      },
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""
      }`.toUpperCase();
  };

  const getUserAvatar = () => {
    return getAvatarUrl(user);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-playfair text-neutral-900">
            <span className="font-medium">Profile</span>{" "}
            <span className="italic text-teal-700">Picture</span>
          </h2>
          <p className="text-neutral-500 font-dm-sans text-sm mt-1">
            Update your profile photo
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img
                src={getUserAvatar()}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-teal-700 flex items-center justify-center text-white text-3xl font-semibold font-dm-sans">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="font-medium text-neutral-800 font-dm-sans mb-1">
              Upload a new photo
            </p>
            <p className="text-sm text-neutral-500 font-dm-sans mb-4">
              Recommended: Square image, at least 400x400 pixels. Max file size:
              5MB
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 text-white text-sm font-semibold rounded-lg transition-all font-dm-sans"
              >
                {isUploadingAvatar ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Photo
                  </>
                )}
              </button>
              {user?.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={isRemovingAvatar}
                  className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-sm font-medium rounded-lg transition-all font-dm-sans"
                >
                  {isRemovingAvatar ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Remove
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-playfair text-neutral-900">
            <span className="font-medium">Personal</span>{" "}
            <span className="italic text-teal-700">Information</span>
          </h2>
          <p className="text-neutral-500 font-dm-sans text-sm mt-1">
            Update your personal details here
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                minLength={2}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                minLength={2}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 font-dm-sans cursor-not-allowed"
                />
                {user?.isEmailVerified && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-teal-600">
                    <Check size={14} />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}
              </div>
              {user?.isEmailVerified && (
                <p className="text-xs text-teal-600 mt-1 flex items-center gap-1 font-dm-sans">
                  <Check size={12} />
                  Email verified
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-dm-sans">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900 bg-white"
                  defaultValue="+977"
                >
                  <option value="+977">+977</option>
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98XXXXXXXX"
                  minLength={7}
                  maxLength={15}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2 font-dm-sans">
                Gender
              </label>
              <div className="flex flex-wrap gap-2">
                {["male", "female", "other"].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => handleGenderSelect(gender)}
                    className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all font-dm-sans capitalize flex-1 sm:flex-none min-w-[80px] ${formData.gender === gender
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2 font-dm-sans text-left">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-neutral-900 bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={!hasChanges}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 font-semibold rounded-lg transition-all font-dm-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !hasChanges}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all font-dm-sans"
            >
              {isUpdating ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <>
                  <Check size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-playfair text-neutral-900">
            <span className="font-medium">Password</span>{" "}
            <span className="italic text-teal-700">& Security</span>
          </h2>
          <p className="text-neutral-500 font-dm-sans text-sm mt-1">
            Manage your password and security settings
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <Lock size={20} className="text-neutral-500" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-neutral-800 font-dm-sans">
                Password
              </p>
              <p className="text-sm text-neutral-500 font-dm-sans truncate">
                Last changed{" "}
                {user?.passwordChangedAt
                  ? getTimeAgo(user.passwordChangedAt)
                  : "recently"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setChangePasswordModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 hover:bg-white text-neutral-700 text-sm font-medium rounded-lg transition-all font-dm-sans shrink-0"
          >
            <Lock size={14} />
            Change Password
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </div>
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  if (diffMonths > 0)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return "today";
}
