import React from "react";
import { IoColorPalette, IoCamera, IoTrash } from "react-icons/io5";

const ActionMenu = ({
  show,
  hasPlacedModel,
  onCustomize,
  onCapture,
  onRemove,
}) => {
  if (!show || !hasPlacedModel) return null;

  const actions = [
    {
      icon: IoColorPalette,
      label: "Customize",
      bg: "bg-teal-500/20",
      iconColor: "text-teal-400",
      onClick: onCustomize,
    },
    {
      icon: IoCamera,
      label: "Capture",
      bg: "bg-teal-500/20",
      iconColor: "text-teal-400",
      onClick: onCapture,
    },
    {
      icon: IoTrash,
      label: "Remove",
      bg: "bg-rose-500/20",
      iconColor: "text-rose-400",
      onClick: onRemove,
    },
  ];

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-8 py-5 shadow-xl animate-[actions-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
        <div className="flex gap-6">
          {actions.map(({ icon: Icon, label, bg, iconColor, onClick }) => (
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
  );
};

export default ActionMenu;
