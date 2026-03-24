import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type InvoiceId = ID<"Invoice", number>;
export const InvoiceId = (v: number) => toId<"Invoice", number>(v);

export type InvoiceDto = {
  id: InvoiceId;
  invoiceCode: string;
  invoiceType: string;
  amount: number;
  discount: number;
  vatAmount: number;
  fee: number;
  amountCard: number;
  paid: number;
  debt: number;
  paymentType: number;
  status: number;
  statusTemp: number;
  receiptImage: string;
  receiptDate: string;
  createdTime: string;
  updatedTime: string;
  userId: number;
  customerId: number;
  branchId: number;
  voucherCode: string;
  customerName: string;
  userName: string;
  [key: string]: unknown;
};

export type InvoiceListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type InvoiceListResponse = Page<InvoiceDto>;

export type InvoiceCreateRequest = {
  invoiceCode: string;
  invoiceType: string;
  amount: number;
  discount: number;
  vatAmount: number;
  fee: number;
  amountCard: number;
  paid: number;
  debt: number;
  paymentType: number;
  status: number;
  statusTemp: number;
  receiptImage: string;
  receiptDate: string;
  createdTime: string;
  updatedTime: string;
  userId: number;
  customerId: number;
  branchId: number;
  voucherCode: string;
  customerName: string;
  userName: string;
};

export type InvoiceUpdateRequest = {
  id: InvoiceId;
  invoiceCode: string;
  invoiceType: string;
  amount: number;
  discount: number;
  vatAmount: number;
  fee: number;
  amountCard: number;
  paid: number;
  debt: number;
  paymentType: number;
  status: number;
  statusTemp: number;
  receiptImage: string;
  receiptDate: string;
  createdTime: string;
  updatedTime: string;
  userId: number;
  customerId: number;
  branchId: number;
  voucherCode: string;
  customerName: string;
  userName: string;
};
