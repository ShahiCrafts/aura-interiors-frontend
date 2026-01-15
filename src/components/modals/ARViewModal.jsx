import { useEffect, useState, useMemo } from "react";
import { X, ExternalLink, Camera } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function ARViewModal({ isOpen, onClose, product }) {
  const [isMobile, setIsMobile] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({ isIOS: false, isAndroid: false });
  const [localIp, setLocalIp] = useState(null);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/v1/system/info`);
        const result = await response.json();
        if (result.status === "success") {
          setLocalIp(result.data.localIp);
        }
      } catch (err) {
        console.error("Failed to fetch local IP:", err);
      }
    };
    if (import.meta.env.DEV) {
      fetchIp();
    }
  }, []);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
      const isAndroid = /android/i.test(userAgent);
      setIsMobile(isIOS || isAndroid);
      setDeviceInfo({ isIOS, isAndroid });
    };
    checkDevice();
  }, []);

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

  // Check if product has AR models for different platforms
  const modelAvailability = useMemo(() => {
    if (!product) return { hasGlb: false, hasUsdz: false, hasAny: false };

    const hasGlb = product.modelFiles?.some(m => m.format === "glb" || m.format === "gltf") ||
      product.modelUrl?.includes(".glb") || product.modelUrl?.includes(".gltf");
    const hasUsdz = product.modelFiles?.some(m => m.format === "usdz") ||
      product.modelUrl?.includes(".usdz");

    return {
      hasGlb,
      hasUsdz,
      hasAny: hasGlb || hasUsdz
    };
  }, [product]);

  // Check if current device has a compatible model
  const hasCompatibleModel = useMemo(() => {
    if (deviceInfo.isIOS) return modelAvailability.hasUsdz;
    if (deviceInfo.isAndroid) return modelAvailability.hasGlb;
    return modelAvailability.hasAny;
  }, [deviceInfo, modelAvailability]);

  if (!isOpen || !product) return null;

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

  // Use local IP for QR code if available during development
  const displayBaseUrl = (import.meta.env.DEV && localIp)
    ? baseUrl.replace("localhost", localIp).replace("127.0.0.1", localIp)
    : baseUrl;

  const arViewUrl = `${displayBaseUrl}/ar/${product.slug || product._id}`;

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

  // Desktop view - QR code only
  if (!isMobile) {
    return (
      <div className="fixed inset-0 z-100 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="min-h-full flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-8 font-dm-sans"
            style={{
              animation:
                "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <X size={18} strokeWidth={1.5} className="text-neutral-500" />
            </button>

            <h2 className="text-center text-[22px] font-playfair text-neutral-900 mb-1">
              View in <span className="italic text-teal-700">Your Space</span>
            </h2>

            <p className="text-center text-neutral-500 text-[15px] mb-6">
              Scan this QR code with your mobile device
            </p>

            {modelAvailability.hasAny ? (
              <>
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

                {/* Device compatibility info */}
                <p className="text-center text-neutral-400 text-xs mb-4">
                  Supported: {modelAvailability.hasUsdz && "iOS"}{modelAvailability.hasUsdz && modelAvailability.hasGlb && " • "}{modelAvailability.hasGlb && "Android"}
                </p>

                <p className="text-center text-neutral-500 text-[15px]">
                  Having trouble scanning?{" "}
                  <button className="text-teal-700 font-semibold underline hover:text-teal-800">
                    Get Help
                  </button>
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-500 text-[15px]">
                  AR model is not available for this product yet.
                </p>
              </div>
            )}
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

  // Mobile view - QR code with action buttons
  return (
    <div className="fixed inset-0 z-100 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-8 font-dm-sans"
          style={{
            animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <X size={18} strokeWidth={1.5} className="text-neutral-500" />
          </button>

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

          <h2 className="text-center text-[22px] font-playfair text-neutral-900 mb-2">
            View in <span className="italic text-teal-700">Your Space</span>
          </h2>

          <p className="text-center text-neutral-500 text-[15px] mb-6">
            {hasCompatibleModel
              ? "Launch AR to see this furniture in your room"
              : deviceInfo.isIOS
                ? "This product only has an Android AR model"
                : "This product only has an iOS AR model"}
          </p>

          {modelAvailability.hasAny && (
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
                disabled={!hasCompatibleModel}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-teal-700 text-white text-[15px] font-medium hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera size={17} />
                Enable Camera
              </button>
            </div>
          )}

          <p className="text-center text-neutral-500 text-[15px]">
            Having trouble?{" "}
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
