import React from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdOutlineViewInAr } from "react-icons/md";
import { HiOutlineCube } from "react-icons/hi2";

const ScanningOverlay = ({ hasPlacedModel, surfaceDetected, isPlacing }) => {
  // Show scanning UI when no surface detected and no model placed
  if (!hasPlacedModel && !surfaceDetected) {
    return (
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
              <MdOutlineViewInAr size={28} className="text-white/80" />
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
    );
  }

  // Show minimal instruction when surface detected (reticle visible)
  if (!hasPlacedModel && surfaceDetected) {
    return (
      <div className="absolute bottom-48 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl rounded-full px-5 py-2.5 flex items-center gap-2">
          <IoCheckmarkCircle size={18} className="text-teal-400" />
          <p className="text-white text-sm font-medium">
            Tap to place furniture
          </p>
        </div>
      </div>
    );
  }

  return null;
};

const PlacingIndicator = ({ isPlacing }) => {
  if (!isPlacing) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-none">
      <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center">
        <div className="absolute w-16 h-16 border-2 border-gray-100 border-t-teal-600 rounded-full animate-spin" />
        <HiOutlineCube size={24} className="text-teal-600" />
      </div>
    </div>
  );
};

export { ScanningOverlay, PlacingIndicator };
export default ScanningOverlay;
