import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  ServiceId,
  ServiceDto,
  ServiceListRequest,
  ServiceUpdateRequest,
  ServiceListResponse,
  ServiceCreateRequest
} from "@/lib/types/service";

export const getServices = async (
  params: ServiceListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<ServiceListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<ServiceListResponse>>(ENDPOINTS.service.list, {
    params,
    signal
  });
  return res.data;
};

export const getServiceDetail = async (
  id: ServiceId,
  signal?: AbortSignal
): Promise<ApiResponse<ServiceDto>> => {
  const res = await axiosInstance.get<ApiResponse<ServiceDto>>(ENDPOINTS.service.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertService = async (
  body: ServiceUpdateRequest | ServiceCreateRequest
): Promise<ApiResponse<ServiceDto>> => {
  const res = await axiosInstance.post<ApiResponse<ServiceDto>>(ENDPOINTS.service.update, body);
  return res.data;
};

export const deleteService = async (id: ServiceId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.service.delete(id));
  return res.data;
};
