import React from "react";
import { IoClose, IoDownload, IoShareSocial } from "react-icons/io5";

const ScreenshotPreview = ({
  show,
  screenshotData,
  selectedProduct,
  onClose,
  onDownload,
  onShare,
}) => {
  if (!show || !screenshotData) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-300 animate-[fade-in_0.2s_ease] p-6"
      onClick={onClose}
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
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-xl text-gray-600 rounded-full flex items-center justify-center active:scale-95 transition-all border border-gray-200"
          >
            <IoClose size={18} />
          </button>
        </div>

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
              onClick={onDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full font-medium active:scale-[0.98] transition-all"
            >
              <IoDownload size={18} />
              Download
            </button>
            <button
              onClick={onShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-medium active:scale-[0.98] transition-all"
            >
              <IoShareSocial size={18} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotPreview;
