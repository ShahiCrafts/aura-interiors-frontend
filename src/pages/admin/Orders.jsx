import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronDown,
  Eye,
  Loader2,
  ShoppingBag,
  DollarSign,
  Clock,
  RotateCcw,
} from 'lucide-react';
import Skeleton from "../../components/common/Skeleton";
import { useAllOrders, useUpdateOrderStatus, useProcessReturnRequest } from '../../hooks/order/useOrderTan';
import { toast } from "react-toastify";
import Pagination from '../../components/common/Pagination';
import formatError from "../../utils/errorHandler";

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [returnDecision, setReturnDecision] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const queryParams = {
    page,
    limit: pageSize,
    ...(searchQuery && { search: searchQuery }),
    ...(filterStatus !== 'all' && { status: filterStatus }),
    ...(filterPaymentStatus !== 'all' && { paymentStatus: filterPaymentStatus }),
  };

  const { data: ordersData, isLoading, error } = useAllOrders(queryParams);
  const updateStatusMutation = useUpdateOrderStatus();
  const processReturnMutation = useProcessReturnRequest();

  const orders = ordersData?.data?.orders || [];
  const pagination = ordersData?.data?.pagination || { total: 0, pages: 1 };
  const stats = ordersData?.data?.stats || { totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0 };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrder._id,
        data: { status: newStatus },
      });
      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      setSelectedOrder(null);
    } catch (err) {
      toast.error(formatError(err, 'Failed to update order status'));
    }
  };

  const handleReturnAction = (order) => {
    setSelectedOrder(order);
    setReturnDecision('');
    setAdminNote('');
    setShowReturnModal(true);
  };

  const handleProcessReturn = async () => {
    if (!selectedOrder || !returnDecision) return;

    try {
      await processReturnMutation.mutateAsync({
        id: selectedOrder._id,
        data: { status: returnDecision, adminNote },
      });
      toast.success(`Return request ${returnDecision} successfully`);
      setShowReturnModal(false);
      setSelectedOrder(null);
      setReturnDecision('');
      setAdminNote('');
    } catch (err) {
      toast.error(formatError(err, 'Failed to process return request'));
    }
  };

  const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentStatusOptions = ['pending', 'paid', 'failed', 'refunded'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'processing': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'shipped': return 'bg-violet-50 text-violet-700 border border-violet-100';
      case 'delivered': return 'bg-teal-50 text-teal-700 border border-teal-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-500';
      case 'confirmed': return 'bg-blue-500';
      case 'processing': return 'bg-indigo-500';
      case 'shipped': return 'bg-violet-500';
      case 'delivered': return 'bg-teal-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'paid': return 'bg-teal-50 text-teal-700 border border-teal-100';
      case 'failed': return 'bg-red-50 text-red-600 border border-red-100';
      case 'refunded': return 'bg-orange-50 text-orange-700 border border-orange-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getReturnStatusColor = (status) => {
    switch (status) {
      case 'requested': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'approved': return 'bg-teal-50 text-teal-700 border border-teal-100';
      case 'rejected': return 'bg-red-50 text-red-600 border border-red-100';
      case 'completed': return 'bg-blue-50 text-blue-700 border border-blue-100';
      default: return '';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Manage and monitor all customer orders</p>
      </div>



      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {/* Filters inside table card */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="all">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterPaymentStatus}
              onChange={(e) => {
                setFilterPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="all">All Payment</option>
              {paymentStatusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-20" /></th>
                  <th className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                  <th className="px-6 py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20 font-mono" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="w-8 h-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-sm font-medium text-gray-900">#{order.orderId.slice(-8)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.items?.length || 0} items</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : `${order.guestInfo?.firstName || 'Guest'} ${order.guestInfo?.lastName || ''}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.user?.email || order.guestInfo?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        NRs. {(order.total || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.orderStatus)}`}></span>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStatusChange(order)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Change status"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {order.returnRequest?.status === 'requested' && (
                          <button
                            onClick={() => handleReturnAction(order)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Process return"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={pagination.pages}
          pageSize={pageSize}
          totalItems={pagination.total}
          onPageChange={setPage}
        />
      </div>

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStatusModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Update Order Status</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">Order: <span className="font-mono font-medium text-gray-900">{selectedOrder?.orderId}</span></p>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {updateStatusMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Return Request Modal */}
        {showReturnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReturnModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Process Return Request</h3>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-5 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Order: <span className="font-mono font-medium text-gray-900">{selectedOrder?.orderId}</span></p>
                <p className="text-sm text-gray-600 mb-1">Reason: <span className="font-medium text-gray-900">{selectedOrder?.returnRequest?.reason}</span></p>
                {selectedOrder?.returnRequest?.description && (
                  <p className="text-sm text-gray-500 mt-2">{selectedOrder.returnRequest.description}</p>
                )}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReturnDecision('approved')}
                    className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${returnDecision === 'approved'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-teal-300'
                      }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setReturnDecision('rejected')}
                    className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${returnDecision === 'rejected'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:border-red-300'
                      }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note (optional)</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note for the customer..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessReturn}
                  disabled={!returnDecision || processReturnMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {processReturnMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Process
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
