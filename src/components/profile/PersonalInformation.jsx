import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Lock, Check, Camera } from "lucide-react";
import { toast } from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import {
  useProfile,
  useUpdateProfile,
  useUpdateAvatar,
  useRemoveAvatar,
} from "../../hooks/useProfileTan";
import ChangePasswordModal from "../modals/ChangePasswordModal";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

export default function PersonalInformation() {
  const fileInputRef = useRef(null);
  const { user: authUser, signIn } = useAuth();
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const { data, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: updateAvatar, isPending: isUploadingAvatar } = useUpdateAvatar();
  const { mutate: removeAvatar, isPending: isRemovingAvatar } = useRemoveAvatar();

  const user = data?.data?.user;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      const dob = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dobDay: dob ? dob.getDate().toString() : "",
        dobMonth: dob ? months[dob.getMonth()] : "",
        dobYear: dob ? dob.getFullYear().toString() : "",
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
      const dob = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dobDay: dob ? dob.getDate().toString() : "",
        dobMonth: dob ? months[dob.getMonth()] : "",
        dobYear: dob ? dob.getFullYear().toString() : "",
      });
      setHasChanges(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let dateOfBirth = null;
    if (formData.dobDay && formData.dobMonth && formData.dobYear) {
      const monthIndex = months.indexOf(formData.dobMonth);
      dateOfBirth = new Date(
        parseInt(formData.dobYear),
        monthIndex,
        parseInt(formData.dobDay)
      ).toISOString();
    }

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
        toast.error(err || "Failed to update profile");
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
          toast.error(err || "Failed to update avatar");
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
        toast.error(err || "Failed to remove avatar");
      },
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getAvatarUrl = () => {
    if (user?.avatar) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
      // Extract server base URL (remove /api/v1 or similar path)
      const serverUrl = baseUrl.split("/api")[0];
      return `${serverUrl}/uploads/avatars/${user.avatar}`;
    }
    return null;
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
      {/* Profile Picture Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-playfair text-neutral-900">
            <span className="font-bold">Profile</span>{" "}
            <span className="italic text-teal-700">Picture</span>
          </h2>
          <p className="text-neutral-500 font-lato text-sm mt-1">
            Update your profile photo
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()}
                alt="Profile"
                crossOrigin="anonymous"
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-teal-700 flex items-center justify-center text-white text-2xl font-semibold font-lato">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
            )}
          </div>

          {/* Upload Info & Buttons */}
          <div className="flex-1">
            <p className="font-medium text-neutral-800 font-lato mb-1">
              Upload a new photo
            </p>
            <p className="text-sm text-neutral-500 font-lato mb-3">
              Recommended: Square image, at least 400x400 pixels. Max file size: 5MB
            </p>
            <div className="flex items-center gap-3">
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
                className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 text-white text-sm font-semibold rounded-lg transition-all font-lato"
              >
                <Upload size={16} />
                {isUploadingAvatar ? "Uploading..." : "Upload Photo"}
              </button>
              {user?.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={isRemovingAvatar}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-sm font-medium rounded-lg transition-all font-lato"
                >
                  <Trash2 size={16} />
                  {isRemovingAvatar ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-playfair text-neutral-900">
            <span className="font-bold">Personal</span>{" "}
            <span className="italic text-teal-700">Information</span>
          </h2>
          <p className="text-neutral-500 font-lato text-sm mt-1">
            Update your personal details here
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 font-lato cursor-not-allowed"
                />
                {user?.isEmailVerified && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-teal-600">
                    <Check size={14} />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}
              </div>
              {user?.isEmailVerified && (
                <p className="text-xs text-teal-600 mt-1 flex items-center gap-1 font-lato">
                  <Check size={12} />
                  Email verified
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1 font-lato">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 bg-white"
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
                  className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Gender & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2 font-lato">
                Gender
              </label>
              <div className="flex gap-2">
                {["male", "female", "other"].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => handleGenderSelect(gender)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all font-lato capitalize ${
                      formData.gender === gender
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    {formData.gender === gender && (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-teal-700 rounded-full" />
                      </span>
                    )}{" "}
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2 font-lato">
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  name="dobDay"
                  value={formData.dobDay}
                  onChange={handleChange}
                  className="px-3 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 bg-white text-sm"
                >
                  <option value="">Day</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  name="dobMonth"
                  value={formData.dobMonth}
                  onChange={handleChange}
                  className="px-3 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 bg-white text-sm"
                >
                  <option value="">Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  name="dobYear"
                  value={formData.dobYear}
                  onChange={handleChange}
                  className="px-3 py-2.5 rounded-lg border border-neutral-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-lato text-neutral-900 bg-white text-sm"
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={!hasChanges}
              className="px-6 py-2.5 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 font-semibold rounded-lg transition-all font-lato"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !hasChanges}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all font-lato"
            >
              <Check size={16} />
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Password & Security Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-playfair text-neutral-900">
            <span className="font-bold">Password</span>{" "}
            <span className="italic text-teal-700">& Security</span>
          </h2>
          <p className="text-neutral-500 font-lato text-sm mt-1">
            Manage your password and security settings
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Lock size={20} className="text-neutral-500" />
            </div>
            <div>
              <p className="font-medium text-neutral-800 font-lato">Password</p>
              <p className="text-sm text-neutral-500 font-lato">
                Last changed {user?.passwordChangedAt ? getTimeAgo(user.passwordChangedAt) : "recently"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setChangePasswordModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 hover:bg-white text-neutral-700 text-sm font-medium rounded-lg transition-all font-lato"
          >
            <Lock size={14} />
            Change Password
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
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
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return "today";
}
