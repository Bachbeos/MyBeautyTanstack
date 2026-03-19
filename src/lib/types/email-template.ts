import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

/* ==============================
        ID
   ============================== */

export type EmailTemplateId = ID<"EmailTemplate", number>;
export const EmailTemplateId = (v: number) => toId<"EmailTemplate", number>(v);

/* ==============================
        DTO
   ============================== */

export type EmailTemplateDto = {
  id: EmailTemplateId;
  name: string;
  designJson: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

/* ==============================
        LIST
   ============================== */

export type EmailTemplateListRequest = {
  id?: number;
  name?: string;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type EmailTemplateListResponse = Page<EmailTemplateDto>;

/* ==============================
        COMMAND
   ============================== */

export type EmailTemplateCreateRequest = {
  name: string;
  designJson: string;
};

export type EmailTemplateUpdateRequest = {
  name: string;
  designJson: string;
};
