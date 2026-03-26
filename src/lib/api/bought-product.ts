import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  BoughtProductId,
  BoughtProductDto,
  BoughtProductListRequest,
  BoughtProductUpdateRequest,
  BoughtProductListResponse,
  BoughtProductCreateRequest
} from "@/lib/types/bought-product";

export const getBoughtProducts = async (
  params: BoughtProductListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<BoughtProductListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<BoughtProductListResponse>>(
    ENDPOINTS.boughtProduct.list,
    {
      params,
      signal
    }
  );
  return res.data;
};

export const upsertBoughtProduct = async (
  body: BoughtProductUpdateRequest | BoughtProductCreateRequest
): Promise<ApiResponse<BoughtProductDto>> => {
  const res = await axiosInstance.post<ApiResponse<BoughtProductDto>>(
    ENDPOINTS.boughtProduct.update,
    body
  );
  return res.data;
};

export const batchUpsertBoughtProducts = async (
  body: BoughtProductCreateRequest[]
): Promise<ApiResponse<BoughtProductDto[]>> => {
  const res = await axiosInstance.post<ApiResponse<BoughtProductDto[]>>(
    ENDPOINTS.boughtProduct.batch,
    body
  );
  return res.data;
};

export const deleteBoughtProduct = async (id: BoughtProductId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.boughtProduct.delete(id));
  return res.data;
};
