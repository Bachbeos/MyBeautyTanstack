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
