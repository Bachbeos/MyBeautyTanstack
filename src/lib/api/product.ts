import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  ProductId,
  ProductDto,
  ProductListRequest,
  ProductUpdateRequest,
  ProductListResponse,
  ProductCreateRequest
} from "@/lib/types/product";

export const getProducts = async (
  params: ProductListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<ProductListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<ProductListResponse>>(ENDPOINTS.product.list, {
    params,
    signal
  });
  return res.data;
};

export const getProductDetail = async (
  id: ProductId,
  signal?: AbortSignal
): Promise<ApiResponse<ProductDto>> => {
  const res = await axiosInstance.get<ApiResponse<ProductDto>>(ENDPOINTS.product.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertProduct = async (
  body: ProductUpdateRequest | ProductCreateRequest
): Promise<ApiResponse<ProductDto>> => {
  const res = await axiosInstance.post<ApiResponse<ProductDto>>(ENDPOINTS.product.update, body);
  return res.data;
};

export const deleteProduct = async (id: ProductId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.product.delete(id));
  return res.data;
};
