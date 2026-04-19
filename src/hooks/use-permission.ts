import { useAuthStore } from "@/lib/stores/auth";
import { authQueries } from "@/lib/tanstack/options/auth";
import { useQuery } from "@tanstack/react-query";

export type PermissionAction = "VIEW" | "ADD" | "UPDATE" | "DELETE";

type Role = "OPERATOR" | "OTHER";

type Policy = {
  allow?: PermissionAction[];
  deny?: PermissionAction[];
};

const rolePolicy: Record<Role, Policy> = {
  OPERATOR: {
    allow: ["VIEW", "ADD", "UPDATE", "DELETE"]
  },
  OTHER: {
    allow: []
  }
};

export interface PermissionResult {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  hasAccess: (action: PermissionAction) => boolean;
}

const EMPTY_SET = new Set<PermissionAction>();

function resolveAccess(
  role: Role | undefined,
  actions: Set<PermissionAction>,
  action: PermissionAction
): boolean {
  const policy = role ? rolePolicy[role] : undefined;

  if (policy?.deny?.includes(action)) {
    return false;
  }

  if (policy?.allow?.includes(action)) {
    return true;
  }

  return actions.has(action);
}

export function usePermission(resource: string): PermissionResult {
  const { data } = useQuery(authQueries.permissions());
  const { isOperator } = useAuthStore();

  const actions = data?.[resource] ?? EMPTY_SET;

  const hasAccess = (action: PermissionAction) => {
    return resolveAccess(isOperator ? "OPERATOR" : "OTHER", actions, action);
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
    const actions = data?.[resource] ?? EMPTY_SET;
    return resolveAccess(isOperator ? "OPERATOR" : "OTHER", actions, "VIEW");
  };

  const canViewAny = (resources: string[]) => {
    return resources.some((r) => canView(r));
  };

  return { canView, canViewAny };
}
