import { BaseModal } from "@/components/ui/modal";
import { CallHistoryForm } from "./form";
import type { callHistoryDto } from "@/lib/types/call-history";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: callHistoryDto;
  userOptions: { label: string; value: number }[];
  customerOptions: { label: string; value: number }[];
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  onLoadMoreUsers?: () => void;
  onLoadMoreCustomers?: () => void;
};

export default function ModalCallHistory({
  type,
  shown,
  item,
  userOptions,
  customerOptions,
  onClose,
  onSubmit,
  onDelete,
  onLoadMoreUsers,
  onLoadMoreCustomers
}: ModalProps) {
  if (!type && !shown) return null;

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm cuộc gọi";
      case "edit":
        return "Cập nhật cuộc gọi";
      case "detail":
        return "Chi tiết cuộc gọi";
      case "delete":
        return "Xóa lịch sử?";
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
          <h5 className="mb-1">Xóa bản ghi?</h5>
          <p className="text-muted small">Bạn có chắc muốn xóa lịch sử cuộc gọi này không?</p>
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
            <button className="btn btn-light me-2" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" form="call-history-form" className="btn btn-primary">
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
          <CallHistoryForm
            mode={type}
            callHistory={item}
            userOptions={userOptions}
            customerOptions={customerOptions}
            onSubmit={onSubmit}
            onLoadMoreUsers={onLoadMoreUsers}
            onLoadMoreCustomers={onLoadMoreCustomers}
          />
        )}
      </div>
    </BaseModal>
  );
}
