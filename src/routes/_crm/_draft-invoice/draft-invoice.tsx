import { AsyncBoundary } from "@/components/async-boundary";
import CollapseButton from "@/components/collapse/collapse-button";
import RefreshButton from "@/components/refresh/refresh";
import { DataTable } from "@/components/table/data-table";
import ActionsTable from "@/components/table/actions-table";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useCloseModal, useModalFade } from "@/hooks/use-modal-animation";
import { BaseModal } from "@/components/ui/modal";
import { invoiceMutations, invoiceQueries } from "@/lib/tanstack/options/invoice";
import type { InvoiceDto } from "@/lib/types/invoice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

const columnHelper = createColumnHelper<InvoiceDto>();

export const Route = createFileRoute("/_crm/_draft-invoice/draft-invoice")({
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
      status: [0]
    }),
    [pageIndex, pageSize, nameFilter]
  );

  useEffect(() => {
    setPageIndex(0);
  }, [nameFilter]);

  const query = useQuery(invoiceQueries.list(params));
  const invoices = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const deleteMutation = useMutation(invoiceMutations.deleteDraft());

  const handleDelete = async () => {
    if (!modal.item?.id) return;
    try {
      await deleteMutation.mutateAsync(modal.item.id as any);
      closeModal();
      query.refetch();
    } catch (error) {
      // Error is usually handled by global mutation handler if meta is present
    }
  };

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
      columnHelper.accessor("createdTime", {
        id: "created_time",
        header: "Ngày tạo",
        cell: (info) => {
          const row = info.row.original;
          const date = row.createdTime || row.receiptDate;
          return (
            <span className="fs-13 text-muted">
              {date ? new Date(date).toLocaleDateString("vi-VN") : "-"}
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
            onDelete={(data) => openModal("delete", data)}
            extra={(data) => (
              <Link
                to="/sale"
                search={{ invoiceId: Number(data.id) } as any}
                className="btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Tiếp tục làm việc"
                style={{ width: "32px", height: "32px", padding: 0 }}
              >
                <i className="ti ti-arrow-right"></i>
              </Link>
            )}
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
              Danh sách hóa đơn nháp
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            <div className="text-muted small">Hóa đơn / Hóa đơn nháp</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
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
                  filterKeyPlaceholder="Tìm nhanh hóa đơn nháp..."
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      {modal.type === "delete" && (
        <BaseModal
          title="Xóa hóa đơn nháp?"
          shown={modalShown}
          size="sm"
          onClose={closeModal}
          footer={
            <div className="d-flex justify-content-center w-100 gap-2">
              <button className="btn btn-sm btn-light w-100" onClick={closeModal}>
                Hủy
              </button>
              <button className="btn btn-sm btn-danger w-100" onClick={handleDelete}>
                Đồng ý
              </button>
            </div>
          }
        >
          <div className="text-center">
            <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle mb-3">
              <i className="ti ti-trash fs-24"></i>
            </span>
            <h5 className="mb-1">Xóa hóa đơn nháp</h5>
            <p className="mb-3 text-muted">
              Bạn có chắc muốn xóa hóa đơn nháp <strong>#{modal.item?.invoiceCode}</strong> không?
            </p>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
