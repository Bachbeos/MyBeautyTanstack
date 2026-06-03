import { useAuthStore } from "@/lib/stores/auth";
import { notificationMutations, notificationQueries } from "@/lib/tanstack/options/notification";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import "@/assets/css/notification-shared.css";
import RefreshButton from "@/components/refresh/refresh";
import CollapseButton from "@/components/collapse/collapse-button";

export const Route = createFileRoute("/_crm/_notification/notification")({
  component: RouteComponent
});

function RouteComponent() {
  const { userId } = useAuthStore();
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const params = useMemo(
    () => ({
      page: 1,
      size: 20
    }),
    []
  );
  const query = useQuery(notificationQueries.list(params));
  const response = query.data;
  const isLoading = query.isLoading;
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );

  const notifications = (response?.result?.items ?? []).filter((n) => !dismissedIds.includes(n.id));

  const markRead = useMutation(notificationMutations.markRead());
  const markAllRead = useMutation(notificationMutations.markAllRead());
  const deleteNotification = useMutation(notificationMutations.delete());

  const handleRemoveItem = (id: number) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleCollapse = () => {
    document.body.classList.toggle("header-collapse");
    setIsHeaderCollapsed(document.body.classList.contains("header-collapse"));
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap">
          <div>
            <h4 className="mb-1">Thông báo</h4>
            <div className="text-muted small">Thông báo / Danh sách thông báo</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <RefreshButton onRefresh={() => query.refetch()} />
            <CollapseButton onCollapse={handleCollapse} active={isHeaderCollapsed} />
          </div>
        </div>

        <div className="card mb-0">
          <div className="card-header d-flex align-items-center flex-wrap gap-2 justify-content-between">
            <h6 className="d-inline-flex align-items-center mb-0">
              Tổng số thông báo <span className="badge bg-danger ms-2">{notifications.filter((n) => n.isRead === 0).length}</span>
            </h6>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                className="btn btn-light"
                type="button"
                onClick={() => userId && markAllRead.mutate(Number(userId))}
              >
                <i className="ti ti-checks me-1"></i>Đánh dấu đã đọc tất cả
              </button>
            </div>
          </div>

          <div className="card-body">
            {isLoading ? (
              <div className="text-center p-5">Đang tải thông báo...</div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div className="card notication-card" key={n.id}>
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center">
                        {/* <a href="#" className="avatar flex-shrink-0">
                          <img
                            src={n.image || "/assets/img/users/user-07.jpg"}
                            alt="img"
                            className="rounded-circle"
                          />
                        </a> */}
                        <div className="ms-2">
                          <div>
                            <p className="mb-1">
                              <span className="fw-medium">{n.title}</span> {n.content}
                            </p>
                            <p className="fs-12 mb-0 d-inline-flex align-items-center">
                              <i className="ti ti-clock me-1"></i>
                              {new Date(n.createdTime).toLocaleString("vi-VN")}
                              {n.isRead === 0 && (
                                <span className="ms-2">
                                  <i className="ti ti-point-filled text-danger fs-16 lh-sm"></i>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="noti-btn d-flex gap-2">
                        {n.isRead === 0 && (
                          <button
                            className="btn btn-light d-inline-flex align-items-center"
                            type="button"
                            onClick={() => markRead.mutate(n.id)}
                          >
                            <i className="ti ti-check me-1"></i>Đánh dấu đã đọc
                          </button>
                        )}
                        <button
                          className="btn btn-outline-danger d-inline-flex align-items-center"
                          type="button"
                          onClick={() => deleteNotification.mutate(n.id, { onSuccess: () => handleRemoveItem(n.id) })}
                        >
                          <i className="ti ti-x me-1"></i>Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-5 text-muted">Không tìm thấy thông báo nào.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
