import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  CustomerId,
  CustomerDto,
  CustomerListRequest,
  CustomerUpdateRequest,
  CustomerListResponse,
  CustomerCreateRequest
} from "@/lib/types/customer";

export const getCustomers = async (
  params: CustomerListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<CustomerListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<CustomerListResponse>>(ENDPOINTS.customer.list, {
    params,
    signal
  });
  return res.data;
};

export const getCustomerDetail = async (
  id: CustomerId,
  signal?: AbortSignal
): Promise<ApiResponse<CustomerDto>> => {
  const res = await axiosInstance.get<ApiResponse<CustomerDto>>(ENDPOINTS.customer.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertCustomer = async (
  body: CustomerUpdateRequest | CustomerCreateRequest
): Promise<ApiResponse<CustomerDto>> => {
  const res = await axiosInstance.post<ApiResponse<CustomerDto>>(ENDPOINTS.customer.update, body);
  return res.data;
};

export const deleteCustomer = async (id: CustomerId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.customer.delete(id));
  return res.data;
};
