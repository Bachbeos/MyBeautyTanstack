import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  NotificationId,
  NotificationDto,
  NotificationListRequest,
  NotificationListResponse,
  NotificationUpdateRequest
} from "@/lib/types/notification";

export const getNotifications = async (
  params: NotificationListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<NotificationListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<NotificationListResponse>>(
    ENDPOINTS.notification.list,
    {
      params,
      signal
    }
  );
  return res.data;
};

export const getNotificationDetail = async (
  id: NotificationId,
  signal?: AbortSignal
): Promise<ApiResponse<NotificationDto>> => {
  const res = await axiosInstance.get<ApiResponse<NotificationDto>>(ENDPOINTS.notification.detail, {
    params: { id },
    signal
  });
  return res.data;
};

export const upsertNotification = async (
  body: NotificationUpdateRequest
): Promise<ApiResponse<NotificationDto>> => {
  const res = await axiosInstance.post<ApiResponse<NotificationDto>>(
    ENDPOINTS.notification.update,
    body
  );
  return res.data;
};

export const markNotificationRead = async (id: NotificationId): Promise<ApiResponse<number>> => {
  const res = await axiosInstance.post<ApiResponse<number>>(
    ENDPOINTS.notification.markRead,
    null, // Không có body
    { params: { id, status: 1 } } // Truyền qua query params theo Backend
  );
  return res.data;
};

export const markAllNotificationsRead = async (userId: number): Promise<ApiResponse<number>> => {
  const res = await axiosInstance.post<ApiResponse<number>>(
    ENDPOINTS.notification.markAllRead,
    null,
    { params: { id: userId } }
  );
  return res.data;
};

export const getUnreadNotificationCount = async (signal?: AbortSignal): Promise<ApiResponse<number>> => {
  const res = await axiosInstance.get<ApiResponse<number>>(ENDPOINTS.notification.unreadCount, {
    signal
  });
  return res.data;
};
