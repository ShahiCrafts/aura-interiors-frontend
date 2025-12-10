import React, { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { ImageWithFallback } from "../fallbacks/ImageWithFallback"; // adjust path

const testimonials = [
  {
    rating: 5,
    quote:
      "Aura Interiors transformed my approach to client presentations. The AR feature lets clients see exactly how pieces will look in their space. Absolutely revolutionary.",
    name: "Saugat Shahi",
    role: "Interior Designer",
    avatar:
      "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    rating: 5,
    quote:
      "The quality is unmatched. Each piece is a work of art that elevates our entire living space. The AR visualization gave us complete confidence before purchasing.",
    name: "Divya Xettri",
    role: "Home Owner",
    avatar:
      "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    rating: 5,
    quote:
      "The perfect marriage of timeless design and cutting-edge technology. Aura Interiors understands that luxury is in the details and the experience.",
    name: "Krishna Bhandari",
    role: "Architect",
    avatar:
      "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

export default function Testimonials() {
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

  return (
    <section
      ref={sectionRef}
      className="bg-linear-to-b from-zinc-50 to-white py-16 sm:py-20 px-4 sm:px-6 md:px-12 lg:px-20 font-lato"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-10 sm:mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-block mb-4">
            <span className="text-xs font-semibold tracking-[0.2em] text-zinc-700 uppercase bg-zinc-100 px-6 py-2 font-lato">
              Testimonials
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-light text-zinc-900 leading-tight">
            Trusted by{" "}
            <span className="text-primary-700 italic">Design Enthusiasts</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`relative bg-white border border-primary-700/10 p-5 sm:p-6 hover:border-primary-700/20 hover:shadow-lg transition-all duration-700 rounded-xl group ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{
                transitionDelay: isVisible ? `${200 + index * 150}ms` : "0ms",
              }}
            >
              {/* Decorative Quote */}
              <span className="absolute right-4 top-4 text-[80px] sm:text-[100px] text-primary-700/10 leading-none select-none pointer-events-none">
                &ldquo;
              </span>

              {/* Rating */}
              <div className="flex gap-1 mb-4 relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 fill-primary-700 text-primary-700"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-zinc-900 italic leading-relaxed mb-6 relative z-10 text-base md:text-lg font-playfair">
                "{testimonial.quote}"
              </p>

              {/* Profile */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-zinc-100 p-0.5">
                  <ImageWithFallback
                    src={testimonial.avatar}
                    fallback="https://via.placeholder.com/150"
                    alt={testimonial.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-zinc-900 font-medium text-base sm:text-lg font-playfair">
                    {testimonial.name}
                  </p>
                  <p className="text-primary-700 text-sm sm:text-base font-lato">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
