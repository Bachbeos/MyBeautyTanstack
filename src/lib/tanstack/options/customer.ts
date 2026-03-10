import { queryOptions, mutationOptions } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomerDetail,
  upsertCustomer,
  deleteCustomer
} from "@/lib/api/customer";

import type {
  CustomerId,
  CustomerDto,
  CustomerListRequest,
  CustomerUpdateRequest,
  CustomerListResponse,
  CustomerCreateRequest
} from "@/lib/types/customer";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

/**
 * 1. Key Factory (Queries + Mutations)
 */
export const customerKeys = createKeys("customer", {
  list: (params: CustomerListRequest) => ["list", params] as const,
  detail: (id: CustomerId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

/**
 * 2. Query Options
 */
export const customerQueries = {
  list: (params: CustomerListRequest) =>
    queryOptions<ApiResponse<CustomerListResponse>>({
      queryKey: customerKeys.list(params),
      queryFn: ({ signal }) => getCustomers(params, signal)
    }),

  detail: (id: CustomerId) =>
    queryOptions<ApiResponse<CustomerDto>>({
      queryKey: customerKeys.detail(id),
      queryFn: ({ signal }) => getCustomerDetail(id, signal),
      enabled: !!id
    })
};

/**
 * 3. Mutation Options
 */
export const customerMutations = {
  create: () =>
    mutationOptions<ApiResponse<CustomerDto>, Error, CustomerCreateRequest>({
      // Using factory for mutationKey
      mutationKey: customerKeys.create(),
      mutationFn: (body) => upsertCustomer(body),
      meta: {
        successMessage: "Tạo khách hàng thành công",
        invalidatesQuery: [customerKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<CustomerDto>, Error, CustomerUpdateRequest>({
      // Using factory for mutationKey
      mutationKey: customerKeys.update(),
      mutationFn: (body) => upsertCustomer(body),
      meta: {
        successMessage: "Cập nhật khách hàng thành công",
        invalidatesQuery: [customerKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, CustomerId>({
      // Using factory for mutationKey
      mutationKey: customerKeys.delete(),
      mutationFn: (id) => deleteCustomer(id),
      meta: {
        successMessage: "Xóa khách hàng thành công",
        invalidatesQuery: [customerKeys.list({})]
      }
    })
};
