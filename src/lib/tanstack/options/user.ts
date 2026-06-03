import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
  type InfiniteData
} from "@tanstack/react-query";
import {
  getUsers,
  getUserDetail,
  upsertUser,
  deleteUser,
  updateUserStatus,
  getUserInfo,
  updateUserInfo,
  updatePassword
} from "@/lib/api/user";


import type {
  UserId,
  UserDto,
  UserListRequest,
  UserUpdateRequest,
  UserListResponse,
  UserCreateRequest,
  UserInfoUpdateRequest,
  UserUpdatePasswordRequest
} from "@/lib/types/user";

import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const userKeys = createKeys("user", {
  list: (params: UserListRequest) => ["list", params] as const,
  detail: (id: UserId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  info: () => ["info"] as const,
  updateInfo: () => ["update-info"] as const,
  updatePassword: () => ["update-password"] as const,
  updateStatus: () => ["updateStatus"] as const,
  infinite: (params: Omit<UserListRequest, "page">) => ["infinite", params] as const
});

export const userQueries = {
  list: (params: UserListRequest) =>
    queryOptions<ApiResponse<UserListResponse>>({
      queryKey: userKeys.list(params),
      queryFn: ({ signal }) => getUsers(params, signal)
    }),

  info: () =>
    queryOptions<ApiResponse<UserDto>>({
      queryKey: userKeys.info(),
      queryFn: ({ signal }) => getUserInfo(signal),
      staleTime: 5 * 60 * 1000
    }),

  infinite: (params: Omit<UserListRequest, "page">) =>
    infiniteQueryOptions<
      ApiResponse<UserListResponse>,
      Error,
      InfiniteData<ApiResponse<UserListResponse>>,
      ReturnType<typeof userKeys.infinite>,
      number
    >({
      queryKey: userKeys.infinite(params),
      initialPageParam: 1,
      queryFn: ({ signal, pageParam }) => getUsers({ ...(params as any), page: pageParam }, signal),
      getNextPageParam: (lastPage, _pages, lastPageParam) => {
        const items = lastPage?.result?.items ?? [];
        const total = lastPage?.result?.total ?? 0;
        const limit = (params as any).limit ?? items.length ?? 0;

        const loadedSoFar = lastPageParam * (limit || 0);
        if (!limit) return items.length > 0 ? lastPageParam + 1 : undefined;

        return loadedSoFar < total ? lastPageParam + 1 : undefined;
      }
    }),

  detail: (id: UserId) =>
    queryOptions<ApiResponse<UserDto>>({
      queryKey: userKeys.detail(id),
      queryFn: ({ signal }) => getUserDetail(id, signal),
      enabled: !!id
    })
};

export const userMutations = {
  create: () =>
    mutationOptions<ApiResponse<UserDto>, Error, UserCreateRequest>({
      mutationKey: userKeys.create(),
      mutationFn: (body) => upsertUser(body),
      meta: {
        successMessage: "Tạo người dùng thành công",
        invalidatesQuery: [userKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<UserDto>, Error, UserUpdateRequest>({
      mutationKey: userKeys.update(),
      mutationFn: (body) => upsertUser(body),
      meta: {
        successMessage: "Cập nhật người dùng thành công",
        invalidatesQuery: [userKeys.list({})]
      }
    }),

  updateInfo: () =>
    mutationOptions<ApiResponse<UserDto>, Error, UserInfoUpdateRequest>({
      mutationKey: userKeys.updateInfo(),
      mutationFn: (body) => updateUserInfo(body),
      meta: {
        successMessage: "Cập nhật thông tin người dùng thành công",
        invalidatesQuery: [userKeys.info()]
      }
    }),

  updatePassword: () =>
    mutationOptions<ApiResponse<void>, Error, UserUpdatePasswordRequest>({
      mutationKey: userKeys.updatePassword(),
      mutationFn: (body) => updatePassword(body),
      meta: {
        successMessage: "Đổi mật khẩu thành công"
      }
    }),


  delete: () =>
    mutationOptions<ApiResponse<void>, Error, UserId>({
      mutationKey: userKeys.delete(),
      mutationFn: (id) => deleteUser(id),
      meta: {
        successMessage: "Xóa người dùng thành công",
        invalidatesQuery: [userKeys.list({})]
      }
    }),

  updateStatus: () =>
    mutationOptions<ApiResponse<void>, Error, { id: UserId; active: number }>({
      mutationKey: userKeys.updateStatus(),
      mutationFn: ({ id, active }) => {
        return updateUserStatus(id, active);
      },
      meta: {
        successMessage: "Cập nhật trạng thái người dùng thành công",
        invalidatesQuery: [userKeys.list({})]
      }
    })
};
