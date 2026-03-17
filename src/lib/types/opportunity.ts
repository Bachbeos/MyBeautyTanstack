import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type OpportunityId = ID<"Opportunity", number>;
export const OpportunityId = (v: number) => toId<"Opportunity", number>(v);

export type OpportunityStage = 1 | 2 | 3 | 4 | 5;

export type OpportunityDto = {
  id: OpportunityId;
  code: string;
  customerId: number;
  customerName: string;
  userId: number;
  userName: string;
  branchId: number;
  creatorId: number;
  name: string;
  description?: string;
  expectedValue?: number;
  probability: number;
  stage: OpportunityStage;
  status: number;
  expectedCloseDate?: string;
  createdTime: string;
  updatedTime: string;
};

export type OpportunityListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type OpportunityListResponse = Page<OpportunityDto>;

export type OpportunityCreateRequest = {
  customerId: number;
  name: string;
  description?: string;
  expectedValue?: number;
  expectedCloseDate?: string;
  userId?: number;
};

export type OpportunityUpdateRequest = {
  id: OpportunityId;
  stage?: OpportunityStage;
  status?: number;
};
