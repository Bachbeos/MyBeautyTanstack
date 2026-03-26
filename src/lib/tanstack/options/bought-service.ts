import { queryOptions, mutationOptions } from "@tanstack/react-query";
import {
  getBoughtServices,
  upsertBoughtService,
  deleteBoughtService
} from "@/lib/api/bought-service";

import type {
  BoughtServiceId,
  BoughtServiceDto,
  BoughtServiceListRequest,
  BoughtServiceUpdateRequest,
  BoughtServiceListResponse,
  BoughtServiceCreateRequest
} from "@/lib/types/bought-service";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const boughtServiceKeys = createKeys("boughtService", {
  list: (params: BoughtServiceListRequest) => ["list", params] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

export const boughtServiceQueries = {
  list: (params: BoughtServiceListRequest) =>
    queryOptions<ApiResponse<BoughtServiceListResponse>>({
      queryKey: boughtServiceKeys.list(params),
      queryFn: ({ signal }) => getBoughtServices(params, signal)
    })
};

export const boughtServiceMutations = {
  create: () =>
    mutationOptions<ApiResponse<BoughtServiceDto>, Error, BoughtServiceCreateRequest>({
      mutationKey: boughtServiceKeys.create(),
      mutationFn: (body) => upsertBoughtService(body),
      meta: {
        successMessage: "Thêm dịch vụ thành công",
        invalidatesQuery: [boughtServiceKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<BoughtServiceDto>, Error, BoughtServiceUpdateRequest>({
      mutationKey: boughtServiceKeys.update(),
      mutationFn: (body) => upsertBoughtService(body),
      meta: {
        successMessage: "Cập nhật dịch vụ thành công",
        invalidatesQuery: [boughtServiceKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, BoughtServiceId>({
      mutationKey: boughtServiceKeys.delete(),
      mutationFn: (id) => deleteBoughtService(id),
      meta: {
        successMessage: "Xóa dịch vụ thành công",
        invalidatesQuery: [boughtServiceKeys.list({})]
      }
    })
};
