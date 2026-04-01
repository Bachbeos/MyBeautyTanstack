import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  UserId,
  UserDto,
  UserListRequest,
  UserUpdateRequest,
  UserListResponse,
  UserCreateRequest,
  UserInfoUpdateRequest
} from "@/lib/types/user";
import type { CursorResult } from "@/lib/types/chat";

export const getUsers = async (
  params: UserListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<UserListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<UserListResponse>>(ENDPOINTS.user.list, {
    params,
    signal
  });
  return res.data;
};

export const getUserDetail = async (
  id: UserId,
  signal?: AbortSignal
): Promise<ApiResponse<UserDto>> => {
  const res = await axiosInstance.get<ApiResponse<UserDto>>(ENDPOINTS.user.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertUser = async (
  body: UserUpdateRequest | UserCreateRequest
): Promise<ApiResponse<UserDto>> => {
  const res = await axiosInstance.post<ApiResponse<UserDto>>(ENDPOINTS.user.update, body);
  return res.data;
};

export const updateUserInfo = async (
  body: UserInfoUpdateRequest
): Promise<ApiResponse<UserDto>> => {
  const res = await axiosInstance.post<ApiResponse<UserDto>>(ENDPOINTS.user.updateInfo, body);
  return res.data;
};

export const deleteUser = async (id: UserId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.user.delete(id));
  return res.data;
};

export const updateUserStatus = async (id: UserId, active: number): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.post<ApiResponse<void>>(ENDPOINTS.user.updateStatus, null, {
    params: { id, active }
  });
  return res.data;
};

export const getUserInfo = async (signal?: AbortSignal): Promise<ApiResponse<UserDto>> => {
  const res = await axiosInstance.get<ApiResponse<UserDto>>(ENDPOINTS.user.info, { signal });
  return res.data;
};
export const getUserListCursor = (
  params: { beforeUserId?: number; keyword?: string; limit?: number },
  signal?: AbortSignal
): Promise<ApiResponse<CursorResult<UserDto>>> =>
  axiosInstance
    .get<ApiResponse<CursorResult<UserDto>>>(ENDPOINTS.user.listCursor, { params, signal })
    .then((r) => r.data);
