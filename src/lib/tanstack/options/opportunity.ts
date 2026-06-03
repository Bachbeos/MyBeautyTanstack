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
  deleteOpportunity,
  getOpportunityKanban,
  getOpportunityStageTransitionMeta,
  moveOpportunityStage,
  assignOpportunity,
  autoAssignOpportunity,
  distributeOpportunities
} from "@/lib/api/opportunity";

import type {
  OpportunityId,
  OpportunityDto,
  OpportunityListRequest,
  OpportunityUpdateRequest,
  OpportunityListResponse,
  OpportunityCreateRequest,
  OpportunityKanbanRequest,
  OpportunityKanbanResponse,
  OpportunityMoveStageRequest,
  StageTransitionMetaResponse,
  OpportunityAutoAssignRequest
} from "@/lib/types/opportunity";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const opportunityKeys = createKeys("opportunity", {
  list: (params: OpportunityListRequest) => ["list", params] as const,
  kanban: (params: OpportunityKanbanRequest) => ["kanban", params] as const,
  stageTransitionMeta: () => ["stageTransitionMeta"] as const,
  detail: (id: OpportunityId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  moveStage: () => ["moveStage"] as const,
  assign: () => ["assign"] as const,
  assignAuto: () => ["assignAuto"] as const,
  infinite: (params: Omit<OpportunityListRequest, "page">) => ["infinite", params] as const
});

export const opportunityQueries = {
  list: (params: OpportunityListRequest) =>
    queryOptions<ApiResponse<OpportunityListResponse>>({
      queryKey: opportunityKeys.list(params),
      queryFn: ({ signal }) => getOpportunities(params, signal)
    }),

  kanban: (params: OpportunityKanbanRequest) =>
    queryOptions<ApiResponse<OpportunityKanbanResponse>>({
      queryKey: opportunityKeys.kanban(params),
      queryFn: ({ signal }) => getOpportunityKanban(params, signal),
      placeholderData: (previousData) => previousData
    }),

  stageTransitionMeta: () =>
    queryOptions<ApiResponse<StageTransitionMetaResponse>>({
      queryKey: opportunityKeys.stageTransitionMeta(),
      queryFn: ({ signal }) => getOpportunityStageTransitionMeta(signal),
      staleTime: 1000 * 60 * 10
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
    }),

  moveStage: () =>
    mutationOptions<
      ApiResponse<number>,
      Error,
      { id: OpportunityId; body: OpportunityMoveStageRequest }
    >({
      mutationKey: opportunityKeys.moveStage(),
      mutationFn: ({ id, body }) => moveOpportunityStage(id, body),
      meta: {
        invalidatesQuery: [opportunityKeys.kanban({ status: 1 })]
      }
    }),

  assign: () =>
    mutationOptions<ApiResponse<number>, Error, { id: OpportunityId; userId: number }>({
      mutationKey: opportunityKeys.assign(),
      mutationFn: ({ id, userId }) => assignOpportunity(id, userId),
      meta: {
        successMessage: "Phân công cơ hội thành công",
        invalidatesQuery: [opportunityKeys.list({})]
      }
    }),

  assignAuto: () =>
    mutationOptions<
      ApiResponse<number>,
      Error,
      { id: OpportunityId; body?: OpportunityAutoAssignRequest }
    >({
      mutationKey: opportunityKeys.assignAuto(),
      mutationFn: ({ id, body }) => autoAssignOpportunity(id, body),
      meta: {
        successMessage: "Đã tự động điều phối cơ hội",
        invalidatesQuery: [opportunityKeys.list({})]
      }
    }),

  distribute: () =>
    mutationOptions<ApiResponse<number>, Error, { opportunityIds: number[]; userIds: number[] }>({
      mutationKey: ["opportunity", "distribute"],
      mutationFn: distributeOpportunities,
      meta: {
        successMessage: "Đã chia đều cơ hội cho nhân viên",
        invalidatesQuery: [opportunityKeys.list({})]
      }
    })
};
