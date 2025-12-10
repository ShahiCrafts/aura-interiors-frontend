import { useEffect, useRef, useState } from "react";
import { Star, X, Play } from "lucide-react";

export default function Hero() {
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);
  const topRowRef = useRef(null);
  const bottomRowRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const gridImages = [
    "https://images.unsplash.com/photo-1631679706909-1844bbd07221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    "https://images.unsplash.com/photo-1583221742001-9ad88bf233ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  ];

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Infinite scroll animation for desktop vertical columns
  useEffect(() => {
    const leftCol = leftColumnRef.current;
    const rightCol = rightColumnRef.current;

    if (!leftCol || !rightCol) return;

    let leftScrollPos = 0;
    let rightScrollPos = 0;
    const speed = 0.5;

    const animate = () => {
      leftScrollPos += speed;
      if (leftScrollPos >= leftCol.scrollHeight / 2) leftScrollPos = 0;
      leftCol.scrollTop = leftScrollPos;

      rightScrollPos += speed;
      if (rightScrollPos >= rightCol.scrollHeight / 2) rightScrollPos = 0;
      rightCol.scrollTop = rightCol.scrollHeight / 2 - rightScrollPos;

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Parallax effect for tablet horizontal rows
  useEffect(() => {
    const topRow = topRowRef.current;
    const bottomRow = bottomRowRef.current;

    if (topRow && bottomRow) {
      const speed = 0.5;
      topRow.scrollLeft = scrollY * speed;
      bottomRow.scrollLeft = topRow.scrollWidth / 3 - scrollY * speed;
    }
  }, [scrollY]);

  const handleOpenVideo = () => setIsVideoOpen(true);
  const handleCloseVideo = () => setIsVideoOpen(false);

  const handleMouseMove = (e, ref) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 5;
    const rotateY = ((x - centerX) / centerX) * 5;

    ref.current.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = (ref) => {
    if (!ref.current) return;
    ref.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  const leftImages = [
    "https://images.unsplash.com/photo-1762803841422-5b8cf8767cd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1760611656148-063d3b9a8dbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1583221742001-9ad88bf233ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1758977403341-0104135995af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1680773525653-f14b98e5acf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  ];

  const rightImages = [
    "https://images.unsplash.com/photo-1631679706909-1844bbd07221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1639322132757-14ee19fb04f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  ];

  return (
    <section className="w-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-72px)] flex flex-col lg:flex-row items-center px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-8 lg:py-0 relative overflow-hidden bg-linear-to-b from-zinc-50 to-white mt-16 lg:mt-[72px]">
      <div
        className={`w-full lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left justify-center gap-3 sm:gap-4 relative z-10 transition-opacity duration-700 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="inline-flex items-center gap-2 w-fit mb-2 sm:mb-3 bg-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm border border-neutral-100">
          <Star className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary-700" />
          <span className="text-sm sm:text-sm md:text-base font-medium text-gray-700 font-lato">
            Trusted by 50k+ homeowners
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-[3rem] xl:text-5xl font-semibold font-playfair text-gray-950 leading-tight">
          <span className="block">Redefine Your Space with</span>
          <span className="text-primary-700 font-semibold italic block mt-1 lg:hidden">
            modern luxury & AR
          </span>
          <span className="text-primary-700 font-semibold italic hidden lg:block mt-1">
            with modern luxury & AR
          </span>
        </h1>

        <p className="text-base sm:text-base md:text-lg lg:text-lg text-gray-600 mb-2 sm:mb-3 font-lato leading-relaxed max-w-sm sm:max-w-md lg:max-w-lg">
          See how furniture looks in your space with AR. Elevate your home's
          style, effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 w-full sm:w-auto font-lato">
          <button className="bg-primary-700 hover:bg-primary-800 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-700/25 flex items-center justify-center">
            <span>Shop Collection</span>
          </button>

          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                handleOpenVideo();
              }
            }}
            className="bg-white text-gray-700 px-6 sm:px-8 py-3 rounded-xl font-semibold border border-gray-200 lg:hover:border-primary-700 lg:hover:text-primary-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-700" />
            <span>Try AR View</span>
          </button>
        </div>

        <div className="flex justify-center lg:justify-start gap-6 sm:gap-8">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-950 font-playfair">
              50k+
            </div>
            <div className="text-sm sm:text-sm text-gray-500 mt-0.5 font-lato">
              Happy Customers
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-950 font-playfair">
              4.9/5
            </div>
            <div className="text-sm sm:text-sm text-gray-500 mt-0.5 font-lato">
              Customer Rating
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-950 font-playfair">
              99.9%
            </div>
            <div className="text-sm sm:text-sm text-gray-500 mt-0.5 font-lato">
              Satisfaction Rate
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex gap-4 flex-1 justify-end relative z-10 h-full">
        <div
          ref={leftColumnRef}
          className="w-48 lg:w-56 xl:w-64 overflow-hidden h-full"
        >
          <div className="flex flex-col gap-4">
            {[...leftImages, ...leftImages].map((src, i) => {
              const imgRef = useRef(null);
              return (
                <div
                  key={i}
                  ref={imgRef}
                  className="w-full h-56 lg:h-60 xl:h-64 rounded-xl overflow-hidden cursor-pointer relative group transition-transform duration-500"
                  onMouseMove={(e) => handleMouseMove(e, imgRef)}
                  onMouseLeave={() => handleMouseLeave(imgRef)}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-90"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div
          ref={rightColumnRef}
          className="w-48 lg:w-56 xl:w-64 overflow-hidden h-full"
        >
          <div className="flex flex-col gap-4">
            {[...rightImages, ...rightImages].map((src, i) => {
              const imgRef = useRef(null);
              return (
                <div
                  key={i}
                  ref={imgRef}
                  className="w-full h-56 lg:h-60 xl:h-64 rounded-xl overflow-hidden cursor-pointer relative group transition-transform duration-500"
                  onMouseMove={(e) => handleMouseMove(e, imgRef)}
                  onMouseLeave={() => handleMouseLeave(imgRef)}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-90"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sm:hidden w-full mt-10 relative z-10 flex justify-center">
        <div className="relative w-[280px] h-[200px]">
          {gridImages.slice(0, 3).map((src, index) => {
            const positions = [
              "z-30 rotate-0 translate-x-0 translate-y-0",
              "z-20 -rotate-6 -translate-x-5 translate-y-3",
              "z-10 rotate-6 translate-x-5 translate-y-4",
            ];
            return (
              <div
                key={index}
                className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl ${positions[index]}`}
              >
                <img
                  src={src}
                  alt={`Interior ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
              </div>
            );
          })}

          <button
            onClick={handleOpenVideo}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:bg-white hover:scale-110 transition-all duration-300"
          >
            <Play
              className="w-5 h-5 text-primary-700 translate-x-0.5"
              fill="currentColor"
            />
          </button>
        </div>
      </div>

      <div className="hidden sm:flex lg:hidden flex-col gap-3 w-screen -mx-6 md:-mx-8 mt-14 md:mt-16 relative z-10 overflow-hidden">
        <div ref={topRowRef} className="flex gap-3 overflow-hidden">
          {[...leftImages, ...leftImages, ...leftImages].map((src, index) => (
            <div
              key={index}
              className="shrink-0 w-60 h-40 rounded-xl overflow-hidden"
            >
              <img
                src={src}
                alt={`Interior ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div ref={bottomRowRef} className="flex gap-3 overflow-hidden">
          {[...rightImages, ...rightImages, ...rightImages].map(
            (src, index) => (
              <div
                key={index}
                className="shrink-0 w-60 h-40 rounded-xl overflow-hidden"
              >
                <img
                  src={src}
                  alt={`Interior ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )
          )}
        </div>
      </div>

      {isVideoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 relative max-w-3xl w-full mx-4 shadow-2xl">
            <button
              onClick={handleCloseVideo}
              className="absolute -top-3 -right-3 sm:top-4 sm:right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <video
              src="src/assets/videos/video.mp4"
              controls
              autoPlay
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
