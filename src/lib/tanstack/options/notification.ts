import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
  type InfiniteData
} from "@tanstack/react-query";
import {
  getNotifications,
  getNotificationDetail,
  upsertNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  deleteNotification
} from "@/lib/api/notification";

import type {
  NotificationId,
  NotificationDto,
  NotificationListRequest,
  NotificationUpdateRequest,
  NotificationListResponse
} from "@/lib/types/notification";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const notificationKeys = createKeys("notification", {
  list: (params: NotificationListRequest) => ["list", params] as const,
  detail: (id: NotificationId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  markRead: () => ["markRead"] as const,
  markAllRead: () => ["markAllRead"] as const,
  delete: () => ["delete"] as const,
  infinite: (params: Omit<NotificationListRequest, "page">) => ["infinite", params] as const
});

export const notificationQueries = {
  list: (params: NotificationListRequest) =>
    queryOptions<ApiResponse<NotificationListResponse>>({
      queryKey: notificationKeys.list(params),
      queryFn: ({ signal }) => getNotifications(params, signal)
    }),

  infinite: (params: Omit<NotificationListRequest, "page">) =>
    infiniteQueryOptions<
      ApiResponse<NotificationListResponse>,
      Error,
      InfiniteData<ApiResponse<NotificationListResponse>>,
      ReturnType<typeof notificationKeys.infinite>,
      number
    >({
      queryKey: notificationKeys.infinite(params),
      initialPageParam: 1,
      queryFn: ({ signal, pageParam }) => getNotifications({ ...params, page: pageParam }, signal),
      getNextPageParam: (lastPage, _pages, lastPageParam) => {
        const items = lastPage?.result?.items ?? [];
        const total = lastPage?.result?.total ?? 0;
        const limit = (params as any).limit ?? items.length ?? 20;

        const loadedSoFar = lastPageParam * limit;
        return loadedSoFar < total ? lastPageParam + 1 : undefined;
      },
      staleTime: Infinity
    }),

  detail: (id: NotificationId) =>
    queryOptions<ApiResponse<NotificationDto>>({
      queryKey: notificationKeys.detail(id),
      queryFn: ({ signal }) => getNotificationDetail(id, signal),
      enabled: !!id
    }),

  unreadCount: () =>
    queryOptions<ApiResponse<number>>({
      queryKey: ["notification", "unreadCount"],
      queryFn: ({ signal }) => getUnreadNotificationCount(signal)
    })
};

export const notificationMutations = {
  upsert: () =>
    mutationOptions<ApiResponse<NotificationDto>, Error, NotificationUpdateRequest>({
      mutationKey: notificationKeys.update(),
      mutationFn: (body) => upsertNotification(body),
      meta: {
        successMessage: "Cập nhật thông báo thành công",
        invalidatesQuery: [notificationKeys.list({})]
      }
    }),

  markRead: () =>
    mutationOptions<ApiResponse<number>, Error, NotificationId>({
      mutationKey: notificationKeys.markRead(),
      mutationFn: (id) => markNotificationRead(id),
      meta: {
        invalidatesQuery: [notificationKeys.list({}), notificationKeys.infinite({})]
      }
    }),

  markAllRead: () =>
    mutationOptions<ApiResponse<number>, Error, number>({
      mutationKey: notificationKeys.markAllRead(),
      mutationFn: (userId) => markAllNotificationsRead(userId),
      meta: {
        successMessage: "Đã đánh dấu tất cả là đã đọc",
        invalidatesQuery: [notificationKeys.list({}), notificationKeys.infinite({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<number>, Error, NotificationId>({
      mutationKey: notificationKeys.delete(),
      mutationFn: (id) => deleteNotification(id),
      meta: {
        successMessage: "Đã xóa thông báo",
        invalidatesQuery: [notificationKeys.list({}), notificationKeys.infinite({})]
      }
    })
};
