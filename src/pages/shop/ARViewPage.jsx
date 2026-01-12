import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Smartphone, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useProduct } from "../../hooks/product/useProductTan";
import { getImageUrl as getImageUrlUtil, getModelUrl as getModelUrlUtil } from "../../utils/imageUrl";

export default function ARViewPage() {
  const { productSlug } = useParams();
  const [deviceInfo, setDeviceInfo] = useState({ isIOS: false, isAndroid: false, isMobile: false });
  const [arSupported, setArSupported] = useState(true);

  const { data: productData, isLoading, error } = useProduct(productSlug);
  const product = productData?.data?.product;

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;

    setDeviceInfo({ isIOS, isAndroid, isMobile });

    // Check AR support
    if (isIOS) {
      // iOS AR Quick Look is supported on iOS 12+
      const iosVersion = parseFloat(
        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(userAgent) || [0, ''])[1])
          .replace('undefined', '3_2').replace('_', '.').replace('_', '')
      ) || false;
      setArSupported(iosVersion >= 12);
    } else if (isAndroid) {
      // Scene Viewer is supported on Android 8+
      setArSupported(true);
    }
  }, []);

  // Get model URL for specific format/platform
  const getModelUrl = (format) => getModelUrlUtil(product, format);

  // Check if we have any AR models available
  const hasGlbModel = () => {
    if (product?.modelFiles?.length > 0) {
      return product.modelFiles.some(m => m.format === "glb" || m.format === "gltf");
    }
    return product?.modelUrl?.includes(".glb") || product?.modelUrl?.includes(".gltf");
  };

  const hasUsdzModel = () => {
    if (product?.modelFiles?.length > 0) {
      return product.modelFiles.some(m => m.format === "usdz");
    }
    return product?.modelUrl?.includes(".usdz");
  };

  const getProductImage = () => getImageUrlUtil(product?.images?.[0]?.url, "products");

  const handleLaunchAR = () => {
    if (deviceInfo.isIOS) {
      // iOS AR Quick Look - only use usdz
      const usdzUrl = getModelUrl("usdz");
      if (usdzUrl) {
        // Create a temporary anchor with rel="ar" for iOS
        const anchor = document.createElement("a");
        anchor.setAttribute("rel", "ar");
        anchor.setAttribute("href", usdzUrl);

        // Add a child img element (required for AR Quick Look)
        const img = document.createElement("img");
        anchor.appendChild(img);

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      }
    } else if (deviceInfo.isAndroid) {
      // Android Scene Viewer - only use glb (preferred) or gltf
      const glbUrl = getModelUrl("glb") || getModelUrl("gltf");
      if (glbUrl) {
        // Scene Viewer with proper parameters for scaling/rotation
        const params = new URLSearchParams({
          file: glbUrl,
          mode: "ar_preferred",
          resizable: "true",
          title: product.name,
        });

        const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?${params.toString()}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;
        window.location.href = intentUrl;
      }
    }
  };

  // Check if AR model is available for current device
  const hasARModelForDevice = () => {
    if (deviceInfo.isIOS) {
      return hasUsdzModel();
    }
    if (deviceInfo.isAndroid) {
      return hasGlbModel();
    }
    return hasGlbModel() || hasUsdzModel();
  };

  // Auto-launch AR on mobile when product is loaded
  useEffect(() => {
    if (product && deviceInfo.isMobile && arSupported) {
      const hasModel = product.modelFiles?.length > 0 || product.modelUrl;

      // Check if device has compatible model
      let canLaunch = false;
      if (deviceInfo.isIOS) {
        canLaunch = product.modelFiles?.some(m => m.format === "usdz") ||
          product.modelUrl?.includes(".usdz");
      } else if (deviceInfo.isAndroid) {
        canLaunch = product.modelFiles?.some(m => m.format === "glb" || m.format === "gltf") ||
          product.modelUrl?.includes(".glb") || product.modelUrl?.includes(".gltf");
      }

      if (hasModel && canLaunch) {
        // Small delay to ensure page is ready
        const timer = setTimeout(() => {
          handleLaunchAR();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [product, deviceInfo, arSupported]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-dm-sans">
        <Loader2 size={40} className="text-teal-700 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-dm-sans">
        <div className="text-center">
          <AlertCircle size={48} className="text-neutral-400 mx-auto mb-4" />
          <h1 className="text-xl font-playfair text-neutral-900 mb-2">Product Not Found</h1>
          <p className="text-neutral-500 mb-6">The product you're looking for doesn't exist.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:underline"
          >
            <ArrowLeft size={18} />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const hasARModel = product.modelFiles?.length > 0 || product.modelUrl;

  return (
    <div className="min-h-screen bg-neutral-50 font-dm-sans">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            to={`/product/${product.slug}`}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-600" />
          </Link>
          <div>
            <h1 className="font-playfair text-lg text-neutral-900">{product.name}</h1>
            <p className="text-sm text-neutral-500">AR View</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Product Preview */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="aspect-square relative">
            <img
              src={getProductImage()}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-playfair text-xl">{product.name}</p>
              <p className="text-white/80 text-sm">
                NRs. {new Intl.NumberFormat("en-NP").format(product.price)}
              </p>
            </div>
          </div>
        </div>

        {/* AR Section */}
        {deviceInfo.isMobile ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Box size={32} className="text-teal-700" />
              </div>
              <h2 className="text-xl font-playfair text-neutral-900 mb-2">
                View in Your Space
              </h2>
              <p className="text-neutral-500 text-sm">
                Place this furniture in your room using augmented reality
              </p>
            </div>

            {hasARModel && arSupported && hasARModelForDevice() ? (
              <>
                <button
                  onClick={handleLaunchAR}
                  className="w-full py-4 bg-teal-700 text-white font-semibold rounded-full hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Box size={20} />
                  Launch AR View
                </button>

                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Smartphone size={16} className="text-teal-700" />
                    Tips for best experience
                  </h3>
                  <ul className="text-sm text-neutral-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-700 mt-1">•</span>
                      Find a well-lit area with enough space
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-700 mt-1">•</span>
                      Point your camera at the floor where you want to place the item
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-700 mt-1">•</span>
                      Move slowly to let AR detect the surface
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-700 mt-1">•</span>
                      Tap to place, pinch to resize
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <AlertCircle size={32} className="text-amber-500 mx-auto mb-3" />
                <p className="text-neutral-600 text-sm">
                  {!hasARModel
                    ? "AR model is not available for this product yet."
                    : !arSupported
                      ? "AR is not supported on your device. Please use iOS 12+ or Android 8+."
                      : deviceInfo.isIOS
                        ? "This product doesn't have an iOS-compatible model (.usdz). Please try on an Android device."
                        : "This product doesn't have an Android-compatible model (.glb). Please try on an iOS device."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <Smartphone size={48} className="text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-playfair text-neutral-900 mb-2">
              Open on Mobile
            </h2>
            <p className="text-neutral-500 text-sm mb-6">
              AR viewing is only available on mobile devices. Please scan the QR code from the product page using your phone.
            </p>
            <Link
              to={`/product/${product.slug}`}
              className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:underline"
            >
              <ArrowLeft size={18} />
              Back to Product
            </Link>
          </div>
        )}

        {/* View Product Button */}
        <div className="mt-6">
          <Link
            to={`/product/${product.slug}`}
            className="block w-full py-3 text-center text-teal-700 font-semibold border border-teal-700 rounded-full hover:bg-teal-50 transition-colors"
          >
            View Product Details
          </Link>
        </div>
      </main>
    </div>
  );
}
