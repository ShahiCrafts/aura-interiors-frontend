import { useState, useEffect } from "react";
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
  Home,
  Box,
  Phone,
  FileText,
} from "lucide-react";
import MegaMenuDropdown from "../components/MegaMenuDropdown";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);

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

  const navLinks = [
    {
      name: "Collections",
      href: "/products",
      hasDropdown: true,
      isMegaMenu: true,
      icon: Box,
    },
    { name: "3D Workspace", href: "/designer", hasDropdown: false, icon: Home },
    { name: "Blogs", href: "/blogs", hasDropdown: false, icon: FileText },
    { name: "Contact", href: "/contact", hasDropdown: false, icon: Phone },
  ];

  const mobileCategories = [
    { name: "Living Room", icon: Sofa, href: "/products?category=living-room" },
    { name: "Bedroom", icon: BedDouble, href: "/products?category=bedroom" },
    {
      name: "Dining",
      icon: UtensilsCrossed,
      href: "/products?category=dining",
    },
    { name: "Lighting", icon: Lamp, href: "/products?category=lighting" },
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
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-500 ${
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
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
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
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Login Button */}
            <button className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-teal-700/25 hover:scale-105 active:scale-95 ml-2 font-lato">
              <User size={18} />
              <span>Login</span>
            </button>

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
          className={`absolute top-0 right-0 w-[85%] max-w-[320px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
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
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <User size={24} className="text-neutral-400" />
              </div>
              <div className="flex-1">
                <p className="text-neutral-900 font-semibold font-playfair">Welcome!</p>
                <p className="text-neutral-500 text-sm font-lato">Sign in to continue</p>
              </div>
              <ChevronRight size={20} className="text-neutral-400" />
            </div>
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
                              href="/products"
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
