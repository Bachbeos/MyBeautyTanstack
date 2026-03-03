// @/lib/queries/resource.ts
import { queryOptions, mutationOptions } from "@tanstack/react-query";
import {
  getResources,
  getResourceDetail,
  updateResource,
  deleteResource
} from "@/lib/api/resource";

import type {
  ResourceId,
  ResourceDto,
  ResourceListRequest,
  ResourceUpdateRequest,
  ResourceListResponse
} from "@/lib/types/resource";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

/**
 * 1. Key Factory (Queries + Mutations)
 */
export const resourceKeys = createKeys("resource", {
  list: (params: ResourceListRequest) => ["list", params] as const,
  detail: (id: ResourceId) => ["detail", id] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

/**
 * 2. Query Options
 */
export const resourceQueries = {
  list: (params: ResourceListRequest) =>
    queryOptions<ApiResponse<ResourceListResponse>>({
      queryKey: resourceKeys.list(params),
      queryFn: ({ signal }) => getResources(params, signal)
    }),

  detail: (id: ResourceId) =>
    queryOptions<ApiResponse<ResourceDto>>({
      queryKey: resourceKeys.detail(id),
      queryFn: ({ signal }) => getResourceDetail(id, signal),
      enabled: !!id
    })
};

/**
 * 3. Mutation Options
 */
export const resourceMutations = {
  update: () =>
    mutationOptions<ApiResponse<ResourceDto>, Error, ResourceUpdateRequest>({
      // Using factory for mutationKey
      mutationKey: resourceKeys.update(),
      mutationFn: (body) => updateResource(body),
      meta: {
        successMessage: "Cập nhật tài nguyên thành công"
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, ResourceId>({
      // Using factory for mutationKey
      mutationKey: resourceKeys.delete(),
      mutationFn: (id) => deleteResource(id),
      meta: {
        successMessage: "Xóa tài nguyên thành công"
      }
    })
};
