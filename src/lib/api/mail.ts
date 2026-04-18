import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";

export type SendMailRequest = {
  to: string;
  subject: string;
  html?: string;
  templateId?: number | null;
  variables?: Record<string, string>;
};

export const sendMail = async (body: SendMailRequest): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.post<ApiResponse<void>>(ENDPOINTS.mail.send, body);
  return res.data;
};
