import { toId, type ID } from "@/lib/types/id";
import type { Page, PageMeta } from "@/lib/types/paging";

export type ServiceId = ID<"Service", number>;
export const ServiceId = (v: number) => toId<"Service", number>(v);

export type ServiceDto = {
  id: ServiceId;
  name: string;
  categoryId: number;
  categoryName: string;
  avatar: string;
  code: string;
  intro: string;
  cost: number;
  price: number;
  discount: number;
  priceVariation: string[];
  totalTime: number;
  isCombo: number;
  featured: number;
  treatmentNum: number;
  parentId: number;
  createdTime: string;
};

export type ServiceListRequest = {
  keyword?: string;
  active?: number;
  [key: string]: unknown;
} & Partial<PageMeta>;

export type ServiceListResponse = Page<ServiceDto>;

export type ServiceCreateRequest = {
  name: string;
  categoryId: number;
  avatar: string;
  code: string;
  intro: string;
  cost: number;
  price: number;
  discount: number;
  priceVariation: string[];
  totalTime: number;
  isCombo: number;
  featured: number;
  treatmentNum: number;
  parentId: number;
};

export type ServiceUpdateRequest = {
  id: ServiceId;
  name: string;
  categoryId: number;
  avatar: string;
  code: string;
  intro: string;
  cost: number;
  price: number;
  discount: number;
  priceVariation: string[];
  totalTime: number;
  isCombo: number;
  featured: number;
  treatmentNum: number;
  parentId: number;
};
