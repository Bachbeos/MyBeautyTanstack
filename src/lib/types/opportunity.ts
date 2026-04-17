import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type OpportunityId = ID<"Opportunity", number>;
export const OpportunityId = (v: number) => toId<"Opportunity", number>(v);

export type OpportunityStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type OpportunityDto = {
  id: OpportunityId;
  code: string;
  customerId: number;
  customerName: string;
  userId: number | null;
  userName: string | null;
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
  unassignedOnly?: boolean;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type OpportunityListResponse = Page<OpportunityDto>;

export type OpportunityCreateRequest = {
  customerId: number;
  name: string;
  description?: string;
  expectedValue?: number;
  expectedCloseDate?: string;
  userId?: number | null;
  priority?: number;
  status?: number;
};

export type OpportunityUpdateRequest = {
  id: OpportunityId;
  stage?: OpportunityStage;
  status?: number;
};

export type OpportunityKanbanRequest = {
  keyword?: string;
  customerId?: number;
  userId?: number;
  stage?: number;
  stages?: number[];
  priorities?: number[];
  status?: number;
  page?: number;
  limit?: number;
};

export type OpportunityKanbanColumn = {
  stage: OpportunityStage;
  stageName: string;
  count: number;
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
  totalExpectedValue?: number;
  totalWeightedValue?: number;
  items: OpportunityDto[];
};

export type OpportunityKanbanResponse = {
  columns: OpportunityKanbanColumn[];
};

export type StageTransitionMetaResponse = {
  stages: {
    id: OpportunityStage;
    code: string;
    name: string;
  }[];
  rules: {
    toStage: OpportunityStage;
    requiredFields: string[];
  }[];
};

export type OpportunityMoveStageRequest = {
  toStage: OpportunityStage;
  userId?: number;
  expectedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  lastActivityDate?: string;
  actualCloseDate?: string;
  lostReason?: string;
  priority?: number;
  nextActionType?: string;
  nextActionDate?: string;
};

export type OpportunityAutoAssignRequest = {
  opportunityIds?: number[];
  roleId?: number;
  userIds?: number[];
};
