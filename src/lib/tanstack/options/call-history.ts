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

export const callHistoryKeys = createKeys("callHistory", {
  list: (params: callHistoryListRequest) => ["list", params] as const,
  detail: (id: callHistoryId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

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

export const callHistoryMutations = {
  create: () =>
    mutationOptions<ApiResponse<callHistoryDto>, Error, callHistoryCreateRequest>({
      mutationKey: callHistoryKeys.create(),
      mutationFn: (body) => upsertCallHistory(body),
      meta: {
        successMessage: "Tạo lịch sử cuộc gọi thành công",
        invalidatesQuery: [callHistoryKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<callHistoryDto>, Error, callHistoryUpdateRequest>({
      mutationKey: callHistoryKeys.update(),
      mutationFn: (body) => upsertCallHistory(body),
      meta: {
        successMessage: "Cập nhật lịch sử cuộc gọi thành công",
        invalidatesQuery: [callHistoryKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, callHistoryId>({
      mutationKey: callHistoryKeys.delete(),
      mutationFn: (id) => deleteCallHistory(id),
      meta: {
        successMessage: "Xóa lịch sử cuộc gọi thành công",
        invalidatesQuery: [callHistoryKeys.list({})]
      }
    })
};
