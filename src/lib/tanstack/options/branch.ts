import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
  type InfiniteData
} from "@tanstack/react-query";
import {
  getBranchs,
  getBranchDetail,
  upsertBranch,
  deleteBranch,
  updateBranchStatus
} from "@/lib/api/branch";

import type {
  BranchId,
  BranchDto,
  BranchListRequest,
  BranchUpdateRequest,
  BranchListResponse,
  BranchCreateRequest
} from "@/lib/types/branch";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const branchKeys = createKeys("branch", {
  list: (params: BranchListRequest) => ["list", params] as const,
  detail: (id: BranchId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  updateStatus: () => ["updateStatus"] as const,
  infinite: (params: Omit<BranchListRequest, "page">) => ["infinite", params] as const
});

export const branchQueries = {
  list: (params: BranchListRequest) =>
    queryOptions<ApiResponse<BranchListResponse>>({
      queryKey: branchKeys.list(params),
      queryFn: ({ signal }) => getBranchs(params, signal)
    }),

  infinite: (params: Omit<BranchListRequest, "page">) =>
    infiniteQueryOptions<
      ApiResponse<BranchListResponse>,
      Error,
      InfiniteData<ApiResponse<BranchListResponse>>,
      ReturnType<typeof branchKeys.infinite>,
      number
    >({
      queryKey: branchKeys.infinite(params),
      initialPageParam: 1,
      queryFn: ({ signal, pageParam }) =>
        getBranchs({ ...(params as any), page: pageParam }, signal),
      getNextPageParam: (lastPage, _pages, lastPageParam) => {
        const items = lastPage?.result?.items ?? [];
        const total = lastPage?.result?.total ?? 0;
        const limit = (params as any).limit ?? items.length ?? 0;

        const loadedSoFar = lastPageParam * (limit || 0);
        if (!limit) return items.length > 0 ? lastPageParam + 1 : undefined;

        return loadedSoFar < total ? lastPageParam + 1 : undefined;
      }
    }),

  detail: (id: BranchId) =>
    queryOptions<ApiResponse<BranchDto>>({
      queryKey: branchKeys.detail(id),
      queryFn: ({ signal }) => getBranchDetail(id, signal),
      enabled: !!id
    })
};

export const branchMutations = {
  create: () =>
    mutationOptions<ApiResponse<BranchDto>, Error, BranchCreateRequest>({
      mutationKey: branchKeys.create(),
      mutationFn: (body) => upsertBranch(body),
      meta: {
        successMessage: "Tạo chi nhánh thành công",
        invalidatesQuery: [branchKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<BranchDto>, Error, BranchUpdateRequest>({
      mutationKey: branchKeys.update(),
      mutationFn: (body) => upsertBranch(body),
      meta: {
        successMessage: "Cập nhật chi nhánh thành công",
        invalidatesQuery: [branchKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, BranchId>({
      mutationKey: branchKeys.delete(),
      mutationFn: (id) => deleteBranch(id),
      meta: {
        successMessage: "Xóa chi nhánh thành công",
        invalidatesQuery: [branchKeys.list({})]
      }
    }),

  updateStatus: () =>
    mutationOptions<ApiResponse<void>, Error, { id: BranchId; active: number }>({
      mutationKey: branchKeys.updateStatus(),
      mutationFn: ({ id, active }) => {
        return updateBranchStatus(id, active);
      },
      meta: {
        successMessage: "Cập nhật trạng thái chi nhánh thành công",
        invalidatesQuery: [branchKeys.list({})]
      }
    })
};
