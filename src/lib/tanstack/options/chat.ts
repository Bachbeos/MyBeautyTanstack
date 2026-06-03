import { infiniteQueryOptions, mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  getChatListCursor,
  searchChats,
  getMessageListCursor,
  searchMessages,
  createChat,
  sendMessage,
  editMessage,
  deleteMessage,
  getChatSidebarSummary
} from "@/lib/api/chat";
import { createKeys } from "@/lib/tanstack/query-key";
import type { ApiResponse } from "@/lib/types/common";
import type { ChatView, MessageDto, CursorResult, CreateChatRequest } from "@/lib/types/chat";

const CHAT_LIMIT = 20;
const MESSAGE_LIMIT = 30;

// QUAN TRỌNG: key KHÔNG có limit — nếu có limit thì setQueryData sẽ miss
export const chatKeys = createKeys("chat", {
  listCursor: () => ["list-cursor"] as const,
  search: (kw: string) => ["search", kw] as const,
  messages: (chatId: number) => ["messages", chatId] as const,
  searchMsg: (chatId: number, kw: string) => ["search-msg", chatId, kw] as const
});

export const chatQueries = {
  sidebarSummary: () =>
    queryOptions({
      queryKey: ["chat", "sidebar-summary"] as const,
      queryFn: getChatSidebarSummary,
      staleTime: 15_000
    }),
  listCursor: (limit = CHAT_LIMIT) =>
    infiniteQueryOptions({
      queryKey: chatKeys.listCursor(),
      queryFn: ({ pageParam, signal }: { pageParam: number | undefined; signal: AbortSignal }) =>
        getChatListCursor({ beforeChatId: pageParam, limit }, signal),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (last: ApiResponse<CursorResult<ChatView>>) =>
        last.result?.hasMore ? (last.result.nextCursor ?? undefined) : undefined
    }),

  searchChats: (keyword: string, limit = CHAT_LIMIT) =>
    infiniteQueryOptions({
      queryKey: chatKeys.search(keyword),
      queryFn: ({ pageParam, signal }: { pageParam: number | undefined; signal: AbortSignal }) =>
        searchChats({ keyword, beforeChatId: pageParam, limit }, signal),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (last: ApiResponse<CursorResult<ChatView>>) =>
        last.result?.hasMore ? (last.result.nextCursor ?? undefined) : undefined,
      enabled: keyword.trim().length > 0
    }),

  messages: (chatId: number, limit = MESSAGE_LIMIT) =>
    infiniteQueryOptions({
      queryKey: chatKeys.messages(chatId),
      queryFn: ({ pageParam, signal }: { pageParam: number | undefined; signal: AbortSignal }) =>
        getMessageListCursor({ chatId, beforeMessageId: pageParam, limit }, signal),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (last: ApiResponse<CursorResult<MessageDto>>) =>
        last.result?.hasMore ? (last.result.nextCursor ?? undefined) : undefined,
      enabled: chatId > 0
    }),

  searchMessages: (chatId: number, keyword: string, limit = MESSAGE_LIMIT) =>
    infiniteQueryOptions({
      queryKey: chatKeys.searchMsg(chatId, keyword),
      queryFn: ({ pageParam, signal }: { pageParam: number | undefined; signal: AbortSignal }) =>
        searchMessages({ chatId, keyword, beforeMessageId: pageParam, limit }, signal),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (last: ApiResponse<CursorResult<MessageDto>>) =>
        last.result?.hasMore ? (last.result.nextCursor ?? undefined) : undefined,
      enabled: chatId > 0 && keyword.trim().length > 0
    })
};

export const chatMutations = {
  sendMessage: () =>
    mutationOptions<
      ApiResponse<MessageDto>,
      Error,
      {
        chatId: number;
        content?: string;
        messageType?: number;
        replyToMessageId?: number | null;
        file?: File;
      }
    >({
      mutationKey: ["message", "send"],
      mutationFn: ({ chatId, file, ...rest }) => sendMessage(chatId, rest, file)
    }),

  editMessage: () =>
    mutationOptions<ApiResponse<MessageDto>, Error, { messageId: number; content: string }>({
      mutationKey: ["message", "edit"],
      mutationFn: editMessage
    }),

  deleteMessage: () =>
    mutationOptions<ApiResponse<number>, Error, number>({
      mutationKey: ["message", "delete"],
      mutationFn: deleteMessage
    }),

  createChat: () =>
    mutationOptions<ApiResponse<ChatView>, Error, CreateChatRequest>({
      mutationKey: ["chat", "create"],
      mutationFn: createChat
    })
};
