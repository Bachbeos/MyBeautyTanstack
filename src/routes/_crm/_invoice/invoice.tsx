import { AsyncBoundary } from "@/components/async-boundary";
import CollapseButton from "@/components/collapse/collapse-button";
import { usePermission } from "@/hooks/use-permission";
import { Can } from "@/components/auth/can";
import ExportButton from "@/components/export/export";
import ActionsTable from "@/components/table/actions-table";
import RefreshButton from "@/components/refresh/refresh";
import { DataTable } from "@/components/table/data-table";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useCloseModal, useModalFade } from "@/hooks/use-modal-animation";
import { exportVisibleTableToXLSX } from "@/lib/export/export-to-excel";
import { exportVisibleTableToPDF } from "@/lib/export/export-to-pdf";
import { invoiceMutations, invoiceQueries } from "@/lib/tanstack/options/invoice";
import type { InvoiceDto } from "@/lib/types/invoice";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

const columnHelper = createColumnHelper<InvoiceDto>();

export const Route = createFileRoute("/_crm/_invoice/invoice")({
  component: RouteComponent
});

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );

  const { canAdd, canEdit, canDelete, canView } = usePermission("INVOICE");

  const rawNameFilter = useMemo(() => {
    const filter = columnFilters.find((f) => f.id === "invoice_code");
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
      keyword: nameFilter || undefined,
      status: 3
    }),
    [pageIndex, pageSize, nameFilter]
  );

  useEffect(() => {
    setPageIndex(0);
  }, [nameFilter]);

  const query = useQuery(invoiceQueries.list(params));
  const invoices = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const createMutation = useMutation(invoiceMutations.create());
  const updateMutation = useMutation(invoiceMutations.update());
  const deleteMutation = useMutation(invoiceMutations.delete());

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center align-middle" }
      }),
      columnHelper.accessor("invoiceCode", {
        id: "invoice_code",
        header: "Mã hóa đơn",
        cell: (info) => <span className="fw-bold text-primary">#{info.getValue()}</span>,
        meta: { className: "align-middle" }
      }),
      columnHelper.display({
        id: "customer_info",
        header: "Khách hàng",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="d-flex flex-column">
              <span className="fw-medium text-dark">{row.customerName || "Khách vãng lai"}</span>
              {row.phone ? <small className="text-muted">{String(row.phone)}</small> : null}
            </div>
          );
        },
        meta: { className: "align-middle" }
      }),
      columnHelper.accessor("amount", {
        id: "amount",
        header: "Tạm tính",
        cell: (info) => (
          <span className="fw-bold text-dark">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
              Number(info.getValue()) || 0
            )}
          </span>
        ),
        meta: { className: "align-middle text-end" }
      }),
      columnHelper.accessor("discount", {
        id: "discount",
        header: "Giảm giá",
        cell: (info) => (
          <span className="fw-bold text-danger">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
              Number(info.getValue()) || 0
            )}
          </span>
        ),
        meta: { className: "align-middle text-end" }
      }),
      columnHelper.accessor("fee", {
        id: "fee",
        header: "Tổng tiền",
        cell: (info) => (
          <span className="fw-bold text-dark">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
              Number(info.getValue()) || 0
            )}
          </span>
        ),
        meta: { className: "align-middle text-end" }
      }),
      columnHelper.accessor("paymentType", {
        id: "payment_type",
        header: "Thanh toán",
        cell: (info) => {
          const type = Number(info.getValue());
          return type === 2 ? (
            <span className="badge badge-soft-info">Chuyển khoản</span>
          ) : (
            <span className="badge badge-soft-success">Tiền mặt</span>
          );
        },
        meta: { className: "text-center align-middle w-1" }
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Trạng thái",
        cell: (info) => {
          const status = Number(info.getValue());
          return status === 1 ? (
            <span className="badge badge-soft-success">Hoàn tất</span>
          ) : (
            <span className="badge badge-soft-warning">Hóa đơn nháp</span>
          );
        },
        meta: { className: "text-center align-middle w-1" }
      }),
      columnHelper.accessor("createdTime", {
        id: "created_time",
        header: "Ngày tạo",
        cell: (info) => {
          const row = info.row.original;
          const date = row.createdTime || row.receiptDate;
          return (
            <span className="fs-13 text-muted">
              {date ? new Date(date).toLocaleString("vi-VN") : "-"}
            </span>
          );
        },
        meta: { className: "align-middle text-center" }
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
            resource="INVOICE"
          />
        )
      })
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: invoices,
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
              Danh sách hóa đơn
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            <div className="text-muted small">Hóa đơn / Danh sách hóa đơn</div>
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
              data={invoices}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="invoice_code"
                  filterKeyPlaceholder="Tìm nhanh hóa đơn..."
                  // toolbarRight={
                  //   <AddButton label="Thêm sản phẩm" onClick={() => openModal("add", null)} />
                  // }
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
