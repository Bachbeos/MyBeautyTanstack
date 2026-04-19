import { useAuthStore } from "@/lib/stores/auth";
import { authQueries } from "@/lib/tanstack/options/auth";
import { useQuery } from "@tanstack/react-query";

export type PermissionAction = "VIEW" | "ADD" | "UPDATE" | "DELETE";

export interface PermissionResult {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  hasAccess: (action: PermissionAction) => boolean;
}

const EMPTY_SET = new Set<PermissionAction>();

export function usePermission(resource: string): PermissionResult {
  const { data } = useQuery(authQueries.permissions());
  const { isOperator } = useAuthStore();

  const actions = data?.[resource] ?? EMPTY_SET;

  const hasAccess = (action: PermissionAction) => {
    if (isOperator) {
      return true;
    }
    return actions.has(action);
  };

  return {
    canView: hasAccess("VIEW"),
    canAdd: hasAccess("ADD"),
    canEdit: hasAccess("UPDATE"),
    canDelete: hasAccess("DELETE"),
    hasAccess
  };
}

export function useViewPermission() {
  const { data } = useQuery(authQueries.permissions());
  const { isOperator } = useAuthStore();

  const canView = (resource: string) => {
    if (isOperator) return true;

    return data?.[resource]?.has("VIEW") ?? false;
  };

  const canViewAny = (resources: string[]) => {
    if (isOperator) return true;

    return resources.some(canView);
  };

  return { canView, canViewAny };
}
