import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import * as chatApi from '../../api/chatApi';

export const useStartChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.startChat,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'my'] });
    },
  });
};

export const useMyChats = ({ page = 1, limit = 20, status } = {}, options = {}) => {
  return useQuery({
    queryKey: ['chats', 'my', { page, limit, status }],
    queryFn: () => chatApi.getMyChats({ page, limit, status }),
    ...options,
  });
};

export const useChatDetails = (chatId, options = {}) => {
  return useQuery({
    queryKey: ['chats', chatId],
    queryFn: () => chatApi.getChatDetails(chatId),
    enabled: !!chatId,
    ...options,
  });
};

export const useChatMessages = (chatId, options = {}) => {
  return useInfiniteQuery({
    queryKey: ['chats', chatId, 'messages'],
    queryFn: ({ pageParam = 1 }) =>
      chatApi.getChatMessages({ chatId, page: pageParam, limit: 50 }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.data?.pagination;
      if (!pagination) return undefined;

      const hasMore = pagination.page < pagination.totalPages;
      return hasMore ? pagination.page + 1 : undefined;
    },
    enabled: !!chatId,
    ...options,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data, variables) => {
      const { chatId } = variables;

      queryClient.invalidateQueries({ queryKey: ['chats', chatId, 'messages'] });

      queryClient.invalidateQueries({ queryKey: ['chats', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['chats', 'admin', 'all'] });
    },
  });
};

export const useMarkMessagesRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.markMessagesAsRead,
    onSuccess: (data, chatId) => {
      queryClient.invalidateQueries({ queryKey: ['chats', chatId, 'messages'] });

      queryClient.invalidateQueries({ queryKey: ['chats', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats', 'my'] });
    },
  });
};

export const useCloseChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.closeChat,
    onSuccess: (data, chatId) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useAllChats = ({ page = 1, limit = 20, status, priority, sortBy } = {}, options = {}) => {
  return useQuery({
    queryKey: ['chats', 'admin', 'all', { page, limit, status, priority, sortBy }],
    queryFn: () => chatApi.getAllChats({ page, limit, status, priority, sortBy }),
    ...options,
  });
};

export const useWaitingQueue = (options = {}) => {
  return useQuery({
    queryKey: ['chats', 'admin', 'queue'],
    queryFn: chatApi.getWaitingQueue,
    refetchInterval: 10000, // Auto-refetch every 10 seconds
    ...options,
  });
};

export const useResolveChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.resolveChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useChatStats = (options = {}) => {
  return useQuery({
    queryKey: ['chats', 'admin', 'stats'],
    queryFn: chatApi.getChatStats,
    refetchInterval: 30000, // Auto-refetch every 30 seconds
    ...options,
  });
};
