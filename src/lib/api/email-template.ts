import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  EmailTemplateCreateRequest,
  EmailTemplateDto,
  EmailTemplateId,
  EmailTemplateListRequest,
  EmailTemplateListResponse,
  EmailTemplateUpdateRequest
} from "@/lib/types/email-template";

/* ==============================
        QUERY
   ============================== */

export const getEmailTemplates = async (
  params: EmailTemplateListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<EmailTemplateListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<EmailTemplateListResponse>>(
    ENDPOINTS.emailTemplate.list,
    { params, signal }
  );
  return res.data;
};

export const getEmailTemplateDetail = async (
  id: EmailTemplateId,
  signal?: AbortSignal
): Promise<ApiResponse<EmailTemplateDto>> => {
  const res = await axiosInstance.get<ApiResponse<EmailTemplateDto>>(
    ENDPOINTS.emailTemplate.detail(id),
    { signal }
  );
  return res.data;
};

export const getAllEmailTemplates = async (
  signal?: AbortSignal
): Promise<ApiResponse<EmailTemplateDto[]>> => {
  const res = await axiosInstance.get<ApiResponse<EmailTemplateDto[]>>(
    ENDPOINTS.emailTemplate.all,
    { signal }
  );
  return res.data;
};

/* ==============================
        COMMAND
   ============================== */

export const createEmailTemplate = async (
  body: EmailTemplateCreateRequest
): Promise<ApiResponse<EmailTemplateDto>> => {
  const res = await axiosInstance.post<ApiResponse<EmailTemplateDto>>(
    ENDPOINTS.emailTemplate.create,
    body
  );
  return res.data;
};

export const updateEmailTemplate = async (
  id: EmailTemplateId,
  body: EmailTemplateUpdateRequest
): Promise<ApiResponse<EmailTemplateDto>> => {
  const res = await axiosInstance.put<ApiResponse<EmailTemplateDto>>(
    ENDPOINTS.emailTemplate.update(id),
    body
  );
  return res.data;
};

export const deleteEmailTemplate = async (id: EmailTemplateId): Promise<ApiResponse<number>> => {
  const res = await axiosInstance.delete<ApiResponse<number>>(ENDPOINTS.emailTemplate.delete(id));
  return res.data;
};
