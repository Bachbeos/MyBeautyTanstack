import * as React from "react";

export type AsyncStatus = "loading" | "pending" | "error" | "success";

export interface AsyncBoundaryProps<TData> {
  data?: TData;
  status: AsyncStatus;
  error?: unknown;

  onRetry?: () => void;

  children: (data: TData) => React.ReactNode;

  loadingFallback?: React.ReactNode;
  emptyFallback?: React.ReactNode;
  errorFallback?: (error: unknown, retry?: () => void) => React.ReactNode;

  className?: string;
}

export function AsyncBoundary<TData>({
  data,
  status,
  error,
  onRetry,
  children,
  loadingFallback,
  emptyFallback,
  errorFallback,
  className
}: AsyncBoundaryProps<TData>) {
  if (status === "loading" || status === "pending") {
    return <div className={className}>{loadingFallback ?? <DefaultLoading />}</div>;
  }

  if (status === "error") {
    if (errorFallback) {
      return <div className={className}>{errorFallback(error, onRetry)}</div>;
    }

    return (
      <div className={className}>
        <DefaultError error={error} onRetry={onRetry} />
      </div>
    );
  }

  const isEmpty = data == null || (Array.isArray(data) && data.length === 0);

  if (isEmpty && emptyFallback) {
    return <div className={className}>{emptyFallback}</div>;
  }

  return <div className={className}>{data && children(data)}</div>;
}

/* =======================
   Default State UIs
======================= */

function DefaultLoading() {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4 p-md-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
          <div>
            <h6 className="mb-1 fw-semibold">Đang tải dữ liệu</h6>
            <p className="text-muted mb-0 small">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>

        <div className="placeholder-glow">
          <span className="placeholder col-8 mb-3 rounded-2" style={{ height: 14 }} />
          <span className="placeholder col-10 mb-3 rounded-2" style={{ height: 14 }} />
          <span className="placeholder col-6 mb-3 rounded-2" style={{ height: 14 }} />
          <span className="placeholder col-12 rounded-2" style={{ height: 120 }} />
        </div>
      </div>
    </div>
  );
}

interface DefaultErrorProps {
  error?: unknown;
  onRetry?: () => void;
}

function DefaultError({ error, onRetry }: DefaultErrorProps) {
  const message = error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn.";

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4 p-md-5 text-center">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: 64, height: 64, background: "rgba(220, 53, 69, 0.12)", color: "#dc3545" }}
          aria-hidden="true"
        >
          <strong>!</strong>
        </div>

        <h5 className="fw-bold mb-2">Không thể tải dữ liệu</h5>
        <p className="text-muted mb-4" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {message}
        </p>

        {onRetry ? (
          <button onClick={onRetry} className="btn btn-primary px-4">
            Thử lại
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function DefaultEmpty() {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-5 text-center">
        <h6 className="fw-semibold mb-2">Không có dữ liệu</h6>
        <p className="text-muted mb-0">Hiện chưa có thông tin để hiển thị.</p>
      </div>
    </div>
  );
}
