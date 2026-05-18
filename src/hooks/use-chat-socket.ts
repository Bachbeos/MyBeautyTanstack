import { useEffect, useRef } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { initSocket, disconnectSocket } from "@/lib/socket/socket";
import { chatKeys } from "@/lib/tanstack/options/chat";
import { useChatStore } from "@/lib/stores/chat";
import { getChatViewById } from "@/lib/api/chat";
import type { MessageReceivedEvent, MessageReadEvent } from "@/lib/socket/types";
import type { ApiResponse } from "@/lib/types/common";
import type { ChatView, MessageDto, CursorResult } from "@/lib/types/chat";

type ChatCache = InfiniteData<ApiResponse<CursorResult<ChatView>>>;
type MessageCache = InfiniteData<ApiResponse<CursorResult<MessageDto>>>;

export function useChatSocket(userId: number, userName: string) {
  const qc = useQueryClient();
  const activeChatId = useChatStore((s) => s.activeChatId);
  const activeChatIdRef = useRef<number | null>(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    if (!userId || userId <= 0) {
      console.log("[useChatSocket] No userId, skip");
      return;
    }

    console.log("[useChatSocket] Init socket for userId:", userId);
    const socket = initSocket(userId, userName);

    const onMessageReceived = async (event: MessageReceivedEvent) => {
      console.log("[Socket] message_received:", event);

      if (event.senderId !== userId && event.chatId === activeChatIdRef.current) {
        socket.emit("mark_read", { chatId: event.chatId });
      }

      // 1. Prepend vào message list
      qc.setQueryData<MessageCache>(chatKeys.messages(event.chatId), (old) => {
        if (!old) return old;
        // Duplicate check
        if (old.pages.some((p) => p.result?.data.some((m) => m.id === event.id))) return old;

        const newMsg: MessageDto = {
          id: event.id,
          content: event.content,
          senderId: event.senderId,
          chatId: event.chatId,
          messageType: event.messageType,
          filePath: event.filePath,
          fileName: event.fileName,
          fileSize: event.fileSize,
          replyToMessageId: event.replyToMessageId,
          replyToMessageContent: event.replyToMessageContent,
          replyToMessageSenderId: event.replyToMessageSenderId,
          replyToMessageType: event.replyToMessageType,
          replyToMessageFilePath: event.replyToMessageFilePath,
          isReplyMessageEdited: false,
          isReplyMessageDeleted: false,
          isEdited: false,
          isDeleted: false,
          createdAt: event.createdAt,
          updatedAt: event.createdAt
        };

        const [first, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            {
              ...first,
              result: first.result
                ? { ...first.result, data: [newMsg, ...(first.result.data ?? [])] }
                : first.result
            },
            ...rest
          ]
        };
      });

      // 2. Update chat list preview + unread
      // Check if chat exists in current cached pages
      const existingChatCache = qc.getQueryData<ChatCache>(chatKeys.listCursor());
      const chatExistsInCache = existingChatCache?.pages.some((page) =>
        page.result?.data.some((chat) => chat.id === event.chatId)
      );

      if (chatExistsInCache) {
        // Chat exists - update in place
        qc.setQueryData<ChatCache>(chatKeys.listCursor(), (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              result: page.result
                ? {
                    ...page.result,
                    data: page.result.data.map((chat) =>
                      chat.id !== event.chatId
                        ? chat
                        : {
                            ...chat,
                            lastMessageContent: event.content,
                            lastMessageSenderId: event.senderId,
                            lastMessageSenderName: event.senderName,
                            lastMessageType: event.messageType,
                            lastMessageAt: event.createdAt,
                            unreadCount:
                              event.senderId !== userId && event.chatId !== activeChatIdRef.current
                                ? chat.unreadCount + 1
                                : chat.unreadCount
                          }
                    )
                  }
                : page.result
            }))
          };
        });
      } else {
        try {
          const chatView = await getChatViewById(event.chatId);
          if (chatView?.result) {
            const newChat: ChatView = {
              ...chatView.result,
              lastMessageContent: event.content,
              lastMessageSenderId: event.senderId,
              lastMessageSenderName: event.senderName,
              lastMessageType: event.messageType,
              lastMessageAt: event.createdAt,
              unreadCount:
                event.senderId !== userId && event.chatId !== activeChatIdRef.current ? 1 : 0
            };
            qc.setQueryData<ChatCache>(chatKeys.listCursor(), (old) => {
              if (!old) return old;
              const [first, ...rest] = old.pages;
              return {
                ...old,
                pages: [
                  {
                    ...first,
                    result: first.result
                      ? {
                          ...first.result,
                          data: [newChat, ...(first.result.data ?? [])]
                        }
                      : first.result
                  },
                  ...rest
                ]
              };
            });
          }
        } catch (err) {
          console.error("[Socket] Failed to fetch chat view:", err);
        }
      }
    };

    const onMessageRead = ({ chatId, userId: readerId }: MessageReadEvent) => {
      if (readerId !== userId) return;
      qc.setQueryData<ChatCache>(chatKeys.listCursor(), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            result: page.result
              ? {
                  ...page.result,
                  data: page.result.data.map((chat) =>
                    chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
                  )
                }
              : page.result
          }))
        };
      });
    };

    socket.on("message_received", onMessageReceived);
    socket.on("message_read", onMessageRead);

    return () => {
      socket.off("message_received", onMessageReceived);
      socket.off("message_read", onMessageRead);
      disconnectSocket();
    };
  }, [userId]);
}
