import { queryOptions, mutationOptions } from "@tanstack/react-query";
import {
  getBoughtProducts,
  upsertBoughtProduct,
  deleteBoughtProduct
} from "@/lib/api/bought-product";

import type {
  BoughtProductId,
  BoughtProductDto,
  BoughtProductListRequest,
  BoughtProductUpdateRequest,
  BoughtProductListResponse,
  BoughtProductCreateRequest
} from "@/lib/types/bought-product";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const boughtProductKeys = createKeys("boughtProduct", {
  list: (params: BoughtProductListRequest) => ["list", params] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

export const boughtProductQueries = {
  list: (params: BoughtProductListRequest) =>
    queryOptions<ApiResponse<BoughtProductListResponse>>({
      queryKey: boughtProductKeys.list(params),
      queryFn: ({ signal }) => getBoughtProducts(params, signal)
    })
};

export const boughtProductMutations = {
  create: () =>
    mutationOptions<ApiResponse<BoughtProductDto>, Error, BoughtProductCreateRequest>({
      mutationKey: boughtProductKeys.create(),
      mutationFn: (body) => upsertBoughtProduct(body),
      meta: {
        successMessage: "Thêm sản phẩm thành công",
        invalidatesQuery: [boughtProductKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<BoughtProductDto>, Error, BoughtProductUpdateRequest>({
      mutationKey: boughtProductKeys.update(),
      mutationFn: (body) => upsertBoughtProduct(body),
      meta: {
        successMessage: "Cập nhật sản phẩm thành công",
        invalidatesQuery: [boughtProductKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, BoughtProductId>({
      mutationKey: boughtProductKeys.delete(),
      mutationFn: (id) => deleteBoughtProduct(id),
      meta: {
        successMessage: "Xóa sản phẩm thành công",
        invalidatesQuery: [boughtProductKeys.list({})]
      }
    })
};
