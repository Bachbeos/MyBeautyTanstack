import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  PermissionUpdateRequest,
  PermissionInfoRequest,
  PermissionInfoResponse,
  ResourcePermissionDto,
  PermissionCreateRequest
} from "@/lib/types/permission";

export const upsertPermission = async (
  body: PermissionUpdateRequest | PermissionCreateRequest
): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.post<ApiResponse<void>>(ENDPOINTS.permission.upsert, body);
  return res.data;
};

export const removePermission = async (
  body: PermissionUpdateRequest
): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.post<ApiResponse<void>>(ENDPOINTS.permission.delete, body);
  return res.data;
};

export const getPermissionInfo = async (
  params: PermissionInfoRequest,
  signal?: AbortSignal
): Promise<ApiResponse<PermissionInfoResponse>> => {
  const res = await axiosInstance.get<ApiResponse<PermissionInfoResponse>>(
    ENDPOINTS.permission.detail,
    { params, signal }
  );
  return res.data;
};

export const getMyResources = async (
  signal?: AbortSignal
): Promise<ApiResponse<ResourcePermissionDto[]>> => {
  const res = await axiosInstance.get<ApiResponse<ResourcePermissionDto[]>>(
    ENDPOINTS.permission.checkPermission,
    { signal }
  );
  return res.data;
};
