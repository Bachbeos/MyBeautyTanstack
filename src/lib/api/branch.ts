import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  BranchId,
  BranchDto,
  BranchListRequest,
  BranchUpdateRequest,
  BranchListResponse,
  BranchCreateRequest
} from "@/lib/types/branch";

export const getBranchs = async (
  params: BranchListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<BranchListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<BranchListResponse>>(ENDPOINTS.branch.list, {
    params,
    signal
  });
  return res.data;
};

export const getBranchDetail = async (
  id: BranchId,
  signal?: AbortSignal
): Promise<ApiResponse<BranchDto>> => {
  const res = await axiosInstance.get<ApiResponse<BranchDto>>(ENDPOINTS.branch.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertBranch = async (
  body: BranchUpdateRequest | BranchCreateRequest
): Promise<ApiResponse<BranchDto>> => {
  const res = await axiosInstance.post<ApiResponse<BranchDto>>(ENDPOINTS.branch.update, body);
  return res.data;
};

export const deleteBranch = async (id: BranchId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.branch.delete(id));
  return res.data;
};

export const updateBranchStatus = async (
  id: BranchId,
  active: number
): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.post<ApiResponse<void>>(ENDPOINTS.branch.updateStatus, null, {
    params: { id, active }
  });
  return res.data;
};
