import { BaseModal } from "@/components/ui/modal";
import { OpportunityForm } from "./form";
import type { OpportunityDto } from "@/lib/types/opportunity";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: OpportunityDto;
  userOptions: { label: string; value: number }[];
  customerOptions: { label: string; value: number }[];
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  onLoadMoreUsers?: () => void;
  onLoadMoreCustomers?: () => void;
  hideUserField?: boolean;
  hideExpectedCloseDateField?: boolean;
  forceStatusActive?: boolean;
  zIndex?: number;
  backdropZIndex?: number;
};

export default function ModalOpportunity({
  type,
  shown,
  item,
  userOptions,
  customerOptions,
  onClose,
  onSubmit,
  onDelete,
  onLoadMoreUsers,
  onLoadMoreCustomers,
  hideUserField,
  hideExpectedCloseDateField,
  forceStatusActive,
  zIndex,
  backdropZIndex
}: ModalProps) {
  if (!type && !shown) return null;

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm cơ hội";
      case "edit":
        return "Cập nhật cơ hội";
      case "detail":
        return "Chi tiết cơ hội";
      case "delete":
        return "Xóa cơ hội?";
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
        zIndex={zIndex}
        backdropZIndex={backdropZIndex}
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
          <h5 className="mb-1">Xóa cơ hội</h5>
          <p className="mb-3 text-muted">Bạn có chắc muốn xóa cơ hội này không?</p>
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
      zIndex={zIndex}
      backdropZIndex={backdropZIndex}
      footer={
        type !== "detail" ? (
          <>
            <button className="btn btn-light me-2" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" form="opportunity-form" className="btn btn-primary">
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
          <OpportunityForm
            mode={type}
            opportunity={item}
            userOptions={userOptions}
            customerOptions={customerOptions}
            onSubmit={onSubmit}
            onLoadMoreUsers={onLoadMoreUsers}
            onLoadMoreCustomers={onLoadMoreCustomers}
            hideUserField={hideUserField}
            hideExpectedCloseDateField={hideExpectedCloseDateField}
            forceStatusActive={forceStatusActive}
          />
        )}
      </div>
    </BaseModal>
  );
}
