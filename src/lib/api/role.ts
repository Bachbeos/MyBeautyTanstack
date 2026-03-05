import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  RoleId,
  RoleDto,
  RoleListRequest,
  RoleUpdateRequest,
  RoleCreateRequest,
  RoleListResponse
} from "@/lib/types/role";

export const getRoles = async (
  params: RoleListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<RoleListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<RoleListResponse>>(ENDPOINTS.role.list, {
    params,
    signal
  });
  return res.data;
};

export const upsertRole = async (
  body: RoleUpdateRequest | RoleCreateRequest
): Promise<ApiResponse<RoleDto>> => {
  const res = await axiosInstance.post<ApiResponse<RoleDto>>(ENDPOINTS.role.upsert, body);
  return res.data;
};

export const deleteRole = async (id: RoleId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.role.delete(id));
  return res.data;
};
