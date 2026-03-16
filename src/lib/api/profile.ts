import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type { ProfileDto, ProfileUpdateRequest } from "../types/profile";

export const upsertProfile = async (
  body: ProfileUpdateRequest
): Promise<ApiResponse<ProfileDto>> => {
  const res = await axiosInstance.post<ApiResponse<ProfileDto>>(ENDPOINTS.user.info, body);
  return res.data;
};
