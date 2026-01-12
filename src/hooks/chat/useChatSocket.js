import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const useChatSocket = (socket, chatId) => {
  const queryClient = useQueryClient();
  const [typingStatus, setTypingStatus] = useState({ isTyping: false, userRole: null });
  const typingTimeoutRef = useRef(null);

  // Join/leave chat room
  useEffect(() => {
    if (!socket || !chatId) return;

    const roomChatId = chatId.toString();
    socket.emit('chat:join', { chatId: roomChatId });

    return () => {
      socket.emit('chat:leave', { chatId: roomChatId });
    };
  }, [socket, chatId]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (data) => {
      // Refetch messages to get the new message
      queryClient.refetchQueries({ queryKey: ['chats', chatId, 'messages'] });

      // Also update chat lists for unread counts
      queryClient.invalidateQueries({ queryKey: ['chats', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['chats', 'admin', 'all'] });
    };

    const handleTypingStatus = (data) => {
      // Compare as strings to ensure match
      if (data.chatId?.toString() === chatId?.toString()) {
        setTypingStatus({
          isTyping: data.isTyping,
          userRole: data.userRole,
        });

        if (data.isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setTypingStatus({ isTyping: false, userRole: null });
          }, 3000);
        }
      }
    };

    const handleMessagesRead = (data) => {
      if (data.chatId === chatId) {
        // Invalidate messages to update read status
        queryClient.invalidateQueries({ queryKey: ['chats', chatId, 'messages'] });

        // Update chat lists for unread count
        queryClient.invalidateQueries({ queryKey: ['chats', chatId] });
        queryClient.invalidateQueries({ queryKey: ['chats', 'my'] });
        queryClient.invalidateQueries({ queryKey: ['chats', 'admin', 'all'] });
      }
    };

    const handleChatClosed = (data) => {
      if (data.chatId === chatId) {
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }
    };

    const handleChatResolved = (data) => {
      if (data.chatId === chatId) {
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }
    };

    const handleStatusChanged = (data) => {
      if (data.chatId === chatId) {
        // Invalidate chat data to get new status
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.invalidateQueries({ queryKey: ['chats', 'my'] });
        queryClient.invalidateQueries({ queryKey: ['chats', 'admin', 'all'] });
      }
    };

    socket.on('chat:message:new', handleNewMessage);
    socket.on('chat:typing:status', handleTypingStatus);
    socket.on('chat:messages:read', handleMessagesRead);
    socket.on('chat:closed', handleChatClosed);
    socket.on('chat:resolved', handleChatResolved);
    socket.on('chat:status:changed', handleStatusChanged);

    return () => {
      socket.off('chat:message:new', handleNewMessage);
      socket.off('chat:typing:status', handleTypingStatus);
      socket.off('chat:messages:read', handleMessagesRead);
      socket.off('chat:closed', handleChatClosed);
      socket.off('chat:resolved', handleChatResolved);
      socket.off('chat:status:changed', handleStatusChanged);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, chatId, queryClient]);

  const broadcastMessage = useCallback(
    (message) => {
      if (socket && chatId) {
        socket.emit('chat:message', { chatId, message });
      }
    },
    [socket, chatId]
  );

  const sendTypingIndicator = useCallback(
    (isTyping) => {
      if (socket && chatId) {
        socket.emit('chat:typing', { chatId, isTyping });
      }
    },
    [socket, chatId]
  );

  const broadcastRead = useCallback(() => {
    if (socket && chatId) {
      socket.emit('chat:read', { chatId });
    }
  }, [socket, chatId]);

  const broadcastChatClose = useCallback(() => {
    if (socket && chatId) {
      socket.emit('chat:close', { chatId });
    }
  }, [socket, chatId]);

  return {
    typingStatus,
    broadcastMessage,
    sendTypingIndicator,
    broadcastRead,
    broadcastChatClose,
  };
};

export default useChatSocket;
