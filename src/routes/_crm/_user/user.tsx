import { AsyncBoundary } from "@/components/async-boundary";
import ExportButton from "@/components/export/export";
import ModalUser from "@/components/features/user/modal";
import RefreshButton from "@/components/refresh/refresh";
import ActionsTable from "@/components/table/actions-table";
import { DataTable } from "@/components/table/data-table";
import AddButton from "@/components/ui/add-button";
import { usePermission } from "@/hooks/use-permission";
import { Can } from "@/components/auth/can";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { userMutations, userQueries } from "@/lib/tanstack/options/user";
import { roleQueries } from "@/lib/tanstack/options/role";
import type { UserDto } from "@/lib/types/user";
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
import { branchQueries } from "@/lib/tanstack/options/branch";
import { exportVisibleTableToXLSX } from "@/lib/export/export-to-excel";
import { exportVisibleTableToPDF } from "@/lib/export/export-to-pdf";

const columnHelper = createColumnHelper<UserDto>();

export const Route = createFileRoute("/_crm/_user/user")({
  component: RouteComponent
});

function RouteComponent() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );
 
  const { canAdd, canEdit, canDelete, canView } = usePermission("USER");

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

  const query = useQuery(userQueries.list(params));
  const users = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;

  const createMutation = useMutation(userMutations.create());
  const updateMutation = useMutation(userMutations.update());
  const deleteMutation = useMutation(userMutations.delete());
  const updateStatusMutation = useMutation(userMutations.updateStatus());

  const handleToggleStatus = async (user: UserDto) => {
    await updateStatusMutation.mutateAsync({
      id: user.id,
      active: Number(user.active) === 1 ? 0 : 1
    });
  };

  const handleCollapse = () => {
    document.body.classList.toggle("header-collapse");
    setIsHeaderCollapsed(document.body.classList.contains("header-collapse"));
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor((_, index) => pageIndex * pageSize + index + 1, {
        id: "stt",
        header: "STT",
        meta: { className: "w-1 text-center" }
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Tên người dùng",
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
      columnHelper.accessor("phone", {
        id: "phone",
        header: "Số điện thoại"
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: "Email"
      }),
      columnHelper.accessor("branchName", {
        id: "branchName",
        header: "Chi nhánh",
        enableHiding: true
      }),
      columnHelper.accessor("active", {
        id: "active",
        header: "Trạng thái",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const row = info.row.original;
          const isActive = Number(row.active) === 1;

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
      columnHelper.accessor("regisDate", {
        id: "regisDate",
        header: "Ngày đăng ký",
        meta: { className: "text-center w-1" },
        cell: (info) => {
          const date = new Date(info.getValue() || "");
          return isNaN(date.getTime()) ? "" : date.toLocaleDateString();
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
            resource="USER"
          />
        )
      })
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: users,
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

  const branchsInf = useInfiniteQuery(branchQueries.infinite({ limit: 10, status: 1 }));

  const branchOptions = useMemo(() => {
    return (
      branchsInf.data?.pages
        .flatMap((page) => page.result?.items ?? [])
        .map((branch) => ({ label: String(branch.name), value: Number(branch.id) })) ?? []
    );
  }, [branchsInf.data]);
 
  const rolesQuery = useQuery(roleQueries.list({ limit: 100 }));
  const roleOptions = useMemo(() => {
    return (
      rolesQuery.data?.result?.items.map((role) => ({
        label: role.name,
        value: Number(role.id)
      })) ?? []
    );
  }, [rolesQuery.data]);

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
              Danh sách người dùng
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            <div className="text-muted small">Tài khoản người dùng / Danh sách người dùng</div>
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
              data={users}
              error={query.error}
              onRetry={() => query.refetch()}
            >
              {() => (
                <DataTable
                  table={table}
                  filterable={true}
                  filterKey="name"
                  filterKeyPlaceholder="Tìm nhanh người dùng..."
                  toolbarRight={
                    <Can I="ADD" a="USER">
                      <AddButton label="Thêm người dùng" onClick={() => openModal("add", null)} />
                    </Can>
                  }
                  toolbarLeft={<div className="text-muted small d-none d-md-block"></div>}
                />
              )}
            </AsyncBoundary>
          </div>
        </div>
      </div>

      <ModalUser
        type={modal.type}
        shown={modalShown}
        item={modal.item}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        branchOptions={branchOptions}
        roleOptions={roleOptions}
        onLoadMoreBranches={handleLoadMoreBranches}
      />
    </div>
  );
}
