import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type { ChatView, MessageDto, CursorResult, CreateChatRequest } from "@/lib/types/chat";

export const getChatListCursor = (
  p: { beforeChatId?: number; limit?: number },
  signal?: AbortSignal
) =>
  axiosInstance
    .get<ApiResponse<CursorResult<ChatView>>>(ENDPOINTS.chat.listCursor, { params: p, signal })
    .then((r) => r.data);

export const searchChats = (
  p: { keyword: string; beforeChatId?: number; limit?: number },
  signal?: AbortSignal
) =>
  axiosInstance
    .get<ApiResponse<CursorResult<ChatView>>>(ENDPOINTS.chat.search, { params: p, signal })
    .then((r) => r.data);

export const createChat = (body: CreateChatRequest) =>
  axiosInstance.post<ApiResponse<ChatView>>(ENDPOINTS.chat.create, body).then((r) => r.data);

export const getMessageListCursor = (
  p: { chatId: number; beforeMessageId?: number; limit?: number },
  signal?: AbortSignal
) =>
  axiosInstance
    .get<ApiResponse<CursorResult<MessageDto>>>(ENDPOINTS.message.listCursor, { params: p, signal })
    .then((r) => r.data);

export const searchMessages = (
  p: { chatId: number; keyword: string; beforeMessageId?: number; limit?: number },
  signal?: AbortSignal
) =>
  axiosInstance
    .get<ApiResponse<CursorResult<MessageDto>>>(ENDPOINTS.message.search, { params: p, signal })
    .then((r) => r.data);

export const sendMessage = (
  chatId: number,
  data: { content?: string; messageType?: number; replyToMessageId?: number | null },
  file?: File
) => {
  const form = new FormData();
  form.append(
    "request",
    new Blob([JSON.stringify({ chatId, ...data })], { type: "application/json" })
  );
  if (file) form.append("file", file);
  return axiosInstance
    .post<ApiResponse<MessageDto>>(ENDPOINTS.message.send, form)
    .then((r) => r.data);
};

export const editMessage = (p: { messageId: number; content: string }) =>
  axiosInstance
    .post<ApiResponse<MessageDto>>(ENDPOINTS.message.edit, null, { params: p })
    .then((r) => r.data);

export const deleteMessage = (messageId: number) =>
  axiosInstance
    .post<ApiResponse<number>>(ENDPOINTS.message.delete, null, { params: { messageId } })
    .then((r) => r.data);
