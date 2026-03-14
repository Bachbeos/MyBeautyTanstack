import { BaseModal } from "@/components/ui/modal";
import { ServiceForm } from "./form";
import type { ServiceDto } from "@/lib/types/service";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: ServiceDto;
  onClose: () => void;
  onSubmit: (values: any) => void;
  onDelete?: () => void;
  categoryOptions: { label: string; value: number }[];
  onLoadMoreCategories?: () => void;
};

export default function ModalService({
  type,
  shown,
  item,
  onClose,
  onSubmit,
  onDelete,
  categoryOptions,
  onLoadMoreCategories
}: ModalProps) {
  void onLoadMoreCategories;

  if (!type && !shown) return null;

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm dịch vụ mới";
      case "edit":
        return "Cập nhật dịch vụ";
      case "detail":
        return "Chi tiết dịch vụ";
      case "delete":
        return "Xóa dịch vụ";
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
              Xóa ngay
            </button>
          </div>
        }
      >
        <div className="text-center">
          <span className="avatar avatar-sm badge-soft-danger border-0 text-danger rounded-circle mb-3">
            <i className="ti ti-trash fs-24"></i>
          </span>
          <h5 className="mb-1">Xóa sản phẩm?</h5>
          <p className="text-muted">
            Bạn có chắc muốn xóa "<strong>{item?.name}</strong>" không?
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
      size="xl"
      footer={
        type !== "detail" ? (
          <>
            <button className="btn btn-light me-2" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" form="service-form" className="btn btn-primary">
              {type === "add" ? "Tạo mới" : "Lưu thay đổi"}
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={onClose}>
            Đóng
          </button>
        )
      }
    >
      <div>
        {type && (type === "add" || type === "edit" || type === "detail") && (
          <ServiceForm
            mode={type}
            service={item}
            onSubmit={onSubmit}
            categoryOptions={categoryOptions}
            onLoadMoreCategories={onLoadMoreCategories}
          />
        )}
      </div>
    </BaseModal>
  );
}
