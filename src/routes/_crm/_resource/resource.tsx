import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import type { ResourceDto } from "@/lib/types/resource";
import { useQuery } from "@tanstack/react-query";
import { resourceQueries } from "@/lib/tanstack/options/resource";
import { AsyncBoundary } from "@/components/async-boundary";
import ModalResource from "@/components/modal/ModalResource";

const columnHelper = createColumnHelper<ResourceDto>();

export const Route = createFileRoute("/_crm/_resource/resource")({
  component: RouteComponent
});

function RouteComponent() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

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
      limit: pageSize
    }),
    [pageIndex, pageSize]
  );

  const query = useQuery(resourceQueries.list(params));
  const resources = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor("code", {
        header: "Mã tài nguyên",
        cell: (info) => <span className="fw-medium text-primary">{info.getValue()}</span>
      }),
      columnHelper.accessor("name", {
        header: "Tên tài nguyên"
      }),
      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: (info) => (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-light border"
              onClick={() => openModal("edit", info.row.original)}
            >
              <i className="ti ti-edit"></i>
            </button>
            <button
              className="btn btn-sm btn-light border text-danger"
              onClick={() => openModal("delete", info.row.original)}
            >
              <i className="ti ti-trash"></i>
            </button>
          </div>
        )
      })
    ],
    []
  );

  const table = useReactTable({
    data: resources,
    columns,
    state: { globalFilter, pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="page-wrapper p-4">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">
              Danh sách tài nguyên
              <span className="badge bg-primary-subtle text-primary ms-2">{total}</span>
            </h4>
          </div>
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => openModal("add")}
          >
            <i className="ti ti-plus me-1"></i> Thêm tài nguyên
          </button>
        </div>

        <div className="card border-0 shadow-sm">
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
                  filterable
                  filterKeyPlaceholder="Tìm nhanh tài nguyên..."
                  toolbarLeft={
                    <div className="text-muted small">
                      Dữ liệu được cập nhật từ hệ thống quản trị
                    </div>
                  }
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
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
        }}
        onDelete={() => {
          closeModal();
        }}
      />
    </div>
  );
}
