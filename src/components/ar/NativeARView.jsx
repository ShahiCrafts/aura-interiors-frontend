import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useARCore } from "capacitor-arcore";
import { IoClose, IoInformationCircle, IoCamera } from "react-icons/io5";
import { MdOutlineViewInAr } from "react-icons/md";
import { HiOutlineCube } from "react-icons/hi2";

import {
  FilterModal,
  CustomizeSheet,
  ScreenshotPreview,
  ProductCatalog,
  ScanningOverlay,
  PlacingIndicator,
  ActionMenu,
  InfoModal,
  TutorialOverlay,
  PRICE_RANGES,
  SORT_OPTIONS,
} from "./components";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
const uploadsBaseUrl = baseUrl.replace("/api/v1", "");

const getProductImage = (product) => {
  if (!product) return null;

  if (product.primaryImage) {
    const url = product.primaryImage;
    if (url.startsWith("http")) return url;
    return `${uploadsBaseUrl}/uploads/products/${url}`;
  }

  if (product.images?.length > 0) {
    const primaryImg = product.images.find((img) => img.isPrimary);
    const url = primaryImg?.url || product.images[0]?.url;
    if (url) {
      if (url.startsWith("http")) return url;
      return `${uploadsBaseUrl}/uploads/products/${url}`;
    }
  }

  return null;
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
    if (isPlacing || !isSessionActive || !selectedProduct) return;
    setIsPlacing(true);
    triggerHaptic("medium");

    const result = await hitTest({ x: 0.5, y: 0.5 });

    if (result.hit) {
      if (currentAnchor) {
        await removeModel(currentAnchor);
      }
      try {
        const modelUrl = getModelUrl(selectedProduct);
        if (!modelUrl) {
          triggerHaptic("error");
          setIsPlacing(false);
          return;
        }

        const response = await placeModel(
          modelUrl,
          result.position,
          result.rotation,
          [1, 1, 1]
        );
        const { anchorId } = response;
        setCurrentAnchor(anchorId);
        setHasPlacedModel(true);
        triggerHaptic("success");
      } catch (err) {
        console.error("Failed to place model:", err);
        triggerHaptic("error");
      }
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

            if (!hasPlacedModel && surfaceDetected) {
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
      if (now - g.lastTouchTime < 500) return;

      g.lastTouchTime = now;
      e.stopPropagation();

      if (!hasPlacedModel && surfaceDetected) {
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
    link.download = `AR-${selectedProduct?.name || "capture"}-${Date.now()}.jpg`;
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

  // Loading state
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
          <p className="text-gray-500 text-sm mt-2">Checking device support...</p>
        </div>
      </div>
    );
  }

  // AR not supported
  if (isSupported === false) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-white text-center p-8">
        <div className="w-24 h-24 border border-gray-200 rounded-full flex items-center justify-center">
          <MdOutlineViewInAr size={40} className="text-gray-400" />
        </div>
        <div>
          <h2 className="text-2xl text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
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

  // No products available
  if (products.length === 0 && !isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-white text-center p-8">
        <div className="w-24 h-24 border border-gray-200 rounded-full flex items-center justify-center">
          <MdOutlineViewInAr size={40} className="text-gray-400" />
        </div>
        <div>
          <h2 className="text-2xl text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
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

  const hasActiveFilters =
    filterCategory !== "All" ||
    filterPriceRange.min > 0 ||
    filterSort.value !== "default";

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Camera permission screen */}
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
            <button onClick={onClose} className="w-full py-3 text-gray-500 text-sm mt-2">
              Not now
            </button>
          </div>
        </div>
      )}

      {/* AR Overlay */}
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
            <ScanningOverlay
              hasPlacedModel={hasPlacedModel}
              surfaceDetected={surfaceDetected}
              isPlacing={isPlacing}
            />
            <PlacingIndicator isPlacing={isPlacing} />
          </div>
        )}

        {/* Header */}
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

        {/* Action Menu */}
        <ActionMenu
          show={showActions}
          hasPlacedModel={hasPlacedModel}
          onCustomize={() => {
            setShowCustomize(true);
            setShowActions(false);
          }}
          onCapture={() => {
            setShowActions(false);
            captureScreenshot();
          }}
          onRemove={handleRemoveModel}
        />

        {/* Tutorial Overlay */}
        <TutorialOverlay
          tutorialStep={tutorialStep}
          hasPlacedModel={hasPlacedModel}
          showActions={showActions}
          showCustomize={showCustomize}
          onSkip={() => setTutorialStep(2)}
        />

        {/* Product Catalog */}
        {isSessionActive && !showCustomize && (
          <ProductCatalog
            products={filteredProducts}
            selectedProduct={selectedProduct}
            onProductSelect={handleChangeProduct}
            onFilterClick={() => setShowFilter(true)}
            hasActiveFilters={hasActiveFilters}
            getProductImage={getProductImage}
          />
        )}

        {/* Filter Modal */}
        <FilterModal
          show={showFilter}
          onClose={() => setShowFilter(false)}
          categoryNames={categoryNames}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterPriceRange={filterPriceRange}
          setFilterPriceRange={setFilterPriceRange}
          filterSort={filterSort}
          setFilterSort={setFilterSort}
        />

        {/* Customize Sheet */}
        <CustomizeSheet
          show={showCustomize}
          onClose={() => setShowCustomize(false)}
          selectedProduct={selectedProduct}
          customization={customization}
          onCustomize={onCustomize}
          currentAnchor={currentAnchor}
          setModelColor={setModelColor}
          triggerHaptic={triggerHaptic}
          getProductImage={getProductImage}
          calculateTotalPrice={calculateTotalPrice}
        />

        {/* Info Modal */}
        <InfoModal show={showInfo} onClose={() => setShowInfo(false)} />

        {/* Screenshot Preview */}
        <ScreenshotPreview
          show={showScreenshotPreview}
          screenshotData={screenshotData}
          selectedProduct={selectedProduct}
          onClose={() => setShowScreenshotPreview(false)}
          onDownload={downloadScreenshot}
          onShare={shareScreenshot}
        />

        {/* Error Toast */}
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

        {/* Screenshot Error Toast */}
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
