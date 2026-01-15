import React from "react";
import { BsArrowLeftRight } from "react-icons/bs";
import { TbHandFinger } from "react-icons/tb";

const TutorialOverlay = ({
  tutorialStep,
  hasPlacedModel,
  showActions,
  showCustomize,
  onSkip,
}) => {
  if (!hasPlacedModel || showActions || showCustomize || tutorialStep >= 2) {
    return null;
  }

  if (tutorialStep === 0) {
    return (
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-56">
        <div className="relative mb-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center animate-pulse">
              <TbHandFinger
                size={32}
                className="text-teal-400 transform -rotate-12"
              />
              <div className="w-3 h-3 bg-teal-400 rounded-full mt-1" />
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
              <div className="w-3 h-3 bg-teal-400 rounded-full mt-1" />
            </div>
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-xl max-w-xs text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              1
            </div>
            <p className="text-teal-400 text-sm font-semibold">Rotate & Scale</p>
          </div>
          <p className="text-white text-sm leading-relaxed">
            Place{" "}
            <span className="text-teal-400 font-medium">two fingers</span> on
            screen
          </p>
          <p className="text-white/70 text-xs mt-1">
            Twist to rotate • Pinch to resize
          </p>
          <button
            onClick={onSkip}
            className="mt-3 text-white/50 text-xs underline pointer-events-auto"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    );
  }

  if (tutorialStep === 1) {
    return (
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-56">
        <div className="relative mb-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-6 mb-2">
              <div className="w-8 h-0.5 bg-linear-to-l from-teal-400 to-transparent rounded-full" />
              <div className="w-8 h-0.5 bg-linear-to-r from-teal-400 to-transparent rounded-full" />
            </div>
            <div className="flex flex-col items-center animate-bounce">
              <TbHandFinger size={36} className="text-teal-400" />
              <div className="w-4 h-4 bg-teal-400 rounded-full" />
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
            <p className="text-teal-400 text-sm font-semibold">Move Position</p>
          </div>
          <p className="text-white text-sm leading-relaxed">
            Drag with{" "}
            <span className="text-teal-400 font-medium">one finger</span> to move
          </p>
          <p className="text-white/70 text-xs mt-1">Slide in any direction</p>
          <button
            onClick={onSkip}
            className="mt-3 text-white/50 text-xs underline pointer-events-auto"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TutorialOverlay;
