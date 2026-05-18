import { AsyncBoundary } from "@/components/async-boundary";
import CollapseButton from "@/components/collapse/collapse-button";
import { usePermission } from "@/hooks/use-permission";
import { Can } from "@/components/auth/can";
import RefreshButton from "@/components/refresh/refresh";
import AppSelect, { type AppSelectOption } from "@/components/ui/app-select";
import { BaseModal } from "@/components/ui/modal";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { customerQueries } from "@/lib/tanstack/options/customer";
import { opportunityMutations, opportunityQueries } from "@/lib/tanstack/options/opportunity";
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
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth";

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

const stageNameMapVi: Record<number, string> = {
  1: "Tiềm năng",
  2: "Đã liên hệ",
  3: "Tư vấn",
  4: "Đề xuất",
  5: "Đàm phán",
  6: "Thành công",
  7: "Thất bại"
};

const stageIconMap: Record<number, string> = {
  1: "ti ti-bulb",
  2: "ti ti-phone-call",
  3: "ti ti-message-chatbot",
  4: "ti ti-file-description",
  5: "ti ti-scale",
  6: "ti ti-rosette-discount-check",
  7: "ti ti-mood-sad"
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

const priorityMap: Record<number, { label: string; className: string }> = {
  0: { label: "Rất thấp", className: "badge-soft-secondary" },
  1: { label: "Thấp", className: "badge-soft-info" },
  2: { label: "Trung bình", className: "badge-soft-warning" },
  3: { label: "Cao", className: "badge-soft-primary" },
  4: { label: "Rất cao", className: "badge-soft-danger" },
  5: { label: "Khẩn cấp", className: "badge-soft-danger" }
};

function isMissingField(card: OpportunityDto, field: string) {
  const value = (card as Record<string, unknown>)[field];
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}

const KANBAN_CARD_HEIGHT = 220;
const KANBAN_COLUMN_WIDTH = 215;

const customGrabCursor =
  'url("data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="white" stroke="%23dc3545" stroke-width="2"/><path d="M10 15v-3a1 1 0 0 1 2 0v2h1v-3a1 1 0 0 1 2 0v3h1v-2a1 1 0 0 1 2 0v4.2c0 .5-.2 1-.5 1.4l-1.1 1.5c-.4.5-1 .9-1.6.9h-2.7c-.6 0-1.2-.2-1.6-.7l-1.7-1.8c-.3-.3-.5-.8-.5-1.3V15z" fill="%23111827"/></svg>") 14 14, grab';

const customPanCursor =
  'url("data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="%23fff5f6" stroke="%23dc3545" stroke-width="2.5"/><path d="M10 15v-3a1 1 0 0 1 2 0v2h1v-3a1 1 0 0 1 2 0v3h1v-2a1 1 0 0 1 2 0v4.2c0 .5-.2 1-.5 1.4l-1.1 1.5c-.4.5-1 .9-1.6.9h-2.7c-.6 0-1.2-.2-1.6-.7l-1.7-1.8c-.3-.3-.5-.8-.5-1.3V15z" fill="%23dc3545"/></svg>") 14 14, grabbing';

function RouteComponent() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );

  const { canAdd, canEdit, canDelete, canView } = usePermission("OPPORTUNITY");

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword] = useDebounceValue(keywordInput, 500);
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [selectedStages, setSelectedStages] = useState<number[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<number[]>([]);

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<number | null>(null);
  const [localColumns, setLocalColumns] = useState<OpportunityKanbanColumn[] | null>(null);
  const [kanbanPage, setKanbanPage] = useState(1);
  const [kanbanLimit] = useState(12);

  const [detailId, setDetailId] = useState<OpportunityId | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPanningBoard, setIsPanningBoard] = useState(false);
  const panStartXRef = useRef(0);
  const panStartScrollLeftRef = useRef(0);
  const kanbanScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setKanbanPage(1);
    setLocalColumns(null);
  }, [keyword, customerId, userId, selectedStages, selectedPriorities]);

  const params = useMemo(
    () => ({
      keyword: keyword || undefined,
      customerId,
      userId,
      stage: undefined,
      stages: selectedStages.length > 0 ? selectedStages : undefined,
      priorities: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      status: 1,
      page: kanbanPage,
      limit: kanbanLimit
    }),
    [keyword, customerId, userId, selectedStages, selectedPriorities, kanbanPage, kanbanLimit]
  );

  const kanbanQuery = useQuery(opportunityQueries.kanban(params));
  const metaQuery = useQuery(opportunityQueries.stageTransitionMeta());
  const detailQuery = useQuery(opportunityQueries.detail((detailId ?? 0) as OpportunityId));

  const moveStageMutation = useMutation(opportunityMutations.moveStage());

  const me = useAuthStore();

  const usersInf = useInfiniteQuery({
    ...userQueries.infinite({
      limit: 20
    })
  });
  const customersInf = useInfiniteQuery(customerQueries.infinite({ limit: 20 }));

  const userOptions: AppSelectOption[] = !me.isOperator
    ? [
      {
        label: String(me.name),
        value: Number(me.userId)
      }
    ]
    : (usersInf.data?.pages
      .flatMap((page) => page.result?.items ?? [])
      .map((u) => ({
        label: String(u.name),
        value: Number(u.id)
      })) ?? []);

  const customerOptions: AppSelectOption[] =
    customersInf.data?.pages
      .flatMap((page) => page.result?.items ?? [])
      .map((c) => ({ label: String(c.name), value: Number(c.id) })) ?? [];

  const stageOptions: AppSelectOption[] = useMemo(
    () =>
      (
        metaQuery.data?.result?.stages ?? [
          { id: 1, name: "Tiềm năng" },
          { id: 2, name: "Đã liên hệ" },
          { id: 3, name: "Tư vấn" },
          { id: 4, name: "Đề xuất" },
          { id: 5, name: "Đàm phán" },
          { id: 6, name: "Thành công" },
          { id: 7, name: "Thất bại" }
        ]
      ).map((s) => ({
        value: Number(s.id),
        label: stageNameMapVi[Number(s.id)] || String(s.name)
      })),
    [metaQuery.data]
  );

  const priorityOptions: AppSelectOption[] = useMemo(
    () => [
      { value: 0, label: "Rất thấp" },
      { value: 1, label: "Thấp" },
      { value: 2, label: "Trung bình" },
      { value: 3, label: "Cao" },
      { value: 4, label: "Rất cao" },
      { value: 5, label: "Khẩn cấp" }
    ],
    []
  );

  const serverColumns = kanbanQuery.data?.result?.columns ?? [];

  useEffect(() => {
    if (!serverColumns.length) return;

    setLocalColumns((prev) => {
      if (kanbanPage <= 1 || !prev || prev.length === 0) {
        return serverColumns;
      }

      const incomingByStage = new Map(serverColumns.map((c) => [Number(c.stage), c]));

      return prev.map((col) => {
        const incoming = incomingByStage.get(Number(col.stage));
        if (!incoming) return col;

        const mergedItems = [...(col.items ?? [])];
        const existed = new Set(mergedItems.map((i) => Number(i.id)));
        for (const item of incoming.items ?? []) {
          const id = Number(item.id);
          if (!existed.has(id)) {
            mergedItems.push(item);
            existed.add(id);
          }
        }

        return {
          ...incoming,
          items: mergedItems
        };
      });
    });
  }, [serverColumns, kanbanPage]);

  const columns = useMemo(() => {
    const byStage = new Map<number, OpportunityKanbanColumn>();
    (localColumns ?? serverColumns).forEach((c) => byStage.set(Number(c.stage), c));

    const stageList =
      metaQuery.data?.result?.stages?.map((s) => ({
        id: Number(s.id),
        name: stageNameMapVi[Number(s.id)] || s.name
      })) ?? [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id, name: stageNameMapVi[id] }));

    const combined = stageList.map(({ id, name }) => {
      const found = byStage.get(id);
      const serverItems = found?.items ?? [];

      return {
        stage: id as OpportunityStage,
        stageName: name || stageNameMapVi[id],
        count: found?.count ?? serverItems.length,
        page: found?.page,
        limit: found?.limit,
        total: found?.total,
        hasMore: found?.hasMore,
        totalExpectedValue:
          found?.totalExpectedValue ??
          serverItems.reduce((sum, x) => sum + Number(x.expectedValue || 0), 0),
        totalWeightedValue: found?.totalWeightedValue ?? 0,
        items: serverItems
      } satisfies OpportunityKanbanColumn;
    });

    let result = combined;
    if (selectedStages.length > 0) {
      result = result.filter((c) => selectedStages.includes(Number(c.stage)));
    }
    if (selectedPriorities.length > 0) {
      result = result.map((col) => ({
        ...col,
        items: col.items.filter((item) => {
          const p = Number((item as any).priority ?? 0);
          return selectedPriorities.includes(p);
        })
      }));
    }
    return result;
  }, [localColumns, serverColumns, metaQuery.data, selectedStages, selectedPriorities]);

  const total = columns.reduce((sum, c) => sum + Number(c.total ?? c.count ?? c.items.length), 0);

  const rulesMap = useMemo(() => {
    const map = new Map<number, string[]>();
    metaQuery.data?.result?.rules?.forEach((r) =>
      map.set(Number(r.toStage), r.requiredFields || [])
    );
    return map;
  }, [metaQuery.data]);

  const resetLocalFromServer = async () => {
    setLocalColumns(null);
    setKanbanPage(1);
    await kanbanQuery.refetch();
  };

  const applyLocalMove = (
    card: OpportunityDto,
    fromStage: OpportunityStage,
    toStage: OpportunityStage
  ) => {
    setLocalColumns((prev) => {
      const base = (prev ?? columns).map((col) => ({ ...col, items: [...col.items] }));
      const fromCol = base.find((c) => Number(c.stage) === Number(fromStage));
      const toCol = base.find((c) => Number(c.stage) === Number(toStage));
      if (!fromCol || !toCol) return prev;

      fromCol.items = fromCol.items.filter((i) => Number(i.id) !== Number(card.id));
      fromCol.count = fromCol.items.length;

      toCol.items = [
        { ...card, stage: toStage },
        ...toCol.items.filter((i) => Number(i.id) !== Number(card.id))
      ];
      toCol.count = toCol.items.length;

      return base;
    });
  };

  const rollbackMove = (
    card: OpportunityDto,
    fromStage: OpportunityStage,
    toStage: OpportunityStage
  ) => {
    setLocalColumns((prev) => {
      if (!prev) return prev;
      const base = prev.map((col) => ({ ...col, items: [...col.items] }));
      const fromCol = base.find((c) => Number(c.stage) === Number(toStage));
      const toCol = base.find((c) => Number(c.stage) === Number(fromStage));
      if (!fromCol || !toCol) return prev;

      fromCol.items = fromCol.items.filter((i) => Number(i.id) !== Number(card.id));
      fromCol.count = fromCol.items.length;

      toCol.items = [
        { ...card, stage: fromStage },
        ...toCol.items.filter((i) => Number(i.id) !== Number(card.id))
      ];
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
        } else if (
          ["expectedCloseDate", "lastActivityDate", "actualCloseDate", "nextActionDate"].includes(k)
        ) {
          (payload as Record<string, unknown>)[k] = v.length === 10 ? `${v}T00:00:00` : v;
        } else {
          (payload as Record<string, unknown>)[k] = v;
        }
      });

      await moveStageMutation.mutateAsync({ id: move.card.id, body: payload });
      toast.success("Chuyển giai đoạn thành công");
      setPendingMove(null);
      setDynamicValues({});
      await resetLocalFromServer();
    } catch {
      rollbackMove(move.card, move.fromStage, move.toStage);
      setPendingMove(null);
      setDynamicValues({});
    }
  };

  const onDropCard = async (card: OpportunityDto, toStage: OpportunityStage) => {
    const fromStage = card.stage;
    if (Number(fromStage) === Number(toStage)) return;

    applyLocalMove(card, fromStage, toStage);

    const requiredFields = (rulesMap.get(Number(toStage)) || []).filter((f) =>
      isMissingField(card, f)
    );

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

  const loadMoreKanban = async () => {
    if (isLoadingMore || kanbanQuery.isFetching) return;
    setIsLoadingMore(true);
    setKanbanPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (!kanbanQuery.isFetching) {
      setIsLoadingMore(false);
    }
  }, [kanbanQuery.isFetching]);

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
              <div className="col-md-4 col-lg-2">
                <input
                  className="form-control"
                  placeholder="Tìm theo tên cơ hội..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                />
              </div>
              <div className="col-md-4 col-lg-2">
                <AppSelect
                  value={
                    customerOptions.find((opt) => Number(opt.value) === Number(customerId ?? -1)) ??
                    null
                  }
                  options={customerOptions}
                  placeholder="Tất cả khách hàng"
                  onMenuScrollToBottom={() =>
                    customersInf.hasNextPage &&
                    !customersInf.isFetchingNextPage &&
                    customersInf.fetchNextPage()
                  }
                  onChange={(option) => {
                    const selected = Array.isArray(option) ? option[0] : option;
                    const nextId = Number(selected?.value ?? 0);
                    setCustomerId(nextId || undefined);
                  }}
                />
              </div>
              <div className="col-md-4 col-lg-2">
                <AppSelect
                  value={
                    !me.isOperator
                      ? userOptions[0] || null
                      : (userOptions.find((opt) => Number(opt.value) === Number(userId ?? -1)) ??
                        null)
                  }
                  options={userOptions}
                  placeholder="Tất cả sale phụ trách"
                  onMenuScrollToBottom={() =>
                    usersInf.hasNextPage && !usersInf.isFetchingNextPage && usersInf.fetchNextPage()
                  }
                  onChange={(option) => {
                    const selected = Array.isArray(option) ? option[0] : option;
                    const nextId = Number(selected?.value ?? 0);
                    setUserId(nextId || undefined);
                  }}
                  isDisabled={!me.isOperator}
                />
              </div>
              <div className="col-md-6 col-lg-3">
                <AppSelect
                  value={stageOptions.filter((opt) => selectedStages.includes(Number(opt.value)))}
                  options={stageOptions}
                  placeholder="Tất cả giai đoạn"
                  isMulti
                  onChange={(option) => {
                    const selected = Array.isArray(option) ? option : option ? [option] : [];
                    setSelectedStages(selected.map((x) => Number(x.value)).filter(Boolean));
                  }}
                />
              </div>
              <div className="col-md-6 col-lg-3">
                <AppSelect
                  value={priorityOptions.filter((opt) =>
                    selectedPriorities.includes(Number(opt.value))
                  )}
                  options={priorityOptions}
                  placeholder="Tất cả mức độ ưu tiên"
                  isMulti
                  onChange={(option) => {
                    const selected = Array.isArray(option) ? option : option ? [option] : [];
                    setSelectedPriorities(
                      selected.map((x) => Number(x.value)).filter((x) => !Number.isNaN(x))
                    );
                  }}
                />
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
            <div
              className="d-flex gap-3 overflow-auto pb-2 kanban-hide-scrollbar"
              ref={kanbanScrollRef}
              style={{
                cursor: isPanningBoard ? customPanCursor : customGrabCursor,
                userSelect: isPanningBoard ? "none" : "auto",
                background: isPanningBoard
                  ? "linear-gradient(90deg, rgba(15,23,42,0.03), rgba(220,53,69,0.05), rgba(15,23,42,0.03))"
                  : "transparent",
                borderRadius: 8,
                transition: "background .15s ease"
              }}
              onMouseDown={(e) => {
                const target = e.target as HTMLElement;
                if (
                  target.closest(".kanban-card") ||
                  target.closest("input,button,select,textarea,a")
                ) {
                  return;
                }

                const container = kanbanScrollRef.current;
                if (!container) return;

                setIsPanningBoard(true);
                panStartXRef.current = e.clientX;
                panStartScrollLeftRef.current = container.scrollLeft;
              }}
              onMouseMove={(e) => {
                if (!isPanningBoard) return;
                const container = kanbanScrollRef.current;
                if (!container) return;

                const deltaX = e.clientX - panStartXRef.current;
                container.scrollLeft = panStartScrollLeftRef.current - deltaX;
              }}
              onMouseUp={() => setIsPanningBoard(false)}
              onMouseLeave={() => setIsPanningBoard(false)}
            >
              {columns.map((column) => {
                const color = stageColorMap[Number(column.stage)] || "secondary";
                const cards = column.items || [];
                const icon = stageIconMap[Number(column.stage)] || "ti ti-layout-kanban";
                const visibleCards = cards;
                const hasMore = Boolean(column.hasMore);

                return (
                  <div
                    key={Number(column.stage)}
                    className="flex-shrink-0"
                    style={{ width: KANBAN_COLUMN_WIDTH }}
                  >
                    <div
                      className="card border-0"
                      style={{
                        height: "72vh",
                        boxShadow:
                          dragOverStage === Number(column.stage)
                            ? "0 14px 28px rgba(220,53,69,0.18)"
                            : "0 6px 16px rgba(15, 23, 42, 0.08)",
                        border:
                          dragOverStage === Number(column.stage)
                            ? "1px dashed rgba(220,53,69,0.5)"
                            : "1px solid rgba(15, 23, 42, 0.04)",
                        transition: "all .18s ease"
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverStage !== Number(column.stage)) {
                          setDragOverStage(Number(column.stage));
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverStage === Number(column.stage)) {
                          setDragOverStage(null);
                        }
                      }}
                      onDrop={async () => {
                        if (!canEdit) {
                          toast.error("Bạn không có quyền chỉnh sửa cơ hội");
                          return;
                        }
                        const moved = cards.find((c) => Number(c.id) === draggingId);
                        const source = (localColumns ?? columns)
                          .flatMap((col) => col.items)
                          .find((c) => Number(c.id) === draggingId);
                        const card = moved || source;
                        if (!card) return;
                        await onDropCard(card, column.stage);
                        setDraggingId(null);
                        setDragOverStage(null);
                      }}
                    >
                      <div className={cn("card-header border-0", `bg-${color}-transparent`)}>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <span className={cn("avatar avatar-sm rounded-circle", `bg-${color}`)}>
                              <i className={cn(icon, "text-white fs-14")} />
                            </span>
                            <div>
                              <div className="fw-semibold">
                                {stageNameMapVi[Number(column.stage)] || column.stageName}
                              </div>
                              <div className="text-muted small">
                                {Number(column.total ?? cards.length)} cơ hội
                              </div>
                            </div>
                          </div>
                          <span className={cn("badge", `badge-soft-${color}`)}>
                            {Number(column.total ?? cards.length)}
                          </span>
                        </div>
                        <div className="small text-muted mt-2">
                          Dự kiến:{" "}
                          {new Intl.NumberFormat("vi-VN").format(
                            Number(column.totalExpectedValue || 0)
                          )}
                          ₫
                        </div>
                      </div>

                      <div
                        className="card-body pt-2 kanban-hide-scrollbar"
                        style={{ maxHeight: "58vh", overflowY: "auto" }}
                        onScroll={async (e) => {
                          const target = e.currentTarget;
                          const nearBottom =
                            target.scrollTop + target.clientHeight >= target.scrollHeight - 24;
                          if (nearBottom && hasMore && !kanbanQuery.isFetching) {
                            await loadMoreKanban();
                          }
                        }}
                      >
                        {visibleCards.map((item) => (
                          <div
                            key={Number(item.id)}
                            className="card kanban-card mb-2 border-0"
                            style={{
                              height: KANBAN_CARD_HEIGHT,
                              boxShadow:
                                draggingId === Number(item.id)
                                  ? "0 14px 30px rgba(220,53,69,0.22)"
                                  : "0 6px 16px rgba(15, 23, 42, 0.08)",
                              transform:
                                draggingId === Number(item.id)
                                  ? "scale(1.02) rotate(0.4deg)"
                                  : "scale(1)",
                              opacity: draggingId === Number(item.id) ? 0.78 : 1,
                              transition: "all .18s ease",
                              cursor: draggingId === Number(item.id) ? "grabbing" : "grab"
                            }}
                            draggable={canEdit}
                            onDragStart={() => setDraggingId(Number(item.id))}
                            onDrag={(e) => {
                              const container = kanbanScrollRef.current;
                              if (!container) return;
                              const x = e.clientX;
                              if (!x) return;

                              const rect = container.getBoundingClientRect();
                              const edge = 80;
                              const step = 22;

                              if (x < rect.left + edge) {
                                container.scrollBy({ left: -step, behavior: "auto" });
                              } else if (x > rect.right - edge) {
                                container.scrollBy({ left: step, behavior: "auto" });
                              }
                            }}
                            onDragEnd={() => setDraggingId(null)}
                          >
                            <div
                              className="card-body p-3 cursor-pointer h-100 d-flex flex-column"
                              role="button"
                              onClick={() => setDetailId(item.id)}
                            >
                              <h6
                                className="mb-2"
                                style={{
                                  minWidth: 0,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  lineHeight: "1.25rem",
                                  minHeight: "2.5rem"
                                }}
                                title={item.name}
                              >
                                {item.name || "-"}
                              </h6>

                              <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                                <span className={cn("badge rounded-pill", `badge-soft-${color}`)}>
                                  {item.probability}%
                                </span>
                                {(() => {
                                  const p = Number((item as any).priority ?? 0);
                                  const mapped = priorityMap[p] ?? {
                                    label: "Không xác định",
                                    className: "badge-soft-secondary"
                                  };
                                  return (
                                    <span className={cn("badge", mapped.className)}>
                                      {mapped.label}
                                    </span>
                                  );
                                })()}
                              </div>

                              <div
                                className="small text-muted d-flex align-items-center mb-1"
                                style={{ minWidth: 0 }}
                              >
                                <i className="ti ti-user me-1" />
                                <span className="text-truncate">
                                  {item.customerName || "Chưa có khách hàng"}
                                </span>
                              </div>
                              <div
                                className="small text-muted d-flex align-items-center mb-1"
                                style={{ minWidth: 0 }}
                              >
                                <i className="ti ti-user-circle me-1" />
                                <span className="text-truncate">
                                  {item.userName || "Chưa phân công"}
                                </span>
                              </div>
                              <div
                                className="small text-muted d-flex align-items-center"
                                style={{ minWidth: 0 }}
                              >
                                <i className="ti ti-calendar-event me-1" />
                                <span className="text-truncate">
                                  {item.expectedCloseDate
                                    ? new Date(item.expectedCloseDate).toLocaleDateString("vi-VN")
                                    : "Chưa có ngày dự kiến"}
                                </span>
                              </div>

                              <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                                <span className="small text-muted">Giá trị dự kiến</span>
                                <div
                                  className="fw-bold text-primary text-truncate"
                                  style={{ maxWidth: 120 }}
                                >
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND"
                                  }).format(Number(item.expectedValue || 0))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {hasMore && (
                          <button className="btn btn-light btn-sm w-100" onClick={loadMoreKanban}>
                            {kanbanQuery.isFetching ? "Đang tải thêm..." : "Tải thêm cơ hội"}
                          </button>
                        )}

                        {cards.length === 0 && (
                          <div className="text-center text-muted small py-4">
                            Chưa có cơ hội trong giai đoạn này
                          </div>
                        )}
                      </div>
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
              <div className="fw-semibold">{detailQuery.data.result.name || "-"}</div>
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
              <label className="form-label text-muted">Giai đoạn</label>
              <div>{stageNameMapVi[Number(detailQuery.data.result.stage)] || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Trạng thái</label>
              <div>
                {Number(detailQuery.data.result.status) === 1
                  ? "Đang hoạt động"
                  : "Ngưng hoạt động"}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Xác suất chốt</label>
              <div>{Number(detailQuery.data.result.probability || 0)}%</div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Mức độ ưu tiên</label>
              {(() => {
                const p = Number((detailQuery.data.result as any).priority ?? 0);
                const mapped = priorityMap[p] ?? {
                  label: "Không xác định",
                  className: "badge-soft-secondary"
                };
                return (
                  <div>
                    <span className={cn("badge", mapped.className)}>{mapped.label}</span>
                  </div>
                );
              })()}
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
            <div className="col-md-6">
              <label className="form-label text-muted">Ngày tạo</label>
              <div>
                {detailQuery.data.result.createdTime
                  ? new Date(detailQuery.data.result.createdTime).toLocaleString("vi-VN")
                  : "-"}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Cập nhật lần cuối</label>
              <div>
                {detailQuery.data.result.updatedTime
                  ? new Date(detailQuery.data.result.updatedTime).toLocaleString("vi-VN")
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
          if (pendingMove)
            rollbackMove(pendingMove.card, pendingMove.fromStage, pendingMove.toStage);
          setPendingMove(null);
          setDynamicValues({});
        }}
        footer={
          <>
            <button
              className="btn btn-light"
              onClick={() => {
                if (pendingMove)
                  rollbackMove(pendingMove.card, pendingMove.fromStage, pendingMove.toStage);
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
              Xác nhận chuyển giai đoạn
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-3">
          {pendingMove?.requiredFields.map((field) => {
            const isDate = [
              "expectedCloseDate",
              "lastActivityDate",
              "actualCloseDate",
              "nextActionDate"
            ].includes(field);
            const isNumber = ["expectedValue", "probability", "priority"].includes(field);
            const isUser = field === "userId";

            if (isUser) {
              return (
                <div key={field}>
                  <label className="form-label">{fieldLabelMap[field] || field}</label>
                  <AppSelect
                    value={
                      userOptions.find(
                        (u) => String(u.value) === String(dynamicValues[field] ?? "")
                      ) ?? null
                    }
                    options={userOptions}
                    placeholder="Chọn người phụ trách"
                    onMenuScrollToBottom={() =>
                      usersInf.hasNextPage &&
                      !usersInf.isFetchingNextPage &&
                      usersInf.fetchNextPage()
                    }
                    onChange={(option) => {
                      const selected = Array.isArray(option) ? option[0] : option;
                      setDynamicValues((prev) => ({
                        ...prev,
                        [field]: String(selected?.value ?? "")
                      }));
                    }}
                  />
                </div>
              );
            }

            return (
              <div key={field}>
                <label className="form-label">{fieldLabelMap[field] || field}</label>
                <input
                  className="form-control"
                  type={isDate ? "date" : isNumber ? "number" : "text"}
                  min={field === "probability" ? 0 : undefined}
                  max={field === "probability" ? 100 : undefined}
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
