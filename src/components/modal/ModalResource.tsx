import { Fragment } from "react";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: any;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
};

export default function ModalResource({
  type,
  shown,
  item,
  onClose,
  onSubmit,
  onDelete
}: ModalProps) {
  if (!type || !shown) return null;

  const isReadOnly = type === "detail";
  const inputProps = isReadOnly ? { disabled: true, readOnly: true } : {};

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm mới tài nguyên";
      case "edit":
        return "Chỉnh sửa tài nguyên";
      case "detail":
        return "Chi tiết tài nguyên";
      default:
        return "";
    }
  };

  if (type === "add" || type === "edit" || type === "detail") {
    return (
      <Fragment>
        <div className="modal fade show d-block" aria-modal style={{ zIndex: 1051 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{getTitle()}</h5>
                <button type="button" className="btn-close custom-btn-close" onClick={onClose}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
              <form onSubmit={onSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Tên tài nguyên</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          defaultValue={item?.name || ""}
                          placeholder="Nhập tên tài nguyên"
                          {...inputProps}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Mã tài nguyên</label>
                        <input
                          type="text"
                          name="code"
                          className="form-control"
                          defaultValue={item?.code || ""}
                          placeholder="Nhập mã tài nguyên"
                          {...inputProps}
                        />
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Mô tả</label>
                        <textarea
                          name="description"
                          className="form-control"
                          rows={3}
                          defaultValue={item?.description || ""}
                          placeholder="Nhập mô tả"
                          {...inputProps}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light me-2" onClick={onClose}>
                    Hủy
                  </button>
                  {!isReadOnly && (
                    <button type="submit" className="btn btn-primary">
                      {type === "add" ? "Thêm mới" : "Lưu thay đổi"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      </Fragment>
    );
  }

  if (type === "delete") {
    return (
      <Fragment>
        <div className="modal fade show d-block" aria-modal style={{ zIndex: 1051 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-0">
              <div className="modal-body p-4 text-center">
                <div className="mb-3">
                  <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle d-inline-flex align-items-center justify-content-center">
                    <i className="ti ti-trash fs-24"></i>
                  </span>
                </div>
                <h5 className="mb-1">Xóa tài nguyên</h5>
                <p className="mb-3 text-muted">
                  Bạn có chắc muốn xóa tài nguyên <strong>{item?.name}</strong>?
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button type="button" className="btn btn-light w-100" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn-danger w-100" onClick={onDelete}>
                    Xác nhận xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      </Fragment>
    );
  }

  return null;
}
