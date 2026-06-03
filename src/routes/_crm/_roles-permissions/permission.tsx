import { AsyncBoundary } from "@/components/async-boundary";
import { usePermission } from "@/hooks/use-permission";
import ExportButton from "@/components/export/export";
import { BaseCheckbox } from "@/components/form/base-checkbox";
import RefreshButton from "@/components/refresh/refresh";
import { DataTable } from "@/components/table/data-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  permissionQueries,
  permissionMutations,
  permissionKeys
} from "@/lib/tanstack/options/permission";
import type { ResourcePermissionDto } from "@/lib/types/permission";
import type { RoleId } from "@/lib/types/role";
import CollapseButton from "@/components/collapse/collapse-button";
import { exportVisibleTableToXLSX } from "@/lib/export/export-to-excel";
import { exportVisibleTableToPDF } from "@/lib/export/export-to-pdf";

const columnHelper = createColumnHelper<ResourcePermissionDto>();

const ACTION_ALIASES: Record<string, string> = {
  CREATE: "ADD"
};

const parseActions = (actions?: string | null): string[] => {
  try {
    const parsed = JSON.parse(actions || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const normalizeAction = (action: string): string => ACTION_ALIASES[action] || action;

const toCanonicalActions = (actions?: string | null): string[] => {
  const normalized = parseActions(actions).map(normalizeAction);
  return Array.from(new Set(normalized));
};

const resolvePayloadAction = (resource: ResourcePermissionDto, canonicalAction: string): string => {
  const resourceActions = parseActions(resource.actions);
  if (resourceActions.includes(canonicalAction)) return canonicalAction;

  const matchedOriginal = resourceActions.find(
    (original) => normalizeAction(original) === canonicalAction
  );
  return matchedOriginal || canonicalAction;
};

export const Route = createFileRoute("/_crm/_roles-permissions/permission")({
  component: RouteComponent
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/_crm/_roles-permissions/permission" });
  const roleId = Number((search as any).id) as unknown as RoleId;
  const roleName = (search as any).name;
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );

  const { canAdd, canEdit, canDelete, canView } = usePermission("PERMISSION");

  const query = useQuery(permissionQueries.info({ roleId }));
  const listResource = query.data?.result || [];

  const addMutation = useMutation(permissionMutations.add());
  const removeMutation = useMutation(permissionMutations.remove());

  const allActions = useMemo(() => {
    const actionsSet = new Set<string>();
    listResource.forEach((r) => {
      toCanonicalActions(r.actions).forEach((a) => actionsSet.add(a));
    });
    return Array.from(actionsSet);
  }, [listResource]);

  const handleToggle = async (
    resource: ResourcePermissionDto,
    action: string,
    isChecked: boolean
  ) => {
    const payloadAction = resolvePayloadAction(resource, action);
    const payload = {
      roleId,
      resourceId: resource.id,
      actions: JSON.stringify([payloadAction])
    };

    if (isChecked) {
      await addMutation.mutateAsync(payload);
    } else {
      await removeMutation.mutateAsync(payload);
    }
    queryClient.invalidateQueries({ queryKey: permissionKeys.info({ roleId }) });
  };

  const handleToggleAllActions = async (resource: ResourcePermissionDto, isChecked: boolean) => {
    let actionsToProcess: string[] = [];
    try {
      const parsed = JSON.parse(resource.actions || "[]");
      if (Array.isArray(parsed)) actionsToProcess = parsed;
    } catch (e) {
      actionsToProcess = [];
    }

    if (actionsToProcess.length === 0) return;

    const payload = {
      roleId,
      resourceId: resource.id,
      actions: JSON.stringify(actionsToProcess)
    };

    if (isChecked) {
      await addMutation.mutateAsync(payload);
    } else {
      await removeMutation.mutateAsync(payload);
    }
    queryClient.invalidateQueries({ queryKey: permissionKeys.info({ roleId }) });
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => info.row.index + 1,
        meta: { className: "text-center w-1" }
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Tên tài nguyên"
      }),
      columnHelper.accessor("code", {
        id: "code",
        header: "Mã tài nguyên"
      }),
      ...allActions.map((action) =>
        columnHelper.display({
          id: action,
          header: `Quyền ${action}`,
          meta: { className: "text-center w-1" },
          cell: (info) => {
            const row = info.row.original;
            const availableActions = toCanonicalActions(row.actions);

            if (!availableActions.includes(action)) return null;

            const currentPermissions = toCanonicalActions(row.permission?.actions);

            return (
              <BaseCheckbox
                id={`${row.id}-${action}`}
                checked={currentPermissions.includes(action)}
                disabled={addMutation.isPending || removeMutation.isPending || !canEdit}
                onChange={(checked) => handleToggle(row, action, checked)}
              />
            );
          }
        })
      ),
      columnHelper.display({
        id: "all",
        header: "Tất cả",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const row = info.row.original;
          const availableActions = toCanonicalActions(row.actions);
          const currentPermissions = toCanonicalActions(row.permission?.actions);

          const isAllChecked =
            availableActions.length > 0 &&
            availableActions.every((a) => currentPermissions.includes(a));

          return (
            <BaseCheckbox
              id={`${row.id}-all`}
              checked={isAllChecked}
              disabled={addMutation.isPending || removeMutation.isPending || !canEdit}
              onChange={(checked) => handleToggleAllActions(row, checked)}
            />
          );
        }
      })
    ],
    [allActions, addMutation.isPending, removeMutation.isPending, roleId]
  );

  const table = useReactTable({
    data: listResource,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const handleCollapse = () => {
    document.body.classList.toggle("header-collapse");
    setIsHeaderCollapsed(document.body.classList.contains("header-collapse"));
  };

  if (canView === false) {
    return (
      <div className="page-wrapper">
        <div className="content py-5 text-center">
          <div className="mb-3">
            <i className="ti ti-lock fs-48 text-danger"></i>
          </div>
          <h4 className="fw-bold">Bạn không có quyền truy cập trang này</h4>
          <p className="text-muted">Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div className="col">
            <h4 className="mb-1 fw-bold">
              Phân quyền chức vụ: <span className="badge badge-soft-primary ms-2">{roleName}</span>
            </h4>
            <div className="text-muted small">Vai trò & Phân quyền / Phân quyền</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <ExportButton
              onExport={(format) => {
                switch (format) {
                  case "xls":
                    exportVisibleTableToXLSX(table);
                    break;
                  case "pdf":
                    exportVisibleTableToPDF(table);
                    break;
                }
              }}
            />
            <RefreshButton onRefresh={() => query.refetch()} />
            <CollapseButton onCollapse={handleCollapse} active={isHeaderCollapsed} />
          </div>
        </div>

        <div className="card border-0 rounded-0 shadow-sm mt-3">
          <div className="card-body p-3">
            <AsyncBoundary
              status={query.status}
              data={listResource}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  showPagination={false}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
