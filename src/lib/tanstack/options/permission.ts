import { queryOptions, mutationOptions } from "@tanstack/react-query";
import {
  getPermissionInfo,
  getMyResources,
  upsertPermission,
  removePermission
} from "@/lib/api/permission";
import { createKeys } from "@/lib/tanstack/query-key";
import type { ApiResponse } from "@/lib/types/common";
import type {
  PermissionCreateRequest,
  PermissionInfoRequest,
  PermissionInfoResponse,
  PermissionUpdateRequest,
  ResourcePermissionDto
} from "@/lib/types/permission";

export const permissionKeys = createKeys("permission", {
  all: () => [] as const,
  info: (params: PermissionInfoRequest) => ["info", params] as const,
  myResources: () => ["my-resources"] as const,
  add: () => ["add"] as const,
  update: () => ["update"] as const,
  remove: () => ["remove"] as const
});

export const permissionQueries = {
  info: (params: PermissionInfoRequest) =>
    queryOptions<ApiResponse<PermissionInfoResponse>>({
      queryKey: permissionKeys.info(params),
      queryFn: ({ signal }) => getPermissionInfo(params, signal),
      enabled: !!params.roleId
    }),

  myResources: () =>
    queryOptions<ApiResponse<ResourcePermissionDto[]>>({
      queryKey: permissionKeys.myResources(),
      queryFn: ({ signal }) => getMyResources(signal)
    })
};

export const permissionMutations = {
  add: () =>
    mutationOptions<ApiResponse<void>, Error, PermissionCreateRequest>({
      mutationKey: [permissionKeys.add()],
      mutationFn: (body) => upsertPermission(body),
      meta: {
        successMessage: "Cấp quyền thành công",
        invalidatesQuery: [permissionKeys.all()]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<void>, Error, PermissionUpdateRequest>({
      mutationKey: [permissionKeys.update()],
      mutationFn: (body) => upsertPermission(body),
      meta: {
        successMessage: "Cấp quyền thành công",
        invalidatesQuery: [permissionKeys.all()]
      }
    }),

  remove: () =>
    mutationOptions<ApiResponse<void>, Error, PermissionUpdateRequest>({
      mutationKey: [permissionKeys.remove()],
      mutationFn: (body) => removePermission(body),
      meta: {
        successMessage: "Thu hồi quyền thành công",
        invalidatesQuery: [permissionKeys.all()]
      }
    })
};
