import { AsyncBoundary } from "@/components/async-boundary";
import RefreshButton from "@/components/refresh/refresh";
import { DataTable } from "@/components/table/data-table";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { opportunityMutations, opportunityQueries } from "@/lib/tanstack/options/opportunity";
import { userQueries } from "@/lib/tanstack/options/user";
import type { OpportunityDto } from "@/lib/types/opportunity";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

const columnHelper = createColumnHelper<OpportunityDto>();

export const Route = createFileRoute("/_crm/_opportunity/dispatch")({
  component: RouteComponent
});

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [unassignedOnly, setUnassignedOnly] = useState(true);

  const rawNameFilter = useMemo(() => {
    const filter = columnFilters.find((f) => f.id === "name");
    return (filter?.value as string) || "";
  }, [columnFilters]);
  const [nameFilter] = useDebounceValue(rawNameFilter, 300);

  const params = useMemo(
    () => ({
      page: pageIndex + 1,
      limit: pageSize,
      keyword: nameFilter || undefined,
      status: 1,
      unassignedOnly
    }),
    [pageIndex, pageSize, nameFilter, unassignedOnly]
  );

  const query = useQuery(opportunityQueries.list(params));
  const opportunities = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const usersInf = useInfiniteQuery(userQueries.infinite({ limit: 50 }));
  const userOptions =
    usersInf.data?.pages
      .flatMap((page) => page.result?.items ?? [])
      .map((user) => ({ value: Number(user.id), label: String(user.name) })) ?? [];

  const assignMutation = useMutation(opportunityMutations.assign());
  const assignAutoMutation = useMutation(opportunityMutations.assignAuto());

  useEffect(() => {
    setPageIndex(0);
  }, [nameFilter, unassignedOnly]);

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
        header: "Cơ hội",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <div className="fw-semibold">{row.name}</div>
              <div className="small text-muted">{row.customerName || "-"}</div>
            </div>
          );
        }
      }),
      columnHelper.accessor("priority", {
        header: "Ưu tiên",
        cell: (info: any) => {
          const p = Number(info.getValue() ?? 0);
          return <span className="badge badge-soft-warning">{p}</span>;
        },
        meta: { className: "text-center" }
      }),
      columnHelper.accessor("userName", {
        header: "Nhân viên phụ trách",
        cell: (info) => info.getValue() || <span className="text-danger">Chưa phân công</span>
      }),
      columnHelper.display({
        id: "action",
        header: "Điều phối",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select form-select-sm"
                defaultValue=""
                onChange={async (e) => {
                  const userId = Number(e.target.value);
                  if (!userId) return;
                  await assignMutation.mutateAsync({ id: row.id, userId });
                  query.refetch();
                }}
              >
                <option value="">Chọn nhân viên</option>
                {userOptions.map((u) => (
                  <option value={u.value} key={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={async () => {
                  await assignAutoMutation.mutateAsync({ id: row.id });
                  query.refetch();
                }}
              >
                Chia đều
              </button>
            </div>
          );
        }
      })
    ],
    [pageIndex, pageSize, assignMutation, assignAutoMutation, userOptions, query]
  );

  const table = useReactTable({
    data: opportunities,
    columns,
    state: {
      columnFilters,
      pagination: { pageIndex, pageSize }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex, pageSize });
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
      }
    },
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pageSize),
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-1 fw-bold">Điều phối cơ hội</h4>
            <div className="small text-muted">Cơ hội / Điều phối</div>
          </div>
          <RefreshButton onRefresh={() => query.refetch()} />
        </div>

        <div className="card border-0 rounded-0 shadow-sm mb-3">
          <div className="card-body p-3 d-flex gap-3 align-items-center">
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="unassignedSwitch"
                checked={unassignedOnly}
                onChange={(e) => setUnassignedOnly(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="unassignedSwitch">
                Chỉ hiển thị cơ hội chưa có nhân viên
              </label>
            </div>
          </div>
        </div>

        <div className="card border-0 rounded-0 shadow-sm">
          <div className="card-body p-3">
            <AsyncBoundary
              status={query.status}
              data={opportunities}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable
                  filterKey="name"
                  filterKeyPlaceholder="Tìm theo tên cơ hội..."
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
