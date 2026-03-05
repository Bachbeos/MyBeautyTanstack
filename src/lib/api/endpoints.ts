import type { ResourceId } from "@/lib/types/resource";
import type { RoleId } from "../types/role";
import type { UnitId } from "../types/unit";
import type { CategoryId } from "../types/category";

export const ENDPOINTS = {
  auth: {
    login: "/user/authenticate",
    register: "/user/create",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me"
  },
  user: {
    info: "/users/info"
  },
  products: {
    list: "/products",
    byId: (id: string) => `/products/${id}`
  },
  resource: {
    list: "/resource/list",
    update: "/resource/update",
    delete: (id: ResourceId) => `/resource/delete/${id}`,
    detail: `/resource/getById`
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
  }
} as const;
