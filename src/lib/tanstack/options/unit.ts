import { queryOptions, mutationOptions } from "@tanstack/react-query";
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

/**
 * 1. Key Factory (Queries + Mutations)
 */
export const unitKeys = createKeys("unit", {
  list: (params: UnitListRequest) => ["list", params] as const,
  detail: (id: UnitId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

/**
 * 2. Query Options
 */
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
    })
};

/**
 * 3. Mutation Options
 */
export const unitMutations = {
  create: () =>
    mutationOptions<ApiResponse<UnitDto>, Error, UnitCreateRequest>({
      // Using factory for mutationKey
      mutationKey: unitKeys.create(),
      mutationFn: (body) => upsertUnit(body),
      meta: {
        successMessage: "Tạo đơn vị thành công",
        invalidatesQuery: [unitKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<UnitDto>, Error, UnitUpdateRequest>({
      // Using factory for mutationKey
      mutationKey: unitKeys.update(),
      mutationFn: (body) => upsertUnit(body),
      meta: {
        successMessage: "Cập nhật đơn vị thành công",
        invalidatesQuery: [unitKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, UnitId>({
      // Using factory for mutationKey
      mutationKey: unitKeys.delete(),
      mutationFn: (id) => deleteUnit(id),
      meta: {
        successMessage: "Xóa đơn vị thành công",
        invalidatesQuery: [unitKeys.list({})]
      }
    })
};
