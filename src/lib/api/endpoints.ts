import type { ResourceId } from "@/lib/types/resource";
import type { RoleId } from "../types/role";
import type { UnitId } from "../types/unit";
import type { CategoryId } from "../types/category";
import type { UserId } from "../types/user";
import type { ProductId } from "../types/product";
import type { CustomerSourceId } from "../types/customer-source";
import type { callHistoryId } from "../types/call-history";
import type { CustomerId } from "../types/customer";

export const ENDPOINTS = {
  auth: {
    login: "/user/authenticate",
    register: "/user/create",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me"
  },
  user: {
    info: "/users/info",
    list: "/user/list",
    update: "/user/update",
    delete: (id: UserId) => `/user/delete/${id}`,
    detail: "/user/getById",
    updatePassword: "/user/update-password",
    updateStatus: "/user/update-status"
  },
  products: {
    list: "/products",
    byId: (id: string) => `/products/${id}`
  },
  resource: {
    list: "/resource/list",
    update: "/resource/update",
    delete: (id: ResourceId) => `/resource/delete/${id}`,
    detail: "/resource/getById"
  },
  role: {
    list: "/role/list",
    update: "/role/update",
    delete: (id: RoleId) => `/role/delete/${id}`
  },
  permission: {
    upsert: "/permission/add",
    delete: "/permission/remove",
    detail: "/permission/info",
    checkPermission: "/permission/resource"
  },
  uploadImage: {
    upload: "/file/upload"
  },
  unit: {
    list: "/unit/list",
    update: "/unit/update",
    delete: (id: UnitId) => `/unit/delete/${id}`,
    detail: "/unit/get"
  },
  category: {
    list: "/categoryItem/list",
    update: "/categoryItem/update",
    delete: (id: CategoryId) => `/categoryItem/delete/${id}`,
    detail: "/categoryItem/get"
  },
  product: {
    list: "/product/list",
    update: "/product/update",
    delete: (id: ProductId) => `/product/delete/${id}`,
    detail: "/product/get"
  },
  customerSource: {
    list: "/customerSource/list",
    update: "/customerSource/update",
    delete: (id: CustomerSourceId) => `/customerSource/delete/${id}`,
    detail: "/customerSource/get"
  },
  callHistory: {
    list: "/callHistory/list",
    update: "/callHistory/update",
    delete: (id: callHistoryId) => `/callHistory/delete/${id}`,
    detail: "/callHistory/get"
  },
  customer: {
    list: "/customer/list",
    update: "/customer/update",
    delete: (id: CustomerId) => `/customer/delete/${id}`,
    detail: "/customer/getById"
  }
} as const;
