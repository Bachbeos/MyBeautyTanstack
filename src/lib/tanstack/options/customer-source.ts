import { queryOptions, mutationOptions } from "@tanstack/react-query";
import {
  getCustomerSources,
  getCustomerSourceDetail,
  upsertCustomerSource,
  deleteCustomerSource
} from "@/lib/api/customer-source";

import type {
  CustomerSourceId,
  CustomerSourceDto,
  CustomerSourceListRequest,
  CustomerSourceUpdateRequest,
  CustomerSourceListResponse,
  CustomerSourceCreateRequest
} from "@/lib/types/customer-source";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

/**
 * 1. Key Factory (Queries + Mutations)
 */
export const customerSourceKeys = createKeys("customerSource", {
  list: (params: CustomerSourceListRequest) => ["list", params] as const,
  detail: (id: CustomerSourceId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

/**
 * 2. Query Options
 */
export const customerSourceQueries = {
  list: (params: CustomerSourceListRequest) =>
    queryOptions<ApiResponse<CustomerSourceListResponse>>({
      queryKey: customerSourceKeys.list(params),
      queryFn: ({ signal }) => getCustomerSources(params, signal)
    }),

  detail: (id: CustomerSourceId) =>
    queryOptions<ApiResponse<CustomerSourceDto>>({
      queryKey: customerSourceKeys.detail(id),
      queryFn: ({ signal }) => getCustomerSourceDetail(id, signal),
      enabled: !!id
    })
};

/**
 * 3. Mutation Options
 */
export const customerSourceMutations = {
  create: () =>
    mutationOptions<ApiResponse<CustomerSourceDto>, Error, CustomerSourceCreateRequest>({
      // Using factory for mutationKey
      mutationKey: customerSourceKeys.create(),
      mutationFn: (body) => upsertCustomerSource(body),
      meta: {
        successMessage: "Tạo nguồn khách hàng thành công",
        invalidatesQuery: [customerSourceKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<CustomerSourceDto>, Error, CustomerSourceUpdateRequest>({
      // Using factory for mutationKey
      mutationKey: customerSourceKeys.update(),
      mutationFn: (body) => upsertCustomerSource(body),
      meta: {
        successMessage: "Cập nhật nguồn khách hàng thành công",
        invalidatesQuery: [customerSourceKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, CustomerSourceId>({
      // Using factory for mutationKey
      mutationKey: customerSourceKeys.delete(),
      mutationFn: (id) => deleteCustomerSource(id),
      meta: {
        successMessage: "Xóa nguồn khách hàng thành công",
        invalidatesQuery: [customerSourceKeys.list({})]
      }
    })
};
