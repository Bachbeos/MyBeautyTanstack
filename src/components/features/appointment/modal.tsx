import { BaseModal } from "@/components/ui/modal";
import type { AppointmentDto } from "@/lib/types/appointment";
import { AppointmentForm } from "./form";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: AppointmentDto;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  userOptions: { label: string; value: number }[];
  onLoadMoreUsers: () => void;
  customerOptions: { label: string; value: number }[];
  onLoadMoreCustomers: () => void;
};

export default function ModalAppointment({
  type,
  shown,
  item,
  onClose,
  onSubmit,
  onDelete,
  userOptions,
  onLoadMoreUsers,
  customerOptions,
  onLoadMoreCustomers
}: ModalProps) {
  if (!type && !shown) return null;

  const getTitle = () => {
    switch (type) {
      case "add":
        return "Thêm mới lịch hẹn";
      case "edit":
        return "Chỉnh sửa lịch hẹn";
      case "detail":
        return "Chi tiết lịch hẹn";
      case "delete":
        return "Xóa lịch hẹn";
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

          <h5 className="mb-1">Xóa lịch hẹn</h5>

          <p className="mb-3 text-muted">Bạn có chắc muốn xóa lịch hẹn đã chọn không?</p>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      title={getTitle()}
      shown={shown}
      onClose={onClose}
      size="lg"
      footer={
        type !== "detail" ? (
          <>
            <button type="button" className="btn btn-light me-2" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" form="appointment-form" className="btn btn-primary">
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
      <div>
        {type && (type === "add" || type === "edit" || type === "detail") && (
          <AppointmentForm
            mode={type}
            appointment={item}
            onSubmit={onSubmit}
            userOptions={userOptions}
            onLoadMoreUsers={onLoadMoreUsers}
            customerOptions={customerOptions}
            onLoadMoreCustomers={onLoadMoreCustomers}
          />
        )}
      </div>
    </BaseModal>
  );
}
