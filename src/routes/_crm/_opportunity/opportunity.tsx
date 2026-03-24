import { AsyncBoundary } from "@/components/async-boundary";
import CollapseButton from "@/components/collapse/collapse-button";
import ExportButton from "@/components/export/export";
import ModalOpportunity from "@/components/features/opportunity/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useCloseModal, useModalFade } from "@/hooks/use-modal-animation";
import { exportVisibleTableToXLSX } from "@/lib/export/export-to-excel";
import { exportVisibleTableToPDF } from "@/lib/export/export-to-pdf";
import { customerQueries } from "@/lib/tanstack/options/customer";
import { opportunityMutations, opportunityQueries } from "@/lib/tanstack/options/opportunity";
import { userQueries } from "@/lib/tanstack/options/user";
import type { OpportunityDto } from "@/lib/types/opportunity";
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

const columnHelper = createColumnHelper<OpportunityDto>();

export const Route = createFileRoute("/_crm/_opportunity/opportunity")({
  component: RouteComponent
});

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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

  const query = useQuery(opportunityQueries.list(params));
  const opportunities = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const createMutation = useMutation(opportunityMutations.create());
  const updateMutation = useMutation(opportunityMutations.update());
  const deleteMutation = useMutation(opportunityMutations.delete());

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center" }
      }),
      // columnHelper.accessor("code", {
      //   header: "Mã cơ hội",
      //   meta: { className: "text-center w-1" },
      //   cell: (info) => <span className="fw-bold text-primary">{info.getValue()}</span>
      // }),
      columnHelper.accessor("name", {
        header: "Cơ hội & Khách hàng",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <div className="fw-semibold mb-1">{row.name}</div>
              <div className="d-flex align-items-center">
                <i className="ti ti-user me-1 text-muted small"></i>
                <span className="text-muted small">{row.customerName}</span>
              </div>
            </div>
          );
        }
      }),
      columnHelper.accessor("userId", {
        header: "Sale phụ trách",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="d-flex align-items-center">
              <i className="ti ti-user-circle me-1 text-info"></i>
              <span className="small">{row.userName}</span>
            </div>
          );
        }
      }),
      columnHelper.accessor("expectedValue", {
        header: "Giá trị dự kiến",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const val = Number(info.getValue() || 0);
          return (
            <span className="fw-medium">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND"
              }).format(val)}
            </span>
          );
        }
      }),
      columnHelper.accessor("stage", {
        header: "Giai đoạn",
        meta: { className: "text-center" },
        cell: (info) => {
          const stage = Number(info.getValue());
          const probability = Number(info.row.original.probability || 0);

          const stages = {
            1: { label: "Lead", color: "bg-secondary" },
            2: { label: "Contacted", color: "bg-info" },
            3: { label: "Consulting", color: "bg-warning" },
            4: { label: "Won", color: "bg-success" },
            5: { label: "Loss", color: "bg-danger" }
          };

          const current = stages[stage as keyof typeof stages] || stages[1];

          return (
            <div style={{ minWidth: "120px" }}>
              <div className="d-flex justify-content-between mb-1 small">
                <span className={`badge ${current.color.replace("bg-", "badge-soft-")}`}>
                  {current.label}
                </span>
                <span className="text-muted">{probability}%</span>
              </div>
              <div className="progress progress-xs">
                <div
                  className={cn("progress-bar", current.color)}
                  role="progressbar"
                  style={{ width: `${probability}%` }}
                ></div>
              </div>
            </div>
          );
        }
      }),
      columnHelper.accessor("expectedCloseDate", {
        header: "Ngày dự kiến chốt",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const date = info.getValue();
          if (!date) return "-";
          return (
            <div className="fw-medium">
              <i className="ti ti-calendar-event me-1"></i>
              {new Date(date).toLocaleDateString("vi-VN")}
            </div>
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
    data: opportunities,
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

  const handleCollapse = () => {
    document.body.classList.toggle("header-collapse");
    setIsHeaderCollapsed(document.body.classList.contains("header-collapse"));
  };

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold">
              Danh sách cơ hội
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            <div className="text-muted small">Cơ hội / Danh sách cơ hội</div>
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
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh cơ hội..."
                  toolbarRight={
                    <AddButton label="Thêm cơ hội" onClick={() => openModal("add", null)} />
                  }
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalOpportunity
        type={modal.type}
        shown={modalShown}
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
