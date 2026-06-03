import { useEffect, useRef, useState } from "react";
import { BaseModal } from "@/components/ui/modal";
import { getSocket } from "@/lib/socket/socket";

type ModalState = "pending" | "success" | "error";

type PaymentDoneEvent = { invoiceId: number };

type Props = {
  shown: boolean;
  invoiceId: number;
  qrCode: string; // base64 PNG
  checkoutUrl: string;
  amount: number;
  onClose: () => void;
};

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

export function PaymentQrModal({ shown, invoiceId, qrCode, checkoutUrl, amount, onClose }: Props) {
  const [state, setState] = useState<ModalState>("pending");

  // Reset về pending mỗi lần modal mở
  useEffect(() => {
    if (shown) setState("pending");
  }, [shown]);

  // Lắng nghe socket "payment_done" từ server
  useEffect(() => {
    if (!shown) return;

    const socket = getSocket();
    if (!socket) return;

    const handler = (data: PaymentDoneEvent) => {
      if (data.invoiceId === invoiceId) {
        setState("success");
      }
    };

    socket.on("payment_done", handler);
    return () => {
      socket.off("payment_done", handler);
    };
  }, [shown, invoiceId]);

  if (!shown) return null;

  return (
    <BaseModal
      title={state === "success" ? "Thanh toán thành công" : "Thanh toán chuyển khoản"}
      shown={shown}
      size="sm"
      onClose={onClose}
      footer={
        state === "success" ? (
          // Chỉ hiện nút đóng khi đã xong
          <button className="btn btn-success w-100" onClick={onClose}>
            <i className="ti ti-check me-2" />
            Hoàn tất
          </button>
        ) : (
          <div className="d-flex gap-2 w-100">
            <button className="btn btn-outline-secondary flex-grow-1" onClick={onClose}>
              Hủy
            </button>
            {/* Nút thủ công: phòng trường hợp quán không cần chờ webhook */}
            <button className="btn btn-primary flex-grow-1" onClick={() => setState("success")}>
              Đã thanh toán
            </button>
          </div>
        )
      }
    >
      {/* ── Trạng thái: pending (đang chờ thanh toán) ─────────────────────── */}
      {state === "pending" && (
        <div className="text-center">
          <p className="text-muted small mb-3">
            Quét mã QR bên dưới để thanh toán. Màn hình tự cập nhật sau khi hoàn tất.
          </p>

          {/* QR Code */}
          <div className="border rounded p-2 d-inline-block mb-3 bg-white">
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR thanh toán"
              style={{ width: 220, height: 220, display: "block" }}
            />
          </div>

          {/* Số tiền */}
          <div className="mb-3">
            <div className="text-muted small">Số tiền</div>
            <div className="fs-4 fw-bold text-primary">{fmt(amount)}</div>
          </div>

          {/* Link PayOS */}
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-secondary btn-sm mb-3"
          >
            <i className="ti ti-external-link me-1" />
            Mở trang PayOS
          </a>

          {/* Spinner chờ */}
          <div className="d-flex align-items-center justify-content-center gap-2 text-muted small">
            <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} />
            Đang chờ xác nhận thanh toán...
          </div>
        </div>
      )}

      {/* ── Trạng thái: success ───────────────────────────────────────────── */}
      {state === "success" && (
        <div className="text-center py-3">
          {/* Icon tick animation */}
          <div
            className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: 80, height: 80 }}
          >
            <i className="ti ti-circle-check text-success" style={{ fontSize: 48 }} />
          </div>

          <h5 className="fw-bold mb-1">Thanh toán thành công!</h5>
          <p className="text-muted small mb-3">
            Hóa đơn đã được xác nhận và cập nhật vào hệ thống.
          </p>

          <div className="bg-light rounded p-3 d-inline-block">
            <div className="text-muted small">Số tiền đã thanh toán</div>
            <div className="fs-4 fw-bold text-success">{fmt(amount)}</div>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
