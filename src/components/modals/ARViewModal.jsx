import { useEffect, useState } from "react";
import { X, ExternalLink, Camera, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function ARViewModal({ isOpen, onClose, product }) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
      const isAndroid = /android/i.test(userAgent);
      setIsMobile(isIOS || isAndroid);
    };
    checkMobile();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Generate the AR view URL
  const getBaseUrl = () => {
    if (import.meta.env.VITE_APP_URL) {
      return import.meta.env.VITE_APP_URL;
    }
    if (import.meta.env.DEV && window.location.hostname !== "localhost") {
      return window.location.origin;
    }
    return window.location.origin;
  };

  const baseUrl = getBaseUrl();
  const arViewUrl = `${baseUrl}/ar/${product.slug || product._id}`;

  const handleOpenLink = () => {
    window.location.href = arViewUrl;
  };

  const handleEnableCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      window.location.href = arViewUrl;
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  // Desktop View
  if (!isMobile) {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="min-h-full flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-8 font-lato"
            style={{
              animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <X size={18} strokeWidth={1.5} className="text-neutral-500" />
            </button>

            {/* Title */}
            <h2 className="text-center text-[22px] font-playfair text-neutral-900 mb-1">
              View in <span className="italic text-teal-700">Your Space</span>
            </h2>

            {/* Subtitle */}
            <p className="text-center text-neutral-500 text-[15px] mb-6">
              Scan this QR code with your mobile device
            </p>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-xl border border-neutral-200 bg-white">
                <QRCodeSVG
                  value={arViewUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>

            {/* Help Link */}
            <p className="text-center text-neutral-500 text-[15px]">
              Having trouble scanning?{" "}
              <button className="text-teal-700 font-semibold underline hover:text-teal-800">
                Get Help
              </button>
            </p>
          </div>
        </div>
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // Mobile View - Matches the design image exactly
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-8 font-lato"
          style={{
            animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <X size={18} strokeWidth={1.5} className="text-neutral-500" />
          </button>

          {/* QR Code with light border */}
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-lg border border-neutral-200">
              <QRCodeSVG
                value={arViewUrl}
                size={180}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-[22px] font-playfair text-neutral-900 mb-2">
            View in <span className="italic text-teal-700">Your Space</span>
          </h2>

          {/* Subtitle */}
          <p className="text-center text-neutral-500 text-[15px] mb-6">
            Scan this QR code with your mobile device
          </p>

          {/* Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleOpenLink}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-neutral-300 text-neutral-700 text-[15px] font-medium hover:bg-neutral-50 transition-colors"
            >
              <ExternalLink size={17} />
              Open Link
            </button>
            <button
              onClick={handleEnableCamera}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-teal-700 text-white text-[15px] font-medium hover:bg-teal-800 transition-colors"
            >
              <Camera size={17} />
              Enable Camera
            </button>
          </div>

          {/* Help Link */}
          <p className="text-center text-neutral-500 text-[15px]">
            Having trouble scanning?{" "}
            <button className="text-teal-700 font-semibold underline hover:text-teal-800">
              Get Help
            </button>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
