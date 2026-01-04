import { Check } from "lucide-react";

const TRACKING_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_ORDER = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

export default function OrderTrackingTimeline({ status }) {
  const currentStepIndex = STATUS_ORDER[status] ?? 0;

  if (status === "cancelled") {
    return (
      <div className="flex items-center justify-center py-4">
        <span className="text-red-500 font-medium font-dm-sans">
          Order Cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {TRACKING_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      isCompleted || isCurrent
                        ? "bg-teal-500"
                        : "bg-neutral-200"
                    }`}
                  />
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? "bg-teal-500 text-white"
                      : isCurrent
                      ? "bg-teal-500 text-white ring-4 ring-teal-100"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isCurrent ? "bg-white" : "bg-neutral-400"
                      }`}
                    />
                  )}
                </div>

                {index < TRACKING_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      isCompleted ? "bg-teal-500" : "bg-neutral-200"
                    }`}
                  />
                )}
              </div>

              <span
                className={`mt-2 text-xs font-medium font-dm-sans text-center ${
                  isCompleted || isCurrent
                    ? "text-teal-700"
                    : "text-neutral-400"
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
