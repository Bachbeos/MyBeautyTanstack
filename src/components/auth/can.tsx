import React from "react";
import { usePermission, type PermissionAction } from "@/hooks/use-permission";

interface CanProps {
  I: PermissionAction;
  a: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ I, a, children, fallback = null }: CanProps) {
  const { hasAccess } = usePermission(a);

  if (!hasAccess(I)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
