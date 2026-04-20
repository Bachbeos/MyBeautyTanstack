import { AsyncBoundary } from "@/components/async-boundary";
import { Can } from "@/components/auth/can";
import CollapseButton from "@/components/collapse/collapse-button";
import ExportButton from "@/components/export/export";
import ModalCustomer from "@/components/features/customer/modal";
import ModalOpportunity from "@/components/features/opportunity/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { BaseModal } from "@/components/ui/modal";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useCloseModal, useModalFade } from "@/hooks/use-modal-animation";
import { usePermission } from "@/hooks/use-permission";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { axiosInstance } from "@/lib/axios/instance";
import { exportVisibleTableToXLSX } from "@/lib/export/export-to-excel";
import { exportVisibleTableToPDF } from "@/lib/export/export-to-pdf";
import { customerAttributeQueries } from "@/lib/tanstack/options/customer-attribute";
import { customerExtraInfoQueries, customerMutations } from "@/lib/tanstack/options/customer";
import { customerSourceQueries } from "@/lib/tanstack/options/customer-source";
import { opportunityMutations } from "@/lib/tanstack/options/opportunity";
import { userQueries } from "@/lib/tanstack/options/user";
import type { ApiResponse } from "@/lib/types/common";
import type { CustomerDto } from "@/lib/types/customer";
import type { Page } from "@/lib/types/paging";
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

type CampaignSnapshotDto = {
  id?: number;
  campaign?: string;
  createdAt?: string;
  customerId?: number;
};

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
  const [campaignModal, setCampaignModal] = useState<{ type: "list" | null; item: CustomerDto | null }>({
    type: null,
    item: null
  });
  const [campaignModalShown, setCampaignModalShown] = useState(false);

  useModalFade(modal.type, setModalShown);
  useModalFade(opportunityModal.type, setOpportunityModalShown);
  useModalFade(campaignModal.type, setCampaignModalShown);

  const closeModal = useCloseModal(setModalShown, (state) => setModal(state as any));
  const closeOpportunityModal = useCloseModal(setOpportunityModalShown, (state) =>
    setOpportunityModal(state as any)
  );
  const closeCampaignModal = useCloseModal(setCampaignModalShown, (state) =>
    setCampaignModal(state as { type: "list" | null; item: CustomerDto | null })
  );

  const openModal = (type: any, item: any) => {
    setModal({ type, item });
  };

  const openOpportunityModal = (type: any, item: any) => {
    setOpportunityModal({ type, item });
  };

  const openCampaignModal = (item: CustomerDto) => {
    setCampaignModal({ type: "list", item });
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

  const campaignListQuery = useInfiniteQuery({
    queryKey: ["campaign-snapshot", campaignModal.item?.id],
    enabled: campaignModalShown && !!campaignModal.item?.id,
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1, signal }) => {
      const res = await axiosInstance.get<ApiResponse<Page<CampaignSnapshotDto>>>(
        ENDPOINTS.campaignSnapshot.list,
        {
          params: {
            customerId: Number(campaignModal.item?.id),
            page: pageParam,
            limit: 1
          },
          signal
        }
      );
      return res.data;
    },
    getNextPageParam: (lastPage, pages) => {
      const totalCampaign = Number(lastPage?.result?.total ?? 0);
      const loaded = pages.reduce((sum, page) => sum + (page.result?.items?.length ?? 0), 0);
      return loaded < totalCampaign ? pages.length + 1 : undefined;
    }
  });

  const generateCampaignMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const res = await axiosInstance.post<ApiResponse<Object>>(
        ENDPOINTS.customerAi.generateCampaign(customerId)
      );
      return res.data;
    },
    onSuccess: async () => {
      await campaignListQuery.refetch();
    },
    meta: {
      successMessage: "Tạo chiến dịch mới thành công"
    }
  });

  const campaignItems = useMemo(
    () => campaignListQuery.data?.pages.flatMap((p) => p?.result?.items ?? []) ?? [],
    [campaignListQuery.data]
  );

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
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="d-flex align-items-center justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                title="Tạo chiến dịch mới"
                onClick={() => {
                  openCampaignModal(row);
                  generateCampaignMutation.mutate(Number(row.id));
                }}
                disabled={generateCampaignMutation.isPending}
              >
                {generateCampaignMutation.isPending ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <i className="ti ti-sparkles" />
                )}
              </button>

              <ActionsTable
                row={info.row}
                onView={(data) => openModal("detail", data)}
                onEdit={(data) => openModal("edit", data)}
                onDelete={(data) => openModal("delete", data)}
                resource="CUSTOMER"
              />
            </div>
          );
        }
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

      <BaseModal
        title={`Chiến dịch tạo cơ hội${campaignModal.item?.name ? ` - ${campaignModal.item.name}` : ""}`}
        shown={campaignModalShown}
        onClose={closeCampaignModal}
        size="lg"
        footer={
          <div className="d-flex justify-content-between align-items-center w-100 gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                if (!campaignModal.item?.id || generateCampaignMutation.isPending) return;
                generateCampaignMutation.mutate(Number(campaignModal.item.id));
              }}
              disabled={!campaignModal.item?.id || generateCampaignMutation.isPending}
            >
              {generateCampaignMutation.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Đang tạo chiến dịch...
                </>
              ) : (
                <>
                  <i className="ti ti-sparkles me-1" />
                  Tạo chiến dịch mới
                </>
              )}
            </button>

            <div className="d-flex align-items-center gap-2">
              <button type="button" className="btn btn-light" onClick={closeCampaignModal}>
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => campaignListQuery.fetchNextPage()}
                disabled={!campaignListQuery.hasNextPage || campaignListQuery.isFetchingNextPage}
              >
                {campaignListQuery.isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
              </button>
            </div>
          </div>
        }
      >
        <div className="d-grid gap-2">
          {campaignListQuery.isLoading ? (
            <div className="text-muted">Đang tải danh sách chiến dịch...</div>
          ) : campaignItems.length === 0 ? (
            <div className="text-muted">Chưa có chiến dịch nào cho khách hàng này.</div>
          ) : (
            campaignItems.map((item, index) => (
              <div key={`${item.id ?? "campaign"}-${index}`} className="card border-0 bg-light-subtle">
                <div className="card-body py-3 px-3">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                      <div className="fw-semibold">Chiến dịch #{item.id ?? index + 1}</div>
                      <div className="text-muted small mt-1" style={{ whiteSpace: "pre-wrap" }}>
                        {item.campaign || "(Không có nội dung)"}
                      </div>
                    </div>
                    {item.createdAt ? (
                      <span className="badge badge-soft-primary">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}

          {campaignListQuery.isRefetching ? (
            <div className="text-muted small">Đang cập nhật danh sách...</div>
          ) : null}
        </div>
      </BaseModal>
    </div>
  );
}
