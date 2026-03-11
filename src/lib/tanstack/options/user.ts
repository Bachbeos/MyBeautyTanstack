import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
  type InfiniteData
} from "@tanstack/react-query";
import { getUsers, getUserDetail, upsertUser, deleteUser, updateUserStatus } from "@/lib/api/user";

import type {
  UserId,
  UserDto,
  UserListRequest,
  UserUpdateRequest,
  UserListResponse,
  UserCreateRequest
} from "@/lib/types/user";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

/**
 * 1. Key Factory (Queries + Mutations)
 */
export const userKeys = createKeys("user", {
  list: (params: UserListRequest) => ["list", params] as const,
  detail: (id: UserId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  updateStatus: () => ["updateStatus"] as const,
  infinite: (params: Omit<UserListRequest, "page">) => ["infinite", params] as const
});

/**
 * 2. Query Options
 */
export const userQueries = {
  list: (params: UserListRequest) =>
    queryOptions<ApiResponse<UserListResponse>>({
      queryKey: userKeys.list(params),
      queryFn: ({ signal }) => getUsers(params, signal)
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

/**
 * 3. Mutation Options
 */
export const userMutations = {
  create: () =>
    mutationOptions<ApiResponse<UserDto>, Error, UserCreateRequest>({
      // Using factory for mutationKey
      mutationKey: userKeys.create(),
      mutationFn: (body) => upsertUser(body),
      meta: {
        successMessage: "Tạo người dùng thành công",
        invalidatesQuery: [userKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<UserDto>, Error, UserUpdateRequest>({
      // Using factory for mutationKey
      mutationKey: userKeys.update(),
      mutationFn: (body) => upsertUser(body),
      meta: {
        successMessage: "Cập nhật người dùng thành công",
        invalidatesQuery: [userKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, UserId>({
      // Using factory for mutationKey
      mutationKey: userKeys.delete(),
      mutationFn: (id) => deleteUser(id),
      meta: {
        successMessage: "Xóa người dùng thành công",
        invalidatesQuery: [userKeys.list({})]
      }
    }),

  updateStatus: () =>
    mutationOptions<ApiResponse<void>, Error, { id: UserId; active: number }>({
      // Using factory for mutationKey
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
