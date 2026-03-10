import { queryOptions, mutationOptions } from "@tanstack/react-query";
import {
  getCallHistorys,
  getCallHistoryDetail,
  upsertCallHistory,
  deleteCallHistory
} from "@/lib/api/call-history";

import type {
  callHistoryId,
  callHistoryDto,
  callHistoryListRequest,
  callHistoryUpdateRequest,
  callHistoryListResponse,
  callHistoryCreateRequest
} from "@/lib/types/call-history";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

/**
 * 1. Key Factory (Queries + Mutations)
 */
export const callHistoryKeys = createKeys("callHistory", {
  list: (params: callHistoryListRequest) => ["list", params] as const,
  detail: (id: callHistoryId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

/**
 * 2. Query Options
 */
export const callHistoryQueries = {
  list: (params: callHistoryListRequest) =>
    queryOptions<ApiResponse<callHistoryListResponse>>({
      queryKey: callHistoryKeys.list(params),
      queryFn: ({ signal }) => getCallHistorys(params, signal)
    }),

  detail: (id: callHistoryId) =>
    queryOptions<ApiResponse<callHistoryDto>>({
      queryKey: callHistoryKeys.detail(id),
      queryFn: ({ signal }) => getCallHistoryDetail(id, signal),
      enabled: !!id
    })
};

/**
 * 3. Mutation Options
 */
export const callHistoryMutations = {
  create: () =>
    mutationOptions<ApiResponse<callHistoryDto>, Error, callHistoryCreateRequest>({
      // Using factory for mutationKey
      mutationKey: callHistoryKeys.create(),
      mutationFn: (body) => upsertCallHistory(body),
      meta: {
        successMessage: "Tạo lịch sử cuộc gọi thành công",
        invalidatesQuery: [callHistoryKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<callHistoryDto>, Error, callHistoryUpdateRequest>({
      // Using factory for mutationKey
      mutationKey: callHistoryKeys.update(),
      mutationFn: (body) => upsertCallHistory(body),
      meta: {
        successMessage: "Cập nhật lịch sử cuộc gọi thành công",
        invalidatesQuery: [callHistoryKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, callHistoryId>({
      // Using factory for mutationKey
      mutationKey: callHistoryKeys.delete(),
      mutationFn: (id) => deleteCallHistory(id),
      meta: {
        successMessage: "Xóa lịch sử cuộc gọi thành công",
        invalidatesQuery: [callHistoryKeys.list({})]
      }
    })
};
