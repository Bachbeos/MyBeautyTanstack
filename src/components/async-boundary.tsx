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
    <div className="async-loading">
      <div className="async-spinner" />
      <p>Loading...</p>
    </div>
  );
}

interface DefaultErrorProps {
  error?: unknown;
  onRetry?: () => void;
}

function DefaultError({ error, onRetry }: DefaultErrorProps) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <div className="async-error">
      <h3>Failed to load</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="async-retry">
          Retry
        </button>
      )}
    </div>
  );
}

export function DefaultEmpty() {
  return (
    <div className="async-empty">
      <p>No data found.</p>
    </div>
  );
}
