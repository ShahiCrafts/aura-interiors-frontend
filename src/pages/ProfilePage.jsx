import { MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../layouts/Navbar";
import SavedAddresses from "../components/profile/SavedAddresses";

export default function ProfilePage() {
  const { user } = useAuth();

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-teal-700 flex items-center justify-center text-white text-lg font-semibold font-lato">
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-neutral-900 font-lato truncate">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-sm text-neutral-500 font-lato truncate flex items-center gap-1">
                      <span className="text-neutral-400">@</span>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  <a
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 text-teal-700 font-medium transition-colors"
                  >
                    <MapPin size={20} />
                    <span className="font-lato">Saved Addresses</span>
                  </a>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <SavedAddresses />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
