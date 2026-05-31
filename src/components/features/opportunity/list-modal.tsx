import { BaseModal } from "@/components/ui/modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { opportunityMutations, opportunityQueries } from "@/lib/tanstack/options/opportunity";
import type { OpportunityDto } from "@/lib/types/opportunity";
import AddButton from "@/components/ui/add-button";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Pagination } from "@/components/table/pagination";

type ModalOpportunityListProps = {
  shown: boolean;
  customerId: number | null;
  customerName: string | null;
  onClose: () => void;
  onAddOpportunity: () => void;
  onDeleteSuccess?: () => void;
};

const stageColorMap: Record<number, string> = {
  1: "secondary",
  2: "info",
  3: "warning",
  4: "primary",
  5: "purple",
  6: "success",
  7: "danger"
};

const stageNameMapVi: Record<number, string> = {
  1: "Tiềm năng",
  2: "Đã liên hệ",
  3: "Tư vấn",
  4: "Đề xuất",
  5: "Đàm phán",
  6: "Thành công",
  7: "Thất bại"
};

import { useState, useEffect } from "react";

export default function ModalOpportunityList({
  shown,
  customerId,
  customerName,
  onClose,
  onAddOpportunity,
  onDeleteSuccess
}: ModalOpportunityListProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    if (shown) {
      setPage(1);
    }
  }, [shown, customerId]);

  const query = useQuery({
    ...opportunityQueries.list({
      customerId: customerId || undefined,
      page,
      limit: pageSize
    }),
    enabled: shown && !!customerId
  });

  const deleteMutation = useMutation(opportunityMutations.delete());
  const [deletingItem, setDeletingItem] = useState<OpportunityDto | null>(null);

  const opportunities = query.data?.result?.items ?? [];
  const total = query.data?.result?.total ?? 0;
  const isLoading = query.isLoading;
  const totalPages = Math.ceil(total / pageSize);

  const table = useReactTable({
    data: opportunities,
    columns: [],
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize
      }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page - 1, pageSize });
        setPage(newState.pageIndex + 1);
        if (newState.pageSize !== pageSize) {
          setPageSize(newState.pageSize);
        }
      }
    },
    manualPagination: true,
    pageCount: totalPages,
    rowCount: total,
    getCoreRowModel: getCoreRowModel()
  });

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      query.refetch();
      onDeleteSuccess?.();
      setDeletingItem(null);
    } catch (error) {

    }
  };

  return (
    <BaseModal
      title={`Danh sách cơ hội - ${customerName || "Khách hàng"}`}
      shown={shown}
      size="xl"
      onClose={onClose}
      footer={
        <div className="d-flex justify-content-end w-100 gap-2">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Đóng
          </button>
        </div>
      }
    >
      <div className="d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-semibold text-dark">
            Tổng số: <span className="badge badge-soft-primary ms-1">{total}</span>
          </h5>
          <AddButton label="Tạo cơ hội mới" onClick={onAddOpportunity} />
        </div>

        {isLoading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
            <div className="spinner-border text-primary" role="status" style={{ width: "2rem", height: "2rem" }} />
            <div className="text-muted small">Đang tải danh sách cơ hội...</div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3 border rounded bg-light-subtle">
            <i className="ti ti-inbox fs-48 text-muted opacity-50" />
            <div className="text-muted text-center small">
              Chưa có cơ hội nào cho khách hàng này.
              <br />
              Nhấn "Tạo cơ hội mới" để bắt đầu.
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            <div className="table-responsive border rounded">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="w-1 text-center">STT</th>
                    <th>Tên cơ hội</th>
                    <th className="text-end">Giá trị dự kiến</th>
                    <th className="text-center">Giai đoạn</th>
                    <th className="w-1 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((item, index) => {
                    const stageColor = stageColorMap[Number(item.stage)] || "secondary";
                    const stageName = stageNameMapVi[Number(item.stage)] || String(item.stage);

                    return (
                      <tr key={String(item.id)}>
                        <td className="text-center text-muted small">{(page - 1) * pageSize + index + 1}</td>
                        <td>
                          <div className="fw-semibold text-dark">{item.name}</div>
                          {item.code && <div className="text-muted small fs-11">Mã: {item.code}</div>}
                        </td>
                        <td className="text-end fw-medium text-primary">
                          {item.expectedValue
                            ? new Intl.NumberFormat("vi-VN").format(item.expectedValue) + " ₫"
                            : "-"}
                        </td>
                        <td className="text-center">
                          <span className={`badge badge-soft-${stageColor}`}>{stageName}</span>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            title="Xóa cơ hội"
                            onClick={() => setDeletingItem(item)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && deletingItem?.id === item.id ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <i className="ti ti-trash" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pt-2 border-top">
                <Pagination table={table} />
              </div>
            )}
          </div>
        )}
      </div>

      {deletingItem && (
        <BaseModal
          title="Xóa cơ hội?"
          shown={!!deletingItem}
          size="sm"
          onClose={() => setDeletingItem(null)}
          zIndex={1061}
          backdropZIndex={1060}
          footer={
            <div className="d-flex justify-content-center w-100 gap-2">
              <button className="btn btn-sm btn-light w-100" onClick={() => setDeletingItem(null)}>
                Hủy
              </button>
              <button
                className="btn btn-sm btn-primary w-100"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                Đồng ý
              </button>
            </div>
          }
        >
          <div className="text-center">
            <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px" }}>
              <i className="ti ti-trash fs-24"></i>
            </span>
            <h5 className="mb-1">Xóa cơ hội</h5>
            <p className="mb-3 text-muted">
              Bạn có chắc muốn xóa cơ hội "<strong>{deletingItem.name}</strong>" này không?
            </p>
          </div>
        </BaseModal>
      )}
    </BaseModal>
  );
}
