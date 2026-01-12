/**
 * ChatMessageList Component
 * Scrollable message history with infinite scroll
 */

import { useRef, useEffect } from 'react';
import { Loader2, MessageCircle, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';

const ChatMessageList = ({
  messages,
  isLoading,
  onLoadMore,
  hasMore,
  isFetchingMore,
  currentUserId,
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && !isFetchingMore) {
      const container = messagesContainerRef.current;
      if (container) {
        const isScrolledToBottom =
          container.scrollHeight - container.scrollTop === container.clientHeight;

        if (isScrolledToBottom || messages.length === 1) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages.length, isFetchingMore]);

  // Handle infinite scroll (load older messages)
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // If scrolled to top, load more
    if (container.scrollTop === 0 && hasMore && !isFetchingMore) {
      prevScrollHeightRef.current = container.scrollHeight;
      onLoadMore();
    }
  };

  // Maintain scroll position after loading older messages
  useEffect(() => {
    if (isFetchingMore && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollHeightDiff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop = scrollHeightDiff;
    }
  }, [isFetchingMore, messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
        <p className="text-sm text-neutral-500">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500 p-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center mb-4 shadow-sm">
          <MessageCircle className="w-10 h-10 text-teal-600" />
        </div>
        <p className="text-neutral-700 font-semibold text-base">Start a conversation</p>
        <p className="text-sm text-neutral-400 mt-1.5 text-center max-w-[240px]">
          Send us a message and we'll get back to you as soon as possible
        </p>
        <div className="flex items-center gap-1.5 mt-4 text-xs text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Usually replies within minutes</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto p-4 space-y-4"
    >
      {/* Load More Indicator */}
      {isFetchingMore && (
        <div className="flex justify-center py-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500 bg-white px-4 py-2 rounded-full shadow-sm border border-neutral-100">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>Loading earlier messages...</span>
          </div>
        </div>
      )}

      {/* Has More Indicator */}
      {hasMore && !isFetchingMore && (
        <div className="flex justify-center py-2">
          <button
            onClick={onLoadMore}
            className="text-xs text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-full transition-colors"
          >
            Load earlier messages
          </button>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <ChatMessage
          key={message._id}
          message={message}
          isOwnMessage={message.sender?._id === currentUserId}
        />
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
