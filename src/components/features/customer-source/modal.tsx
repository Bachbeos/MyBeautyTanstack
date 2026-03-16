import { CustomerSourceForm } from "@/components/features/customer-source/form";
import { BaseModal } from "@/components/ui/modal";
import type { CustomerSourceDto } from "@/lib/types/customer-source";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: CustomerSourceDto;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  onDelete?: () => Promise<void> | void;
};

export default function ModalCustomerSource({
  type,
  shown,
  item,
  onClose,
  onSubmit,
  onDelete
}: ModalProps) {
  if (!type && !shown) return null;

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm mới nguồn khách hàng";
      case "edit":
        return "Chỉnh sửa nguồn khách hàng";
      case "detail":
        return "Chi tiết nguồn khách hàng";
      case "delete":
        return "Xóa nguồn khách hàng";
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
            <button type="button" className="btn btn-sm btn-danger w-100" onClick={onDelete}>
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

          <h5 className="mb-1">Xóa nguồn khách hàng</h5>

          <p className="mb-3 text-muted">
            Bạn có chắc muốn xóa nguồn khách hàng <strong>{item?.name}</strong>?
          </p>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      title={getTitle()}
      shown={shown}
      onClose={onClose}
      footer={
        type !== "detail" ? (
          <>
            <button type="button" className="btn btn-light me-2" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" form="customerSource-form" className="btn btn-primary">
              {type === "add" ? "Thêm mới" : "Lưu thay đổi"}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-light" onClick={onClose}>
            Đóng
          </button>
        )
      }
    >
      <div className="">
        {type && (type === "add" || type === "edit" || type === "detail") && (
          <CustomerSourceForm mode={type} customerSource={item} onSubmit={onSubmit} />
        )}
      </div>
    </BaseModal>
  );
}
