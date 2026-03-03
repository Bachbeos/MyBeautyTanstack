import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type ResourceId = ID<"Resource", number>;
export const ResourceId = (v: number) => toId<"Resource", number>(v);

export type ResourceDto = {
  id: ResourceId;
  name: string;
  code: string;
  uri: string;
  actions: string;
  description?: string;
  [key: string]: unknown;
};

export type ResourceListRequest = {
  name?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type ResourceListResponse = Page<ResourceDto>;

export type ResourceUpdateRequest = {
  id?: ResourceId;
  name: string;
  code: string;
  uri: string;
  actions: string;
  description?: string;
};
