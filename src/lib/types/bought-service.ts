import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type BoughtServiceId = ID<"BoughtService", number>;
export const BoughtServiceId = (v: number) => toId<"BoughtService", number>(v);

export type BoughtServiceDto = {
  id: BoughtServiceId;
  invoiceId: number;
  serviceId: number;
  qty: number;
  price: number;
  fee: number;
  amount?: number;
  discount?: number;
  variation?: string;
  customerId: number;
  status: number;
  note?: string;
  [key: string]: unknown;
};

export type BoughtServiceListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type BoughtServiceListResponse = Page<BoughtServiceDto>;

export type BoughtServiceCreateRequest = {
  invoiceId: number;
  serviceId: number;
  qty: number;
  price: number;
  fee: number;
  amount?: number;
  discount?: number;
  variation?: string;
  customerId: number;
  status: number;
  note?: string;
};

export type BoughtServiceUpdateRequest = {
  id: BoughtServiceId;
  invoiceId: number;
  serviceId: number;
  qty: number;
  price: number;
  fee: number;
  amount?: number;
  discount?: number;
  variation?: string;
  customerId: number;
  status: number;
  note?: string;
};
