import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type ProductId = ID<"Product", number>;
export const ProductId = (v: number) => toId<"Product", number>(v);

export type ProductDto = {
  id: ProductId;
  name: string;
  categoryId: number;
  categoryName: string;
  content?: string;
  code?: string;
  avatar?: string;
  price: number;
  discount?: number;
  discountUnit?: number;
  position?: number;
  status: number;
  unitId: number;
  type: number;
  expiredPeriod?: number;
};

export type ProductListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type ProductListResponse = Page<ProductDto>;

export type ProductCreateRequest = {
  name: string;
  categoryId: number;
  content?: string;
  code?: string;
  avatar?: string;
  price: number;
  discount?: number;
  discountUnit?: number;
  position?: number;
  status: number;
  unitId: number;
  type: number;
  expiredPeriod?: number;
};

export type ProductUpdateRequest = {
  id: ProductId;
  name: string;
  categoryId: number;
  content?: string;
  code?: string;
  avatar?: string;
  price: number;
  discount?: number;
  discountUnit?: number;
  position?: number;
  status: number;
  unitId: number;
  type: number;
  expiredPeriod?: number;
};
