import { AsyncBoundary } from "@/components/async-boundary";
import ExportButton from "@/components/export/export";
import ModalProduct from "@/components/features/product/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { productMutations, productQueries } from "@/lib/tanstack/options/product";
import type { ProductDto } from "@/lib/types/product";
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

const columnHelper = createColumnHelper<ProductDto>();

export const Route = createFileRoute("/_crm/_product/product")({
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
    item?: ProductDto;
    shown: boolean;
  }>({
    type: null,
    item: undefined,
    shown: false
  });

  const openModal = (type: "add" | "edit" | "delete" | "detail", item?: ProductDto) => {
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

  const query = useQuery(productQueries.list(params));
  const products = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const createMutation = useMutation(productMutations.create());
  const updateMutation = useMutation(productMutations.update());
  const deleteMutation = useMutation(productMutations.delete());

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.accessor("code", {
        header: "Mã sản phẩm"
      }),
      columnHelper.accessor("name", {
        header: "Tên sản phẩm"
      }),
      columnHelper.accessor("categoryName", {
        header: "Danh mục"
      }),
      columnHelper.accessor("price", {
        header: "Giá bán"
      }),
      columnHelper.accessor("discount", {
        header: "Giảm giá",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const row = info.row.original;
          const discount = info.getValue();

          if (!discount || discount === 0) return "0";

          const unit = Number(row.discountUnit) === 2 ? "đ" : "%";
          const displayValue =
            unit === "đ" ? new Intl.NumberFormat("vi-VN").format(Number(discount)) : discount;

          return (
            <span>
              {displayValue}
              {unit}
            </span>
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
    data: products,
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

  const handleToggleStatus = async (row: ProductDto) => {
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
              Danh sách sản phẩm
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            {/* Breadcrumb component ở đây */}
            <div className="text-muted small">Sản phẩm / Danh sách</div>
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
              data={products}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh sản phẩm..."
                  toolbarRight={
                    <AddButton label="Thêm sản phẩm" onClick={() => openModal("add")} />
                  }
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalProduct
        type={modal.type}
        shown={modal.shown}
        item={modal.item}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        categoryOptions={[]}
        unitOptions={[]}
      />
    </div>
  );
}
