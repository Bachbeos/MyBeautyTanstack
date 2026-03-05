import { AsyncBoundary } from "@/components/async-boundary";
import ExportButton from "@/components/export/export";
import { BaseCheckbox } from "@/components/form/base-checkbox";
import RefreshButton from "@/components/refresh/refresh";
import { DataTable } from "@/components/table/data-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import {
  permissionQueries,
  permissionMutations,
  permissionKeys
} from "@/lib/tanstack/options/permission";
import type { ResourcePermissionDto } from "@/lib/types/permission";
import type { RoleId } from "@/lib/types/role";

const columnHelper = createColumnHelper<ResourcePermissionDto>();

export const Route = createFileRoute("/_crm/_roles-permissions/permission")({
  component: RouteComponent
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/_crm/_roles-permissions/permission" });
  const roleId = Number((search as any).id) as unknown as RoleId;
  const roleName = (search as any).name;

  const query = useQuery(permissionQueries.info({ roleId }));
  const listResource = query.data?.result || [];

  const addMutation = useMutation(permissionMutations.add());
  const removeMutation = useMutation(permissionMutations.remove());

  const allActions = useMemo(() => {
    const actionsSet = new Set<string>();
    listResource.forEach((r) => {
      try {
        const parsed = JSON.parse(r.actions || "[]");
        if (Array.isArray(parsed)) parsed.forEach((a) => actionsSet.add(a));
      } catch (e) {}
    });
    return Array.from(actionsSet);
  }, [listResource]);

  const handleToggle = async (
    resource: ResourcePermissionDto,
    action: string,
    isChecked: boolean
  ) => {
    const payload = {
      roleId,
      resourceId: resource.id,
      actions: JSON.stringify([action])
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
        header: "Tên tài nguyên"
      }),
      columnHelper.accessor("code", {
        header: "Mã tài nguyên"
      }),
      ...allActions.map((action) =>
        columnHelper.display({
          id: action,
          header: `Quyền ${action}`,
          meta: { className: "text-center w-1" },
          cell: (info) => {
            const row = info.row.original;
            let availableActions: string[] = [];
            try {
              availableActions = JSON.parse(row.actions || "[]");
            } catch (e) {
              availableActions = [];
            }

            if (!availableActions.includes(action)) return null;

            let currentPermissions: string[] = [];
            try {
              currentPermissions = JSON.parse(row.permission?.actions || "[]");
            } catch (e) {
              currentPermissions = [];
            }

            return (
              <BaseCheckbox
                id={`${row.id}-${action}`}
                checked={currentPermissions.includes(action)}
                disabled={addMutation.isPending || removeMutation.isPending}
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
          let availableActions: string[] = [];
          let currentPermissions: string[] = [];

          try {
            availableActions = JSON.parse(row.actions || "[]");
            currentPermissions = JSON.parse(row.permission?.actions || "[]");
          } catch (e) {}

          const isAllChecked =
            availableActions.length > 0 &&
            availableActions.every((a) => currentPermissions.includes(a));

          return (
            <BaseCheckbox
              id={`${row.id}-all`}
              checked={isAllChecked}
              disabled={addMutation.isPending || removeMutation.isPending}
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

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div className="col">
            <h4 className="mb-1 fw-bold">
              Phân quyền chức vụ: <span className="badge badge-soft-primary ms-2">{roleName}</span>
            </h4>
            <div className="text-muted small">Phân quyền / Chi tiết</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <ExportButton onExport={() => {}} />
            <RefreshButton onRefresh={() => query.refetch()} />
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
                  filterKeyPlaceholder="Tìm nhanh tài nguyên..."
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
