import { AsyncBoundary } from "@/components/async-boundary";
import CollapseButton from "@/components/collapse/collapse-button";
import ExportButton from "@/components/export/export";
import ModalCustomer from "@/components/features/customer/modal";
import ModalOpportunity from "@/components/features/opportunity/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { usePermission } from "@/hooks/use-permission";
import { Can } from "@/components/auth/can";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useCloseModal, useModalFade } from "@/hooks/use-modal-animation";
import { exportVisibleTableToXLSX } from "@/lib/export/export-to-excel";
import { exportVisibleTableToPDF } from "@/lib/export/export-to-pdf";
import { customerExtraInfoQueries, customerMutations } from "@/lib/tanstack/options/customer";
import { opportunityMutations } from "@/lib/tanstack/options/opportunity";
import { userQueries } from "@/lib/tanstack/options/user";
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

  const segmentLabelMap: Record<string, { label: string; className: string }> = {
    vip: { label: "Khách VIP", className: "badge-soft-success" },
    loyal: { label: "Khách trung thành", className: "badge-soft-primary" },
    potential: { label: "Khách tiềm năng", className: "badge-soft-warning" },
    at_risk: { label: "Có nguy cơ rời bỏ", className: "badge-soft-danger" },
    churned: { label: "Đã rời bỏ", className: "badge-soft-secondary" }
  };
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );
 
  const { canAdd, canEdit, canDelete, canView } = usePermission("CUSTOMER");

  const rawNameFilter = useMemo(() => {
    const filter = columnFilters.find((f) => f.id === "name");
    return (filter?.value as string) || "";
  }, [columnFilters]);

  const [nameFilter] = useDebounceValue(rawNameFilter, 500);

  const [modal, setModal] = useState<{ type: any; item: any }>({ type: null, item: null });
  const [modalShown, setModalShown] = useState(false);
  const [opportunityModal, setOpportunityModal] = useState<{ type: any; item: any }>({
    type: null,
    item: null
  });
  const [opportunityModalShown, setOpportunityModalShown] = useState(false);

  useModalFade(modal.type, setModalShown);
  useModalFade(opportunityModal.type, setOpportunityModalShown);

  const closeModal = useCloseModal(setModalShown, (state) => setModal(state as any));
  const closeOpportunityModal = useCloseModal(setOpportunityModalShown, (state) =>
    setOpportunityModal(state as any)
  );

  const openModal = (type: any, item: any) => {
    setModal({ type, item });
  };

  const openOpportunityModal = (type: any, item: any) => {
    setOpportunityModal({ type, item });
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

  const query = useQuery(customerExtraInfoQueries.list(params));
  const customers = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const attrQuery = useQuery(customerAttributeQueries.list({ isParent: 2 }));
  const dynamicAttributes = attrQuery.data?.result?.items ?? [];

  const createMutation = useMutation(customerMutations.create());
  const updateMutation = useMutation(customerMutations.update());
  const deleteMutation = useMutation(customerMutations.delete());
  const createOpportunityMutation = useMutation(opportunityMutations.create());

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
      columnHelper.accessor("address", { header: "Địa chỉ" }),
      columnHelper.accessor((row) => String((row as any).segmentCode || ""), {
        id: "segmentCode",
        header: "Phân khúc",
        cell: (info) => {
          const code = String(info.getValue() || "").toLowerCase();
          const mapped = segmentLabelMap[code];
          if (!mapped) return <span className="text-muted">Chưa phân loại</span>;

          return <span className={`badge ${mapped.className}`}>{mapped.label}</span>;
        },
        meta: { className: "text-center" }
      })
    ];

    const dynamicCols = dynamicAttributes.map((attr: any) =>
      columnHelper.accessor(
        (row: any) => {
          const extraInfos = row.customerExtraInfos || [];
          const found = extraInfos.find((ei: any) => ei.attributeId === attr.id);
          return found?.attributeValue ?? null;
        },
        {
          id: `attr_${attr.id}`,
          header: attr.name,
          cell: (info) => {
            const value = info.getValue();

            if (!value) return "-";

            if (attr.datatype === "attachment") {
              return (
                <a href={value} target="_blank" className="text-primary">
                  <i className="ti ti-paperclip" />
                </a>
              );
            }

            return value;
          }
        }
      )
    );

    return [
      ...staticCols,
      ...dynamicCols,
      columnHelper.accessor("opportunityCount", {
        header: "Số cơ hội",
        cell: (info) => {
          const row = info.row.original;
          const count = Number(info.getValue() ?? 0);

          return (
            <div
              className="badge cursor-pointer badge-soft-danger custom-cursor-on-hover"
              title="Thêm cơ hội"
              onClick={() =>
                openOpportunityModal("add", {
                  customerId: Number(row.id),
                  customerName: row.name
                })
              }
            >
              <span>{count} cơ hội</span>
              <i className="ti ti-plus" />
            </div>
          );
        },
        meta: { className: "text-center" }
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
            resource="CUSTOMER"
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
  const usersInf = useInfiniteQuery(userQueries.infinite({ limit: 10 }));
  const customersInf = useInfiniteQuery(customerExtraInfoQueries.infinite({ limit: 10 }));

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

  const handleOpportunitySubmit = async (values: any) => {
    const payload = {
      ...values,
      status: 1,
      expectedCloseDate: undefined,
      userId: null
    };
    await createOpportunityMutation.mutateAsync(payload);
    closeOpportunityModal();
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
                    <Can I="ADD" a="CUSTOMER">
                      <AddButton label="Thêm khách hàng" onClick={() => openModal("add", null)} />
                    </Can>
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
        item={modal.item}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        customerSourceOptions={customerSourceOptions}
        onLoadMorecustomerSources={handleLoadMoreCustomerSources}
      />

      <ModalOpportunity
        type={opportunityModal.type}
        shown={opportunityModalShown}
        item={opportunityModal.item}
        onClose={closeOpportunityModal}
        onSubmit={handleOpportunitySubmit}
        userOptions={userOptions}
        customerOptions={customerOptions}
        onLoadMoreUsers={handleLoadMoreUsers}
        onLoadMoreCustomers={handleLoadMoreCustomers}
        hideUserField
        hideExpectedCloseDateField
        forceStatusActive
      />
    </div>
  );
}
