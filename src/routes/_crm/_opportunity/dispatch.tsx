import { AsyncBoundary } from "@/components/async-boundary";
import RefreshButton from "@/components/refresh/refresh";
import { DataTable } from "@/components/table/data-table";
import AppSelect, { type AppSelectOption } from "@/components/ui/app-select";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { opportunityMutations, opportunityQueries } from "@/lib/tanstack/options/opportunity";
import { userQueries } from "@/lib/tanstack/options/user";
import type { OpportunityDto, OpportunityId } from "@/lib/types/opportunity";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState,
  type RowSelectionState
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

const columnHelper = createColumnHelper<OpportunityDto>();

const priorityLabelMap: Record<number, { label: string; className: string }> = {
  0: { label: "Rất thấp", className: "badge-soft-secondary" },
  1: { label: "Thấp", className: "badge-soft-info" },
  2: { label: "Trung bình", className: "badge-soft-warning" },
  3: { label: "Cao", className: "badge-soft-primary" },
  4: { label: "Rất cao", className: "badge-soft-danger" },
  5: { label: "Khẩn cấp", className: "badge-soft-danger" }
};

const stageLabelMap: Record<number, string> = {
  1: "Khởi tạo",
  2: "Tiếp cận",
  3: "Tư vấn",
  4: "Đàm phán",
  5: "Chốt deal",
  6: "Thành công",
  7: "Thất bại"
};

export const Route = createFileRoute("/_crm/_opportunity/dispatch")({
  component: RouteComponent
});

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [unassignedOnly, setUnassignedOnly] = useState(true);

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

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

  const usersInf = useInfiniteQuery(
    userQueries.infinite({
      limit: 50
    })
  );

  const userOptions = useMemo<AppSelectOption[]>(
    () =>
      usersInf.data?.pages
        .flatMap((page) => page.result?.items ?? [])
        .map((user) => ({ value: Number(user.id), label: String(user.name) })) ?? [],
    [usersInf.data]
  );

  const selectedUsersForDropdown = useMemo(
    () => userOptions.filter((u) => selectedUserIds.includes(Number(u.value))),
    [userOptions, selectedUserIds]
  );

  const distributeMutation = useMutation(opportunityMutations.distribute());

  useEffect(() => {
    setPageIndex(0);
  }, [nameFilter, unassignedOnly]);

  useEffect(() => {
    setRowSelection({});
  }, [pageIndex, pageSize, nameFilter, unassignedOnly]);

  useEffect(() => {
    setSelectedUserIds((prev) =>
      prev.filter((id) => userOptions.some((u) => Number(u.value) === id))
    );
  }, [userOptions]);

  const selectedOpportunityIds = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((index) => opportunities[Number(index)]?.id)
      .filter((id): id is OpportunityId => Boolean(id));
  }, [rowSelection, opportunities]);

  const canDispatch = selectedUserIds.length > 0 && selectedOpportunityIds.length > 0;

  const formatCurrency = (value?: number) => {
    if (!value || Number.isNaN(value)) return "-";
    return `${value.toLocaleString("vi-VN")} đ`;
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          const checked = table.getIsAllPageRowsSelected();
          const indeterminate = table.getIsSomePageRowsSelected() && !checked;
          return (
            <input
              type="checkbox"
              className="form-check-input"
              checked={checked}
              ref={(el) => {
                if (el) el.indeterminate = indeterminate;
              }}
              onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            />
          );
        },
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="form-check-input"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
          />
        ),
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.accessor("code", {
        header: "Mã cơ hội",
        cell: (info) => info.getValue() || "-",
        meta: { className: "text-center" }
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Cơ hội",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <div className="fw-semibold">{row.name}</div>
              <div className="small text-muted">Khách hàng: {row.customerName || "-"}</div>
            </div>
          );
        }
      }),
      columnHelper.accessor((row) => Number((row as any).priority ?? 0), {
        id: "priority",
        header: "Mức độ ưu tiên",
        cell: (info) => {
          const p = Number(info.getValue() ?? 0);
          const mapped = priorityLabelMap[p] ?? {
            label: "Không xác định",
            className: "badge-soft-secondary"
          };
          return <span className={`badge ${mapped.className}`}>{mapped.label}</span>;
        },
        meta: { className: "text-center" }
      }),
      columnHelper.accessor((row) => Number(row.expectedValue ?? 0), {
        id: "expectedValue",
        header: "Giá trị dự kiến",
        cell: (info) => formatCurrency(Number(info.getValue() ?? 0)),
        meta: { className: "text-end" }
      }),
      columnHelper.accessor((row) => Number(row.probability ?? 0), {
        id: "probability",
        header: "Xác suất",
        cell: (info) => `${Number(info.getValue() ?? 0)}%`,
        meta: { className: "text-center" }
      }),
      columnHelper.accessor((row) => Number(row.stage ?? 1), {
        id: "stage",
        header: "Giai đoạn",
        cell: (info) => stageLabelMap[Number(info.getValue() ?? 1)] || "-",
        meta: { className: "text-center" }
      }),
      columnHelper.accessor("userName", {
        header: "Nhân viên phụ trách",
        cell: (info) => info.getValue() || <span className="text-danger">Chưa phân công</span>
      }),
      columnHelper.display({
        id: "action",
        header: "Điều phối nhanh",
        cell: () => <span className="text-muted small">Chọn ở form bên trên</span>
      })
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: opportunities,
    columns,
    state: {
      columnFilters,
      pagination: { pageIndex, pageSize },
      rowSelection
    },
    getRowId: (_row, index) => String(index),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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

  const handleRunDispatch = async () => {
    if (!canDispatch || selectedOpportunityIds.length === 0) return;

    await distributeMutation.mutateAsync({
      opportunityIds: selectedOpportunityIds.map(Number),
      userIds: selectedUserIds
    });

    setRowSelection({});
    setSelectedUserIds([]);
    await query.refetch();
  };

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
          <div className="card-body p-3 d-flex flex-column gap-3">
            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
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
              <span className="badge badge-soft-primary">
                Đã chọn {selectedOpportunityIds.length} cơ hội
              </span>
            </div>

            <div className="border rounded-2 p-3 bg-light-subtle">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-lg-6">
                  <label className="form-label mb-1">Danh sách nhân viên</label>
                  <AppSelect
                    value={selectedUsersForDropdown}
                    options={userOptions}
                    isMulti
                    placeholder="Tìm kiếm và chọn nhân viên"
                    onMenuScrollToBottom={() =>
                      usersInf.hasNextPage && !usersInf.isFetchingNextPage && usersInf.fetchNextPage()
                    }
                    onChange={(option) => {
                      const selected = Array.isArray(option) ? option : option ? [option] : [];
                      setSelectedUserIds(selected.map((item) => Number(item.value)).filter(Boolean));
                    }}
                  />
                </div>

                <div className="col-12 col-lg-6">
                  <label className="form-label mb-1">Danh sách cơ hội đã chọn</label>
                  <div className="border rounded-2 bg-white p-2 d-flex flex-wrap gap-2" style={{ minHeight: 42 }}>
                    {selectedOpportunityIds.length > 0 ? (
                      selectedOpportunityIds.map((id) => {
                        const opportunity = opportunities.find((item) => Number(item.id) === Number(id));
                        return (
                          <span key={String(id)} className="badge bg-primary-subtle text-primary">
                            {opportunity?.code || `#${String(id)}`}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-muted small">Chưa chọn cơ hội nào</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button
                  className="btn btn-primary"
                  disabled={!canDispatch || distributeMutation.isPending}
                  onClick={handleRunDispatch}
                >
                  {distributeMutation.isPending ? "Đang chia đều..." : "Chia đều công việc"}
                </button>
              </div>
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
