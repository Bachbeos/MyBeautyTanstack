import { AsyncBoundary } from "@/components/async-boundary";
import CollapseButton from "@/components/collapse/collapse-button";
import ExportButton from "@/components/export/export";
import ModalCustomer from "@/components/features/customer/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useCloseModal, useModalFade } from "@/hooks/use-modal-animation";
import { exportVisibleTableToXLSX } from "@/lib/export/export-to-excel";
import { exportVisibleTableToPDF } from "@/lib/export/export-to-pdf";
import { customerMutations, customerQueries } from "@/lib/tanstack/options/customer";
import { customerAttributeQueries } from "@/lib/tanstack/options/customer-attribute";
import { customerSourceQueries } from "@/lib/tanstack/options/customer-source";
import type { CustomerDto } from "@/lib/types/customer";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

const columnHelper = createColumnHelper<CustomerDto>();

export const Route = createFileRoute("/_crm/_customer/customer")({
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

  const query = useQuery(customerQueries.list(params));
  const customers = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const selectedCustomerId = modal.item?.id as any;
  const detailQuery = useQuery({
    ...customerQueries.detail(selectedCustomerId),
    enabled:
      !!selectedCustomerId && modalShown && (modal.type === "edit" || modal.type === "detail")
  });

  const detailItem = detailQuery.data?.result as CustomerDto | undefined;
  const listExtraInfos = ((modal.item as any)?.customerExtraInfos ??
    (modal.item as any)?.customerExtraInfoDtos ??
    []) as any[];
  const detailExtraInfos = ((detailItem as any)?.customerExtraInfos ??
    (detailItem as any)?.customerExtraInfoDtos ??
    []) as any[];

  const modalItem = detailItem
    ? ({
        ...(modal.item as any),
        ...(detailItem as any),
        customerExtraInfos: detailExtraInfos.length ? detailExtraInfos : listExtraInfos
      } as CustomerDto)
    : modal.item;

  const attrQuery = useQuery(customerAttributeQueries.list({}));
  const dynamicAttributes = attrQuery.data?.result?.items ?? [];

  const createMutation = useMutation(customerMutations.create());
  const updateMutation = useMutation(customerMutations.update());
  const deleteMutation = useMutation(customerMutations.delete());

  const columns = useMemo(() => {
    const staticCols = [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Khách hàng",
        cell: (info) => {
          const row = info.row.original;
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || "avatar")}&background=random`;
          return (
            <div className="d-flex align-items-center">
              <div
                className="avatar avatar-sm rounded-circle border me-2 flex-shrink-0"
                style={{ width: "32px", height: "32px" }}
              >
                <img
                  src={row.avatar || fallbackAvatar}
                  alt={row.name}
                  className="w-100 h-100 object-fit-cover rounded-circle"
                />
              </div>
              <span>{row.name}</span>
            </div>
          );
        }
      }),
      columnHelper.accessor("phone", { header: "Số điện thoại" }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("address", { header: "Địa chỉ" })
    ];

    const dynamicCols = dynamicAttributes.map((attr: any) =>
      columnHelper.display({
        id: `attr_${attr.id}`,
        header: attr.name,
        cell: (info) => {
          const extraInfos = (info.row.original.customerExtraInfos as any[]) || [];
          const found = extraInfos.find((ei: any) => ei.attributeId === attr.id);
          if (!found?.attributeValue) return "-";

          if (attr.datatype === "attachment") {
            return (
              <a href={found.attributeValue} target="_blank" className="text-primary">
                <i className="ti ti-paperclip" />
              </a>
            );
          }
          return found.attributeValue;
        }
      })
    );

    return [
      ...staticCols,
      ...dynamicCols,
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
    ];
  }, [pageIndex, pageSize, dynamicAttributes]);

  const table = useReactTable({
    data: customers,
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

  const customerSourcesInf = useInfiniteQuery(customerSourceQueries.infinite({ limit: 10 }));

  const customerSourceOptions = useMemo(
    () =>
      customerSourcesInf.data?.pages
        .flatMap((page) => page.result?.items ?? [])
        .map((customerSource) => ({
          label: String(customerSource.name),
          value: Number(customerSource.id)
        })) ?? [],
    [customerSourcesInf.data]
  );

  const [handleLoadMoreCustomerSources] = [customerSourcesInf].map(
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
              Danh sách khách hàng
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            <div className="text-muted small">Khách hàng / Danh sách khách hàng</div>
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
              data={customers}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh khách hàng..."
                  toolbarRight={
                    <AddButton label="Thêm khách hàng" onClick={() => openModal("add", null)} />
                  }
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalCustomer
        type={modal.type}
        shown={modalShown}
        item={modalItem}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        customerSourceOptions={customerSourceOptions}
        onLoadMorecustomerSources={handleLoadMoreCustomerSources}
      />
    </div>
  );
}
