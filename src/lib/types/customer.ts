import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type CustomerId = ID<"Customer", number>;
export const CustomerId = (v: number) => toId<"Customer", number>(v);

export type CustomerDto = {
  id: CustomerId;
  name: string;
  avatar: string;
  gender: number;
  age: number;
  sourceId: number;
  sourceName: string;
  address: string;
  phone: string;
  email: string;
  birthday: string;
  height: number;
  weight: number;
  userId: number;
  userName: string;
  creatorId: number;
  note: string;
  createdTime: string;
  updatedTime: string;
  latestContact: string;
  segmentCode?: string;
  [key: string]: unknown;
};

export type CustomerListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type CustomerListResponse = Page<CustomerDto>;

export type CustomerCreateRequest = {
  name: string;
  avatar: string;
  gender: number;
  age: number;
  sourceId: number;
  address: string;
  phone: string;
  email: string;
  birthday: string;
  height: number;
  weight: number;
  userId: number;
  note: string;
};

export type CustomerUpdateRequest = {
  id: CustomerId;
  name: string;
  avatar: string;
  gender: number;
  age: number;
  sourceId: number;
  address: string;
  phone: string;
  email: string;
  birthday: string;
  height: number;
  weight: number;
  userId: number;
  note: string;
};
