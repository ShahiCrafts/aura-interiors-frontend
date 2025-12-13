import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";

export default function FeaturedPieces() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);
  const products = [
    {
      category: "LIVING ROOM",
      name: "Luxe Velvet Sofa",
      price: "NRs. 18,000",
      originalPrice: "NRs. 22,000",
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=1000&fit=crop",
      badge: "Bestseller",
    },
    {
      category: "ACCENT SEATING",
      name: "Architectural Armchair",
      price: "NRs. 18,000",
      image:
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=1000&fit=crop",
    },
    {
      category: "DINING",
      name: "Marble Dining Set",
      price: "NRs. 18,000",
      image:
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=1000&fit=crop",
      badge: "New",
    },
    {
      category: "TABLES",
      name: "Designer Coffee Table",
      price: "NRs. 18,000",
      image:
        "https://images.unsplash.com/photo-1565191999001-551c187427bb?w=800&h=1000&fit=crop",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-linear-to-b from-zinc-50 to-white py-16 sm:py-20 px-4 sm:px-6 md:px-12 lg:px-20 font-lato"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading Section */}
        <div
          className={`text-center mb-10 sm:mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-block mb-4">
            <span className="text-xs font-semibold tracking-[0.2em] text-zinc-700 uppercase bg-zinc-100 px-6 py-2 font-lato">
              Our Collection
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-900 mb-4 tracking-tight font-playfair">
            Featured <span className="italic text-teal-700">Masterpieces</span>
          </h2>
          <p className="text-zinc-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-lato">
            Curated pieces that blend timeless elegance with contemporary
            innovation.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:gap-x-6 md:gap-y-12 lg:gap-8">
          {products.map((p, i) => (
            <div
              key={i}
              className={`group cursor-pointer relative transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{
                transitionDelay: isVisible ? `${150 + i * 100}ms` : "0ms",
              }}
            >
              {/* Image Container */}
              <div className="relative w-full aspect-square md:aspect-4/5 lg:aspect-3/4 overflow-hidden bg-zinc-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />

                {/* Badge */}
                {p.badge && (
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                    <span
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-full ${
                        p.badge === "New"
                          ? "bg-teal-700 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 hover:text-white transition-colors">
                    <Heart size={14} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-700 hover:text-white transition-colors">
                    <ShoppingBag
                      size={14}
                      className="sm:w-[18px] sm:h-[18px]"
                    />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-1.5">
                <p className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] text-zinc-500 uppercase font-lato">
                  {p.category}
                </p>
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-zinc-900 group-hover:text-teal-700 transition-colors duration-300 font-playfair leading-snug">
                  {p.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-base sm:text-lg md:text-xl font-bold text-teal-700 font-playfair">
                    {p.price}
                  </p>
                  {p.originalPrice && (
                    <p className="text-xs sm:text-sm text-zinc-400 line-through font-lato">
                      {p.originalPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div
          className={`text-center mt-10 sm:mt-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: isVisible ? "600ms" : "0ms" }}
        >
          <button className="group inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-teal-700 text-white hover:bg-teal-800 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl">
            <span className="text-sm sm:text-base font-semibold tracking-wide">
              Explore Full Collection
            </span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
