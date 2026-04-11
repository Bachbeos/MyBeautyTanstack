import { AsyncBoundary } from "@/components/async-boundary";
import CollapseButton from "@/components/collapse/collapse-button";
import RefreshButton from "@/components/refresh/refresh";
import { BaseModal } from "@/components/ui/modal";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { opportunityMutations, opportunityQueries } from "@/lib/tanstack/options/opportunity";
import { customerQueries } from "@/lib/tanstack/options/customer";
import { userQueries } from "@/lib/tanstack/options/user";
import type {
  OpportunityDto,
  OpportunityId,
  OpportunityKanbanColumn,
  OpportunityMoveStageRequest,
  OpportunityStage
} from "@/lib/types/opportunity";
import { cn } from "@/lib/utils";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_crm/_opportunity/opportunity")({
  component: RouteComponent
});

type PendingMove = {
  card: OpportunityDto;
  fromStage: OpportunityStage;
  toStage: OpportunityStage;
  requiredFields: string[];
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

const stageNameFallback: Record<number, string> = {
  1: "Lead",
  2: "Contacted",
  3: "Consulting",
  4: "Proposal",
  5: "Negotiation",
  6: "Won",
  7: "Lost"
};

const fieldLabelMap: Record<string, string> = {
  userId: "Người phụ trách",
  expectedValue: "Giá trị dự kiến",
  probability: "Xác suất (%)",
  expectedCloseDate: "Ngày dự kiến chốt",
  lastActivityDate: "Ngày hoạt động gần nhất",
  actualCloseDate: "Ngày chốt thực tế",
  lostReason: "Lý do mất cơ hội",
  priority: "Mức độ ưu tiên",
  nextActionType: "Loại hành động tiếp theo",
  nextActionDate: "Ngày hành động tiếp theo"
};

function isMissingField(card: OpportunityDto, field: string) {
  const value = (card as Record<string, unknown>)[field];
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}

function RouteComponent() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword] = useDebounceValue(keywordInput, 500);
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [userId, setUserId] = useState<number | undefined>(undefined);

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [localColumns, setLocalColumns] = useState<OpportunityKanbanColumn[] | null>(null);

  const [detailId, setDetailId] = useState<OpportunityId | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  const params = useMemo(
    () => ({
      keyword: keyword || undefined,
      customerId,
      userId,
      status: 1
    }),
    [keyword, customerId, userId]
  );

  const kanbanQuery = useQuery(opportunityQueries.kanban(params));
  const metaQuery = useQuery(opportunityQueries.stageTransitionMeta());
  const detailQuery = useQuery(
    opportunityQueries.detail((detailId ?? 0) as OpportunityId)
  );

  const moveStageMutation = useMutation(opportunityMutations.moveStage());

  const usersInf = useInfiniteQuery(userQueries.infinite({ limit: 20 }));
  const customersInf = useInfiniteQuery(customerQueries.infinite({ limit: 20 }));

  const userOptions =
    usersInf.data?.pages
      .flatMap((page) => page.result?.items ?? [])
      .map((u) => ({ label: String(u.name), value: Number(u.id) })) ?? [];

  const customerOptions =
    customersInf.data?.pages
      .flatMap((page) => page.result?.items ?? [])
      .map((c) => ({ label: String(c.name), value: Number(c.id) })) ?? [];

  const serverColumns = kanbanQuery.data?.result?.columns ?? [];

  const columns = useMemo(() => {
    const byStage = new Map<number, OpportunityKanbanColumn>();
    (localColumns ?? serverColumns).forEach((c) => byStage.set(Number(c.stage), c));

    const stageList =
      metaQuery.data?.result?.stages?.map((s) => ({ id: Number(s.id), name: s.name })) ??
      [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id, name: stageNameFallback[id] }));

    return stageList.map(({ id, name }) => {
      const found = byStage.get(id);
      return {
        stage: id as OpportunityStage,
        stageName: found?.stageName || name || stageNameFallback[id],
        count: found?.count ?? found?.items?.length ?? 0,
        totalExpectedValue: found?.totalExpectedValue ?? 0,
        totalWeightedValue: found?.totalWeightedValue ?? 0,
        items: found?.items ?? []
      } satisfies OpportunityKanbanColumn;
    });
  }, [localColumns, serverColumns, metaQuery.data]);

  const total = columns.reduce((sum, c) => sum + (c.count || c.items.length), 0);

  const rulesMap = useMemo(() => {
    const map = new Map<number, string[]>();
    metaQuery.data?.result?.rules?.forEach((r) => map.set(Number(r.toStage), r.requiredFields || []));
    return map;
  }, [metaQuery.data]);

  const resetLocalFromServer = async () => {
    setLocalColumns(null);
    await kanbanQuery.refetch();
  };

  const applyLocalMove = (card: OpportunityDto, fromStage: OpportunityStage, toStage: OpportunityStage) => {
    setLocalColumns((prev) => {
      const base = (prev ?? columns).map((col) => ({ ...col, items: [...col.items] }));
      const fromCol = base.find((c) => Number(c.stage) === Number(fromStage));
      const toCol = base.find((c) => Number(c.stage) === Number(toStage));
      if (!fromCol || !toCol) return prev;

      fromCol.items = fromCol.items.filter((i) => Number(i.id) !== Number(card.id));
      fromCol.count = fromCol.items.length;

      toCol.items = [{ ...card, stage: toStage }, ...toCol.items.filter((i) => Number(i.id) !== Number(card.id))];
      toCol.count = toCol.items.length;

      return base;
    });
  };

  const rollbackMove = (card: OpportunityDto, fromStage: OpportunityStage, toStage: OpportunityStage) => {
    setLocalColumns((prev) => {
      if (!prev) return prev;
      const base = prev.map((col) => ({ ...col, items: [...col.items] }));
      const fromCol = base.find((c) => Number(c.stage) === Number(toStage));
      const toCol = base.find((c) => Number(c.stage) === Number(fromStage));
      if (!fromCol || !toCol) return prev;

      fromCol.items = fromCol.items.filter((i) => Number(i.id) !== Number(card.id));
      fromCol.count = fromCol.items.length;

      toCol.items = [{ ...card, stage: fromStage }, ...toCol.items.filter((i) => Number(i.id) !== Number(card.id))];
      toCol.count = toCol.items.length;

      return base;
    });
  };

  const submitMove = async (move: PendingMove, extraValues?: Record<string, string>) => {
    try {
      const payload: OpportunityMoveStageRequest = {
        toStage: move.toStage
      };

      const values = extraValues || {};
      Object.entries(values).forEach(([k, v]) => {
        if (v === "") return;
        if (["expectedValue", "probability", "priority", "userId"].includes(k)) {
          (payload as Record<string, unknown>)[k] = Number(v);
        } else if (["expectedCloseDate", "lastActivityDate", "actualCloseDate", "nextActionDate"].includes(k)) {
          (payload as Record<string, unknown>)[k] = v.length === 10 ? `${v}T00:00:00` : v;
        } else {
          (payload as Record<string, unknown>)[k] = v;
        }
      });

      await moveStageMutation.mutateAsync({ id: move.card.id, body: payload });
      toast.success("Chuyển stage thành công");
      setPendingMove(null);
      setDynamicValues({});
      await resetLocalFromServer();
    } catch {
      rollbackMove(move.card, move.fromStage, move.toStage);
      toast.error("Chuyển stage thất bại, đã hoàn tác vị trí thẻ");
      setPendingMove(null);
      setDynamicValues({});
    }
  };

  const onDropCard = async (card: OpportunityDto, toStage: OpportunityStage) => {
    const fromStage = card.stage;
    if (Number(fromStage) === Number(toStage)) return;

    applyLocalMove(card, fromStage, toStage);

    const requiredFields = (rulesMap.get(Number(toStage)) || []).filter((f) => isMissingField(card, f));

    if (requiredFields.length > 0) {
      setPendingMove({ card, fromStage, toStage, requiredFields });
      setDynamicValues({});
      return;
    }

    await submitMove({ card, fromStage, toStage, requiredFields: [] });
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
              Kanban cơ hội
              <span className="badge badge-soft-primary ms-2">{total}</span>
            </h4>
            <div className="text-muted small">Cơ hội / Kanban</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <RefreshButton onRefresh={() => resetLocalFromServer()} />
            <CollapseButton onCollapse={handleCollapse} active={isHeaderCollapsed} />
          </div>
        </div>

        <div className="card border-0 rounded-0 shadow-sm mb-3">
          <div className="card-body p-3">
            <div className="row g-2">
              <div className="col-md-4">
                <input
                  className="form-control"
                  placeholder="Tìm theo tên cơ hội..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={customerId ?? ""}
                  onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Tất cả khách hàng</option>
                  {customerOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={userId ?? ""}
                  onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Tất cả sale phụ trách</option>
                  {userOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <AsyncBoundary
          status={kanbanQuery.status}
          data={columns}
          error={kanbanQuery.error}
          onRetry={() => resetLocalFromServer()}
        >
          {() => (
            <div className="d-flex gap-3 overflow-auto pb-2">
              {columns.map((column) => {
                const color = stageColorMap[Number(column.stage)] || "secondary";
                const cards = column.items || [];

                return (
                  <div
                    key={Number(column.stage)}
                    className="card border-0 shadow-sm"
                    style={{ minWidth: 330, width: 330 }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async () => {
                      const moved = cards.find((c) => Number(c.id) === draggingId);
                      const source = (localColumns ?? columns)
                        .flatMap((col) => col.items)
                        .find((c) => Number(c.id) === draggingId);
                      const card = moved || source;
                      if (!card) return;
                      await onDropCard(card, column.stage);
                      setDraggingId(null);
                    }}
                  >
                    <div className="card-header bg-white border-0 pb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className={cn("badge", `badge-soft-${color}`)}>{column.stageName}</span>
                        <span className="badge bg-light text-dark">{cards.length}</span>
                      </div>
                      <div className="small text-muted mt-2">
                        Tổng dự kiến: {new Intl.NumberFormat("vi-VN").format(Number(column.totalExpectedValue || 0))} VND
                      </div>
                    </div>

                    <div className="card-body pt-0" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                      {cards.map((item) => (
                        <div
                          key={Number(item.id)}
                          className="card kanban-card mb-2 border"
                          draggable
                          onDragStart={() => setDraggingId(Number(item.id))}
                        >
                          <div
                            className="card-body p-3 cursor-pointer"
                            role="button"
                            onClick={() => setDetailId(item.id)}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className="mb-0 text-truncate" style={{ maxWidth: 220 }}>
                                {item.name}
                              </h6>
                              <span className={cn("badge", `badge-soft-${color}`)}>{item.probability}%</span>
                            </div>

                            <div className="small text-muted mb-1">
                              <i className="ti ti-user me-1" /> {item.customerName || "-"}
                            </div>
                            <div className="small text-muted mb-1">
                              <i className="ti ti-user-circle me-1" /> {item.userName || "-"}
                            </div>
                            <div className="small text-muted mb-2">
                              <i className="ti ti-calendar-event me-1" />
                              {item.expectedCloseDate
                                ? new Date(item.expectedCloseDate).toLocaleDateString("vi-VN")
                                : "Chưa có ngày chốt"}
                            </div>

                            <div className="fw-semibold text-primary">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND"
                              }).format(Number(item.expectedValue || 0))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AsyncBoundary>
      </div>

      <BaseModal
        title="Chi tiết cơ hội"
        shown={!!detailId}
        size="lg"
        onClose={() => setDetailId(null)}
        footer={
          <button className="btn btn-primary" onClick={() => setDetailId(null)}>
            Đóng
          </button>
        }
      >
        {detailQuery.isFetching ? (
          <div className="text-muted">Đang tải chi tiết...</div>
        ) : detailQuery.data?.result ? (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted">Tên cơ hội</label>
              <div className="fw-semibold">{detailQuery.data.result.name}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Mã cơ hội</label>
              <div>{detailQuery.data.result.code || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Khách hàng</label>
              <div>{detailQuery.data.result.customerName || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Sale phụ trách</label>
              <div>{detailQuery.data.result.userName || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Giá trị dự kiến</label>
              <div>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND"
                }).format(Number(detailQuery.data.result.expectedValue || 0))}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Ngày dự kiến chốt</label>
              <div>
                {detailQuery.data.result.expectedCloseDate
                  ? new Date(detailQuery.data.result.expectedCloseDate).toLocaleDateString("vi-VN")
                  : "-"}
              </div>
            </div>
            <div className="col-12">
              <label className="form-label text-muted">Mô tả</label>
              <div>{detailQuery.data.result.description || "-"}</div>
            </div>
          </div>
        ) : (
          <div className="text-danger">Không tải được chi tiết cơ hội.</div>
        )}
      </BaseModal>

      <BaseModal
        title="Cần bổ sung thông tin trước khi chuyển stage"
        shown={!!pendingMove}
        size="md"
        onClose={() => {
          if (pendingMove) rollbackMove(pendingMove.card, pendingMove.fromStage, pendingMove.toStage);
          setPendingMove(null);
          setDynamicValues({});
        }}
        footer={
          <>
            <button
              className="btn btn-light"
              onClick={() => {
                if (pendingMove) rollbackMove(pendingMove.card, pendingMove.fromStage, pendingMove.toStage);
                setPendingMove(null);
                setDynamicValues({});
              }}
            >
              Hủy
            </button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                if (!pendingMove) return;
                const missing = pendingMove.requiredFields.filter((f) => !dynamicValues[f]);
                if (missing.length > 0) {
                  toast.error("Vui lòng nhập đầy đủ các trường bắt buộc");
                  return;
                }
                await submitMove(pendingMove, dynamicValues);
              }}
            >
              Xác nhận chuyển stage
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-3">
          {pendingMove?.requiredFields.map((field) => {
            const isDate = ["expectedCloseDate", "lastActivityDate", "actualCloseDate", "nextActionDate"].includes(field);
            const isNumber = ["expectedValue", "probability", "priority"].includes(field);
            const isUser = field === "userId";

            if (isUser) {
              return (
                <div key={field}>
                  <label className="form-label">{fieldLabelMap[field] || field}</label>
                  <select
                    className="form-select"
                    value={dynamicValues[field] ?? ""}
                    onChange={(e) =>
                      setDynamicValues((prev) => ({
                        ...prev,
                        [field]: e.target.value
                      }))
                    }
                  >
                    <option value="">Chọn người phụ trách</option>
                    {userOptions.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={field}>
                <label className="form-label">{fieldLabelMap[field] || field}</label>
                <input
                  className="form-control"
                  type={isDate ? "date" : isNumber ? "number" : "text"}
                  value={dynamicValues[field] ?? ""}
                  onChange={(e) =>
                    setDynamicValues((prev) => ({
                      ...prev,
                      [field]: e.target.value
                    }))
                  }
                />
              </div>
            );
          })}
        </div>
      </BaseModal>
    </div>
  );
}
