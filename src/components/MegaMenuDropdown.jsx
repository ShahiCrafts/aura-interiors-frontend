import {
  ChevronRight,
  Sofa,
  Lamp,
  UtensilsCrossed,
  Armchair,
  BedDouble,
  Monitor,
  Sparkles,
  ArrowRight,
  Tag,
  Heart,
} from "lucide-react";

const megaMenuData = {
  categories: [
    {
      name: "Living Room",
      icon: Sofa,
      count: 48,
      href: "/products?category=living-room",
    },
    {
      name: "Bedroom",
      icon: BedDouble,
      count: 36,
      href: "/products?category=bedroom",
    },
    {
      name: "Dining",
      icon: UtensilsCrossed,
      count: 24,
      href: "/products?category=dining",
    },
    {
      name: "Office",
      icon: Monitor,
      count: 18,
      href: "/products?category=office",
    },
    {
      name: "Accent Seating",
      icon: Armchair,
      count: 32,
      href: "/products?category=accent-seating",
    },
    {
      name: "Lighting",
      icon: Lamp,
      count: 42,
      href: "/products?category=lighting",
    },
  ],
  featured: [
    {
      name: "Luxe Velvet Sofa",
      price: "$1,200",
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop",
      href: "/product/p1",
    },
    {
      name: "Marble Dining Set",
      price: "$2,400",
      image:
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&auto=format&fit=crop",
      href: "/product/p3",
    },
  ],
  promo: {
    title: "Winter Sale",
    subtitle: "Up to 40% off on selected items",
    cta: "Shop Now",
    href: "/products",
    bgImage:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop",
  },
};

export default function MegaMenuDropdown({ isOpen, onMouseEnter, onMouseLeave, onClose }) {
  return (
    <div
      className={`hidden lg:block fixed top-[73px] left-0 right-0 z-40 transition-all duration-300 ${
        isOpen
          ? "opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-4"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white border-b border-neutral-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Categories */}
            <div className="col-span-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-teal-700/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                </div>
                <h3 className="font-semibold text-neutral-900 font-playfair">
                  Shop by Category
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {megaMenuData.categories.map((category) => (
                  <a
                    key={category.name}
                    href={category.href}
                    onClick={onClose}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-teal-700/5 transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center group-hover:bg-teal-700/10 transition-colors">
                      <category.icon className="w-5 h-5 text-neutral-600 group-hover:text-teal-700 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800 group-hover:text-teal-700 transition-colors font-lato">
                        {category.name}
                      </p>
                      <p className="text-xs text-neutral-500 font-lato">
                        {category.count} items
                      </p>
                    </div>
                  </a>
                ))}
              </div>
              <a
                href="/products"
                onClick={onClose}
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-teal-700 hover:underline font-lato"
              >
                View All Categories
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Featured Products */}
            <div className="col-span-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-teal-700/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-teal-700" />
                </div>
                <h3 className="font-semibold text-neutral-900 font-playfair">
                  Featured Products
                </h3>
              </div>
              <div className="space-y-4">
                {megaMenuData.featured.map((product) => (
                  <a
                    key={product.name}
                    href={product.href}
                    onClick={onClose}
                    className="group flex items-center gap-4 p-2 rounded-xl hover:bg-neutral-50 transition-all duration-200"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-800 group-hover:text-teal-700 transition-colors font-playfair">
                        {product.name}
                      </p>
                      <p className="text-lg font-bold text-teal-700 mt-1 font-playfair">
                        {product.price}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Promo Banner */}
            <div className="col-span-4">
              <a
                href={megaMenuData.promo.href}
                onClick={onClose}
                className="block relative h-full min-h-60 rounded-2xl overflow-hidden group"
              >
                <img
                  src={megaMenuData.promo.bgImage}
                  alt="Promo"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider font-lato">
                      Limited Time
                    </span>
                  </div>
                  <h4 className="text-2xl font-playfair font-bold mb-1">
                    {megaMenuData.promo.title}
                  </h4>
                  <p className="text-sm text-white/80 mb-4 font-lato">
                    {megaMenuData.promo.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-2 bg-white text-teal-700 px-5 py-2.5 rounded-full text-sm font-semibold group-hover:bg-teal-700 group-hover:text-white transition-all duration-300 font-lato">
                    {megaMenuData.promo.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-neutral-600 font-lato">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Free shipping on orders over $500
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 font-lato">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                30-day returns
              </div>
            </div>
            <a
              href="/products"
              onClick={onClose}
              className="flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline font-lato"
            >
              Browse All Products
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 -z-10"
        onClick={onMouseLeave}
      />
    </div>
  );
}
