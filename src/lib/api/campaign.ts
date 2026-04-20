import { axiosInstance } from "../axios/instance";
import type { ListCampaignRequest } from "../types/campaign";
import type { ApiResponse } from "../types/common";
import { ENDPOINTS } from "./endpoints";

export const generateCampaign = async (
  id: number
): Promise<ApiResponse<any>> => {
  const res = await axiosInstance.post<ApiResponse<any>>(
    ENDPOINTS.campaign.generate(id)
  );
  return res.data;
};

export const getCampaignList = async (
  params?: ListCampaignRequest,
  signal?: AbortSignal
): Promise<ApiResponse<any>> => {
  const res = await axiosInstance.get<ApiResponse<any>>(
    ENDPOINTS.campaign.list(),
    {
      params,
      signal
    }
  );
  return res.data;
};