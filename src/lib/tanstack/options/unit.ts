import {
  queryOptions,
  mutationOptions,
  type InfiniteData,
  infiniteQueryOptions
} from "@tanstack/react-query";
import { getUnits, getUnitDetail, upsertUnit, deleteUnit } from "@/lib/api/unit";

import type {
  UnitId,
  UnitDto,
  UnitListRequest,
  UnitUpdateRequest,
  UnitListResponse,
  UnitCreateRequest
} from "@/lib/types/unit";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const unitKeys = createKeys("unit", {
  list: (params: UnitListRequest) => ["list", params] as const,
  detail: (id: UnitId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  infinite: (params: Omit<UnitListRequest, "page">) => ["infinite", params] as const
});

export const unitQueries = {
  list: (params: UnitListRequest) =>
    queryOptions<ApiResponse<UnitListResponse>>({
      queryKey: unitKeys.list(params),
      queryFn: ({ signal }) => getUnits(params, signal)
    }),

  detail: (id: UnitId) =>
    queryOptions<ApiResponse<UnitDto>>({
      queryKey: unitKeys.detail(id),
      queryFn: ({ signal }) => getUnitDetail(id, signal),
      enabled: !!id
    }),

  infinite: (params: Omit<UnitListRequest, "page">) =>
    infiniteQueryOptions<
      ApiResponse<UnitListResponse>,
      Error,
      InfiniteData<ApiResponse<UnitListResponse>>,
      ReturnType<typeof unitKeys.infinite>,
      number
    >({
      queryKey: unitKeys.infinite(params),
      initialPageParam: 1,
      queryFn: ({ signal, pageParam }) => getUnits({ ...(params as any), page: pageParam }, signal),
      getNextPageParam: (lastPage, _pages, lastPageParam) => {
        const items = lastPage?.result?.items ?? [];
        const total = lastPage?.result?.total ?? 0;
        const limit = (params as any).limit ?? items.length ?? 0;

        const loadedSoFar = lastPageParam * (limit || 0);
        if (!limit) return items.length > 0 ? lastPageParam + 1 : undefined;

        return loadedSoFar < total ? lastPageParam + 1 : undefined;
      }
    })
};

export const unitMutations = {
  create: () =>
    mutationOptions<ApiResponse<UnitDto>, Error, UnitCreateRequest>({
      mutationKey: unitKeys.create(),
      mutationFn: (body) => upsertUnit(body),
      meta: {
        successMessage: "Tạo đơn vị thành công",
        invalidatesQuery: [unitKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<UnitDto>, Error, UnitUpdateRequest>({
      mutationKey: unitKeys.update(),
      mutationFn: (body) => upsertUnit(body),
      meta: {
        successMessage: "Cập nhật đơn vị thành công",
        invalidatesQuery: [unitKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, UnitId>({
      mutationKey: unitKeys.delete(),
      mutationFn: (id) => deleteUnit(id),
      meta: {
        successMessage: "Xóa đơn vị thành công",
        invalidatesQuery: [unitKeys.list({})]
      }
    })
};
