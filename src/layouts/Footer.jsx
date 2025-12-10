import React, { useState, useEffect, useRef } from "react";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
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

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log("Subscribed email:", email);
    setEmail("");
  };

  const links = {
    company: ["About Us", "Careers", "Blog", "Contact"],
    shop: ["Living Room", "Dining", "Bedroom", "Office"],
  };

  return (
    <footer
      ref={sectionRef}
      className="bg-linear-to-b from-zinc-50 to-white text-gray-900 font-lato"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16">
        {/* Newsletter Section */}
        <div
          className={`flex flex-col items-center text-center mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-block mb-4">
            <span className="text-xs font-semibold tracking-[0.2em] text-zinc-700 uppercase bg-zinc-100 px-6 py-2 font-lato">
              Newsletter
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-light mb-4">
            Subscribe to Our{" "}
            <span className="italic text-primary-700">Design Newsletter</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-6 sm:mb-8 max-w-2xl font-lato">
            Get exclusive access to new collections, design inspiration, and AR
            features.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full max-w-xl"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 w-full sm:w-auto bg-white border border-gray-300 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-700 transition-colors font-lato"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-primary-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-primary-800 transition-colors duration-300 whitespace-nowrap font-semibold"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-16 mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
        >
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-4 sm:space-y-6">
            <h3 className="text-primary-700 text-lg sm:text-xl font-semibold font-playfair">
              Aura Interiors
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Redefining luxury furniture with augmented reality technology and
              timeless design.
            </p>
            <div className="flex gap-3 sm:gap-4 mt-4">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary-700 hover:bg-primary-700/10 transition-all duration-300"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-gray-900 text-base sm:text-lg font-semibold mb-3 sm:mb-4 font-playfair">Shop</h3>
            <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
              {links.shop.map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="hover:text-primary-700 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-900 text-base sm:text-lg font-semibold mb-3 sm:mb-4 font-playfair">
              Company
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
              {links.company.map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="hover:text-primary-700 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-900 text-base sm:text-lg font-semibold mb-3 sm:mb-4 font-playfair">
              Contact
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
              <li>Chwakpa Tole, Hattiban</li>
              <li>Lalitpur, 44600</li>
              <li>+977 98XXXXXXXX</li>
              <li className="break-all">support.desk@aurainteriors.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`border-t border-gray-300 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-gray-500 text-sm transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
        >
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Aura Interiors. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-14">
            {["Privacy Policy", "Terms of Service", "Cookies"].map(
              (item, i) => (
                <a
                  key={i}
                  href="#"
                  className="hover:text-primary-700 transition-colors"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
