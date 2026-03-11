import { AsyncBoundary } from "@/components/async-boundary";
import ExportButton from "@/components/export/export";
import ModalCallHistory from "@/components/features/call-history/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { callHistoryMutations, callHistoryQueries } from "@/lib/tanstack/options/call-history";
import { customerQueries } from "@/lib/tanstack/options/customer";
import { userQueries } from "@/lib/tanstack/options/user";
import type { callHistoryDto } from "@/lib/types/call-history";
import { cn } from "@/lib/utils";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

const columnHelper = createColumnHelper<callHistoryDto>();

export const Route = createFileRoute("/_crm/_call-history/call-history")({
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
    item?: callHistoryDto;
    shown: boolean;
  }>({
    type: null,
    item: undefined,
    shown: false
  });

  const openModal = (type: "add" | "edit" | "delete" | "detail", item?: callHistoryDto) => {
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

  const query = useQuery(callHistoryQueries.list(params));
  const callHistorys = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const createMutation = useMutation(callHistoryMutations.create());
  const updateMutation = useMutation(callHistoryMutations.update());
  const deleteMutation = useMutation(callHistoryMutations.delete());

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.accessor("callType", {
        header: "Loại cuộc gọi",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const callType = info.getValue();
          const isAudio = Number(callType) === 1;

          return (
            <span className="fs-18 text-primary" title={isAudio ? "Audio" : "Video"}>
              {isAudio ? <i className="ti ti-phone" /> : <i className="ti ti-video" />}
            </span>
          );
        }
      }),
      columnHelper.display({
        id: "participants",
        header: "Người tham gia",
        cell: (info) => {
          const row = info.row.original;
          const userName = row.userName;
          const customerName = row.customerName;
          return (
            <div>
              <div className="d-flex align-items-center mb-1">
                <i className="ti ti-user-circle me-1 text-muted"></i>
                <span className="text-muted small">{userName}</span>
              </div>
              <div className="d-flex align-items-center">
                <i className="ti ti-user me-1 text-muted"></i>
                <span className="text-muted small">{customerName}</span>
              </div>
            </div>
          );
        }
      }),
      columnHelper.accessor("outcome", {
        header: "Kết quả",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const outcome = Number(info.getValue());
          let badgeClass = "badge-soft-secondary";
          let label = "Không xác định";

          if (outcome === 1) {
            badgeClass = "badge-soft-success";
            label = "Cuộc gọi đến";
          } else if (outcome === 2) {
            badgeClass = "badge-soft-info";
            label = "Cuộc gọi đi";
          } else if (outcome === 3) {
            badgeClass = "badge-soft-danger";
            label = "Cuộc gọi nhỡ";
          }

          return <span className={`badge ${badgeClass}`}>{label}</span>;
        }
      }),
      columnHelper.accessor("duration", {
        header: "Thời lượng",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const duration = info.getValue();
          return formatDuration(duration);
        }
      }),
      columnHelper.accessor("interestLevel", {
        header: "Đánh giá",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const row = info.row.original;
          const level = Number(info.getValue() || 0);

          return (
            <div className="text-warning d-flex justify-content-center">
              {Number(row.outcome) === 3 ? (
                <span className="text-muted small">-</span>
              ) : (
                Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`ti ti-star ${i < level ? "fs-12" : "fs-12 text-muted opacity-25"}`}
                  />
                ))
              )}
            </div>
          );
        }
      }),
      columnHelper.accessor("status", {
        header: "Trạng thái",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const row = info.row.original;
          const isActive = Number(row.status) === 1;

          return (
            <span
              className={cn(
                "badge cursor-pointer",
                isActive ? "badge-soft-success" : "badge-soft-danger"
              )}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(row);
              }}
            >
              {isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
            </span>
          );
        }
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
    data: callHistorys,
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

  const usersInf = useInfiniteQuery(userQueries.infinite({ limit: 10 }));
  const customersInf = useInfiniteQuery(customerQueries.infinite({ limit: 10 }));

  const [userOptions, customerOptions] = useMemo(
    () => [
      usersInf.data?.pages
        .flatMap((page) => page.result?.items ?? [])
        .map((user) => ({ label: String(user.name), value: Number(user.id) })) ?? [],
      customersInf.data?.pages
        .flatMap((page) => page.result?.items ?? [])
        .map((customer) => ({ label: String(customer.name), value: Number(customer.id) })) ?? []
    ],
    [usersInf.data, customersInf.data]
  );

  const [handleLoadMoreUsers, handleLoadMoreCustomers] = [usersInf, customersInf].map(
    (q) => () => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()
  );

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

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleToggleStatus = async (row: callHistoryDto) => {
    const newStatus = Number(row.status) === 1 ? 0 : 1;

    try {
      await updateMutation.mutateAsync({
        ...row,
        status: newStatus
      });
      query.refetch();
    } catch (error) {
      console.error("Toggle status failed:", error);
    }
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
              data={callHistorys}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh lịch sử cuộc gọi..."
                  toolbarRight={
                    <AddButton label="Thêm lịch sử cuộc gọi" onClick={() => openModal("add")} />
                  }
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalCallHistory
        type={modal.type}
        shown={modal.shown}
        item={modal.item}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        userOptions={userOptions}
        customerOptions={customerOptions}
        onLoadMoreUsers={handleLoadMoreUsers}
        onLoadMoreCustomers={handleLoadMoreCustomers}
      />
    </div>
  );
}
