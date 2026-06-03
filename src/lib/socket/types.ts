export interface MessageReceivedEvent {
  id: number;
  chatId: number;
  chatName?: string | null;
  senderId: number;
  senderName: string;
  content: string | null;
  messageType: number;
  filePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  replyToMessageId: number | null;
  replyToMessageContent: string | null;
  replyToMessageSenderId: number | null;
  replyToMessageType: number | null;
  replyToMessageFilePath: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface NotificationReceivedEvent {
  id: number;
  title: string;
  content: string | null;
  createdTime?: string;
  image?: string | null;
  type?: string | null;
  unreadCount?: number;
}

export interface TypingEvent {
  chatId: number;
  userId: number;
  userName: string;
  typing: boolean;
}

export interface MessageReadEvent {
  chatId: number;
  messageId: number | null;
  userId: number;
}

export interface PaymentDoneEvent {
  invoiceId: number;
}

export interface UserStatusEvent {
  userId: number;
  status: "online" | "offline";
}

export interface UserStatusEvent {
  userId: number;
  status: "online" | "offline";
}
