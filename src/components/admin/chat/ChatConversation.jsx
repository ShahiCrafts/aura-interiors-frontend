import { useEffect } from "react";
import { User, Mail, Info } from "lucide-react";
import {
  useChatMessages,
  useMarkMessagesRead,
} from "../../../hooks/chat/useChatTan";
import useChatSocket from "../../../hooks/chat/useChatSocket";
import useNotificationSocket from "../../../hooks/notification/useNotificationSocket";
import useAuthStore from "../../../store/authStore";
import ChatMessageList from "../../chat/ChatMessageList";
import ChatInput from "../../chat/ChatInput";
import TypingIndicator from "../../chat/TypingIndicator";

const ChatConversation = ({ chat, onClose, onChatUpdated }) => {
  const { user } = useAuthStore();
  const token = localStorage.getItem("token");
  const { socket } = useNotificationSocket(token, user?._id);

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useChatMessages(chat?._id, { enabled: !!chat });

  const markAsReadMutation = useMarkMessagesRead();
  const { typingStatus, sendTypingIndicator, broadcastRead } = useChatSocket(
    socket,
    chat?._id
  );

  useEffect(() => {
    if (chat?._id && chat?.unreadCountAdmin > 0) {
      markAsReadMutation.mutate(chat._id);
      broadcastRead();
    }
  }, [chat?._id]);

  const allMessages =
    messagesData?.pages.flatMap((page) => page.data.messages) || [];

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="flex-1 overflow-hidden bg-gray-50/30">
        <ChatMessageList
          messages={allMessages}
          isLoading={isLoading}
          onLoadMore={() =>
            hasNextPage && !isFetchingNextPage && fetchNextPage()
          }
          hasMore={hasNextPage}
          isFetchingMore={isFetchingNextPage}
          currentUserId={user?._id}
        />
      </div>

      <div className="shrink-0">
        {typingStatus.isTyping && (
          <div className="px-6 py-2 bg-white/80 backdrop-blur-sm border-t border-gray-100">
            <TypingIndicator isAdmin={typingStatus.userRole === "admin"} />
          </div>
        )}

        {chat.status === "waiting" || chat.status === "active" ? (
          <div className="p-4 bg-white border-t border-gray-100">
            <ChatInput
              chatId={chat._id}
              onTyping={(isTyping) => sendTypingIndicator(isTyping)}
            />
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
              Chat {chat.status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatConversation;
