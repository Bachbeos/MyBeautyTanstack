import { toId, type ID } from "@/lib/types/id";
import type { RoleId } from "@/lib/types/role";

/**
 * Branded ID for the Resource entity
 */
export type ResourceId = ID<"Resource", number>;
export const ResourceId = (v: number) => toId<"Resource", number>(v);

export type PermissionDto = {
  roleId: RoleId;
  actions: string;
};

export type ResourcePermissionDto = {
  id: ResourceId;
  name: string;
  description: string | null;
  code: string;
  uri: string;
  actions: string;
  permission: PermissionDto;
};

export type PermissionCreateRequest = {
  roleId: RoleId;
  resourceId: ResourceId;
  actions: string;
};

export type PermissionUpdateRequest = {
  roleId: RoleId;
  resourceId: ResourceId;
  actions: string;
};

export type PermissionInfoRequest = {
  roleId: RoleId;
};

export type PermissionInfoResponse = ResourcePermissionDto[];
