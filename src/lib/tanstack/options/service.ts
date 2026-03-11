import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
  type InfiniteData
} from "@tanstack/react-query";
import { getServices, getServiceDetail, upsertService, deleteService } from "@/lib/api/service";

import type {
  ServiceId,
  ServiceDto,
  ServiceListRequest,
  ServiceUpdateRequest,
  ServiceListResponse,
  ServiceCreateRequest
} from "@/lib/types/service";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

/**
 * 1. Key Factory (Queries + Mutations)
 */
export const serviceKeys = createKeys("service", {
  list: (params: ServiceListRequest) => ["list", params] as const,
  detail: (id: ServiceId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  infinite: (params: Omit<ServiceListRequest, "page">) => ["infinite", params] as const
});

/**
 * 2. Query Options
 */
export const serviceQueries = {
  list: (params: ServiceListRequest) =>
    queryOptions<ApiResponse<ServiceListResponse>>({
      queryKey: serviceKeys.list(params),
      queryFn: ({ signal }) => getServices(params, signal)
    }),

  infinite: (params: Omit<ServiceListRequest, "page">) =>
    infiniteQueryOptions<
      ApiResponse<ServiceListResponse>,
      Error,
      InfiniteData<ApiResponse<ServiceListResponse>>,
      ReturnType<typeof serviceKeys.infinite>,
      number
    >({
      queryKey: serviceKeys.infinite(params),
      initialPageParam: 1,
      queryFn: ({ signal, pageParam }) =>
        getServices({ ...(params as any), page: pageParam }, signal),
      getNextPageParam: (lastPage, _pages, lastPageParam) => {
        const items = lastPage?.result?.items ?? [];
        const total = lastPage?.result?.total ?? 0;
        const limit = (params as any).limit ?? items.length ?? 0;

        const loadedSoFar = lastPageParam * (limit || 0);
        if (!limit) return items.length > 0 ? lastPageParam + 1 : undefined;

        return loadedSoFar < total ? lastPageParam + 1 : undefined;
      }
    }),

  detail: (id: ServiceId) =>
    queryOptions<ApiResponse<ServiceDto>>({
      queryKey: serviceKeys.detail(id),
      queryFn: ({ signal }) => getServiceDetail(id, signal),
      enabled: !!id
    })
};

/**
 * 3. Mutation Options
 */
export const serviceMutations = {
  create: () =>
    mutationOptions<ApiResponse<ServiceDto>, Error, ServiceCreateRequest>({
      // Using factory for mutationKey
      mutationKey: serviceKeys.create(),
      mutationFn: (body) => upsertService(body),
      meta: {
        successMessage: "Tạo dịch vụ thành công",
        invalidatesQuery: [serviceKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<ServiceDto>, Error, ServiceUpdateRequest>({
      // Using factory for mutationKey
      mutationKey: serviceKeys.update(),
      mutationFn: (body) => upsertService(body),
      meta: {
        successMessage: "Cập nhật dịch vụ thành công",
        invalidatesQuery: [serviceKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, ServiceId>({
      // Using factory for mutationKey
      mutationKey: serviceKeys.delete(),
      mutationFn: (id) => deleteService(id),
      meta: {
        successMessage: "Xóa dịch vụ thành công",
        invalidatesQuery: [serviceKeys.list({})]
      }
    })
};
