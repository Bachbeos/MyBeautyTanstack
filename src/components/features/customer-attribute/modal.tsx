import { BaseModal } from "@/components/ui/modal";
import type { CustomerAttributeDto } from "@/lib/types/customer-attribute";
import { AttributeForm } from "./form";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: CustomerAttributeDto;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  parentOptions: { label: string; value: number }[];
};

export default function ModalAttribute({
  type,
  shown,
  item,
  onClose,
  onSubmit,
  onDelete,
  parentOptions
}: ModalProps) {
  if (!type && !shown) return null;

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm thuộc tính khách hàng";
      case "edit":
        return "Sửa thuộc tính khách hàng";
      case "detail":
        return "Chi tiết thuộc tính";
      case "delete":
        return "Xóa thuộc tính";
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
              Xác nhận xóa
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
          <h5 className="mb-1">Xóa thuộc tính</h5>
          <p className="mb-3 text-muted">
            Bạn có chắc muốn xóa thuộc tính <strong>{item?.name}</strong>?
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
            <button type="submit" form="attribute-form" className="btn btn-primary">
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
          <AttributeForm
            mode={type}
            attribute={item}
            onSubmit={onSubmit}
            parentOptions={parentOptions}
          />
        )}
      </div>
    </BaseModal>
  );
}
