import { useEffect, useState } from 'react';
import {
  Plus,
  Sparkles,
  MessageCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Shield,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatMessages, useMarkMessagesRead, useSendMessage } from '../../hooks/chat/useChatTan';
import useChatSocket from '../../hooks/chat/useChatSocket';
import useNotificationSocket from '../../hooks/notification/useNotificationSocket';
import useAuthStore from '../../store/authStore';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';

const ChatWindow = ({ chat, onClose, onStartNew }) => {
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
      <div className="shrink-0 bg-white border-b border-gray-100 p-4 shadow-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm text-[#0d9488]">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-base tracking-tight leading-none">Aura Support</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#0d9488] uppercase tracking-wider">Expert Online</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={onStartNew}
              className="p-2 rounded-full text-gray-400 hover:text-[#0d9488] hover:bg-teal-50 transition-all"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-50/30">
        {chat ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ChatMessageList
                messages={allMessages}
                isLoading={isLoading}
                onLoadMore={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                hasMore={hasNextPage}
                isFetchingMore={isFetchingNextPage}
                currentUserId={user?._id}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-white">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 shadow-sm">
              <MessageCircle className="w-10 h-10 text-[#0d9488]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">How can we help today?</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-[240px]">Our experts are ready to assist you in real-time.</p>
            <button
              onClick={onStartNew}
              className="px-8 py-3 bg-[#0d9488] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              Start Conversation <ArrowRight size={18} />
            </button>
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
          <div className="p-4 bg-white border-t border-gray-50">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden focus-within:border-teal-200 transition-all">
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