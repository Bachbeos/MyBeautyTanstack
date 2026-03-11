import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { getVouchers, getVoucherDetail, upsertVoucher, deleteVoucher } from "@/lib/api/voucher";

import type {
  VoucherId,
  VoucherDto,
  VoucherListRequest,
  VoucherUpdateRequest,
  VoucherListResponse,
  VoucherCreateRequest
} from "@/lib/types/voucher";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const voucherKeys = createKeys("voucher", {
  list: (params: VoucherListRequest) => ["list", params] as const,
  detail: (id: VoucherId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

export const voucherQueries = {
  list: (params: VoucherListRequest) =>
    queryOptions<ApiResponse<VoucherListResponse>>({
      queryKey: voucherKeys.list(params),
      queryFn: ({ signal }) => getVouchers(params, signal)
    }),

  detail: (id: VoucherId) =>
    queryOptions<ApiResponse<VoucherDto>>({
      queryKey: voucherKeys.detail(id),
      queryFn: ({ signal }) => getVoucherDetail(id, signal),
      enabled: !!id
    })
};

export const voucherMutations = {
  create: () =>
    mutationOptions<ApiResponse<VoucherDto>, Error, VoucherCreateRequest>({
      mutationKey: voucherKeys.create(),
      mutationFn: (body) => upsertVoucher(body),
      meta: {
        successMessage: "Tạo mã giảm giá thành công",
        invalidatesQuery: [voucherKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<VoucherDto>, Error, VoucherUpdateRequest>({
      mutationKey: voucherKeys.update(),
      mutationFn: (body) => upsertVoucher(body),
      meta: {
        successMessage: "Cập nhật mã giảm giá thành công",
        invalidatesQuery: [voucherKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, VoucherId>({
      mutationKey: voucherKeys.delete(),
      mutationFn: (id) => deleteVoucher(id),
      meta: {
        successMessage: "Xóa mã giảm giá thành công",
        invalidatesQuery: [voucherKeys.list({})]
      }
    })
};
