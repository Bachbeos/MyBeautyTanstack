import type { ResourceId } from "@/lib/types/resource";
import type { RoleId } from "../types/role";
import type { UnitId } from "../types/unit";
import type { CategoryId } from "../types/category";
import type { UserId } from "../types/user";
import type { ProductId } from "../types/product";
import type { CustomerSourceId } from "../types/customer-source";
import type { callHistoryId } from "../types/call-history";
import type { CustomerId } from "../types/customer";
import type { VoucherId } from "../types/voucher";
import type { BranchId } from "../types/branch";
import type { ServiceId } from "../types/service";
import type { CustomerAttributeId } from "../types/customer-attribute";
import type { AppointmentId } from "../types/appointment";
import type { NotificationId } from "../types/notification";
import type { OpportunityId } from "../types/opportunity";

export const ENDPOINTS = {
  auth: {
    login: "/user/authenticate",
    register: "/user/create",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me"
  },
  user: {
    info: "/user/info",
    updateInfo: "/user/info",
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
    detail: "/customer/get"
  },
  voucher: {
    list: "/voucher/list",
    update: "/voucher/update",
    delete: (id: VoucherId) => `/voucher/delete/${id}`,
    detail: "/voucher/get",
    apply: "/voucher/applyVoucher"
  },
  invoice: {
    list: "/invoice/list",
    update: "/invoice/update",
    delete: (id: string) => `/invoice/delete/${id}`,
    detail: "/invoice/get",
    draft: "/invoice/draft",
    recalculate: "/invoice/recalculate"
  },
  boughtProduct: {
    list: "/boughtProduct/list",
    update: "/boughtProduct/update",
    delete: (id: string) => `/boughtProduct/delete/${id}`
  },
  boughtService: {
    list: "/boughtService/list",
    update: "/boughtService/update",
    delete: (id: string) => `/boughtService/delete/${id}`
  },
  branch: {
    list: "/branch/list",
    update: "/branch/update",
    delete: (id: BranchId) => `/branch/delete/${id}`,
    detail: "/branch/get",
    updateStatus: "/branch/update-status"
  },
  service: {
    list: "/service/list",
    update: "/service/update",
    delete: (id: ServiceId) => `/service/delete/${id}`,
    detail: "/service/get"
  },
  customerAttribute: {
    list: "/customerAttribute/list",
    update: "/customerAttribute/update",
    delete: (id: CustomerAttributeId) => `/customerAttribute/delete/${id}`,
    detail: "/customerAttribute/get"
  },
  appointment: {
    list: "/schedule/list",
    update: "/schedule/update",
    delete: (id: AppointmentId) => `/schedule/delete/${id}`,
    detail: "/schedule/get"
  },
  notification: {
    list: "/notification/list",
    detail: "/notification/get",
    update: "/notification/update",
    markRead: "/notification/mark-read",
    markAllRead: "/notification/mark-all-read",
    delete: (id: NotificationId) => `/notification/delete/${id}`
  },
  opportunity: {
    list: "/opportunity/list",
    update: "/opportunity/update",
    delete: (id: OpportunityId) => `/opportunity/delete/${id}`,
    detail: "/opportunity/get"
  }
} as const;
