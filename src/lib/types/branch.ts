import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type BranchId = ID<"Branch", number>;
export const BranchId = (v: number) => toId<"Branch", number>(v);

export type BranchDto = {
  id: BranchId;
  name: string;
  parentId?: number;
  avatar: string;
  adress: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  status: number;
  foundingYear: number;
  foundingMonth: number;
  foundingDay: number;
  ownerId: number;
  createdTime: string;
  [key: string]: unknown;
};

export type BranchListRequest = {
  keyword?: string;
  status?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type BranchListResponse = Page<BranchDto>;

export type BranchCreateRequest = {
  name: string;
  parentId?: number;
  avatar: string;
  adress: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  status: number;
  foundingYear: number;
  foundingMonth: number;
  foundingDay: number;
  ownerId: number;
};

export type BranchUpdateRequest = {
  id: BranchId;
  name: string;
  parentId?: number;
  avatar: string;
  adress: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  status: number;
  foundingYear: number;
  foundingMonth: number;
  foundingDay: number;
  ownerId: number;
};
