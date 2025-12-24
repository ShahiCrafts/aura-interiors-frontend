import React from "react";
import { TbRotate360, TbHandFinger } from "react-icons/tb";
import { HiOutlineArrowsPointingOut } from "react-icons/hi2";

const InfoModal = ({ show, onClose }) => {
  if (!show) return null;

  const gestures = [
    { icon: TbRotate360, gesture: "2 fingers", action: "Rotate" },
    { icon: HiOutlineArrowsPointingOut, gesture: "Pinch", action: "Scale" },
    { icon: TbHandFinger, gesture: "1 finger", action: "Move" },
  ];

  return (
    <div
      className="fixed inset-0 z-200 animate-[fade-in_0.2s_ease]"
      onClick={onClose}
    >
      <div
        className="absolute top-28 left-4 right-4 animate-[actions-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl">
          <div className="flex justify-around items-start gap-2">
            {gestures.map(({ icon: Icon, gesture, action }) => (
              <div
                key={action}
                className="flex flex-col items-center text-center flex-1"
              >
                <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center mb-1.5">
                  <Icon size={18} className="text-teal-400" />
                </div>
                <p className="text-white text-[11px] font-medium">{action}</p>
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
  );
};

export default InfoModal;
