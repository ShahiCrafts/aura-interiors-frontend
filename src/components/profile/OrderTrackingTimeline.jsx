import { Check, ClipboardList, Package, Truck, CheckCircle2, ShoppingBag, X } from "lucide-react";

const TRACKING_STEPS = [
  { key: "pending", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: ClipboardList },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_ORDER = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

export default function OrderTrackingTimeline({ status }) {
  const currentStepIndex = STATUS_ORDER[status] ?? -1;

  if (status === "cancelled") {
    return (
      <div className="flex items-center justify-center py-6 bg-red-50 rounded-2xl border border-red-100">
        <span className="text-red-600 font-bold font-dm-sans flex items-center gap-2">
          <X size={20} />
          Order Cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="py-2 relative">
      {/* Connector Line Base */}
      <div className="absolute top-7 left-0 w-full h-0.5 bg-neutral-100 -z-0 hidden sm:block" />

      <div className="flex items-center justify-between relative z-10">
        {TRACKING_STEPS.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isLastCompleted = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="relative flex items-center justify-center w-full">
                {/* Connector Line Active */}
                {index > 0 && (
                  <div
                    className={`absolute right-1/2 top-1/2 -translate-y-1/2 w-full h-0.5 -z-10 hidden sm:block ${isCompleted ? "bg-teal-500" : "bg-neutral-100"
                      }`}
                  />
                )}

                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${isCompleted
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 ring-4 ring-white"
                      : "bg-white text-neutral-300 border-2 border-neutral-100"
                    }`}
                >
                  {isLastCompleted && status !== "delivered" ? (
                    <div className="relative">
                      <Icon size={24} />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                      </span>
                    </div>
                  ) : isCompleted ? (
                    <Check size={24} strokeWidth={3} />
                  ) : (
                    <Icon size={24} />
                  )}
                </div>
              </div>

              <span
                className={`mt-4 text-[11px] font-bold font-dm-sans text-center uppercase tracking-wider transition-colors duration-500 ${isCompleted ? "text-teal-700" : "text-neutral-400"
                  }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
