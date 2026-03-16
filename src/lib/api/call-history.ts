import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  callHistoryId,
  callHistoryDto,
  callHistoryListRequest,
  callHistoryUpdateRequest,
  callHistoryListResponse,
  callHistoryCreateRequest
} from "@/lib/types/call-history";

export const getCallHistorys = async (
  params: callHistoryListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<callHistoryListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<callHistoryListResponse>>(
    ENDPOINTS.callHistory.list,
    {
      params,
      signal
    }
  );
  return res.data;
};

export const getCallHistoryDetail = async (
  id: callHistoryId,
  signal?: AbortSignal
): Promise<ApiResponse<callHistoryDto>> => {
  const res = await axiosInstance.get<ApiResponse<callHistoryDto>>(ENDPOINTS.callHistory.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertCallHistory = async (
  body: callHistoryUpdateRequest | callHistoryCreateRequest
): Promise<ApiResponse<callHistoryDto>> => {
  const res = await axiosInstance.post<ApiResponse<callHistoryDto>>(
    ENDPOINTS.callHistory.update,
    body
  );
  return res.data;
};

export const deleteCallHistory = async (id: callHistoryId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.callHistory.delete(id));
  return res.data;
};
