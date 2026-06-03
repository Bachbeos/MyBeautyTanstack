export interface ChatView {
  id: number;
  chatName: string;
  chatAvatar: string | null;
  isGroupChat: boolean;
  lastMessageId: number | null;
  lastMessageContent: string | null;
  lastMessageSenderId: number | null;
  lastMessageSenderName: string | null;
  lastMessageType: number | null;
  lastMessageAt: string | null;
  unreadCount: number;
  otherUserId?: number | null;
  isOnline?: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDto {
  id: number;
  content: string | null;
  senderId: number;
  chatId: number;
  messageType: number;
  filePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  replyToMessageId: number | null;
  replyToMessageContent: string | null;
  replyToMessageFilePath: string | null;
  replyToMessageType: number | null;
  replyToMessageSenderId: number | null;
  isReplyMessageEdited: boolean;
  isReplyMessageDeleted: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CursorResult<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface CreateChatRequest {
  isGroupChat: boolean;
  groupChatName?: string;
  memberIds: number[];
}
