import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  OpportunityId,
  OpportunityDto,
  OpportunityListRequest,
  OpportunityUpdateRequest,
  OpportunityListResponse,
  OpportunityCreateRequest
} from "@/lib/types/opportunity";

export const getOpportunities = async (
  params: OpportunityListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<OpportunityListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<OpportunityListResponse>>(
    ENDPOINTS.opportunity.list,
    {
      params,
      signal
    }
  );
  return res.data;
};

export const getOpportunityDetail = async (
  id: OpportunityId,
  signal?: AbortSignal
): Promise<ApiResponse<OpportunityDto>> => {
  const res = await axiosInstance.get<ApiResponse<OpportunityDto>>(ENDPOINTS.opportunity.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertOpportunity = async (
  body: OpportunityUpdateRequest | OpportunityCreateRequest
): Promise<ApiResponse<OpportunityDto>> => {
  const res = await axiosInstance.post<ApiResponse<OpportunityDto>>(
    ENDPOINTS.opportunity.update,
    body
  );
  return res.data;
};

export const deleteOpportunity = async (id: OpportunityId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.opportunity.delete(id));
  return res.data;
};
