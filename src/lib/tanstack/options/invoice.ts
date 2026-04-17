import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
  type InfiniteData
} from "@tanstack/react-query";
import { getInvoices, getInvoiceDetail, getDraftInvoiceDetail, upsertInvoice, deleteInvoice, deleteDraftInvoice } from "@/lib/api/invoice";

import type {
  InvoiceId,
  InvoiceDto,
  InvoiceListRequest,
  InvoiceUpdateRequest,
  InvoiceListResponse,
  InvoiceCreateRequest
} from "@/lib/types/invoice";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const invoiceKeys = createKeys("invoice", {
  list: (params: InvoiceListRequest) => ["list", params] as const,
  detail: (id: InvoiceId) => ["detail", id] as const,
  draftDetail: (id: InvoiceId) => ["draftDetail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const,
  infinite: (params: Omit<InvoiceListRequest, "page">) => ["infinite", params] as const,
  deleteDraft: () => ["deleteDraft"] as const
});

export const invoiceQueries = {
  list: (params: InvoiceListRequest) =>
    queryOptions<ApiResponse<InvoiceListResponse>>({
      queryKey: invoiceKeys.list(params),
      queryFn: ({ signal }) => getInvoices(params, signal)
    }),

  infinite: (params: Omit<InvoiceListRequest, "page">) =>
    infiniteQueryOptions<
      ApiResponse<InvoiceListResponse>,
      Error,
      InfiniteData<ApiResponse<InvoiceListResponse>>,
      ReturnType<typeof invoiceKeys.infinite>,
      number
    >({
      queryKey: invoiceKeys.infinite(params),
      initialPageParam: 1,
      queryFn: ({ signal, pageParam }) =>
        getInvoices({ ...(params as any), page: pageParam }, signal),
      getNextPageParam: (lastPage, _pages, lastPageParam) => {
        const items = lastPage?.result?.items ?? [];
        const total = lastPage?.result?.total ?? 0;
        const limit = (params as any).limit ?? items.length ?? 0;

        const loadedSoFar = lastPageParam * (limit || 0);
        if (!limit) return items.length > 0 ? lastPageParam + 1 : undefined;

        return loadedSoFar < total ? lastPageParam + 1 : undefined;
      }
    }),

  detail: (id: InvoiceId) =>
    queryOptions<ApiResponse<InvoiceDto>>({
      queryKey: invoiceKeys.detail(id),
      queryFn: ({ signal }) => getInvoiceDetail(id, signal),
      enabled: !!id
    }),

  draftDetail: (id: InvoiceId) =>
    queryOptions<ApiResponse<InvoiceDto>>({
      queryKey: invoiceKeys.draftDetail(id),
      queryFn: ({ signal }) => getDraftInvoiceDetail(id, signal),
      enabled: !!id
    })
};

export const invoiceMutations = {
  create: () =>
    mutationOptions<ApiResponse<InvoiceDto>, Error, InvoiceCreateRequest>({
      mutationKey: invoiceKeys.create(),
      mutationFn: (body) => upsertInvoice(body),
      meta: {
        successMessage: "Tạo hóa đơn thành công",
        invalidatesQuery: [invoiceKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<InvoiceDto>, Error, InvoiceUpdateRequest>({
      mutationKey: invoiceKeys.update(),
      mutationFn: (body) => upsertInvoice(body),
      meta: {
        successMessage: "Cập nhật hóa đơn thành công",
        invalidatesQuery: [invoiceKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, InvoiceId>({
      mutationKey: invoiceKeys.delete(),
      mutationFn: (id) => deleteInvoice(id),
      meta: {
        successMessage: "Xóa hóa đơn thành công",
        invalidatesQuery: [invoiceKeys.list({})]
      }
    }),

  deleteDraft: () =>
    mutationOptions<ApiResponse<void>, Error, InvoiceId>({
      mutationKey: invoiceKeys.deleteDraft(),
      mutationFn: (id) => deleteDraftInvoice(id),
      meta: {
        successMessage: "Xóa hóa đơn nháp thành công",
        invalidatesQuery: [invoiceKeys.list({})]
      }
    })
};
