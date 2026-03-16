import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  CustomerAttributeId,
  CustomerAttributeDto,
  CustomerAttributeListRequest,
  CustomerAttributeUpdateRequest,
  CustomerAttributeListResponse,
  CustomerAttributeCreateRequest
} from "@/lib/types/customer-attribute";

export const getCustomerAttributes = async (
  params: CustomerAttributeListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<CustomerAttributeListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<CustomerAttributeListResponse>>(
    ENDPOINTS.customerAttribute.list,
    {
      params,
      signal
    }
  );
  return res.data;
};

export const getCustomerAttributeDetail = async (
  id: CustomerAttributeId,
  signal?: AbortSignal
): Promise<ApiResponse<CustomerAttributeDto>> => {
  const res = await axiosInstance.get<ApiResponse<CustomerAttributeDto>>(
    ENDPOINTS.customerAttribute.detail,
    {
      params: { id: id },
      signal
    }
  );
  return res.data;
};

export const upsertCustomerAttribute = async (
  body: CustomerAttributeUpdateRequest | CustomerAttributeCreateRequest
): Promise<ApiResponse<CustomerAttributeDto>> => {
  const res = await axiosInstance.post<ApiResponse<CustomerAttributeDto>>(
    ENDPOINTS.customerAttribute.update,
    body
  );
  return res.data;
};

export const deleteCustomerAttribute = async (
  id: CustomerAttributeId
): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.customerAttribute.delete(id));
  return res.data;
};
