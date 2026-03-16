import { AsyncBoundary } from "@/components/async-boundary";
import ExportButton from "@/components/export/export";
import ModalService from "@/components/features/service/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { categoryQueries } from "@/lib/tanstack/options/category";
import { serviceMutations, serviceQueries } from "@/lib/tanstack/options/service";
import type { ServiceDto } from "@/lib/types/service";
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

const columnHelper = createColumnHelper<ServiceDto>();

export const Route = createFileRoute("/_crm/_service/service")({
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
    item?: ServiceDto;
    shown: boolean;
  }>({
    type: null,
    item: undefined,
    shown: false
  });

  const openModal = (type: "add" | "edit" | "delete" | "detail", item?: ServiceDto) => {
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

  const query = useQuery(serviceQueries.list(params));
  const services = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const createMutation = useMutation(serviceMutations.create());
  const updateMutation = useMutation(serviceMutations.update());
  const deleteMutation = useMutation(serviceMutations.delete());

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
        header: "Tên dịch vụ",
        cell: (info) => {
          const row = info.row.original;
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || "avatar")}&background=random`;

          return (
            <div className="d-flex align-items-center">
              <div
                className="avatar avatar-sm rounded-circle border me-2 flex-shrink-0"
                style={{ width: "32px", height: "32px", overflow: "hidden" }}
              >
                <img
                  src={row.avatar || fallbackAvatar}
                  alt={row.name}
                  className="w-100 h-100 object-fit-cover rounded-circle"
                  onError={(e) => {
                    e.currentTarget.src = fallbackAvatar;
                  }}
                />
              </div>
              <span>{row.name}</span>
            </div>
          );
        }
      }),
      columnHelper.accessor("categoryName", {
        id: "categoryName",
        header: "Danh mục"
      }),
      columnHelper.accessor("price", {
        id: "price",
        header: "Giá bán",
        cell: (info) => (
          <span>
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
              Number(info.getValue()) || 0
            )}
          </span>
        )
      }),
      columnHelper.accessor("isCombo", {
        id: "isCombo",
        header: "Loại",
        meta: { className: "text-center" },
        cell: (info) =>
          Number(info.getValue()) === 1 ? (
            <span className="badge badge-soft-warning">Combo</span>
          ) : (
            <span className="badge badge-soft-info">Thường</span>
          )
      }),
      columnHelper.accessor("status", {
        id: "status",
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
    data: services,
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

  const handleToggleStatus = async (row: ServiceDto) => {
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

  const categorysInf = useInfiniteQuery(categoryQueries.infinite({ limit: 10 }));

  const categoryOptions = useMemo(() => {
    return (
      categorysInf.data?.pages
        .flatMap((page) => page.result?.items ?? [])
        .map((category) => ({ label: String(category.name), value: Number(category.id) })) ?? []
    );
  }, [categorysInf.data]);

  const [handleLoadMoreCategories] = [categorysInf].map(
    (q) => () => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()
  );

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold">
              Danh sách dịch vụ
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            <div className="text-muted small">Dịch vụ / Danh sách</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <ExportButton onExport={() => {}} />
            <RefreshButton onRefresh={() => query.refetch()} />
          </div>
        </div>

        <div className="card border-0 rounded-0 shadow-sm">
          <div className="card-body p-3">
            <AsyncBoundary
              status={query.status}
              data={services}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh dịch vụ..."
                  toolbarRight={<AddButton label="Thêm dịch vụ" onClick={() => openModal("add")} />}
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalService
        type={modal.type}
        shown={modal.shown}
        item={modal.item}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        categoryOptions={categoryOptions}
        onLoadMoreCategories={handleLoadMoreCategories}
      />
    </div>
  );
}
