import { queryOptions, mutationOptions } from "@tanstack/react-query";
import {
  getCustomerAttributes,
  getCustomerAttributeDetail,
  upsertCustomerAttribute,
  deleteCustomerAttribute
} from "@/lib/api/customer-attribute";

import type {
  CustomerAttributeId,
  CustomerAttributeDto,
  CustomerAttributeListRequest,
  CustomerAttributeUpdateRequest,
  CustomerAttributeListResponse,
  CustomerAttributeCreateRequest
} from "@/lib/types/customer-attribute";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const customerAttributeKeys = createKeys("customerAttribute", {
  list: (params: CustomerAttributeListRequest) => ["list", params] as const,
  detail: (id: CustomerAttributeId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

export const customerAttributeQueries = {
  list: (params: CustomerAttributeListRequest) =>
    queryOptions<ApiResponse<CustomerAttributeListResponse>>({
      queryKey: customerAttributeKeys.list(params),
      queryFn: ({ signal }) => getCustomerAttributes(params, signal)
    }),

  detail: (id: CustomerAttributeId) =>
    queryOptions<ApiResponse<CustomerAttributeDto>>({
      queryKey: customerAttributeKeys.detail(id),
      queryFn: ({ signal }) => getCustomerAttributeDetail(id, signal),
      enabled: !!id
    })
};

export const customerAttributeMutations = {
  create: () =>
    mutationOptions<ApiResponse<CustomerAttributeDto>, Error, CustomerAttributeCreateRequest>({
      mutationKey: customerAttributeKeys.create(),
      mutationFn: (body) => upsertCustomerAttribute(body),
      meta: {
        successMessage: "Tạo thuộc tính thành công",
        invalidatesQuery: [customerAttributeKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<CustomerAttributeDto>, Error, CustomerAttributeUpdateRequest>({
      mutationKey: customerAttributeKeys.update(),
      mutationFn: (body) => upsertCustomerAttribute(body),
      meta: {
        successMessage: "Cập nhật thuộc tính thành công",
        invalidatesQuery: [customerAttributeKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, CustomerAttributeId>({
      mutationKey: customerAttributeKeys.delete(),
      mutationFn: (id) => deleteCustomerAttribute(id),
      meta: {
        successMessage: "Xóa thuộc tính thành công",
        invalidatesQuery: [customerAttributeKeys.list({})]
      }
    })
};
