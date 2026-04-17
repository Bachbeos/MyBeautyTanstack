import { BaseModal } from "@/components/ui/modal";
import type { UserDto } from "@/lib/types/user";
import { UserForm } from "./form";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: UserDto;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  branchOptions: { label: string; value: number }[];
  roleOptions: { label: string; value: number }[];
  onLoadMoreBranches?: () => void;
};

export default function ModalUser({
  type,
  shown,
  item,
  branchOptions,
  roleOptions,
  onClose,
  onSubmit,
  onDelete,
  onLoadMoreBranches
}: ModalProps) {
  if (!type && !shown) return null;

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm người dùng";
      case "edit":
        return "Sửa người dùng";
      case "detail":
        return "Chi tiết người dùng";
      case "delete":
        return "Xóa người dùng";
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
        contentClassName="rounded-0 border-radius"
        footer={
          <div className="d-flex justify-content-center w-100 gap-2">
            <button type="button" className="btn btn-sm btn-light w-100" onClick={onClose}>
              Hủy
            </button>
            <button type="button" className="btn btn-sm btn-primary w-100" onClick={onDelete}>
              Đồng ý, xóa
            </button>
          </div>
        }
      >
        <div className="text-center">
          <div className="mb-3">
            <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle d-inline-flex align-items-center justify-content-center">
              <i className="ti ti-trash fs-24"></i>
            </span>
          </div>
          <h5 className="mb-1">Xóa người dùng</h5>
          <p className="mb-3 text-muted">
            Bạn có chắc muốn xóa người dùng <strong>{item?.name}</strong> không?
          </p>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      title={getTitle()}
      shown={shown}
      size="lg"
      onClose={onClose}
      footer={
        type !== "detail" ? (
          <>
            <button type="button" className="btn btn-light me-2" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" form="user-form" className="btn btn-primary">
              {type === "add" ? "Tạo mới" : "Lưu thay đổi"}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Đóng
          </button>
        )
      }
    >
      <div>
        {type && (type === "add" || type === "edit" || type === "detail") && (
          <UserForm
            mode={type}
            user={item}
            branchOptions={branchOptions}
            roleOptions={roleOptions}
            onSubmit={onSubmit}
            onLoadMoreBranches={onLoadMoreBranches}
          />
        )}
      </div>
    </BaseModal>
  );
}
