import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type UnitId = ID<"Unit", number>;
export const UnitId = (v: number) => toId<"Unit", number>(v);

export type UnitDto = {
  id: UnitId;
  name?: string;
  status?: number;
  position: number;
  createdTime: string;
  updatedTime: string;
  [key: string]: unknown;
};

export type UnitListRequest = Partial<PageMeta> & {
  keyword?: string;
  [key: string]: unknown;
};

export type UnitUpdateRequest = {
  id: UnitId;
  name?: string;
  status?: number;
  position: number;
};

export type UnitCreateRequest = {
  name: string;
  status?: number;
  position?: number;
};

export type UnitListResponse = Page<UnitDto>;
