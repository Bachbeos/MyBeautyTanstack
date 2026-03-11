import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type callHistoryId = ID<"callHistory", number>;
export const callHistoryId = (v: number) => toId<"callHistory", number>(v);

export type callHistoryDto = {
  id: callHistoryId;
  userId: number;
  userName: string;
  customerId: number;
  customerName: string;
  callType: number;
  outcome: number;
  interestLevel: number;
  duration: number;
  note: string;
  status: number;
  [key: string]: unknown;
};

export type callHistoryListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type callHistoryListResponse = Page<callHistoryDto>;

export type callHistoryCreateRequest = {
  userId: number;
  customerId: number;
  callType: number;
  outcome: number;
  interestLevel: number;
  duration: number;
  note: string;
  status: number;
};

export type callHistoryUpdateRequest = {
  id: callHistoryId;
  userId: number;
  customerId: number;
  callType: number;
  outcome: number;
  interestLevel: number;
  duration: number;
  note: string;
  status: number;
};
