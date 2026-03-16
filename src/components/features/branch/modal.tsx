import { BaseModal } from "@/components/ui/modal";
import { BaseOffcanvas } from "@/components/ui/offcanvas";
import { BranchForm } from "./form";
import type { BranchDto } from "@/lib/types/branch";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: BranchDto;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  parentOptions: { value: number; label: string }[];
  onLoadMoreParents?: () => void;
  userOptions: { value: number; label: string }[];
  onLoadMoreUsers?: () => void;
};

export default function ModalBranch({
  type,
  shown,
  item,
  onClose,
  onSubmit,
  onDelete,
  parentOptions,
  onLoadMoreParents,
  userOptions,
  onLoadMoreUsers
}: ModalProps) {
  if (!type && !shown) return null;

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm chi nhánh";
      case "edit":
        return "Cập nhật chi nhánh";
      case "detail":
        return "Chi tiết chi nhánh";
      case "delete":
        return "Xóa chi nhánh?";
      default:
        return "";
    }
  };

  if (type === "delete") {
    return (
      <BaseModal
        title={getTitle()}
        shown={shown}
        size="sm"
        onClose={onClose}
        footer={
          <div className="d-flex justify-content-center w-100 gap-2">
            <button className="btn btn-sm btn-light w-100" onClick={onClose}>
              Hủy
            </button>
            <button className="btn btn-sm btn-primary w-100" onClick={onDelete}>
              Đồng ý
            </button>
          </div>
        }
      >
        <div className="text-center">
          <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle mb-3">
            <i className="ti ti-trash fs-24"></i>
          </span>
          <h5 className="mb-1">Xóa chi nhánh</h5>
          <p className="mb-3 text-muted">
            Bạn có chắc muốn xóa chi nhánh <strong>{item?.name}</strong> không?
          </p>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseOffcanvas
      title={getTitle()}
      shown={shown}
      onClose={onClose}
      size="lg"
      footer={
        type !== "detail" ? (
          <>
            <div className="d-flex justify-content-end gap-2 w-100">
              <button className="btn btn-light" type="button" onClick={onClose}>
                Huỷ
              </button>
              <button className="btn btn-primary" type="submit" form="branch-form">
                {type === "add" ? "Tạo mới" : "Lưu thay đổi"}
              </button>
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-light" onClick={onClose}>
              Đóng
            </button>
          </div>
        )
      }
    >
      <div>
        {type && (type === "add" || type === "edit" || type === "detail") && (
          <BranchForm
            mode={type}
            branch={item}
            onSubmit={onSubmit}
            parentOptions={parentOptions}
            onLoadMoreParents={onLoadMoreParents}
            userOptions={userOptions}
            onLoadMoreUsers={onLoadMoreUsers}
          />
        )}
      </div>
    </BaseOffcanvas>
  );
}
