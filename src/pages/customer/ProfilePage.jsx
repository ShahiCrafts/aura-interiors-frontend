import { useState } from "react";
import {
  MapPin,
  User,
  Heart,
  Package,
  LayoutDashboard,
  CreditCard,
  Mail,
  Camera
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import Navbar from "../../layouts/customer/Navbar";
import SavedAddresses from "../../components/profile/SavedAddresses";
import PersonalInformation from "../../components/profile/PersonalInformation";
import Wishlist from "../../components/profile/Wishlist";
import OrdersSection from "../../components/profile/OrdersSection";
import { getAvatarUrl } from "../../utils/imageUrl";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("orders");

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getProfileAvatar = () => {
    return getAvatarUrl(user);
  };

  const navItems = [
    { id: "personal-information", label: "Personal Information", icon: User },
    { id: "orders", label: "Orders", icon: Package, count: 3 },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "saved-addresses", label: "Saved Addresses", icon: MapPin },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFDFD] pt-20 font-dm-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="lg:sticky lg:top-24">
                {/* User Info Section */}
                <div className="flex items-center gap-5 mb-10">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-teal-700 flex items-center justify-center text-white text-3xl font-playfair font-medium overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={getProfileAvatar()}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(user?.firstName, user?.lastName) || "JD"
                      )}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-neutral-100 rounded-lg flex items-center justify-center text-neutral-500 shadow-sm hover:bg-neutral-50 transition-colors">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-playfair font-medium text-neutral-900 truncate tracking-tight">
                      {user?.firstName || "John"} {user?.lastName || "Doe"}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-400 font-dm-sans">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{user?.email || "john.doe@gmail.com"}</span>
                    </div>
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
                        className={`group flex items-center gap-3.5 px-4.5 py-3 rounded-xl transition-all duration-200 relative overflow-hidden w-full focus:outline-none ${isActive
                          ? "bg-teal-50/80 text-teal-700 ring-1 ring-teal-100/50"
                          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                          }`}
                      >
                        {/* Active Indicator Bar - Matches Admin Sidebar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-600 rounded-r-full"></span>
                        )}

                        <Icon
                          className={`w-5 h-5 shrink-0 transition-all duration-200 ${isActive ? "text-teal-600" : "text-neutral-400 group-hover:text-neutral-900"
                            }`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span
                          className={`flex-1 text-left text-[15px] tracking-tight ${isActive ? "font-semibold" : "font-medium"
                            }`}
                        >
                          {item.label}
                        </span>

                        {item.count !== undefined && (
                          <span className={`text-[11px] font-bold font-dm-sans px-2 py-0.5 rounded-full transition-all ${isActive
                            ? "bg-teal-600 text-white"
                            : "text-neutral-300 group-hover:text-neutral-400"
                            }`}>
                            {item.count}
                          </span>
                        )}
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
