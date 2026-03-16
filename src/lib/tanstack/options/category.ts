import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
  type InfiniteData
} from "@tanstack/react-query";
import {
  getCategorys,
  getCategoryDetail,
  upsertCategory,
  deleteCategory
} from "@/lib/api/category";

import type {
  CategoryId,
  CategoryDto,
  CategoryListRequest,
  CategoryUpdateRequest,
  CategoryListResponse,
  CategoryCreateRequest
} from "@/lib/types/category";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const categoryKeys = createKeys("category", {
  list: (params: CategoryListRequest) => ["list", params] as const,
  detail: (id: CategoryId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  infinite: (params: Omit<CategoryListRequest, "page">) => ["infinite", params] as const
});

export const categoryQueries = {
  list: (params: CategoryListRequest) =>
    queryOptions<ApiResponse<CategoryListResponse>>({
      queryKey: categoryKeys.list(params),
      queryFn: ({ signal }) => getCategorys(params, signal)
    }),

  detail: (id: CategoryId) =>
    queryOptions<ApiResponse<CategoryDto>>({
      queryKey: categoryKeys.detail(id),
      queryFn: ({ signal }) => getCategoryDetail(id, signal),
      enabled: !!id
    }),

  infinite: (params: Omit<CategoryListRequest, "page">) =>
    infiniteQueryOptions<
      ApiResponse<CategoryListResponse>,
      Error,
      InfiniteData<ApiResponse<CategoryListResponse>>,
      ReturnType<typeof categoryKeys.infinite>,
      number
    >({
      queryKey: categoryKeys.infinite(params),
      initialPageParam: 1,
      queryFn: ({ signal, pageParam }) =>
        getCategorys({ ...(params as any), page: pageParam }, signal),
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

export const categoryMutations = {
  create: () =>
    mutationOptions<ApiResponse<CategoryDto>, Error, CategoryCreateRequest>({
      mutationKey: categoryKeys.create(),
      mutationFn: (body) => upsertCategory(body),
      meta: {
        successMessage: "Tạo danh mục thành công",
        invalidatesQuery: [categoryKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<CategoryDto>, Error, CategoryUpdateRequest>({
      mutationKey: categoryKeys.update(),
      mutationFn: (body) => upsertCategory(body),
      meta: {
        successMessage: "Cập nhật danh mục thành công",
        invalidatesQuery: [categoryKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, CategoryId>({
      mutationKey: categoryKeys.delete(),
      mutationFn: (id) => deleteCategory(id),
      meta: {
        successMessage: "Xóa danh mục thành công",
        invalidatesQuery: [categoryKeys.list({})]
      }
    })
};
