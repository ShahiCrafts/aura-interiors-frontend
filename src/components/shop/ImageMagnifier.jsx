import { useState, useRef } from "react";

export default function ImageMagnifier({
  src,
  alt,
  magnifierSize = 150,
  zoomLevel = 2.5,
  className = "",
}) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierStyle, setMagnifierStyle] = useState({});
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { left, top, width, height } = container.getBoundingClientRect();

    const x = e.clientX - left;
    const y = e.clientY - top;

    if (x < 0 || x > width || y < 0 || y > height) {
      setShowMagnifier(false);
      return;
    }

    const magnifierX = x - magnifierSize / 2;
    const magnifierY = y - magnifierSize / 2;

    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    setMagnifierStyle({
      left: `${magnifierX}px`,
      top: `${magnifierY}px`,
      backgroundImage: `url('${src}')`,
      backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
      backgroundPosition: `${bgX}% ${bgY}%`,
    });
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "crosshair" }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded-2xl"
        draggable={false}
      />

      {showMagnifier && (
        <div
          className="absolute pointer-events-none rounded-full border-4 border-white shadow-xl"
          style={{
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            backgroundRepeat: "no-repeat",
            zIndex: 40,
            ...magnifierStyle,
          }}
        />
      )}
    </div>
  );
}
