import { useEffect, useState } from 'react';
import {
  Plus,
  Sparkles,
  MessageCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Shield,
  X,
  Loader2,
  Zap,
  HelpCircle,
  Truck,
  ShoppingBag,
  RotateCcw,
  Headset
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatMessages, useMarkMessagesRead, useSendMessage } from '../../hooks/chat/useChatTan';
import useChatSocket from '../../hooks/chat/useChatSocket';
import useNotificationSocket from '../../hooks/notification/useNotificationSocket';
import useAuthStore from '../../store/authStore';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';

const ChatWindow = ({ chat, onClose, onStartNew, onResetView, isCreatingChat }) => {
  const { user } = useAuthStore();
  const token = localStorage.getItem('token');
  const { socket } = useNotificationSocket(token, user?._id);

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useChatMessages(chat?._id, { enabled: !!chat });

  const markAsReadMutation = useMarkMessagesRead();
  const sendMessageMutation = useSendMessage();
  const { typingStatus, sendTypingIndicator, broadcastRead } = useChatSocket(socket, chat?._id);

  useEffect(() => {
    if (chat?._id && chat?.unreadCountCustomer > 0) {
      markAsReadMutation.mutate(chat._id);
      broadcastRead();
    }
  }, [chat?._id]);

  const allMessages = messagesData?.pages.flatMap((page) => page.data.messages) || [];

  return (
    <div className="flex flex-col h-full bg-white font-dm-sans overflow-hidden">
      {/* Refined Professional Header - No Gradients */}
      {/* Minimalist Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 p-3 sm:p-4 shadow-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E0F2F1] flex items-center justify-center text-[#009688]">
              {/* Using a Robot icon or similar if available, else standard Shield/Headset */}
              <Headset size={18} sm:size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-sm sm:text-base tracking-tight leading-none">Aura Assistant</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Expert help for your home</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onResetView}
              className="text-sm font-semibold text-[#009688] hover:text-[#00796b] flex items-center gap-1 transition-colors"
            >
              <Plus size={16} /> New Chat
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-50/30">
        {chat ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden relative">
              {allMessages.length > 0 && (
                <ChatMessageList
                  messages={allMessages}
                  isLoading={isLoading}
                  onLoadMore={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                  hasMore={hasNextPage}
                  isFetchingMore={isFetchingNextPage}
                  currentUserId={user?._id}
                />
              )}
              {allMessages.length === 0 && !isLoading && (
                <div className="absolute inset-0 flex flex-col justify-end px-4 pb-0 bg-gray-50/30">
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col items-start space-y-4">
                    {/* Greeting Bubble */}
                    <div className="bg-[#E0F2F1] p-4 rounded-2xl rounded-tl-none max-w-[85%] text-sm text-gray-800 leading-relaxed shadow-sm">
                      Hello! Welcome to Aura Interiors. How can I help you find the perfect piece for your home today? 🛋️
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 pt-2 bg-white/50 backdrop-blur-sm border-t border-gray-100">
                    <h4 className="text-[9px] sm:text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 sm:mb-3">Quick Messages</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Show sofas",
                        "Bedroom furniture",
                        "Best deals",
                        "Track order",
                        "Return Policy",
                        "Speak to agent"
                      ].map((text) => (
                        <button
                          key={text}
                          onClick={() => sendMessageMutation.mutate({ chatId: chat._id, content: text })}
                          className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:border-[#009688] hover:text-[#009688] hover:shadow-sm transition-all text-left truncate"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 bg-white">
            {isCreatingChat ? (
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-[#0d9488] animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Starting conversation...</p>
              </div>
            ) : (
              <div className="w-full max-w-xs">
                <div className="w-full">
                  {/* Greeting Bubble Fallback */}
                  <div className="bg-[#E0F2F1] p-4 rounded-2xl rounded-tl-none text-sm text-gray-800 leading-relaxed shadow-sm mb-6 text-left">
                    Hello! Select a topic below to get started. 👇
                  </div>

                  <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 text-left">Quick Messages</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Show sofas",
                      "Bedroom furniture",
                      "Best deals",
                      "Track order"
                    ].map((text) => (
                      <button
                        key={text}
                        onClick={() => onStartNew(text)}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#009688] hover:text-[#009688] hover:shadow-sm transition-all text-left truncate shadow-sm"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => onStartNew()}
                    className="w-full text-center mt-4 text-xs font-semibold text-gray-400 hover:text-[#009688] transition-colors"
                  >
                    Start a blank conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 bg-white">
        <AnimatePresence>
          {/* FIXED: Capture admin typing status specifically */}
          {typingStatus.isTyping && typingStatus.userRole === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="px-5 pt-3"
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 shadow-xs">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent is typing</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {chat && (chat.status === 'waiting' || chat.status === 'active') && (
          <div className="p-3 sm:p-4 bg-white border-t border-gray-50">
            <div>
              <ChatInput
                chatId={chat._id}
                onTyping={(isTyping) => sendTypingIndicator(isTyping)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;