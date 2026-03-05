import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  CategoryId,
  CategoryDto,
  CategoryListRequest,
  CategoryUpdateRequest,
  CategoryListResponse,
  CategoryCreateRequest
} from "@/lib/types/category";

export const getCategorys = async (
  params: CategoryListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<CategoryListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<CategoryListResponse>>(ENDPOINTS.category.list, {
    params,
    signal
  });
  return res.data;
};

export const getCategoryDetail = async (
  id: CategoryId,
  signal?: AbortSignal
): Promise<ApiResponse<CategoryDto>> => {
  const res = await axiosInstance.get<ApiResponse<CategoryDto>>(ENDPOINTS.category.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertCategory = async (
  body: CategoryUpdateRequest | CategoryCreateRequest
): Promise<ApiResponse<CategoryDto>> => {
  const res = await axiosInstance.post<ApiResponse<CategoryDto>>(ENDPOINTS.category.update, body);
  return res.data;
};

export const deleteCategory = async (id: CategoryId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.category.delete(id));
  return res.data;
};
