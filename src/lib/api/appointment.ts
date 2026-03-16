import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  AppointmentId,
  AppointmentDto,
  AppointmentListRequest,
  AppointmentUpdateRequest,
  AppointmentListResponse,
  AppointmentCreateRequest
} from "@/lib/types/appointment";

export const getAppointments = async (
  params: AppointmentListRequest,
  signal?: AbortSignal
): Promise<ApiResponse<AppointmentListResponse>> => {
  const res = await axiosInstance.get<ApiResponse<AppointmentListResponse>>(
    ENDPOINTS.appointment.list,
    {
      params,
      signal
    }
  );
  return res.data;
};

export const getAppointmentDetail = async (
  id: AppointmentId,
  signal?: AbortSignal
): Promise<ApiResponse<AppointmentDto>> => {
  const res = await axiosInstance.get<ApiResponse<AppointmentDto>>(ENDPOINTS.appointment.detail, {
    params: { id: id },
    signal
  });
  return res.data;
};

export const upsertAppointment = async (
  body: AppointmentUpdateRequest | AppointmentCreateRequest
): Promise<ApiResponse<AppointmentDto>> => {
  const res = await axiosInstance.post<ApiResponse<AppointmentDto>>(
    ENDPOINTS.appointment.update,
    body
  );
  return res.data;
};

export const deleteAppointment = async (id: AppointmentId): Promise<ApiResponse<void>> => {
  const res = await axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.appointment.delete(id));
  return res.data;
};
