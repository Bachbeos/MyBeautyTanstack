import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type CustomerAttributeId = ID<"CustomerAttribute", number>;
export const CustomerAttributeId = (v: number) => toId<"CustomerAttribute", number>(v);

export type CustomerAttributeDto = {
  id: CustomerAttributeId;
  name: string;
  fieldName?: string;
  fileName?: string;
  required: number;
  readonly: number;
  unique?: number | null;
  uniqued?: number | null;
  datatype: string;
  attributes: string | string[];
  position: number;
  parentId: number;
  parentName: string | null;
  createdAt: string | null;
  [key: string]: unknown;
};

export type CustomerAttributeListRequest = {
  isParent?: 1 | 2;
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type CustomerAttributeListResponse = Page<CustomerAttributeDto>;

export type CustomerAttributeCreateRequest = {
  name: string;
  fileName: string;
  required: number;
  readonly: number;
  unique: number;
  datatype: string;
  attributes: string;
  position: number;
  parentId?: number;
};

export type CustomerAttributeUpdateRequest = {
  id: CustomerAttributeId;
  name?: string;
  fileName?: string;
  required?: number;
  readonly?: number;
  unique?: number;
  datatype?: string;
  attributes?: string;
  position?: number;
  parentId?: number;
};
