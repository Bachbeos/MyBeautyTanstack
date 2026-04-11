import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  OpportunityId,
  OpportunityDto,
  OpportunityListRequest,
  OpportunityUpdateRequest,
  OpportunityListResponse,
  OpportunityCreateRequest,
  OpportunityKanbanRequest,
  OpportunityKanbanResponse,
  OpportunityMoveStageRequest,
  StageTransitionMetaResponse
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

export const getOpportunityKanban = async (
  params: OpportunityKanbanRequest,
  signal?: AbortSignal
): Promise<ApiResponse<OpportunityKanbanResponse>> => {
  const res = await axiosInstance.get<ApiResponse<OpportunityKanbanResponse>>(
    ENDPOINTS.opportunity.kanban,
    {
      params,
      signal
    }
  );
  return res.data;
};

export const getOpportunityStageTransitionMeta = async (
  signal?: AbortSignal
): Promise<ApiResponse<StageTransitionMetaResponse>> => {
  const res = await axiosInstance.get<ApiResponse<StageTransitionMetaResponse>>(
    ENDPOINTS.opportunity.stageTransitionMeta,
    {
      signal
    }
  );
  return res.data;
};

export const moveOpportunityStage = async (
  id: OpportunityId,
  body: OpportunityMoveStageRequest
): Promise<ApiResponse<number>> => {
  const res = await axiosInstance.post<ApiResponse<number>>(ENDPOINTS.opportunity.moveStage(id), body);
  return res.data;
};

export const assignOpportunity = async (
  id: OpportunityId,
  userId: number
): Promise<ApiResponse<number>> => {
  const res = await axiosInstance.post<ApiResponse<number>>(ENDPOINTS.opportunity.assign(id), null, {
    params: { userId }
  });
  return res.data;
};

export const autoAssignOpportunity = async (id: OpportunityId): Promise<ApiResponse<number>> => {
  const res = await axiosInstance.post<ApiResponse<number>>(ENDPOINTS.opportunity.assignAuto(id));
  return res.data;
};
