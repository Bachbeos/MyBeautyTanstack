import { queryOptions, mutationOptions } from "@tanstack/react-query";
import {
  getAppointments,
  getAppointmentDetail,
  upsertAppointment,
  deleteAppointment
} from "@/lib/api/appointment";

import type {
  AppointmentId,
  AppointmentDto,
  AppointmentListRequest,
  AppointmentUpdateRequest,
  AppointmentListResponse,
  AppointmentCreateRequest
} from "@/lib/types/appointment";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";

export const appointmentKeys = createKeys("appointment", {
  list: (params: AppointmentListRequest) => ["list", params] as const,
  detail: (id: AppointmentId) => ["detail", id] as const,
  create: () => ["create"] as const,
  update: () => ["update"] as const,
  delete: () => ["delete"] as const
});

export const appointmentQueries = {
  list: (params: AppointmentListRequest) =>
    queryOptions<ApiResponse<AppointmentListResponse>>({
      queryKey: appointmentKeys.list(params),
      queryFn: ({ signal }) => getAppointments(params, signal)
    }),

  detail: (id: AppointmentId) =>
    queryOptions<ApiResponse<AppointmentDto>>({
      queryKey: appointmentKeys.detail(id),
      queryFn: ({ signal }) => getAppointmentDetail(id, signal),
      enabled: !!id
    })
};

export const appointmentMutations = {
  create: () =>
    mutationOptions<ApiResponse<AppointmentDto>, Error, AppointmentCreateRequest>({
      mutationKey: appointmentKeys.create(),
      mutationFn: (body) => upsertAppointment(body),
      meta: {
        successMessage: "Tạo lịch hẹn thành công",
        invalidatesQuery: [appointmentKeys.list({})]
      }
    }),

  update: () =>
    mutationOptions<ApiResponse<AppointmentDto>, Error, AppointmentUpdateRequest>({
      mutationKey: appointmentKeys.update(),
      mutationFn: (body) => upsertAppointment(body),
      meta: {
        successMessage: "Cập nhật lịch hẹn thành công",
        invalidatesQuery: [appointmentKeys.list({})]
      }
    }),

  delete: () =>
    mutationOptions<ApiResponse<void>, Error, AppointmentId>({
      mutationKey: appointmentKeys.delete(),
      mutationFn: (id) => deleteAppointment(id),
      meta: {
        successMessage: "Xóa lịch hẹn thành công",
        invalidatesQuery: [appointmentKeys.list({})]
      }
    })
};
