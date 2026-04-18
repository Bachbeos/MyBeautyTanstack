import { useMemo } from "react";

export type PermissionAction = "VIEW" | "ADD" | "UPDATE" | "DELETE";

export interface PermissionResult {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  hasAccess: (action: string) => boolean;
}

export function usePermission(resource: string): PermissionResult {
  return useMemo(() => {
    const hasAccess = (action: string) => {
      return localStorage.getItem(`${resource}_${action}`) === "1";
    };

    return {
      canView: hasAccess("VIEW"),
      canAdd: hasAccess("ADD"),
      canEdit: hasAccess("UPDATE"),
      canDelete: hasAccess("DELETE"),
      hasAccess,
    };
  }, [resource]);
}
