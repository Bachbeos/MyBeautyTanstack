import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type VoucherId = ID<"Voucher", number>;
export const VoucherId = (v: number) => toId<"Voucher", number>(v);

export type VoucherDto = {
  id: VoucherId;
  name: string;
  code: string;
  discountType: number;
  discountValue: number;
  maxDiscount: number;
  minInvoiceAmount: number;
  totalQuantity: number;
  usageQuantity: number;
  startDate: string;
  endDate: string;
  status: number;
  perUserLimit: number;
  branchId: number;
  branchName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

export type VoucherListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type VoucherListResponse = Page<VoucherDto>;

export type VoucherCreateRequest = {
  name: string;
  code: string;
  discountType: number;
  discountValue: number;
  maxDiscount: number;
  minInvoiceAmount: number;
  totalQuantity: number;
  usageQuantity: number;
  startDate: string;
  endDate: string;
  status: number;
  perUserLimit: number;
  branchId: number;
  branchName: string;
  description?: string;
};

export type VoucherUpdateRequest = {
  id: VoucherId;
  name: string;
  code: string;
  discountType: number;
  discountValue: number;
  maxDiscount: number;
  minInvoiceAmount: number;
  totalQuantity: number;
  usageQuantity: number;
  startDate: string;
  endDate: string;
  status: number;
  perUserLimit: number;
  branchId: number;
  branchName: string;
  description?: string;
};
