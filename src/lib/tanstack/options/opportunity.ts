import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
  type InfiniteData
} from "@tanstack/react-query";
import {
  getOpportunities,
  getOpportunityDetail,
  upsertOpportunity,
  deleteOpportunity
} from "@/lib/api/opportunity";

import type {
  OpportunityId,
  OpportunityDto,
  OpportunityListRequest,
  OpportunityUpdateRequest,
  OpportunityListResponse,
  OpportunityCreateRequest
} from "@/lib/types/opportunity";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const opportunityKeys = createKeys("opportunity", {
  list: (params: OpportunityListRequest) => ["list", params] as const,
  detail: (id: OpportunityId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  infinite: (params: Omit<OpportunityListRequest, "page">) => ["infinite", params] as const
});

export const opportunityQueries = {
  list: (params: OpportunityListRequest) =>
    queryOptions<ApiResponse<OpportunityListResponse>>({
      queryKey: opportunityKeys.list(params),
      queryFn: ({ signal }) => getOpportunities(params, signal)
    }),

  infinite: (params: Omit<OpportunityListRequest, "page">) =>
    infiniteQueryOptions<
      ApiResponse<OpportunityListResponse>,
      Error,
      InfiniteData<ApiResponse<OpportunityListResponse>>,
      ReturnType<typeof opportunityKeys.infinite>,
      number
    >({
      queryKey: opportunityKeys.infinite(params),
      initialPageParam: 1,
      queryFn: ({ signal, pageParam }) =>
        getOpportunities({ ...(params as any), page: pageParam }, signal),
      getNextPageParam: (lastPage, _pages, lastPageParam) => {
        const items = lastPage?.result?.items ?? [];
        const total = lastPage?.result?.total ?? 0;
        const limit = (params as any).limit ?? items.length ?? 0;

        const loadedSoFar = lastPageParam * (limit || 0);
        if (!limit) return items.length > 0 ? lastPageParam + 1 : undefined;

        return loadedSoFar < total ? lastPageParam + 1 : undefined;
      }
    }),

  detail: (id: OpportunityId) =>
    queryOptions<ApiResponse<OpportunityDto>>({
      queryKey: opportunityKeys.detail(id),
      queryFn: ({ signal }) => getOpportunityDetail(id, signal),
      enabled: !!id
    })
};

export const opportunityMutations = {
  create: () =>
    mutationOptions<ApiResponse<OpportunityDto>, Error, OpportunityCreateRequest>({
      mutationKey: opportunityKeys.create(),
      mutationFn: (body) => upsertOpportunity(body),
      meta: {
        successMessage: "Tạo cơ hội thành công",
        invalidatesQuery: [opportunityKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<OpportunityDto>, Error, OpportunityUpdateRequest>({
      mutationKey: opportunityKeys.update(),
      mutationFn: (body) => upsertOpportunity(body),
      meta: {
        successMessage: "Cập nhật cơ hội thành công",
        invalidatesQuery: [opportunityKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, OpportunityId>({
      mutationKey: opportunityKeys.delete(),
      mutationFn: (id) => deleteOpportunity(id),
      meta: {
        successMessage: "Xóa cơ hội thành công",
        invalidatesQuery: [opportunityKeys.list({})]
      }
    })
};
