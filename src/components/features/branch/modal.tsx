import { BaseModal } from "@/components/ui/modal";
import { BaseOffcanvas } from "@/components/ui/offcanvas";
import { BranchForm } from "./form";

export default function ModalBranch({
  type,
  shown,
  item,
  onClose,
  onSubmit,
  onDelete,
  parentOptions,
  userOptions
}: any) {
  if (!type || !shown) return null;

  // Xử lý Xóa bằng Modal nhỏ giữa màn hình
  if (type === "delete") {
    return (
      <BaseModal title="Xóa chi nhánh" shown={shown} size="sm" onClose={onClose}>
        <div className="p-4 text-center">
          <div className="mb-3">
            <span className="avatar avatar-xl badge-soft-danger rounded-circle d-inline-flex align-items-center justify-content-center">
              <i className="ti ti-trash fs-24"></i>
            </span>
          </div>
          <h5>Xác nhận xóa?</h5>
          <p className="text-muted small">
            Chi nhánh <strong>{item?.name}</strong> sẽ bị xóa khỏi hệ thống.
          </p>
          <div className="d-flex gap-2 mt-4">
            <button className="btn btn-light w-100" onClick={onClose}>
              Hủy
            </button>
            <button className="btn btn-danger w-100" onClick={onDelete}>
              Đồng ý xóa
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // Xử lý Thêm/Sửa/Chi tiết bằng Offcanvas
  return (
    <BaseOffcanvas
      title={
        type === "add" ? "Thêm chi nhánh" : type === "edit" ? "Sửa chi nhánh" : "Chi tiết chi nhánh"
      }
      shown={shown}
      onClose={onClose}
      size="lg" // Khớp với offcanvas-large cũ
      footer={
        type !== "detail" && (
          <div className="d-flex justify-content-end gap-2 w-100">
            <button className="btn btn-light" type="button" onClick={onClose}>
              Huỷ
            </button>
            <button className="btn btn-primary" type="submit" form="branch-form">
              {type === "add" ? "Tạo mới" : "Lưu thay đổi"}
            </button>
          </div>
        )
      }
    >
      <BranchForm
        mode={type}
        item={item}
        onSubmit={onSubmit}
        parentOptions={parentOptions}
        userOptions={userOptions}
      />
    </BaseOffcanvas>
  );
}
