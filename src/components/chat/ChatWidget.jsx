import { useState, useMemo } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyChats, useStartChat } from '../../hooks/chat/useChatTan';
import useAuthStore from '../../store/authStore';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(() => {
    // Only show if not seen before
    return !localStorage.getItem('aura_chat_greeted');
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const { user } = useAuthStore();

  const handleCloseGreeting = () => {
    setShowGreeting(false);
    localStorage.setItem('aura_chat_greeted', 'true');
  };

  const { data: chatsData } = useMyChats(
    { page: 1, limit: 10 },
    { enabled: !!user && user.role !== 'admin', refetchInterval: 5000 }
  );

  const startChatMutation = useStartChat();

  const activeChat = useMemo(() => {
    if (!activeChatId || !chatsData?.data?.chats) return null;
    return chatsData.data.chats.find(chat => chat._id === activeChatId) || null;
  }, [activeChatId, chatsData]);

  const totalUnread = useMemo(() => {
    if (!chatsData?.data?.chats) return 0;
    return chatsData.data.chats.reduce((sum, chat) => sum + (chat.unreadCountCustomer || 0), 0);
  }, [chatsData]);

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (showGreeting) {
        setShowGreeting(false);
        localStorage.setItem('aura_chat_greeted', 'true');
      }
      if (chatsData?.data?.chats?.length > 0) {
        const recentChat = chatsData.data.chats.find(c => c.status === 'active' || c.status === 'waiting');
        if (recentChat) setActiveChatId(recentChat._id);
        else handleStartNewChat();
      } else {
        handleStartNewChat();
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleStartNewChat = () => {
    startChatMutation.mutate(
      { subject: 'Support Request', metadata: { userAgent: navigator.userAgent } },
      { onSuccess: (res) => setActiveChatId(res.data.chat._id) }
    );
  };

  if (user && user.role === 'admin') return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {!isOpen && showGreeting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="mb-4 mr-2 pointer-events-auto"
          >
            <div className="bg-white rounded-[20px] border border-stone-200/60 p-5 w-64 relative">
              {/* Close Button */}
              <button
                onClick={handleCloseGreeting}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center bg-[#F1F3F5] text-stone-500 rounded-full hover:bg-stone-200 transition-colors"
              >
                <X size={12} strokeWidth={3} />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#109383] flex items-center justify-center text-white font-bold text-base border border-teal-600/20">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight">Aura Support</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-tighter">Online</span>
                  </div>
                </div>
              </div>

              <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                Hi there! 👋 Need help finding the perfect furniture? We're here to assist you!
              </p>

              {/* Tooltip Arrow - Flat */}
              <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white border-r border-b border-stone-200/60 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-[calc(100vw-3rem)] h-[calc(100vh-8rem)] md:w-[400px] md:h-[600px] md:max-h-[80vh] bg-white rounded-2xl border border-stone-200/60 overflow-hidden pointer-events-auto"
          >
            <ChatWindow
              chat={activeChat}
              onClose={() => setIsOpen(false)}
              onStartNew={handleStartNewChat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 pointer-events-auto relative z-10 border ${isOpen
          ? 'bg-white text-[#109383] border-stone-200'
          : 'bg-[#109383] text-white border-teal-700/30'
          }`}
      >
        {isOpen ? (
          <X className="w-7 h-7" strokeWidth={2.5} />
        ) : (
          <>
            <MessageSquare className="w-7 h-7 p-0.5" strokeWidth={2.5} />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E13A3E] text-white text-[11px] font-black rounded-full w-6 h-6 flex items-center justify-center ring-2 ring-white z-20">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
