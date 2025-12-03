import React, { useEffect, useRef, useState } from "react";
import { Lightbulb, Compass, Award } from "lucide-react";

export default function Philosophy() {
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

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "AR technology that transforms how you visualize furniture",
    },
    {
      icon: Compass,
      title: "Craftsmanship",
      description: "Premium materials with meticulous attention to detail",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Award-winning designs recognized around the world",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-linear-to-b from-zinc-50 to-white py-16 sm:py-20 px-4 sm:px-6 md:px-12 lg:px-20"
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
              Our Philosophy
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-light text-gray-950 leading-tight">
            Where <span className="text-teal-700 italic">Craftsmanship</span>{" "}
            <span className="block mt-2">Meets Technology</span>
          </h2>

          <p className="mt-4 text-gray-700 max-w-3xl mx-auto text-base md:text-lg leading-relaxed font-lato">
            Every piece at Aura Interiors blends artful design with smart
            innovation. We believe your home should reflect your unique story,
            enhanced by technology that makes design experimental.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 mb-12 sm:mb-16">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className={`flex flex-col items-center text-center transition-all duration-700 hover:-translate-y-2 group ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: isVisible ? `${200 + index * 150}ms` : "0ms" }}
              >
                {/* Icon Circle */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center mb-4 transition-transform duration-500">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-teal-700 transition-transform duration-500 group-hover:rotate-8" />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-playfair font-medium text-gray-950 mb-2">
                  {value.title}
                </h3>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg max-w-xs font-lato">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quote Section */}
        <div
          className={`flex items-center justify-center gap-8 max-w-4xl mx-auto relative px-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: isVisible ? "700ms" : "0ms" }}
        >
          <span className="text-[80px] sm:text-[100px] md:text-[120px] text-teal-700/10 select-none leading-none absolute -left-2 sm:-left-8 md:-left-12 top-0">
            &ldquo;
          </span>

          <p className="text-lg sm:text-xl md:text-2xl italic text-gray-950 leading-relaxed text-center font-playfair z-10 font-light max-w-2xl">
            Design is not just what it looks like and feels like.
            <br />
            Design is how it works in your life.
          </p>

          <span className="text-[80px] sm:text-[100px] md:text-[120px] text-teal-700/10 select-none leading-none absolute -right-2 sm:-right-8 md:-right-12 bottom-0 rotate-180">
            &ldquo;
          </span>
        </div>
      </div>
    </section>
  );
}
