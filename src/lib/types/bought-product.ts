import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type BoughtProductId = ID<"BoughtProduct", number>;
export const BoughtProductId = (v: number) => toId<"BoughtProduct", number>(v);

export type BoughtProductDto = {
  id: BoughtProductId;
  invoiceId: number;
  productId: number;
  unitId: number;
  qty: number;
  price: number;
  fee: number;
  customerId: number;
  status: number;
  note?: string;
  [key: string]: unknown;
};

export type BoughtProductListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type BoughtProductListResponse = Page<BoughtProductDto>;

export type BoughtProductCreateRequest = {
  invoiceId: number;
  productId: number;
  unitId: number;
  qty: number;
  price: number;
  fee: number;
  customerId: number;
  status: number;
  note?: string;
};

export type BoughtProductUpdateRequest = {
  id: BoughtProductId;
  invoiceId: number;
  productId: number;
  unitId: number;
  qty: number;
  price: number;
  fee: number;
  customerId: number;
  status: number;
  note?: string;
};
