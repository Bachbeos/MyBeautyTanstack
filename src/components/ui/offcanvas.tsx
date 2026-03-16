import { cn } from "@/lib/utils";
import { type ReactNode, Fragment, useEffect } from "react";

type BaseOffcanvasProps = {
  title: string;
  shown: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

export function BaseOffcanvas({
  title,
  shown,
  onClose,
  children,
  footer,
  size = "md",
  className
}: BaseOffcanvasProps) {
  useEffect(() => {
    if (shown) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [shown]);

  const sizeClass =
    size === "lg"
      ? "offcanvas-large"
      : size === "xl"
        ? "offcanvas-xl"
        : size === "sm"
          ? "offcanvas-sm"
          : "";

  return (
    <Fragment>
      <div
        className={cn("offcanvas offcanvas-end", shown && "show", sizeClass, className)}
        style={{ visibility: shown ? "visible" : "hidden", zIndex: 1051 }}
        tabIndex={-1}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title mb-0">{title}</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            onClick={onClose}
          ></button>
        </div>

        <div className="offcanvas-body custom-modal-scroll">{children}</div>

        {footer && <div className="offcanvas-footer p-3 border-top bg-white">{footer}</div>}
      </div>

      <div
        className={cn("offcanvas-backdrop fade", shown && "show")}
        style={{ zIndex: 1050, display: shown ? "block" : "none" }}
        onClick={onClose}
      ></div>
    </Fragment>
  );
}
