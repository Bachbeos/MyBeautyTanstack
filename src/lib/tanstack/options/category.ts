import { queryOptions, mutationOptions } from "@tanstack/react-query";
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

/**
 * 1. Key Factory (Queries + Mutations)
 */
export const categoryKeys = createKeys("category", {
  list: (params: CategoryListRequest) => ["list", params] as const,
  detail: (id: CategoryId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

/**
 * 2. Query Options
 */
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
    })
};

/**
 * 3. Mutation Options
 */
export const categoryMutations = {
  create: () =>
    mutationOptions<ApiResponse<CategoryDto>, Error, CategoryCreateRequest>({
      // Using factory for mutationKey
      mutationKey: categoryKeys.create(),
      mutationFn: (body) => upsertCategory(body),
      meta: {
        successMessage: "Tạo danh mục thành công",
        invalidatesQuery: [categoryKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<CategoryDto>, Error, CategoryUpdateRequest>({
      // Using factory for mutationKey
      mutationKey: categoryKeys.update(),
      mutationFn: (body) => upsertCategory(body),
      meta: {
        successMessage: "Cập nhật danh mục thành công",
        invalidatesQuery: [categoryKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, CategoryId>({
      // Using factory for mutationKey
      mutationKey: categoryKeys.delete(),
      mutationFn: (id) => deleteCategory(id),
      meta: {
        successMessage: "Xóa danh mục thành công",
        invalidatesQuery: [categoryKeys.list({})]
      }
    })
};
