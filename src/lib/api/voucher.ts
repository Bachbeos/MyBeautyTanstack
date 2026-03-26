import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  VoucherId,
  VoucherDto,
  VoucherListRequest,
  VoucherUpdateRequest,
  VoucherListResponse,
  VoucherCreateRequest
} from "@/lib/types/voucher";

export const getVouchers = async (
  params: VoucherListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<VoucherListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<VoucherListResponse>>(ENDPOINTS.voucher.list, {
    params,
    signal
  });
  return res.data;
};

export const getVoucherDetail = async (
  id: VoucherId,
  signal?: AbortSignal
): Promise<ApiResponse<VoucherDto>> => {
  const res = await axiosInstance.get<ApiResponse<VoucherDto>>(ENDPOINTS.voucher.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertVoucher = async (
  body: VoucherUpdateRequest | VoucherCreateRequest
): Promise<ApiResponse<VoucherDto>> => {
  const res = await axiosInstance.post<ApiResponse<VoucherDto>>(ENDPOINTS.voucher.update, body);
  return res.data;
};

export const deleteVoucher = async (id: VoucherId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.voucher.delete(id));
  return res.data;
};

export const getVoucherByCode = async (code: string): Promise<ApiResponse<VoucherDto>> => {
  const res = await axiosInstance.get<ApiResponse<VoucherDto>>(ENDPOINTS.voucher.getByCode, {
    params: { code }
  });
  return res.data;
};

export const applyVoucher = async (
  invoiceId: number,
  voucherCode: string
): Promise<ApiResponse<{ discountAmount: number; totalAmount: number; fee: number }>> => {
  const res = await axiosInstance.post<
    ApiResponse<{ discountAmount: number; totalAmount: number; fee: number }>
  >(ENDPOINTS.voucher.apply, null, {
    params: { invoiceId, voucherCode }
  });
  return res.data;
};
