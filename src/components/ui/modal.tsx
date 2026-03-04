import { type ReactNode, Fragment } from "react";

type BaseModalProps = {
  title: string;
  shown: boolean;
  size?: "sm" | "md" | "lg";
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function BaseModal({
  title,
  shown,
  size = "md",
  onClose,
  children,
  footer
}: BaseModalProps) {
  if (!shown) return null;

  const sizeClass = size === "sm" ? "modal-sm" : size === "lg" ? "modal-lg" : "";

  return (
    <Fragment>
      <div className="modal fade show d-block" style={{ zIndex: 1051 }}>
        <div className={`modal-dialog modal-dialog-centered ${sizeClass}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">{children}</div>

            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose} />
    </Fragment>
  );
}
