import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  ResourceId,
  ResourceDto,
  ResourceListRequest,
  ResourceUpdateRequest,
  ResourceListResponse,
  ResourceCreateRequest
} from "@/lib/types/resource";

export const getResources = async (
  params: ResourceListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<ResourceListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<ResourceListResponse>>(ENDPOINTS.resource.list, {
    params,
    signal
  });
  return res.data;
};

export const getResourceDetail = async (
  id: ResourceId,
  signal?: AbortSignal
): Promise<ApiResponse<ResourceDto>> => {
  const res = await axiosInstance.get<ApiResponse<ResourceDto>>(ENDPOINTS.resource.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertResource = async (
  body: ResourceUpdateRequest | ResourceCreateRequest
): Promise<ApiResponse<ResourceDto>> => {
  const res = await axiosInstance.post<ApiResponse<ResourceDto>>(ENDPOINTS.resource.update, {
    ...body,
    actions: Array.isArray(body.actions) ? JSON.stringify(body.actions) : body.actions
  });
  return res.data;
};

export const deleteResource = async (id: ResourceId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.resource.delete(id));
  return res.data;
};
