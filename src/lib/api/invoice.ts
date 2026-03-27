import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  InvoiceId,
  InvoiceDto,
  InvoiceListRequest,
  InvoiceUpdateRequest,
  InvoiceListResponse,
  InvoiceCreateRequest
} from "@/lib/types/invoice";

export const getInvoices = async (
  params: InvoiceListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<InvoiceListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<InvoiceListResponse>>(ENDPOINTS.invoice.list, {
    params,
    signal
  });
  return res.data;
};

export const getInvoiceDetail = async (
  id: InvoiceId,
  signal?: AbortSignal
): Promise<ApiResponse<InvoiceDto>> => {
  const res = await axiosInstance.get<ApiResponse<InvoiceDto>>(ENDPOINTS.invoice.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertInvoice = async (
  body: InvoiceUpdateRequest | InvoiceCreateRequest
): Promise<ApiResponse<InvoiceDto>> => {
  const res = await axiosInstance.post<ApiResponse<InvoiceDto>>(ENDPOINTS.invoice.update, body);
  return res.data;
};

export const deleteInvoice = async (id: InvoiceId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.invoice.delete(id));
  return res.data;
};

export const createDraftInvoice = async (
  customerId: number,
  signal?: AbortSignal
): Promise<ApiResponse<InvoiceDto>> => {
  const params = { customerId: customerId != 0 ? customerId : undefined };
  const res = await axiosInstance.get<ApiResponse<InvoiceDto>>(ENDPOINTS.invoice.draftCreate, {
    params,
    signal
  });
  return res.data;
};

export const updateDraftInvoice = async (
  body: InvoiceUpdateRequest
): Promise<ApiResponse<InvoiceDto>> => {
  const res = await axiosInstance.post<ApiResponse<InvoiceDto>>(
    ENDPOINTS.invoice.draftUpdate,
    body
  );
  return res.data;
};

export const createInvoice = async (
  body: InvoiceCreateRequest & { voucherId?: number }
): Promise<ApiResponse<InvoiceDto>> => {
  const res = await axiosInstance.post<ApiResponse<InvoiceDto>>(ENDPOINTS.invoice.create, body);
  return res.data;
};
