/**
 * ChatList Component
 * Sidebar list of all chats with filters
 */

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, MessageCircle, User } from 'lucide-react';

const ChatList = ({
  chats,
  pagination,
  isLoading,
  selectedChat,
  onSelectChat,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
  currentPage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats by search query
  const filteredChats = chats.filter((chat) => {
    const customerName = `${chat.customer?.firstName || ''} ${chat.customer?.lastName || ''}`.toLowerCase();
    const subject = (chat.subject || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return customerName.includes(query) || subject.includes(query);
  });

  // Format time ago
  const timeAgo = (date) => {
    if (!date) return '';

    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return messageDate.toLocaleDateString();
  };

  // Get status badge classes
  const getStatusBadge = (status) => {
    const styles = {
      waiting: 'bg-amber-50 text-amber-700 border border-amber-100',
      active: 'bg-teal-50 text-teal-700 border border-teal-100',
      resolved: 'bg-purple-50 text-purple-700 border border-purple-100',
      closed: 'bg-gray-50 text-gray-600 border border-gray-100',
    };
    return styles[status] || styles.closed;
  };

  return (
    <div className="h-full bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Conversations</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-700 cursor-pointer"
        >
          <option value="all">All Conversations</option>
          <option value="waiting">Waiting</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-500">Loading conversations...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No conversations</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${selectedChat?._id === chat._id
                  ? 'bg-teal-50/50 border-l-4 border-l-teal-500'
                  : 'border-l-4 border-l-transparent'
                  }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedChat?._id === chat._id
                    ? 'bg-teal-100 text-teal-600'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    <User className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Customer Name & Status */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`font-medium text-sm truncate ${selectedChat?._id === chat._id ? 'text-teal-900' : 'text-gray-900'
                        }`}>
                        {chat.customer?.firstName || 'Customer'} {chat.customer?.lastName || ''}
                      </p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${getStatusBadge(chat.status)}`}>
                        {chat.status}
                      </span>
                    </div>

                    {/* Subject */}
                    {chat.subject ? (
                      <p className="text-xs font-medium text-gray-600 truncate mb-1">{chat.subject}</p>
                    ) : (
                      <p className="text-xs text-gray-400 truncate mb-1 italic">No subject</p>
                    )}

                    {/* Time & Unread */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-gray-400">{timeAgo(chat.lastMessageAt)}</span>
                      {chat.unreadCountAdmin > 0 && (
                        <span className="bg-teal-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-sm">
                          {chat.unreadCountAdmin > 9 ? '9+' : chat.unreadCountAdmin}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatList;
