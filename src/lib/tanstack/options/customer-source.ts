import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
  type InfiniteData
} from "@tanstack/react-query";
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

export const customerSourceKeys = createKeys("customerSource", {
  list: (params: CustomerSourceListRequest) => ["list", params] as const,
  detail: (id: CustomerSourceId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  infinite: (params: Omit<CustomerSourceListRequest, "page">) => ["infinite", params] as const
});

export const customerSourceQueries = {
  list: (params: CustomerSourceListRequest) =>
    queryOptions<ApiResponse<CustomerSourceListResponse>>({
      queryKey: customerSourceKeys.list(params),
      queryFn: ({ signal }) => getCustomerSources(params, signal)
    }),

  infinite: (params: Omit<CustomerSourceListRequest, "page">) =>
    infiniteQueryOptions<
      ApiResponse<CustomerSourceListResponse>,
      Error,
      InfiniteData<ApiResponse<CustomerSourceListResponse>>,
      ReturnType<typeof customerSourceKeys.infinite>,
      number
    >({
      queryKey: customerSourceKeys.infinite(params),
      initialPageParam: 1,
      queryFn: ({ signal, pageParam }) =>
        getCustomerSources({ ...(params as any), page: pageParam }, signal),
      getNextPageParam: (lastPage, _pages, lastPageParam) => {
        const items = lastPage?.result?.items ?? [];
        const total = lastPage?.result?.total ?? 0;
        const limit = (params as any).limit ?? items.length ?? 0;

        const loadedSoFar = lastPageParam * (limit || 0);
        if (!limit) return items.length > 0 ? lastPageParam + 1 : undefined;

        return loadedSoFar < total ? lastPageParam + 1 : undefined;
      }
    }),

  detail: (id: CustomerSourceId) =>
    queryOptions<ApiResponse<CustomerSourceDto>>({
      queryKey: customerSourceKeys.detail(id),
      queryFn: ({ signal }) => getCustomerSourceDetail(id, signal),
      enabled: !!id
    })
};

export const customerSourceMutations = {
  create: () =>
    mutationOptions<ApiResponse<CustomerSourceDto>, Error, CustomerSourceCreateRequest>({
      mutationKey: customerSourceKeys.create(),
      mutationFn: (body) => upsertCustomerSource(body),
      meta: {
        successMessage: "Tạo nguồn khách hàng thành công",
        invalidatesQuery: [customerSourceKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<CustomerSourceDto>, Error, CustomerSourceUpdateRequest>({
      mutationKey: customerSourceKeys.update(),
      mutationFn: (body) => upsertCustomerSource(body),
      meta: {
        successMessage: "Cập nhật nguồn khách hàng thành công",
        invalidatesQuery: [customerSourceKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, CustomerSourceId>({
      mutationKey: customerSourceKeys.delete(),
      mutationFn: (id) => deleteCustomerSource(id),
      meta: {
        successMessage: "Xóa nguồn khách hàng thành công",
        invalidatesQuery: [customerSourceKeys.list({})]
      }
    })
};
