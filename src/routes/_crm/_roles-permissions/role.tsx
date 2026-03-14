import { AsyncBoundary } from "@/components/async-boundary";
import ExportButton from "@/components/export/export";
import ModalRole from "@/components/features/role/modal";
import { BaseCheckbox } from "@/components/form/base-checkbox";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { roleMutations, roleQueries } from "@/lib/tanstack/options/role";
import type { RoleDto } from "@/lib/types/role";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useModalFade, useCloseModal } from "@/hooks/use-modal-animation";
import CollapseButton from "@/components/collapse/collapse-button";

const columnHelper = createColumnHelper<RoleDto>();

export const Route = createFileRoute("/_crm/_roles-permissions/role")({
  component: RouteComponent
});

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );

  const rawNameFilter = useMemo(() => {
    const filter = columnFilters.find((f) => f.id === "name");
    return (filter?.value as string) || "";
  }, [columnFilters]);

  const [nameFilter] = useDebounceValue(rawNameFilter, 500);

  const [modal, setModal] = useState<{ type: any; item: any }>({ type: null, item: null });
  const [modalShown, setModalShown] = useState(false);

  useModalFade(modal.type, setModalShown);

  const closeModal = useCloseModal(setModalShown, (state) => setModal(state as any));

  const openModal = (type: any, item: any) => {
    setModal({ type, item });
  };

  const handleToggle = async (row: RoleDto, field: "isDefault" | "isOperator") => {
    const payload: RoleDto = {
      ...row,
      [field]: row[field] === 1 ? 0 : 1
    };

    try {
      await updateMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  const params = useMemo(
    () => ({
      page: pageIndex + 1,
      limit: pageSize,
      keyword: nameFilter || undefined
    }),
    [pageIndex, pageSize, nameFilter]
  );

  useEffect(() => {
    setPageIndex(0);
  }, [nameFilter]);

  const query = useQuery(roleQueries.list(params));
  const roles = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const createMutation = useMutation(roleMutations.create());
  const updateMutation = useMutation(roleMutations.update());
  const deleteMutation = useMutation(roleMutations.delete());

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Tên chức vụ"
      }),
      columnHelper.accessor("isDefault", {
        id: "isDefault",
        header: "Quyền mặc định",
        meta: { className: "text-center w-1" },
        cell: (info) => (
          <BaseCheckbox
            id={`default-${info.row.original.id}`}
            checked={info.getValue() === 1}
            disabled={updateMutation.isPending}
            onChange={() => handleToggle(info.row.original, "isDefault")}
          />
        )
      }),
      columnHelper.accessor("isOperator", {
        id: "isOperator",
        header: "Quyền điều hành",
        meta: { className: "text-center w-1" },
        cell: (info) => (
          <BaseCheckbox
            id={`operator-${info.row.original.id}`}
            checked={info.getValue() === 1}
            disabled={updateMutation.isPending}
            onChange={() => handleToggle(info.row.original, "isOperator")}
          />
        )
      }),
      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        meta: { className: "text-center w-1" },
        cell: (info) => (
          <ActionsTable
            row={info.row}
            onView={(data) => openModal("detail", data)}
            onEdit={(data) => openModal("edit", data)}
            onDelete={(data) => openModal("delete", data)}
            onPermission={(data) => {
              navigate({
                to: "/permission",
                search: {
                  id: data.id,
                  name: data.name
                }
              });
            }}
          />
        )
      })
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: roles,
    columns,
    state: {
      columnFilters,
      pagination: { pageIndex, pageSize }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pageSize),
    getCoreRowModel: getCoreRowModel()
  });

  const handleSubmit = async (values: any) => {
    if (modal.type === "add") await createMutation.mutateAsync(values);
    if (modal.type === "edit") await updateMutation.mutateAsync(values);
    closeModal();
    query.refetch();
  };

  const handleDelete = async () => {
    if (!modal.item?.id) return;
    await deleteMutation.mutateAsync(modal.item.id);
    closeModal();
    query.refetch();
  };

  const handleCollapse = () => {
    document.body.classList.toggle("header-collapse");
    setIsHeaderCollapsed(document.body.classList.contains("header-collapse"));
  };

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        {/* Header & Breadcrumb */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold">
              Danh sách chức vụ
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            {/* Breadcrumb component ở đây */}
            <div className="text-muted small">Chức vụ & Phân quyền / Danh sách chức vụ</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <ExportButton onExport={() => {}} />
            <RefreshButton onRefresh={() => query.refetch()} />
            <CollapseButton onCollapse={handleCollapse} active={isHeaderCollapsed} />
          </div>
        </div>

        <div className="card border-0 rounded-0 shadow-sm">
          <div className="card-body p-3">
            <AsyncBoundary
              status={query.status}
              data={roles}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh chức vụ..."
                  toolbarRight={
                    <AddButton label="Thêm chức vụ" onClick={() => openModal("add", null)} />
                  }
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalRole
        type={modal.type}
        shown={modalShown}
        item={modal.item}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}
