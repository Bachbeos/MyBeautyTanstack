import { BaseModal } from "@/components/ui/modal";
import type { ProductDto } from "@/lib/types/product";
import { ProductForm } from "./form";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: ProductDto;
  categoryOptions: { label: string; value: number }[];
  unitOptions: { label: string; value: number }[];
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  onLoadMoreCategories?: () => void;
  onLoadMoreUnits?: () => void;
};

export default function ModalProduct({
  type,
  shown,
  item,
  categoryOptions,
  unitOptions,
  onClose,
  onSubmit,
  onDelete,
  onLoadMoreCategories,
  onLoadMoreUnits
}: ModalProps) {
  if (!type || !shown) return null;

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm mới sản phẩm";
      case "edit":
        return "Cập nhật sản phẩm";
      case "detail":
        return "Chi tiết sản phẩm";
      case "delete":
        return "Xóa sản phẩm";
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
        <div className="p-4 text-center">
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
      size="xl"
      onClose={onClose}
      footer={
        type !== "detail" ? (
          <>
            <button className="btn btn-light me-2" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" form="product-form" className="btn btn-primary">
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
      <ProductForm
        mode={type}
        product={item}
        categoryOptions={categoryOptions}
        unitOptions={unitOptions}
        onSubmit={onSubmit}
        onLoadMoreCategories={onLoadMoreCategories}
        onLoadMoreUnits={onLoadMoreUnits}
      />
    </BaseModal>
  );
}
