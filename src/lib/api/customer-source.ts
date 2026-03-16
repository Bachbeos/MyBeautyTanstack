import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  CustomerSourceId,
  CustomerSourceDto,
  CustomerSourceListRequest,
  CustomerSourceUpdateRequest,
  CustomerSourceListResponse,
  CustomerSourceCreateRequest
} from "@/lib/types/customer-source";

export const getCustomerSources = async (
  params: CustomerSourceListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<CustomerSourceListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<CustomerSourceListResponse>>(
    ENDPOINTS.customerSource.list,
    {
      params,
      signal
    }
  );
  return res.data;
};

export const getCustomerSourceDetail = async (
  id: CustomerSourceId,
  signal?: AbortSignal
): Promise<ApiResponse<CustomerSourceDto>> => {
  const res = await axiosInstance.get<ApiResponse<CustomerSourceDto>>(
    ENDPOINTS.customerSource.detail,
    {
      params: { id: id },
      signal
    }
  );
  return res.data;
};

export const upsertCustomerSource = async (
  body: CustomerSourceUpdateRequest | CustomerSourceCreateRequest
): Promise<ApiResponse<CustomerSourceDto>> => {
  const res = await axiosInstance.post<ApiResponse<CustomerSourceDto>>(
    ENDPOINTS.customerSource.update,
    body
  );
  return res.data;
};

export const deleteCustomerSource = async (id: CustomerSourceId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.customerSource.delete(id));
  return res.data;
};
