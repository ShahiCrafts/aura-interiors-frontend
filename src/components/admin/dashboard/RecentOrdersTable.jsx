import { Link } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";

export default function RecentOrdersTable({ orders = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>

        <Link
          to="/admin/orders"
          className="text-teal-600 text-sm font-medium hover:text-teal-700 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/60">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const customerName =
                order.user?.fullName || order.guestInfo?.firstName || "Guest";

              const statusStyles =
                order.orderStatus === "delivered"
                  ? "bg-emerald-50 text-emerald-700"
                  : order.orderStatus === "cancelled"
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-700";

              return (
                <tr
                  key={order._id}
                  className="group hover:bg-gray-50/60 transition-colors"
                >
                  {/* Order ID */}
                  <td className="px-6 py-4">
                    <span className="inline-block font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      #{order.orderId.slice(-6)}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {customerName[0]}
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-40">
                        {customerName}
                      </span>
                    </div>
                  </td>

                  {/* Status (NO DOT) */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    NRs. {order.total.toLocaleString()}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}

            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
