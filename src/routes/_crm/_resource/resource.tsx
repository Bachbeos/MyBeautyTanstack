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

const columnHelper = createColumnHelper<ResourceDto>();

export const Route = createFileRoute("/_crm/_resource/resource")({
  component: RouteComponent
});

function RouteComponent() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

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
  const pageCount = Math.ceil(total / pageSize);

  const columns = useMemo(
    () => [
      columnHelper.accessor("code", {
        header: "Mã tài nguyên",
        cell: (info) => <span className="fw-medium text-primary">{info.getValue()}</span>
      }),
      columnHelper.accessor("name", {
        header: "Tên tài nguyên"
      }),
      columnHelper.accessor("description", {
        header: "Mô tả"
      }),
      columnHelper.accessor("uri", {
        header: "URI"
      }),
      columnHelper.accessor("actions", {
        header: "Actions",
        cell: (info) => {
          const raw = info.getValue();
          let parsed: string[] = [];

          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = [];
          }

          return (
            <div className="d-flex flex-wrap gap-1">
              {parsed.map((a) => (
                <span key={a} className="badge bg-primary-subtle text-primary">
                  {a}
                </span>
              ))}
            </div>
          );
        }
      })
    ],
    []
  );

  const table = useReactTable({
    data: resources,
    columns,
    pageCount,
    state: {
      globalFilter,
      pagination: {
        pageIndex,
        pageSize
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;

      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    manualPagination: true,
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
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-3">
            <AsyncBoundary
              status={query.status}
              data={resources}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {(_data) => (
                <>
                  <div className="mb-2 text-muted small">Tổng số bản ghi: {total}</div>

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
                </>
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
