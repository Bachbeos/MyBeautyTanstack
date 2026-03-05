import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { getRoles, upsertRole, deleteRole } from "@/lib/api/role";
import type {
  RoleListRequest,
  RoleId,
  RoleListResponse,
  RoleDto,
  RoleUpdateRequest,
  RoleCreateRequest
} from "@/lib/types/role";
import { createKeys } from "@/lib/tanstack/query-key";
import type { ApiResponse } from "@/lib/types/common";

export const roleKeys = createKeys("role", {
  list: (params: RoleListRequest) => ["list", params] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

export const roleQueries = {
  list: (params: RoleListRequest) =>
    queryOptions<ApiResponse<RoleListResponse>>({
      queryKey: roleKeys.list(params),
      queryFn: ({ signal }) => getRoles(params, signal)
    })
};

export const roleMutations = {
  create: () =>
    mutationOptions<ApiResponse<RoleDto>, Error, RoleCreateRequest>({
      mutationKey: roleKeys.create(),
      mutationFn: (body) => upsertRole(body),
      meta: { successMessage: "Tạo chức vụ thành công", invalidatesQuery: [roleKeys.list({})] }
    }),
  update: () =>
    mutationOptions<ApiResponse<RoleDto>, Error, RoleUpdateRequest>({
      mutationKey: roleKeys.update(),
      mutationFn: (body) => upsertRole(body),
      meta: { successMessage: "Cập nhật chức vụ thành công", invalidatesQuery: [roleKeys.list({})] }
    }),
  delete: () =>
    mutationOptions<ApiResponse<void>, Error, RoleId>({
      mutationKey: roleKeys.delete(),
      mutationFn: (id) => deleteRole(id),
      meta: { successMessage: "Xóa chức vụ thành công", invalidatesQuery: [roleKeys.list({})] }
    })
};
