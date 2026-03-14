import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState
} from "@tanstack/react-table";
import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/table/data-table";
import type { ResourceDto } from "@/lib/types/resource";
import { useQuery, useMutation } from "@tanstack/react-query";
import { resourceQueries, resourceMutations } from "@/lib/tanstack/options/resource";
import { AsyncBoundary } from "@/components/async-boundary";
import ModalResource from "@/components/features/resource/modal";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import ActionsTable from "@/components/table/actions-table";
import AddButton from "@/components/ui/add-button";
import ExportButton from "@/components/export/export";
import RefreshButton from "@/components/refresh/refresh";

const columnHelper = createColumnHelper<ResourceDto>();

export const Route = createFileRoute("/_crm/_resource/resource")({
  component: RouteComponent
});

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const rawNameFilter = useMemo(() => {
    const filter = columnFilters.find((f) => f.id === "name");
    return (filter?.value as string) || "";
  }, [columnFilters]);

  const [nameFilter] = useDebounceValue(rawNameFilter, 500);

  const [modal, setModal] = useState<{
    type: "add" | "edit" | "delete" | "detail" | null;
    item?: ResourceDto;
    shown: boolean;
  }>({
    type: null,
    item: undefined,
    shown: false
  });

  const openModal = (type: "add" | "edit" | "delete" | "detail", item?: ResourceDto) => {
    setModal({ type, item, shown: true });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, shown: false }));
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

  const query = useQuery(resourceQueries.list(params));
  const resources = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const createMutation = useMutation(resourceMutations.create());
  const updateMutation = useMutation(resourceMutations.update());
  const deleteMutation = useMutation(resourceMutations.delete());

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.accessor("name", {
        header: "Tên tài nguyên"
      }),
      columnHelper.accessor("description", {
        header: "Mô tả"
      }),
      columnHelper.accessor("code", {
        header: "Code"
      }),
      columnHelper.accessor("uri", {
        header: "URI"
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
          />
        )
      })
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: resources,
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

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        {/* Header & Breadcrumb */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold">
              Danh sách tài nguyên
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            {/* Breadcrumb component ở đây */}
            <div className="text-muted small">Tài nguyên / Danh sách</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <ExportButton onExport={() => {}} />
            <RefreshButton onRefresh={() => query.refetch()} />
          </div>
        </div>

        <div className="card border-0 rounded-0 shadow-sm">
          {/* <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap bg-white py-3"></div> */}
          <div className="card-body p-3">
            <AsyncBoundary
              status={query.status}
              data={resources}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh tài nguyên..."
                  toolbarRight={
                    <AddButton label="Thêm tài nguyên" onClick={() => openModal("add")} />
                  }
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalResource
        type={modal.type}
        shown={modal.shown}
        item={modal.item}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}
