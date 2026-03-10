import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { getProducts, getProductDetail, upsertProduct, deleteProduct } from "@/lib/api/product";

import type {
  ProductId,
  ProductDto,
  ProductListRequest,
  ProductUpdateRequest,
  ProductListResponse,
  ProductCreateRequest
} from "@/lib/types/product";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

/**
 * 1. Key Factory (Queries + Mutations)
 */
export const productKeys = createKeys("product", {
  list: (params: ProductListRequest) => ["list", params] as const,
  detail: (id: ProductId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

/**
 * 2. Query Options
 */
export const productQueries = {
  list: (params: ProductListRequest) =>
    queryOptions<ApiResponse<ProductListResponse>>({
      queryKey: productKeys.list(params),
      queryFn: ({ signal }) => getProducts(params, signal)
    }),

  detail: (id: ProductId) =>
    queryOptions<ApiResponse<ProductDto>>({
      queryKey: productKeys.detail(id),
      queryFn: ({ signal }) => getProductDetail(id, signal),
      enabled: !!id
    })
};

/**
 * 3. Mutation Options
 */
export const productMutations = {
  create: () =>
    mutationOptions<ApiResponse<ProductDto>, Error, ProductCreateRequest>({
      // Using factory for mutationKey
      mutationKey: productKeys.create(),
      mutationFn: (body) => upsertProduct(body),
      meta: {
        successMessage: "Tạo sản phẩm thành công",
        invalidatesQuery: [productKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<ProductDto>, Error, ProductUpdateRequest>({
      // Using factory for mutationKey
      mutationKey: productKeys.update(),
      mutationFn: (body) => upsertProduct(body),
      meta: {
        successMessage: "Cập nhật sản phẩm thành công",
        invalidatesQuery: [productKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, ProductId>({
      // Using factory for mutationKey
      mutationKey: productKeys.delete(),
      mutationFn: (id) => deleteProduct(id),
      meta: {
        successMessage: "Xóa sản phẩm thành công",
        invalidatesQuery: [productKeys.list({})]
      }
    })
};
