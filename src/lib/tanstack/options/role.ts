import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { getRoles, deleteRole, upsertRole } from "@/lib/api/role";
import { createKeys } from "@/lib/tanstack/query-key";
import type { ApiResponse } from "@/lib/types/common";
import type {
  RoleId,
  RoleDto,
  RoleListRequest,
  RoleUpdateRequest,
  RoleCreateRequest,
  RoleListResponse
} from "@/lib/types/role";

/**
 * 1. Key Factory
 */
export const roleKeys = createKeys("role", {
  all: () => ["all"] as const,
  list: (params: RoleListRequest) => ["list", params] as const,
  mutation: () => ["mutation"] as const
});

/**
 * 2. Query Options
 */
export const roleQueries = {
  list: (params: RoleListRequest) =>
    queryOptions<ApiResponse<RoleListResponse>>({
      queryKey: roleKeys.list(params),
      queryFn: ({ signal }) => getRoles(params, signal)
    })
};

/**
 * 3. Mutation Options
 */
export const roleMutations = {
  create: () =>
    mutationOptions<ApiResponse<RoleDto>, Error, RoleCreateRequest>({
      mutationKey: [...roleKeys.mutation(), "create"],
      mutationFn: (body) => upsertRole(body),
      meta: {
        successMessage: "Tạo vai trò thành công",
        invalidatesQuery: [roleKeys.list({})]
      }
    }),

  update: (id: RoleId) =>
    mutationOptions<ApiResponse<RoleDto>, Error, RoleUpdateRequest>({
      mutationKey: [...roleKeys.mutation(), "update", id],
      mutationFn: (body) => upsertRole(body),
      meta: {
        successMessage: "Cập nhật vai trò thành công",
        invalidatesQuery: [roleKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, RoleId>({
      mutationKey: [...roleKeys.mutation(), "delete"],
      mutationFn: (id) => deleteRole(id),
      meta: {
        successMessage: "Xóa vai trò thành công",
        invalidatesQuery: [roleKeys.list({})]
      }
    })
};
