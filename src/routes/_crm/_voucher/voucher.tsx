import { AsyncBoundary } from "@/components/async-boundary";
import ExportButton from "@/components/export/export";
import ModalVoucher from "@/components/features/voucher/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { usePermission } from "@/hooks/use-permission";
import { Can } from "@/components/auth/can";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { branchQueries } from "@/lib/tanstack/options/branch";
import { voucherMutations, voucherQueries } from "@/lib/tanstack/options/voucher";
import type { VoucherDto } from "@/lib/types/voucher";
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
import { useModalFade, useCloseModal } from "@/hooks/use-modal-animation";
import CollapseButton from "@/components/collapse/collapse-button";
import { exportVisibleTableToXLSX } from "@/lib/export/export-to-excel";
import { exportVisibleTableToPDF } from "@/lib/export/export-to-pdf";

const columnHelper = createColumnHelper<VoucherDto>();

export const Route = createFileRoute("/_crm/_voucher/voucher")({
  component: RouteComponent
});

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );
 
  const { canAdd, canEdit, canDelete, canView } = usePermission("VOUCHER");

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

  const query = useQuery(voucherQueries.list(params));
  const vouchers = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const createMutation = useMutation(voucherMutations.create());
  const updateMutation = useMutation(voucherMutations.update());
  const deleteMutation = useMutation(voucherMutations.delete());

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.accessor("code", {
        id: "code",
        header: "Mã giảm giá",
        meta: { className: "text-center" }
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Tên chương trình"
      }),
      columnHelper.accessor("discountValue", {
        id: "discountValue",
        header: "Giá trị giảm",
        cell: (info) => {
          const row = info.row.original;
          const value = info.getValue() as number;
          const formatVND = (amount: number) =>
            new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

          if (row.discountType === 1) {
            return <span>{formatVND(Number(value))}</span>;
          }

          return (
            <div>
              <span className="fw-bold">{value}%</span>
              {row.maxDiscount && row.maxDiscount > 0 && (
                <div className="small text-muted">Max: {formatVND(row.maxDiscount)}</div>
              )}
            </div>
          );
        }
      }),
      columnHelper.display({
        id: "quantity",
        header: "Lượt dùng",
        cell: (info) => {
          const row = info.row.original;
          return (
            <span>
              <span className="text-success fw-medium">{row.usageQuantity}</span>
              <span className="text-muted"> / {row.totalQuantity}</span>
            </span>
          );
        },
        meta: { className: "text-center" }
      }),
      columnHelper.display({
        id: "time",
        header: "Thời gian",
        cell: (info) => {
          const row = info.row.original;

          const formatDate = (dateStr: string | Date) =>
            new Date(dateStr).toLocaleDateString("vi-VN");

          return (
            <div className="small">
              <div className="fw-medium">{formatDate(row.startDate)}</div>
              <div className="text-muted">
                <i className="ti ti-arrow-narrow-right me-1"></i>
                đến {formatDate(row.endDate)}
              </div>
            </div>
          );
        }
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Trạng thái",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const row = info.row.original;
          const now = new Date();
          const start = new Date(row.startDate);
          const end = new Date(row.endDate);

          let statusLabel = "Ngưng hoạt động";
          let badgeClass = "badge-soft-danger";

          if (Number(row.status) === 1) {
            if (now < start) {
              statusLabel = "Chưa diễn ra";
              badgeClass = "badge-soft-info";
            } else if (now > end) {
              statusLabel = "Hết hạn";
              badgeClass = "badge-soft-secondary";
            } else {
              statusLabel = "Đang hoạt động";
              badgeClass = "badge-soft-success";
            }
          }

          return (
            <span
              className={cn(
                "badge cursor-pointer",
                badgeClass,
                !canEdit && "opacity-50 cursor-not-allowed"
              )}
              style={{ cursor: canEdit ? "pointer" : "not-allowed" }}
              onClick={(e) => {
                if (!canEdit) return;
                e.stopPropagation();
                handleToggleStatus(row);
              }}
            >
              {statusLabel}
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
            resource="VOUCHER"
          />
        )
      })
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: vouchers,
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

  const branchsInf = useInfiniteQuery(branchQueries.infinite({ limit: 10 }));

  const branchOptions = useMemo(() => {
    const branches = branchsInf.data?.pages.flatMap((p) => p.result?.items ?? []) ?? [];

    const defaultOption = { label: "Toàn hệ thống (Mặc định)", value: 0 };

    return [defaultOption, ...branches.map((b) => ({ label: b.name, value: b.id }))];
  }, [branchsInf.data]);

  const [handleLoadMoreBranches] = [branchsInf].map(
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

  const handleToggleStatus = async (row: VoucherDto) => {
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
          <div>
            <h4 className="mb-1 fw-bold">
              Danh sách mã giảm giá
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            <div className="text-muted small">Mã giảm giá / Danh sách mã giảm giá</div>
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
              data={vouchers}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh mã giảm giá..."
                  toolbarRight={
                    <Can I="ADD" a="VOUCHER">
                      <AddButton label="Thêm mã giảm giá" onClick={() => openModal("add", null)} />
                    </Can>
                  }
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalVoucher
        type={modal.type}
        shown={modalShown}
        item={modal.item}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        branchOptions={branchOptions}
        onLoadMoreBranches={handleLoadMoreBranches}
      />
    </div>
  );
}
