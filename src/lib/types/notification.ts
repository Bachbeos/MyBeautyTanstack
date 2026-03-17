import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type NotificationId = ID<"Notification", number>;
export const NotificationId = (v: number) => toId<"Notification", number>(v);

export type NotificationDto = {
  id: NotificationId;
  userId: number;
  type: number;
  title: string;
  image: string | null;
  content: string;
  refType: string | null;
  refId: number | null;
  isRead: number;
  createdTime: string;
  [key: string]: unknown;
};

export type NotificationListRequest = {
  isRead?: number;
  type?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type NotificationListResponse = Page<NotificationDto>;

export type NotificationUpdateRequest = {
  id: NotificationId;
  title?: string;
  content?: string;
  image?: string;
  isRead?: number;
};
