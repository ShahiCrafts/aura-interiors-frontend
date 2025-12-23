import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { useARCore } from "capacitor-arcore";
import {
  IoClose,
  IoColorPalette,
  IoTrash,
  IoCheckmarkCircle,
  IoCart,
  IoInformationCircle,
  IoFilter,
  IoCamera,
  IoDownload,
  IoShareSocial,
} from "react-icons/io5";
import { MdOutlineViewInAr } from "react-icons/md";
import { HiOutlineCube, HiOutlineArrowsPointingOut } from "react-icons/hi2";
import { BsArrowLeftRight } from "react-icons/bs";
import { TbRotate360, TbHandFinger } from "react-icons/tb";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
const uploadsBaseUrl = baseUrl.replace("/api/v1", "");

const getProductImage = (product) => {
  if (product?.images?.[0]?.url) {
    const url = product.images[0].url;
    if (url.startsWith("http")) return url;
    return `${uploadsBaseUrl}/uploads/products/${url}`;
  }

  const name = (product?.name || "").toLowerCase();
  if (name.includes("sofa"))
    return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop";
  if (name.includes("chair"))
    return "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&h=200&fit=crop";
  if (name.includes("table"))
    return "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200&h=200&fit=crop";
  if (name.includes("bed"))
    return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&h=200&fit=crop";
  if (name.includes("lamp"))
    return "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&h=200&fit=crop";
  return "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&h=200&fit=crop";
};

const COLOR_HEX_MAP = {
  white: "#FFFFFF",
  black: "#1a1a1a",
  gray: "#6B7280",
  grey: "#6B7280",
  brown: "#8B4513",
  beige: "#F5F5DC",
  navy: "#1e3a5f",
  green: "#2d5a27",
  red: "#B91C1C",
  blue: "#2563EB",
  natural: "#D4A574",
  cream: "#FFFDD0",
  charcoal: "#36454F",
  walnut: "#5D432C",
  oak: "#C4A35A",
  mahogany: "#4a1c03",
  teak: "#B8860B",
  ivory: "#FFFFF0",
  tan: "#D2B48C",
  burgundy: "#800020",
  olive: "#556B2F",
  mustard: "#FFDB58",
  coral: "#FF7F50",
  teal: "#008080",
  pink: "#FFC0CB",
  purple: "#7C3AED",
  orange: "#F97316",
  yellow: "#FCD34D",
};

const getColorHex = (colorName) => {
  if (!colorName) return null;
  const normalized = colorName.toLowerCase().trim();
  return COLOR_HEX_MAP[normalized] || null;
};

const getModelUrl = (product) => {
  if (product?.modelFiles?.length > 0) {
    const glbModel = product.modelFiles.find(
      (m) => m.format === "glb" || m.format === "gltf"
    );
    if (glbModel) {
      if (glbModel.isExternal || glbModel.url?.startsWith("http")) {
        return glbModel.url;
      }
      return `${uploadsBaseUrl}/uploads/models/${glbModel.url}`;
    }
  }
  if (product?.modelUrl) {
    if (product.modelUrl.startsWith("http")) return product.modelUrl;
    return `${uploadsBaseUrl}/uploads/models/${product.modelUrl}`;
  }
  return null;
};

const formatNPR = (amount) => `Nrs. ${amount?.toLocaleString("en-IN") || "0"}`;

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under Nrs. 10,000", min: 0, max: 10000 },
  { label: "Nrs. 10,000 - 25,000", min: 10000, max: 25000 },
  { label: "Nrs. 25,000 - 50,000", min: 25000, max: 50000 },
  { label: "Above Nrs. 50,000", min: 50000, max: Infinity },
];
const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
];

const NativeARView = ({
  products = [],
  categories = [],
  selectedProduct,
  onProductSelect,
  customization,
  onCustomize,
  onClose,
  onAddToCart,
  isLoading = false,
}) => {
  const overlayRef = useRef(null);

  const {
    isSupported,
    isSessionActive,
    placedModels,
    error,
    startSession,
    stopSession,
    hitTest,
    placeModel,
    removeModel,
    transformModel,
    setModelColor,
    clearError,
    getCamera,
    getRenderer,
  } = useARCore();

  const [currentAnchor, setCurrentAnchor] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [hasPlacedModel, setHasPlacedModel] = useState(false);
  const [surfaceDetected, setSurfaceDetected] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriceRange, setFilterPriceRange] = useState(PRICE_RANGES[0]);
  const [filterSort, setFilterSort] = useState(SORT_OPTIONS[0]);
  const [screenshotData, setScreenshotData] = useState(null);
  const [showScreenshotPreview, setShowScreenshotPreview] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshotError, setScreenshotError] = useState(null);
  const [tutorialStep, setTutorialStep] = useState(0);

  const gestureRef = useRef({
    isGesturing: false,
    isDragging: false,
    initialDistance: 0,
    initialAngle: 0,
    initialScale: 1,
    initialRotation: 0,
    initialPosition: [0, 0, 0],
    lastTouchTime: 0,
    touchStartTime: 0,
    startX: 0,
    startY: 0,
    didRotateScale: false,
    didDrag: false,
    touchMoved: false,
  });

  const categoryNames = useMemo(() => {
    return ["All", ...categories.map((c) => c.name)];
  }, [categories]);

  // Poll for surface detection when session is active
  useEffect(() => {
    if (!isSessionActive || hasPlacedModel) {
      setSurfaceDetected(false);
      return;
    }

    const checkSurface = async () => {
      const result = await hitTest({ x: 0.5, y: 0.5 });
      setSurfaceDetected(result.hit);
    };

    checkSurface();
    const interval = setInterval(checkSurface, 500);
    return () => clearInterval(interval);
  }, [isSessionActive, hasPlacedModel, hitTest]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filterCategory !== "All") {
      result = result.filter((p) => {
        const catName = typeof p.category === "object" ? p.category?.name : "";
        return catName.toLowerCase().includes(filterCategory.toLowerCase());
      });
    }

    result = result.filter(
      (p) =>
        (p.price || 0) >= filterPriceRange.min &&
        (p.price || 0) <= filterPriceRange.max
    );

    if (filterSort.value === "price_asc")
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (filterSort.value === "price_desc")
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (filterSort.value === "name_asc")
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return result;
  }, [products, filterCategory, filterPriceRange, filterSort]);

  const triggerHaptic = useCallback((type = "light") => {
    if ("vibrate" in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [50, 30, 50],
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }, []);

  const handleStartAR = useCallback(async () => {
    if (isSupported && overlayRef.current) {
      triggerHaptic("medium");
      await startSession({
        planeDetection: true,
        lightEstimation: true,
        domOverlay: overlayRef.current,
      });
    }
  }, [isSupported, startSession, triggerHaptic]);

  useEffect(
    () => () => {
      if (isSessionActive) stopSession();
    },
    [isSessionActive, stopSession]
  );

  const getDistance = (t1, t2) =>
    Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
  const getAngle = (t1, t2) =>
    Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) *
    (180 / Math.PI);

  const placeModelAtCenter = useCallback(async () => {
    console.log(
      "placeModelAtCenter called - isPlacing:",
      isPlacing,
      "isSessionActive:",
      isSessionActive,
      "selectedProduct:",
      selectedProduct?.name
    );
    if (isPlacing || !isSessionActive || !selectedProduct) {
      console.log("Early return - conditions not met");
      return;
    }
    setIsPlacing(true);
    triggerHaptic("medium");

    console.log("Performing hit test...");
    const result = await hitTest({ x: 0.5, y: 0.5 });
    console.log("Hit test result:", result);

    if (result.hit) {
      if (currentAnchor) {
        console.log("Removing existing model:", currentAnchor);
        await removeModel(currentAnchor);
      }
      try {
        const modelUrl = getModelUrl(selectedProduct);
        console.log("Placing model from URL:", modelUrl);
        console.log("Position:", result.position, "Rotation:", result.rotation);

        if (!modelUrl) {
          console.error("No model URL available for product:", selectedProduct);
          triggerHaptic("error");
          setIsPlacing(false);
          return;
        }

        console.log("Calling placeModel...");
        const response = await placeModel(
          modelUrl,
          result.position,
          result.rotation,
          [1, 1, 1]
        );
        console.log("placeModel response:", response);
        const { anchorId } = response;
        setCurrentAnchor(anchorId);
        setHasPlacedModel(true);
        triggerHaptic("success");
        console.log("Model placed successfully with anchorId:", anchorId);
      } catch (err) {
        console.error("Failed to place model:", err);
        console.error("Error details:", err.message, err.stack);
        triggerHaptic("error");
      }
    } else {
      console.log("Hit test failed - no surface detected at center");
    }
    setIsPlacing(false);
  }, [
    isSessionActive,
    selectedProduct,
    isPlacing,
    currentAnchor,
    hitTest,
    placeModel,
    removeModel,
    triggerHaptic,
  ]);

  const handleTouchStart = useCallback(
    (e) => {
      if (!isSessionActive) return;
      const touches = e.touches;
      const g = gestureRef.current;

      g.touchStartTime = Date.now();
      g.touchMoved = false;
      g.startX = touches[0].clientX;
      g.startY = touches[0].clientY;

      if (touches.length === 1 && currentAnchor) {
        g.isDragging = true;
        const model = placedModels.find((m) => m.anchorId === currentAnchor);
        if (model) g.initialPosition = model.position || [0, 0, 0];
      } else if (touches.length === 2 && currentAnchor) {
        e.preventDefault();
        g.isDragging = false;
        g.isGesturing = true;
        g.initialDistance = getDistance(touches[0], touches[1]);
        g.initialAngle = getAngle(touches[0], touches[1]);
        const model = placedModels.find((m) => m.anchorId === currentAnchor);
        if (model) {
          g.initialScale = model.scale?.[0] || 1;
          const qy = model.rotation?.[1] || 0,
            qw = model.rotation?.[3] || 1;
          g.initialRotation =
            Math.atan2(2 * qy * qw, 1 - 2 * qy * qy) * (180 / Math.PI);
        }
      }
    },
    [isSessionActive, currentAnchor, placedModels]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isSessionActive) return;
      const touches = e.touches;
      const g = gestureRef.current;

      const moveDistance = Math.sqrt(
        Math.pow(touches[0].clientX - g.startX, 2) +
          Math.pow(touches[0].clientY - g.startY, 2)
      );
      if (moveDistance > 10) {
        g.touchMoved = true;
      }

      if (!currentAnchor) return;

      if (touches.length === 1 && g.isDragging && !g.isGesturing) {
        const DRAG_SENSITIVITY = 0.0015;
        const screenDeltaX = (touches[0].clientX - g.startX) * DRAG_SENSITIVITY;
        const screenDeltaY = (touches[0].clientY - g.startY) * DRAG_SENSITIVITY;

        const dragDistance = Math.sqrt(
          Math.pow(touches[0].clientX - g.startX, 2) +
            Math.pow(touches[0].clientY - g.startY, 2)
        );
        if (dragDistance > 20) {
          g.didDrag = true;
        }

        const camera = getCamera();
        let worldDeltaX = screenDeltaX;
        let worldDeltaZ = screenDeltaY;

        if (camera) {
          const cameraRotationY = camera.rotation.y;
          const cosY = Math.cos(cameraRotationY);
          const sinY = Math.sin(cameraRotationY);
          const rightX = cosY;
          const rightZ = -sinY;
          const forwardX = sinY;
          const forwardZ = cosY;
          worldDeltaX = screenDeltaX * rightX + screenDeltaY * forwardX;
          worldDeltaZ = screenDeltaX * rightZ + screenDeltaY * forwardZ;
        }

        transformModel(currentAnchor, {
          position: [
            g.initialPosition[0] + worldDeltaX,
            g.initialPosition[1],
            g.initialPosition[2] + worldDeltaZ,
          ],
        });
      } else if (touches.length === 2 && g.isGesturing) {
        e.preventDefault();
        const currentDistance = getDistance(touches[0], touches[1]);
        const currentAngle = getAngle(touches[0], touches[1]);
        const scaleRatio = currentDistance / g.initialDistance;
        const newScale = Math.max(
          0.2,
          Math.min(3, g.initialScale * scaleRatio)
        );
        const angleDelta = currentAngle - g.initialAngle;
        const newRotation = g.initialRotation + angleDelta;
        const rad = (newRotation * Math.PI) / 180;

        if (Math.abs(angleDelta) > 10 || Math.abs(scaleRatio - 1) > 0.1) {
          g.didRotateScale = true;
        }

        transformModel(currentAnchor, {
          scale: [newScale, newScale, newScale],
          rotation: [0, Math.sin(rad / 2), 0, Math.cos(rad / 2)],
        });
      }
    },
    [isSessionActive, currentAnchor, transformModel, getCamera]
  );

  const handleTouchEnd = useCallback(
    async (e) => {
      const g = gestureRef.current;
      if (e.touches.length === 0) {
        const touchDuration = Date.now() - g.touchStartTime;
        const wasTap = !g.touchMoved && touchDuration < 300;

        if (wasTap && !g.isGesturing && !g.didDrag && !g.didRotateScale) {
          const now = Date.now();
          if (now - g.lastTouchTime > 500) {
            g.lastTouchTime = now;
            console.log(
              "Tap detected - hasPlacedModel:",
              hasPlacedModel,
              "surfaceDetected:",
              surfaceDetected
            );

            if (!hasPlacedModel && surfaceDetected) {
              console.log("Attempting to place model...");
              await placeModelAtCenter();
            } else if (hasPlacedModel) {
              setShowActions((prev) => !prev);
              setShowCustomize(false);
              triggerHaptic("light");
            }
          }
        }

        if (g.didRotateScale && tutorialStep === 0) {
          setTutorialStep(1);
          triggerHaptic("success");
        } else if (g.didDrag && tutorialStep === 1) {
          setTutorialStep(2);
          triggerHaptic("success");
        }

        g.didRotateScale = false;
        g.didDrag = false;

        if (g.isDragging && currentAnchor) {
          const model = placedModels.find((m) => m.anchorId === currentAnchor);
          if (model) g.initialPosition = model.position || [0, 0, 0];
        }
        g.isDragging = false;
        g.isGesturing = false;
        g.touchMoved = false;
      } else if (e.touches.length < 2) g.isGesturing = false;
    },
    [
      currentAnchor,
      placedModels,
      tutorialStep,
      triggerHaptic,
      hasPlacedModel,
      surfaceDetected,
      placeModelAtCenter,
    ]
  );

  const handleTap = useCallback(
    async (e) => {
      const g = gestureRef.current;
      if (g.isGesturing || g.isDragging) return;

      const now = Date.now();
      if (now - g.lastTouchTime < 500) {
        console.log("Click debounced - recent touch detected");
        return;
      }

      console.log(
        "Click/tap handler - hasPlacedModel:",
        hasPlacedModel,
        "surfaceDetected:",
        surfaceDetected
      );
      g.lastTouchTime = now;
      e.stopPropagation();

      if (!hasPlacedModel && surfaceDetected) {
        console.log("Click: Attempting to place model...");
        await placeModelAtCenter();
      } else if (hasPlacedModel) {
        setShowActions((prev) => !prev);
        setShowCustomize(false);
        triggerHaptic("light");
      }
    },
    [hasPlacedModel, surfaceDetected, placeModelAtCenter, triggerHaptic]
  );

  const handleRemoveModel = useCallback(() => {
    if (currentAnchor) {
      triggerHaptic("medium");
      removeModel(currentAnchor);
      setCurrentAnchor(null);
      setHasPlacedModel(false);
      setShowActions(false);
      setShowCustomize(false);
    }
  }, [currentAnchor, removeModel, triggerHaptic]);

  const handleChangeProduct = useCallback(
    async (product) => {
      onProductSelect(product);
      triggerHaptic("light");
      if (hasPlacedModel && currentAnchor) {
        setIsPlacing(true);
        const result = await hitTest({ x: 0.5, y: 0.5 });
        if (result.hit) {
          await removeModel(currentAnchor);
          try {
            const modelUrl = getModelUrl(product);
            if (modelUrl) {
              const { anchorId } = await placeModel(
                modelUrl,
                result.position,
                result.rotation,
                [1, 1, 1]
              );
              setCurrentAnchor(anchorId);
              triggerHaptic("success");
            }
          } catch (err) {
            console.error("Failed to place model:", err);
          }
        }
        setIsPlacing(false);
      }
    },
    [
      hasPlacedModel,
      currentAnchor,
      onProductSelect,
      hitTest,
      removeModel,
      placeModel,
      triggerHaptic,
    ]
  );

  const calculateTotalPrice = useCallback(() => {
    if (!selectedProduct) return 0;
    return (
      (selectedProduct.price || 0) +
      (customization?.material?.priceModifier || 0) +
      (customization?.size?.priceModifier || 0)
    );
  }, [selectedProduct, customization]);

  const captureScreenshot = useCallback(async () => {
    if (!isSessionActive || isCapturing) return;
    setIsCapturing(true);
    setShowActions(false);
    triggerHaptic("medium");

    try {
      const uiElements = overlayRef.current?.querySelectorAll(
        "[data-hide-on-capture]"
      );
      uiElements?.forEach((el) => (el.style.visibility = "hidden"));
      await new Promise((resolve) => setTimeout(resolve, 300));

      let captured = false;

      const canvases = document.querySelectorAll("canvas");
      for (const canvas of canvases) {
        if (canvas.width > 0 && canvas.height > 0) {
          try {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            if (dataUrl && dataUrl !== "data:," && dataUrl.length > 1000) {
              setScreenshotData(dataUrl);
              setShowScreenshotPreview(true);
              triggerHaptic("success");
              captured = true;
              break;
            }
          } catch (e) {
            console.log("Canvas capture failed:", e);
          }
        }
      }

      if (!captured) {
        triggerHaptic("error");
        setScreenshotError("Could not capture AR view");
        setTimeout(() => setScreenshotError(null), 3000);
      }

      uiElements?.forEach((el) => (el.style.visibility = "visible"));
    } catch (err) {
      console.error("Screenshot failed:", err);
      triggerHaptic("error");
      setScreenshotError("Screenshot failed");
      setTimeout(() => setScreenshotError(null), 3000);
    }
    setIsCapturing(false);
  }, [isSessionActive, isCapturing, triggerHaptic]);

  const downloadScreenshot = useCallback(() => {
    if (!screenshotData) return;
    const link = document.createElement("a");
    link.download = `AR-${
      selectedProduct?.name || "capture"
    }-${Date.now()}.jpg`;
    link.href = screenshotData;
    link.click();
    triggerHaptic("success");
  }, [screenshotData, selectedProduct, triggerHaptic]);

  const shareScreenshot = useCallback(async () => {
    if (!screenshotData) return;
    try {
      const blob = await (await fetch(screenshotData)).blob();
      const file = new File([blob], `AR-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${selectedProduct?.name || "Furniture"} in AR`,
        });
        triggerHaptic("success");
      } else {
        downloadScreenshot();
      }
    } catch (err) {
      downloadScreenshot();
    }
  }, [screenshotData, selectedProduct, downloadScreenshot, triggerHaptic]);

  if (isSupported === null || isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-black">
        <div className="relative">
          <div className="w-20 h-20 border border-gray-700 rounded-full flex items-center justify-center">
            <div className="absolute inset-0">
              <div className="w-full h-full border-2 border-transparent border-t-teal-500 rounded-full animate-spin" />
            </div>
            <MdOutlineViewInAr size={28} className="text-teal-500" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-medium">Loading AR Experience</p>
          <p className="text-gray-500 text-sm mt-2">
            Checking device support...
          </p>
        </div>
      </div>
    );
  }

  if (isSupported === false) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-white text-center p-8">
        <div className="w-24 h-24 border border-gray-200 rounded-full flex items-center justify-center">
          <MdOutlineViewInAr size={40} className="text-gray-400" />
        </div>
        <div>
          <h2
            className="text-2xl text-gray-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            AR Not Supported
          </h2>
          <p className="text-gray-500 mt-3 max-w-xs leading-relaxed">
            Your device doesn't support augmented reality features
          </p>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 max-w-xs">
          <p className="text-sm text-teal-700">
            Try using <span className="font-medium">Chrome browser</span> on an
            ARCore-supported Android device
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-medium transition-all duration-200 active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (products.length === 0 && !isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-white text-center p-8">
        <div className="w-24 h-24 border border-gray-200 rounded-full flex items-center justify-center">
          <MdOutlineViewInAr size={40} className="text-gray-400" />
        </div>
        <div>
          <h2
            className="text-2xl text-gray-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No AR Products
          </h2>
          <p className="text-gray-500 mt-3 max-w-xs leading-relaxed">
            No products with AR models are currently available
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-medium transition-all duration-200 active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {!isSessionActive && (
        <div className="absolute inset-0 bg-black flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-800">
            <div className="flex items-center justify-center w-16 h-16 bg-teal-600/20 rounded-full mx-auto mb-4">
              <IoCamera size={32} className="text-teal-500" />
            </div>
            <h3 className="text-white text-lg font-semibold text-center mb-2">
              Camera Access Required
            </h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              This app needs camera access to show furniture in your space using
              augmented reality.
            </p>
            <button
              onClick={handleStartAR}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-all duration-200 active:scale-[0.98]"
            >
              Allow Camera Access
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-gray-500 text-sm mt-2"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none *:pointer-events-auto"
      >
        {isSessionActive && (
          <div
            className="absolute inset-0 z-1"
            onClick={handleTap}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Only show scanning UI when no surface detected and no model placed */}
            {!hasPlacedModel && !surfaceDetected && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-2 border-white/30" />
                    <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-transparent border-t-white animate-spin" />
                    <div className="absolute inset-4 w-24 h-24 rounded-full border border-white/20" />
                    <div
                      className="absolute inset-4 w-24 h-24 rounded-full border border-transparent border-t-white/60 animate-spin"
                      style={{
                        animationDuration: "1.5s",
                        animationDirection: "reverse",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MdOutlineViewInAr
                        size={28}
                        className="text-white/80"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-base font-medium">
                      Scanning for surface
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      Point camera at a flat surface
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Show minimal instruction when surface detected (reticle visible) */}
            {!hasPlacedModel && surfaceDetected && (
              <div className="absolute bottom-48 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-xl rounded-full px-5 py-2.5 flex items-center gap-2">
                  <IoCheckmarkCircle size={18} className="text-teal-400" />
                  <p className="text-white text-sm font-medium">
                    Tap to place furniture
                  </p>
                </div>
              </div>
            )}

            {isPlacing && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-none">
                <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center">
                  <div className="absolute w-16 h-16 border-2 border-gray-100 border-t-teal-600 rounded-full animate-spin" />
                  <HiOutlineCube size={24} className="text-teal-600" />
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 pt-[calc(12px+env(safe-area-inset-top,12px))] z-100"
          data-hide-on-capture
        >
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl text-white flex items-center justify-center active:scale-95 transition-all"
          >
            <IoClose size={22} />
          </button>

          <div className="flex items-center gap-2 px-4 py-2.5 bg-black/40 backdrop-blur-xl rounded-full">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-white">AR View</span>
          </div>

          <button
            onClick={() => setShowInfo(true)}
            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl text-white flex items-center justify-center active:scale-95 transition-all"
          >
            <IoInformationCircle size={22} />
          </button>
        </div>

        {showActions && hasPlacedModel && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-8 py-5 shadow-xl animate-[actions-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
              <div className="flex gap-6">
                {[
                  {
                    icon: IoColorPalette,
                    label: "Customize",
                    bg: "bg-teal-500/20",
                    iconColor: "text-teal-400",
                    onClick: () => {
                      setShowCustomize(true);
                      setShowActions(false);
                    },
                  },
                  {
                    icon: IoCamera,
                    label: "Capture",
                    bg: "bg-teal-500/20",
                    iconColor: "text-teal-400",
                    onClick: () => {
                      setShowActions(false);
                      captureScreenshot();
                    },
                  },
                  {
                    icon: IoTrash,
                    label: "Remove",
                    bg: "bg-rose-500/20",
                    iconColor: "text-rose-400",
                    onClick: handleRemoveModel,
                  },
                ].map(({ icon: Icon, label, bg, iconColor, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center active:scale-95 transition-all group-hover:scale-105`}
                    >
                      <Icon size={20} className={iconColor} />
                    </div>
                    <span className="text-[10px] font-medium text-white/70">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasPlacedModel &&
          !showActions &&
          !showCustomize &&
          tutorialStep < 2 && (
            <>
              {tutorialStep === 0 && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-56">
                  <div className="relative mb-6">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center animate-pulse">
                        <TbHandFinger
                          size={32}
                          className="text-teal-400 transform -rotate-12"
                        />
                        <div className="w-3 h-3 bg-teal-400 rounded-full mt-1 shadow-lg shadow-teal-400/50" />
                      </div>
                      <div className="flex items-center gap-2">
                        <BsArrowLeftRight size={24} className="text-white/80" />
                      </div>
                      <div
                        className="flex flex-col items-center animate-pulse"
                        style={{ animationDelay: "0.15s" }}
                      >
                        <TbHandFinger
                          size={32}
                          className="text-teal-400 transform rotate-12"
                        />
                        <div className="w-3 h-3 bg-teal-400 rounded-full mt-1 shadow-lg shadow-teal-400/50" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-xl max-w-xs text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        1
                      </div>
                      <p className="text-teal-400 text-sm font-semibold">
                        Rotate & Scale
                      </p>
                    </div>
                    <p className="text-white text-sm leading-relaxed">
                      Place{" "}
                      <span className="text-teal-400 font-medium">
                        two fingers
                      </span>{" "}
                      on screen
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      Twist to rotate • Pinch to resize
                    </p>
                    <button
                      onClick={() => setTutorialStep(2)}
                      className="mt-3 text-white/50 text-xs underline pointer-events-auto"
                    >
                      Skip tutorial
                    </button>
                  </div>
                </div>
              )}

              {tutorialStep === 1 && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-56">
                  <div className="relative mb-6">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-6 mb-2">
                        <div className="w-8 h-0.5 bg-linear-to-l from-teal-400 to-transparent rounded-full" />
                        <div className="w-8 h-0.5 bg-linear-to-r from-teal-400 to-transparent rounded-full" />
                      </div>
                      <div className="flex flex-col items-center animate-bounce">
                        <TbHandFinger size={36} className="text-teal-400" />
                        <div className="w-4 h-4 bg-teal-400 rounded-full shadow-lg shadow-teal-400/50" />
                      </div>
                      <div className="flex flex-col items-center gap-1 mt-2">
                        <div className="w-0.5 h-6 bg-linear-to-t from-teal-400 to-transparent rounded-full" />
                        <div className="w-0.5 h-6 bg-linear-to-b from-teal-400 to-transparent rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-xl max-w-xs text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        2
                      </div>
                      <p className="text-teal-400 text-sm font-semibold">
                        Move Position
                      </p>
                    </div>
                    <p className="text-white text-sm leading-relaxed">
                      Drag with{" "}
                      <span className="text-teal-400 font-medium">
                        one finger
                      </span>{" "}
                      to move
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      Slide in any direction
                    </p>
                    <button
                      onClick={() => setTutorialStep(2)}
                      className="mt-3 text-white/50 text-xs underline pointer-events-auto"
                    >
                      Skip tutorial
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        {isSessionActive && !showCustomize && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-xl rounded-t-3xl z-40 safe-bottom"
            data-hide-on-capture
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-white/30 rounded-full" />
            </div>

            <div className="flex justify-between items-center px-5 pb-3 gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
                  <HiOutlineCube size={18} className="text-teal-400" />
                </div>
                <div>
                  <h2
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Collection
                  </h2>
                  <span className="text-xs text-white/50">
                    {filteredProducts.length} items available
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowFilter(true)}
                className="relative flex items-center gap-1.5 px-4 py-2 border border-white/20 hover:border-teal-400 hover:bg-white/10 rounded-full text-xs font-medium text-white/80 active:scale-95 transition-all"
              >
                <IoFilter size={14} />
                <span>Filter</span>
                {(filterCategory !== "All" ||
                  filterPriceRange.min > 0 ||
                  filterSort.value !== "default") && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-400 rounded-full border-2 border-black/70" />
                )}
              </button>
            </div>

            <div className="flex gap-3 px-5 pb-5 overflow-x-auto hide-scrollbar">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full py-6 gap-2">
                  <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center">
                    <IoFilter size={18} className="text-white/40" />
                  </div>
                  <span className="text-sm text-white/40">
                    No products found
                  </span>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product._id || product.id}
                    onClick={() => handleChangeProduct(product)}
                    className="group shrink-0 flex flex-col items-center p-2 rounded-xl transition-all hover:bg-white/10"
                  >
                    <div
                      className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all ${
                        selectedProduct?._id === product._id ||
                        selectedProduct?.id === product.id
                          ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-black/70"
                          : "border border-white/20 group-hover:border-teal-400/50"
                      }`}
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      {(selectedProduct?._id === product._id ||
                        selectedProduct?.id === product.id) && (
                        <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                          <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                            <IoCheckmarkCircle
                              size={14}
                              className="text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="mt-2 text-[10px] font-medium text-white/80 text-center max-w-16 truncate">
                      {product.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        selectedProduct?._id === product._id ||
                        selectedProduct?.id === product.id
                          ? "text-teal-400"
                          : "text-white/50"
                      }`}
                    >
                      {formatNPR(product.price)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {showFilter && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-200 animate-[fade-in_0.2s_ease]"
            onClick={() => setShowFilter(false)}
          >
            <div
              className="w-full max-h-[70vh] bg-black/80 backdrop-blur-xl rounded-t-3xl flex flex-col animate-[slide-up_0.35s_cubic-bezier(0.4,0,0.2,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-5 py-4">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <IoFilter size={16} className="text-teal-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">
                    Filter & Sort
                  </h2>
                </div>
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white/70 flex items-center justify-center active:scale-95 transition-all"
                >
                  <IoClose size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-4">
                <div className="mb-4">
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryNames.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                          filterCategory === cat
                            ? "bg-teal-500 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
                    Price Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFilterPriceRange(range)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                          filterPriceRange === range
                            ? "bg-teal-500 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
                    Sort By
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilterSort(option)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                          filterSort.value === option.value
                            ? "bg-teal-500 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-5 pt-4 pb-8">
                <button
                  onClick={() => {
                    setFilterCategory("All");
                    setFilterPriceRange(PRICE_RANGES[0]);
                    setFilterSort(SORT_OPTIONS[0]);
                  }}
                  className="flex-1 py-2.5 bg-white/10 text-white/70 rounded-full text-sm font-medium active:scale-[0.98] transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="flex-[1.5] py-2.5 bg-teal-500 text-white rounded-full text-sm font-medium active:scale-[0.98] transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {showCustomize && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-200 animate-[fade-in_0.2s_ease]"
            onClick={() => setShowCustomize(false)}
          >
            <div
              className="w-full bg-black/80 backdrop-blur-xl rounded-t-3xl flex flex-col animate-[slide-up_0.35s_cubic-bezier(0.4,0,0.2,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-white/30 rounded-full" />
              </div>

              <div className="px-5 py-4">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20">
                    <img
                      src={getProductImage(selectedProduct)}
                      alt={selectedProduct?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-sm font-medium">
                      {selectedProduct?.name}
                    </h3>
                    <p className="text-teal-400 text-sm font-semibold">
                      {formatNPR(calculateTotalPrice())}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="w-8 h-8 rounded-full bg-white/10 text-white/70 flex items-center justify-center"
                  >
                    <IoClose size={16} />
                  </button>
                </div>

                {/* Color Options - with color swatches */}
                {selectedProduct?.colors &&
                  selectedProduct.colors.length > 0 && (
                    <div className="mb-4">
                      <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
                        Color{" "}
                        {customization?.color && (
                          <span className="text-teal-400 capitalize">
                            • {customization.color}
                          </span>
                        )}
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {selectedProduct.colors.map((color, idx) => {
                          const hexColor = getColorHex(color);
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                onCustomize?.({ ...customization, color });
                                // Apply color to 3D model in AR
                                if (currentAnchor && hexColor) {
                                  setModelColor(currentAnchor, hexColor);
                                }
                                triggerHaptic("light");
                              }}
                              className="group"
                              title={color}
                            >
                              <div
                                style={{ backgroundColor: hexColor || "#888" }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-all border-2 ${
                                  customization?.color === color
                                    ? "ring-2 ring-offset-2 ring-offset-black/80 ring-teal-400 scale-110 border-white/50"
                                    : "border-white/20 hover:border-white/40"
                                }`}
                              >
                                {customization?.color === color && (
                                  <IoCheckmarkCircle size={18} />
                                )}
                              </div>
                              <span className="text-[9px] text-white/50 mt-1 block text-center capitalize">
                                {color}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {selectedProduct?.materials &&
                  selectedProduct.materials.length > 0 && (
                    <div className="mb-4">
                      <label className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2 block">
                        Material
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.materials.map((material, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onCustomize?.({ ...customization, material });
                              triggerHaptic("light");
                            }}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
                              customization?.material === material
                                ? "bg-teal-500 text-white"
                                : "bg-white/10 text-white/70"
                            }`}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {(!selectedProduct?.colors ||
                  selectedProduct.colors.length === 0) &&
                  (!selectedProduct?.materials ||
                    selectedProduct.materials.length === 0) && (
                    <div className="mb-4 p-4 bg-white/5 rounded-xl text-center">
                      <p className="text-white/50 text-sm">
                        No customization options available for this product.
                      </p>
                      <p className="text-white/30 text-xs mt-1">
                        Colors and materials can be added in admin panel.
                      </p>
                    </div>
                  )}

                <button
                  onClick={() => setShowCustomize(false)}
                  className="w-full py-3 bg-teal-500 text-white rounded-full text-sm font-medium active:scale-[0.98] transition-all mb-6"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {showInfo && (
          <div
            className="fixed inset-0 z-200 animate-[fade-in_0.2s_ease]"
            onClick={() => setShowInfo(false)}
          >
            <div
              className="absolute top-28 left-4 right-4 animate-[actions-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl">
                {/* Gesture hints in a row */}
                <div className="flex justify-around items-start gap-2">
                  {[
                    {
                      icon: TbRotate360,
                      gesture: "2 fingers",
                      action: "Rotate",
                    },
                    {
                      icon: HiOutlineArrowsPointingOut,
                      gesture: "Pinch",
                      action: "Scale",
                    },
                    { icon: TbHandFinger, gesture: "1 finger", action: "Move" },
                  ].map(({ icon: Icon, gesture, action }) => (
                    <div
                      key={action}
                      className="flex flex-col items-center text-center flex-1"
                    >
                      <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center mb-1.5">
                        <Icon size={18} className="text-teal-400" />
                      </div>
                      <p className="text-white text-[11px] font-medium">
                        {action}
                      </p>
                      <p className="text-white/50 text-[10px]">{gesture}</p>
                    </div>
                  ))}
                </div>

                <p className="text-center text-white/40 text-[10px] mt-3">
                  Tap anywhere to dismiss
                </p>
              </div>
            </div>
          </div>
        )}

        {showScreenshotPreview && screenshotData && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-300 animate-[fade-in_0.2s_ease] p-6"
            onClick={() => setShowScreenshotPreview(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl overflow-hidden animate-[actions-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)] border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-3/4 bg-gray-100">
                <img
                  src={screenshotData}
                  alt="AR Screenshot"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setShowScreenshotPreview(false)}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-xl text-gray-600 rounded-full flex items-center justify-center active:scale-95 transition-all border border-gray-200"
                >
                  <IoClose size={18} />
                </button>
              </div>

              {/* Actions */}
              <div className="p-5">
                <h3
                  className="text-base font-semibold text-gray-800 mb-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Screenshot Captured
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedProduct?.name} in your space
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={downloadScreenshot}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full font-medium active:scale-[0.98] transition-all"
                  >
                    <IoDownload size={18} />
                    Download
                  </button>
                  <button
                    onClick={shareScreenshot}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-medium active:scale-[0.98] transition-all"
                  >
                    <IoShareSocial size={18} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-rose-500/90 backdrop-blur-xl text-white px-5 py-3 rounded-full z-300 animate-[toast-in_0.3s_ease]">
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={clearError}
              className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-white/30"
            >
              <IoClose size={14} />
            </button>
          </div>
        )}

        {screenshotError && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-rose-500/90 backdrop-blur-xl text-white px-5 py-3 rounded-full z-300 animate-[toast-in_0.3s_ease]">
            <IoCamera size={16} />
            <span className="text-sm font-medium">{screenshotError}</span>
            <button
              onClick={() => setScreenshotError(null)}
              className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center active:scale-90 transition-all"
            >
              <IoClose size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NativeARView;
