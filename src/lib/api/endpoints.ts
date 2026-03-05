import type { ResourceId } from "@/lib/types/resource";
import type { RoleId } from "@/lib/types/role";

export const ENDPOINTS = {
  auth: {
    login: "/user/authenticate",
    register: "/user/create",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me"
  },
  users: {
    list: "/users",
    byId: (id: string) => `/users/${id}`
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
    list: `/role/list`,
    upsert: `/role/update`,
    delete: (id: RoleId) => `/role/delete/${id}`
  },
  permission: {
    upsert: `/permission/add`,
    delete: `/permission/remove`,
    detail: `/permission/info`,
    checkPermission: `/permission/resource`
  }
} as const;
