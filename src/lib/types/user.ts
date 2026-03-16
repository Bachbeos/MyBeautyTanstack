import { type ID, toId } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type UserId = ID<"User", number>;
export const UserId = (v: number) => toId<"User", number>(v);

export type UserDto = {
  id: UserId;
  name: string;
  avatar: string;
  phone: string;
  email?: string;
  plainPassword?: string | number;
  branchId?: number;
  branchName?: string;
  roleId: number;
  active: number;
  regisDate: string;
  [key: string]: unknown;
};

export type UserListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type UserListResponse = Page<UserDto>;

export type UserCreateRequest = {
  name: string;
  phone: string;
  email?: string;
  plainPassword?: string | number;
  branchId?: number;
  active: number;
};

export type UserUpdateRequest = {
  id: UserId;
  name?: string;
  phone?: string;
  email?: string;
  plainPassword?: string | number;
  branchId?: number;
  active?: number;
};

export type UserInfoUpdateRequest = {
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: number;
  alias?: string;
  cityName?: string;
  subdistrictName?: string;
};
