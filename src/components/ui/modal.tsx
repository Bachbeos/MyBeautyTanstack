import { cn } from "@/lib/utils";
import { type ReactNode, Fragment } from "react";

type BaseModalProps = {
  title: string;
  shown: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  contentClassName?: string;
};

export function BaseModal({
  title,
  shown,
  size = "md",
  onClose,
  children,
  footer,
  headerActions,
  contentClassName
}: BaseModalProps) {
  if (!shown) return null;

  const sizeClass =
    size === "sm" ? "modal-sm" : size === "lg" ? "modal-lg" : size === "xl" ? "modal-xl" : "";

  return (
    <Fragment>
      <div className={cn("modal fade show d-block")} style={{ zIndex: 1051 }}>
        <div className={`modal-dialog modal-dialog-centered ${sizeClass}`}>
          <div className={cn("modal-content", contentClassName)}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <div className="ms-auto d-flex align-items-center gap-2">
                {headerActions}
                <button type="button" className="btn-close" onClick={onClose} />
              </div>
            </div>

            <div className="modal-body">{children}</div>

            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>

      <div
        className={cn("modal-backdrop fade", shown && "show")}
        style={{
          zIndex: 1050,
          display: shown ? "block" : "none"
        }}
        onClick={onClose}
      />
    </Fragment>
  );
}
