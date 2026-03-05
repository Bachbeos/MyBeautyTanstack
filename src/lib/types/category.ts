import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type CategoryId = ID<"Category", number>;
export const CategoryId = (v: number) => toId<"Category", number>(v);

export type CategoryDto = {
  id: CategoryId;
  name?: string;
  active?: number;
  position: number;
  avatar: string;
  type?: number;
  parentId: CategoryId;
  featured: string;
  [key: string]: unknown;
};

export type CategoryListRequest = Partial<PageMeta> & {
  keyword?: string;
  [key: string]: unknown;
};

export type CategoryUpdateRequest = {
  id: CategoryId;
  name?: string;
  active?: number;
  position: number;
  avatar: string;
  type?: number;
  parentId: CategoryId;
  featured: string;
};

export type CategoryCreateRequest = {
  name: string;
  active?: number;
  position: number;
  avatar: string;
  type?: number;
  parentId: CategoryId;
  featured: string;
};

export type CategoryListResponse = Page<CategoryDto>;
