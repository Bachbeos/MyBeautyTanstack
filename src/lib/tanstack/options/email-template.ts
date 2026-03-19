import {
  createEmailTemplate,
  deleteEmailTemplate,
  updateEmailTemplate
} from "@/lib/api/email-template";
import { createKeys } from "@/lib/tanstack/query-key";

import { mutationOptions } from "@tanstack/react-query";

import {
  getAllEmailTemplates,
  getEmailTemplateDetail,
  getEmailTemplates
} from "@/lib/api/email-template";
import type { ApiResponse } from "@/lib/types/common";

import { queryOptions } from "@tanstack/react-query";
import type {
  EmailTemplateCreateRequest,
  EmailTemplateDto,
  EmailTemplateId,
  EmailTemplateListRequest,
  EmailTemplateListResponse,
  EmailTemplateUpdateRequest
} from "@/lib/types/email-template";

export const emailTemplateKeys = createKeys("email-template", {
  list: (params: EmailTemplateListRequest) => ["list", params] as const,
  detail: (id: EmailTemplateId) => ["detail", id] as const,
  all: () => ["all"] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

export const emailTemplateQueries = {
  list: (params: EmailTemplateListRequest) =>
    queryOptions<ApiResponse<EmailTemplateListResponse>>({
      queryKey: emailTemplateKeys.list(params),
      queryFn: ({ signal }) => getEmailTemplates(params, signal)
    }),

  detail: (id: EmailTemplateId) =>
    queryOptions<ApiResponse<EmailTemplateDto>>({
      queryKey: emailTemplateKeys.detail(id),
      queryFn: ({ signal }) => getEmailTemplateDetail(id, signal),
      enabled: !!id
    }),

  all: () =>
    queryOptions<ApiResponse<EmailTemplateDto[]>>({
      queryKey: emailTemplateKeys.all(),
      queryFn: ({ signal }) => getAllEmailTemplates(signal)
    })
};

export const emailTemplateMutations = {
  create: () =>
    mutationOptions<ApiResponse<EmailTemplateDto>, Error, EmailTemplateCreateRequest>({
      mutationKey: emailTemplateKeys.create(),
      mutationFn: (body) => createEmailTemplate(body),
      meta: {
        successMessage: "Tạo email template thành công",
        invalidatesQuery: [emailTemplateKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<
      ApiResponse<EmailTemplateDto>,
      Error,
      { id: EmailTemplateId; body: EmailTemplateUpdateRequest }
    >({
      mutationKey: emailTemplateKeys.update(),
      mutationFn: ({ id, body }) => updateEmailTemplate(id, body),
      meta: {
        successMessage: "Cập nhật email template thành công",
        invalidatesQuery: [emailTemplateKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<number>, Error, EmailTemplateId>({
      mutationKey: emailTemplateKeys.delete(),
      mutationFn: (id) => deleteEmailTemplate(id),
      meta: {
        successMessage: "Xóa email template thành công",
        invalidatesQuery: [emailTemplateKeys.list({})]
      }
    })
};
