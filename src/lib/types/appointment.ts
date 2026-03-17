import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type AppointmentId = ID<"Appointment", number>;
export const AppointmentId = (v: number) => toId<"Appointment", number>(v);

export type AppointmentDto = {
  id: AppointmentId;
  title: string;
  creatorId: number;
  creatorName: string;
  content: string;
  customerId: number;
  customerName: string;
  userId: number;
  userName: string;
  startTime: string;
  endTime: string;
  userEmail: string;
  note: string;
  type: number;
  [key: string]: unknown;
};

export type AppointmentListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type AppointmentListResponse = Page<AppointmentDto>;

export type AppointmentCreateRequest = {
  title: string;
  creatorId: number;
  content?: string;
  customerId: number;
  userId: number;
  userName: string;
  startTime: string;
  endTime: string;
  note?: string;
  type: number;
};

export type AppointmentUpdateRequest = {
  id: AppointmentId;
  title: string;
  creatorId: number;
  content?: string;
  customerId: number;
  userId: number;
  userName: string;
  startTime: string;
  endTime: string;
  note?: string;
  type: number;
};
