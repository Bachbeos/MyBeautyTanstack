import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

/**
 * Branded ID for the Role entity
 */
export type RoleId = ID<"Role", number>;
export const RoleId = (v: number) => toId<"Role", number>(v);

export type RoleDto = {
  id: RoleId;
  name: string;
  isDefault: number;
  isOperator: number;
  [key: string]: unknown;
};

export type RoleListRequest = Partial<PageMeta> & {
  keyword?: string;
  [key: string]: unknown;
};

export type RoleUpdateRequest = {
  id: RoleId;
  name?: string;
  isDefault?: number;
  isOperator?: number;
};

export type RoleCreateRequest = {
  name: string;
  isDefault?: number;
  isOperator?: number;
};

export type RoleListResponse = Page<RoleDto>;
