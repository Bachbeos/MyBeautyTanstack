import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  UnitId,
  UnitDto,
  UnitListRequest,
  UnitUpdateRequest,
  UnitListResponse,
  UnitCreateRequest
} from "@/lib/types/unit";

export const getUnits = async (
  params: UnitListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<UnitListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<UnitListResponse>>(ENDPOINTS.unit.list, {
    params,
    signal
  });
  return res.data;
};

export const getUnitDetail = async (
  id: UnitId,
  signal?: AbortSignal
): Promise<ApiResponse<UnitDto>> => {
  const res = await axiosInstance.get<ApiResponse<UnitDto>>(ENDPOINTS.unit.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertUnit = async (
  body: UnitUpdateRequest | UnitCreateRequest
): Promise<ApiResponse<UnitDto>> => {
  const res = await axiosInstance.post<ApiResponse<UnitDto>>(ENDPOINTS.unit.update, body);
  return res.data;
};

export const deleteUnit = async (id: UnitId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.unit.delete(id));
  return res.data;
};
