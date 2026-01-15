import { useState } from "react";
import {
  MapPin,
  User,
  Heart,
  Package,
  Mail,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    { id: "personal-information", label: "Profile", fullLabel: "Personal Information", icon: User },
    { id: "orders", label: "Orders", fullLabel: "Orders", icon: Package, count: 3 },
    { id: "wishlist", label: "Wishlist", fullLabel: "Wishlist", icon: Heart },
    { id: "saved-addresses", label: "Addresses", fullLabel: "Saved Addresses", icon: MapPin },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFDFD] font-dm-sans">
        {/* Desktop Layout */}
        <div className="hidden lg:block pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex gap-12">
              {/* Sidebar */}
              <div className="w-72 shrink-0">
                <div className="sticky top-24">
                  {/* User Info Section */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-teal-700 flex items-center justify-center text-white text-3xl font-playfair font-medium overflow-hidden shadow-sm">
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
                      <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-stone-100 rounded-lg flex items-center justify-center text-stone-500 shadow-sm hover:bg-stone-50 transition-colors">
                        <Camera size={14} />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-playfair font-semibold text-neutral-900 truncate tracking-tight">
                        {user?.firstName || "John"} {user?.lastName || "Doe"}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-400 font-dm-sans">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate">{user?.email || "john.doe@gmail.com"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Card - Desktop */}
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-3">
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
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-600 rounded-r-full"></span>
                            )}
                            <Icon
                              className={`w-5 h-5 shrink-0 transition-all duration-200 ${isActive ? "text-teal-600" : "text-neutral-400 group-hover:text-neutral-900"
                                }`}
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span
                              className={`flex-1 text-left text-[17px] tracking-tight ${isActive ? "font-semibold text-teal-700" : "font-medium"
                                }`}
                            >
                              {item.fullLabel}
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

        {/* Mobile & Tablet Layout */}
        <div className="lg:hidden pt-16">
          {/* Mobile Header - User Profile Card */}
          <div className="bg-white px-4 py-5 sm:px-6 border-b border-neutral-100">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-playfair font-medium overflow-hidden shadow-sm">
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
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-stone-100 rounded-lg flex items-center justify-center text-stone-500 shadow-sm hover:bg-stone-50 transition-colors">
                  <Camera size={12} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-playfair font-semibold text-neutral-900 truncate tracking-tight">
                  {user?.firstName || "John"} {user?.lastName || "Doe"}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs sm:text-sm text-neutral-400 font-dm-sans">
                  <Mail size={12} className="shrink-0 sm:w-[14px] sm:h-[14px]" />
                  <span className="truncate">{user?.email || "john.doe@gmail.com"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Navigation Tabs */}
          <div className="bg-white border-b border-neutral-100 sticky top-16 z-10">
            <nav className="flex items-center px-2 sm:px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all duration-200 ${
                      isActive ? "text-teal-700" : "text-neutral-400"
                    }`}
                  >
                    <div className="relative">
                      <Icon
                        size={20}
                        className={`transition-all duration-200 ${
                          isActive ? "text-teal-600" : "text-neutral-400"
                        }`}
                        strokeWidth={isActive ? 2.5 : 1.5}
                      />
                      {item.count !== undefined && (
                        <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-teal-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {item.count}
                        </span>
                      )}
                    </div>
                    <span className={`text-[12px] sm:text-[13px] mt-1 font-dm-sans transition-all duration-200 ${
                      isActive ? "font-semibold text-teal-700" : "font-medium text-neutral-400"
                    }`}>
                      {item.label}
                    </span>

                    {/* Active indicator line */}
                    {isActive && (
                      <motion.div
                        layoutId="topTabIndicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-teal-600 rounded-full"
                        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="px-4 sm:px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "personal-information" && <PersonalInformation />}
                {activeTab === "orders" && <OrdersSection />}
                {activeTab === "wishlist" && <Wishlist />}
                {activeTab === "saved-addresses" && <SavedAddresses />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </>
  );
}
