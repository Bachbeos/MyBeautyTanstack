import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type CustomerSourceId = ID<"CustomerSource", number>;
export const CustomerSourceId = (v: number) => toId<"CustomerSource", number>(v);

export type CustomerSourceDto = {
  id: CustomerSourceId;
  name: string;
  status: number;
  createdTime: string;
  [key: string]: unknown;
};

export type CustomerSourceListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type CustomerSourceListResponse = Page<CustomerSourceDto>;

export type CustomerSourceCreateRequest = {
  name: string;
  status: number;
};

export type CustomerSourceUpdateRequest = {
  id: CustomerSourceId;
  name: string;
  status: number;
};
