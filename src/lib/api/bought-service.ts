import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  BoughtServiceId,
  BoughtServiceDto,
  BoughtServiceListRequest,
  BoughtServiceUpdateRequest,
  BoughtServiceListResponse,
  BoughtServiceCreateRequest
} from "@/lib/types/bought-service";

export const getBoughtServices = async (
  params: BoughtServiceListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<BoughtServiceListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<BoughtServiceListResponse>>(
    ENDPOINTS.boughtService.list,
    {
      params,
      signal
    }
  );
  return res.data;
};

export const upsertBoughtService = async (
  body: BoughtServiceUpdateRequest | BoughtServiceCreateRequest
): Promise<ApiResponse<BoughtServiceDto>> => {
  const res = await axiosInstance.post<ApiResponse<BoughtServiceDto>>(
    ENDPOINTS.boughtService.update,
    body
  );
  return res.data;
};

export const batchUpsertBoughtServices = async (
  body: (BoughtServiceCreateRequest | BoughtServiceUpdateRequest)[]
): Promise<ApiResponse<BoughtServiceDto[]>> => {
  const res = await axiosInstance.post<ApiResponse<BoughtServiceDto[]>>(
    ENDPOINTS.boughtService.batch,
    body
  );
  return res.data;
};

export const deleteBoughtService = async (id: BoughtServiceId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.boughtService.delete(id));
  return res.data;
};
