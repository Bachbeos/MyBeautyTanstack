import { AsyncBoundary } from "@/components/async-boundary";
import ExportButton from "@/components/export/export";
import ModalAttribute from "@/components/features/customer-attribute/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { usePermission } from "@/hooks/use-permission";
import { Can } from "@/components/auth/can";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import {
  customerAttributeMutations,
  customerAttributeQueries
} from "@/lib/tanstack/options/customer-attribute";
import type { CustomerAttributeDto } from "@/lib/types/customer-attribute";
import { useMutation, useQuery } from "@tanstack/react-query";
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

const columnHelper = createColumnHelper<CustomerAttributeDto>();

export const Route = createFileRoute("/_crm/_customer-settings/customer-attribute")({
  component: RouteComponent
});

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );
 
  const { canAdd, canEdit, canDelete, canView } = usePermission("CUSTOMER_ATTRIBUTE");

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

  const query = useQuery(customerAttributeQueries.list(params));
  const attributes = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const selectedAttributeId = modal.item?.id as any;
  const detailQuery = useQuery({
    ...customerAttributeQueries.detail(selectedAttributeId),
    enabled:
      !!selectedAttributeId && modalShown && (modal.type === "edit" || modal.type === "detail")
  });

  const modalItem = (detailQuery.data?.result as CustomerAttributeDto | undefined) ?? modal.item;

  const allAttributesQuery = useQuery(customerAttributeQueries.list({ page: 1, limit: 1000 }));

  const parentOptions = useMemo(() => {
    const items = allAttributesQuery.data?.result?.items ?? [];
    return [
      { label: "Không thuộc nhóm nào", value: 0 },
      ...items.map((attr) => ({
        label: attr.name || "",
        value: attr.id || 0
      }))
    ];
  }, [allAttributesQuery.data]);

  const createMutation = useMutation(customerAttributeMutations.create());
  const updateMutation = useMutation(customerAttributeMutations.update());
  const deleteMutation = useMutation(customerAttributeMutations.delete());

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => pageIndex * pageSize + info.row.index + 1,
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.accessor("name", {
        header: "Tên thuộc tính"
      }),
      columnHelper.accessor("datatype", {
        header: "Kiểu dữ liệu",
        meta: { className: "text-center" }
        // cell: (info) => (
        //   <span className="badge badge-soft-info text-uppercase">{info.getValue()}</span>
        // )
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
            resource="CUSTOMER_ATTRIBUTE"
          />
        )
      })
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: attributes,
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
    allAttributesQuery.refetch();
  };

  const handleDelete = async () => {
    if (!modal.item?.id) return;
    await deleteMutation.mutateAsync(modal.item.id);
    closeModal();
    query.refetch();
    allAttributesQuery.refetch();
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
              Thuộc tính khách hàng
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            <div className="text-muted small">Cài đặt khách hàng / Thuộc tính khách hàng</div>
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
              data={attributes}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh thuộc tính..."
                  toolbarRight={
                    <Can I="ADD" a="CUSTOMER_ATTRIBUTE">
                      <AddButton label="Thêm thuộc tính" onClick={() => openModal("add", null)} />
                    </Can>
                  }
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalAttribute
        type={modal.type}
        shown={modalShown}
        item={modalItem}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        parentOptions={parentOptions}
      />
    </div>
  );
}
