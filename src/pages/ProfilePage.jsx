import { useState } from "react";
import { MapPin, User, Heart, Package } from "lucide-react";
import useAuthStore from "../store/authStore";
import Navbar from "../layouts/Navbar";
import SavedAddresses from "../components/profile/SavedAddresses";
import PersonalInformation from "../components/profile/PersonalInformation";
import Wishlist from "../components/profile/Wishlist";
import OrdersSection from "../components/profile/OrdersSection";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("personal-information");

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getAvatarUrl = () => {
    if (user?.avatar) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
      const serverUrl = baseUrl.split("/api")[0];
      return `${serverUrl}/uploads/avatars/${user.avatar}`;
    }
    return null;
  };

  const navItems = [
    { id: "personal-information", label: "Personal Information", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "saved-addresses", label: "Saved Addresses", icon: MapPin },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 pt-20 font-dm-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 lg:sticky lg:top-24">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt="Profile"
                      crossOrigin="anonymous"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-teal-700 flex items-center justify-center text-white text-lg font-semibold font-dm-sans">
                      {getInitials(user?.firstName, user?.lastName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-neutral-900 font-dm-sans truncate">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-sm text-neutral-500 font-dm-sans truncate flex items-center gap-1">
                      <span className="text-neutral-400">@</span>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                          isActive
                            ? "bg-teal-50 text-teal-700"
                            : "text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-dm-sans">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === "personal-information" && <PersonalInformation />}
              {activeTab === "orders" && <OrdersSection />}
              {activeTab === "wishlist" && <Wishlist />}
              {activeTab === "saved-addresses" && <SavedAddresses />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
