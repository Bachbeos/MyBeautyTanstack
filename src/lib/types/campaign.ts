import type { PageMeta } from "./paging";

export type ListCampaignRequest = {
  customerId: number;
} & Partial<PageMeta>;