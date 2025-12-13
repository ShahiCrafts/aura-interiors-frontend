import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sofa,
  BedDouble,
  UtensilsCrossed,
  Lamp,
  Box,
  Heart,
  LogOut,
  LayoutDashboard,
  FileText,
  Phone,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import MegaMenuDropdown from "../components/MegaMenuDropdown";
import SignupModal from "../components/modals/SignupModal";
import LoginModal from "../components/modals/LoginModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, signOut } = useAuthStore();
  const navigate = useNavigate();
  const cartCount = 3;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSignOut = () => {
    signOut();
    setUserDropdownOpen(false);
    closeMobileMenu();
    navigate("/");
  };

  const navLinks = [
    {
      name: "Shop",
      href: "/shop",
      hasDropdown: true,
      isMegaMenu: true,
      icon: Box,
    },
    { name: "Design Studio", href: "/design-studio", hasDropdown: false, icon: LayoutDashboard },
    { name: "Blog", href: "/blog", hasDropdown: false, icon: FileText },
    { name: "Contact", href: "/contact", hasDropdown: false, icon: Phone },
  ];

  const mobileCategories = [
    { name: "Living Room", icon: Sofa, href: "/shop/living-room" },
    { name: "Bedroom", icon: BedDouble, href: "/shop/bedroom" },
    {
      name: "Dining",
      icon: UtensilsCrossed,
      href: "/shop/dining",
    },
    { name: "Lighting", icon: Lamp, href: "/shop/lighting" },
  ];

  const handleMegaMenuEnter = () => {
    setMegaMenuOpen(true);
    setActiveLink("Collections");
  };

  const handleMegaMenuLeave = () => {
    setMegaMenuOpen(false);
    setActiveLink(null);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileCollectionsOpen(false);
  };

  return (
    <>
      <nav
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-500 font-lato ${
          scrolled
            ? "bg-white/95 backdrop-blur-2xl shadow-lg border-b border-neutral-200/80"
            : "bg-white/80 backdrop-blur-xl border-b border-neutral-200/40 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <a href="/" onClick={closeMobileMenu}>
              <h1
                className="font-playfair text-xl sm:text-2xl lg:text-2xl font-bold tracking-wide text-amber-800 cursor-pointer"
                style={{
                  opacity: 0,
                  animation:
                    "fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards",
                }}
              >
                Aura Interiors
              </h1>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center items-center gap-8 xl:gap-10 whitespace-nowrap">
            {navLinks.map((link, idx) => (
              <div
                key={link.name}
                className="relative group"
                onMouseEnter={() => {
                  if (link.isMegaMenu) {
                    handleMegaMenuEnter();
                  } else {
                    setActiveLink(link.name);
                  }
                }}
                onMouseLeave={() => {
                  if (!link.isMegaMenu) {
                    setActiveLink(null);
                  }
                }}
                style={{
                  opacity: 0,
                  animation: `fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) ${
                    0.1 + idx * 0.1
                  }s forwards`,
                }}
              >
                <a
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm lg:text-base font-medium text-neutral-700 hover:text-neutral-900 transition-colors duration-200 py-2 font-lato"
                >
                  {link.name}
                  {link.hasDropdown && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        activeLink === link.name ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </a>

                <div
                  className={`absolute left-0 -bottom-1 h-0.5 bg-linear-to-r from-teal-700 to-teal-600 rounded-full transition-all duration-300 ${
                    activeLink === link.name
                      ? "w-full opacity-100"
                      : "w-0 opacity-0"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="flex items-center shrink-0 gap-1 sm:gap-2">
            {/* Mobile Icons */}
            <div className="flex lg:hidden items-center gap-1">
              <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <Bell size={20} className="text-neutral-600" />
              </button>
              <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <ShoppingBag size={20} className="text-neutral-600" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Icons */}
            <div className="hidden lg:flex items-center gap-1">
              <button className="p-2.5 rounded-xl hover:bg-neutral-100 transition-all duration-300 group relative">
                <Bell
                  size={20}
                  className="text-neutral-600 group-hover:text-neutral-900 transition-colors"
                />
              </button>

              <button className="p-2.5 rounded-xl hover:bg-neutral-100 transition-all duration-300 group relative">
                <ShoppingBag
                  size={20}
                  className="text-neutral-600 group-hover:text-neutral-900 transition-colors"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Login Button / User Profile */}
            {isAuthenticated ? (
              <div className="hidden lg:block relative ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900 font-lato">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-neutral-500 font-lato">
                      {user?.email}
                    </p>
                  </div>
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt="Profile"
                      crossOrigin="anonymous"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-700/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white text-sm font-semibold font-lato ring-2 ring-teal-700/20">
                      {getInitials(user?.firstName, user?.lastName)}
                    </div>
                  )}
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-neutral-100 py-1">
                    <a
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors font-lato text-sm"
                    >
                      <User size={16} className="text-neutral-400" />
                      My Profile
                    </a>
                    {user?.role === "admin" && (
                      <a
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors font-lato text-sm"
                      >
                        <LayoutDashboard size={16} className="text-neutral-400" />
                        Admin Dashboard
                      </a>
                    )}
                    <hr className="my-1 border-neutral-100" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors font-lato text-sm"
                    >
                      <LogOut size={16} className="text-neutral-400" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="hidden lg:flex items-center px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-[15px] font-medium text-white transition-colors duration-200 ml-3 font-lato"
              >
                Login
              </button>
            )}

            {/* Mobile/Tablet Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-all duration-300"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} className="text-neutral-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-60 transition-all duration-300 ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobileMenu}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 w-[85%] max-w-[320px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col font-lato ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="px-5 py-6 border-b border-neutral-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-playfair text-lg font-bold tracking-wide text-amber-800">
                Aura Interiors
              </h1>
              <button
                onClick={closeMobileMenu}
                className="w-9 h-9 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-neutral-600" />
              </button>
            </div>
            {isAuthenticated ? (
              <div className="w-full flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    crossOrigin="anonymous"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-teal-700 flex items-center justify-center text-white font-semibold font-lato">
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-neutral-900 font-semibold font-lato truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-neutral-500 text-sm font-lato truncate">{user?.email}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  closeMobileMenu();
                  setLoginModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <User size={24} className="text-neutral-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-neutral-900 font-semibold font-playfair">Welcome!</p>
                  <p className="text-neutral-500 text-sm font-lato">Sign in to continue</p>
                </div>
                <ChevronRight size={20} className="text-neutral-400" />
              </button>
            )}
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation Links */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2 font-lato">
                Menu
              </p>
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.hasDropdown ? (
                      <>
                        <button
                          onClick={() =>
                            setMobileCollectionsOpen(!mobileCollectionsOpen)
                          }
                          className="w-full flex items-center gap-3 px-3 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                        >
                          <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center">
                            <link.icon size={18} className="text-neutral-500" />
                          </div>
                          <span className="flex-1 text-left font-medium font-lato">
                            {link.name}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-neutral-400 transition-transform duration-200 ${
                              mobileCollectionsOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Collections Submenu */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-out ${
                            mobileCollectionsOpen
                              ? "max-h-80 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="ml-4 pl-4 border-l-2 border-neutral-100 py-2 space-y-1">
                            {mobileCategories.map((category) => (
                              <a
                                key={category.name}
                                href={category.href}
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 transition-colors group"
                              >
                                <category.icon
                                  size={16}
                                  className="text-neutral-400 group-hover:text-teal-700 transition-colors"
                                />
                                <span className="text-sm text-neutral-600 group-hover:text-teal-700 font-medium transition-colors font-lato">
                                  {category.name}
                                </span>
                              </a>
                            ))}
                            <a
                              href="/shop"
                              onClick={closeMobileMenu}
                              className="flex items-center gap-2 px-3 py-2.5 text-teal-700 font-medium text-sm font-lato"
                            >
                              <span>View All Products</span>
                              <ChevronRight size={16} />
                            </a>
                          </div>
                        </div>
                      </>
                    ) : (
                      <a
                        href={link.href}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-3 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center">
                          <link.icon size={18} className="text-neutral-500" />
                        </div>
                        <span className="flex-1 font-medium font-lato">{link.name}</span>
                        <ChevronRight size={18} className="text-neutral-400" />
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Links Section */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2 font-lato">
                  Quick Links
                </p>
                <div className="space-y-1">
                  <a
                    href="/shop?sort=rating"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Heart size={18} className="text-purple-600" />
                    </div>
                    <span className="flex-1 font-medium font-lato">Top Rated</span>
                    <ChevronRight size={18} className="text-neutral-400" />
                  </a>
                  <a
                    href="/shop?sort=price_low"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                      <Box size={18} className="text-green-600" />
                    </div>
                    <span className="flex-1 font-medium font-lato">Best Value</span>
                    <ChevronRight size={18} className="text-neutral-400" />
                  </a>
                </div>
              </div>

              {/* Account Section for Authenticated Users */}
              {isAuthenticated && (
                <div className="pt-4 border-t border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2 font-lato">
                    Account
                  </p>
                  <div className="space-y-1">
                    <a
                      href="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                    >
                      <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <User size={18} className="text-neutral-500" />
                      </div>
                      <span className="flex-1 font-medium font-lato">My Profile</span>
                      <ChevronRight size={18} className="text-neutral-400" />
                    </a>
                    {user?.role === "admin" && (
                      <a
                        href="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-3 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                          <LayoutDashboard size={18} className="text-teal-700" />
                        </div>
                        <span className="flex-1 font-medium font-lato">Admin Dashboard</span>
                        <ChevronRight size={18} className="text-neutral-400" />
                      </a>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                    >
                      <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <LogOut size={18} className="text-neutral-500" />
                      </div>
                      <span className="flex-1 text-left font-medium font-lato">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <MegaMenuDropdown
        isOpen={megaMenuOpen}
        onMouseEnter={handleMegaMenuEnter}
        onMouseLeave={handleMegaMenuLeave}
        onClose={() => setMegaMenuOpen(false)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setLoginModalOpen(false);
          setSignupModalOpen(true);
        }}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        onSwitchToLogin={() => {
          setSignupModalOpen(false);
          setLoginModalOpen(true);
        }}
      />

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInScale {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
