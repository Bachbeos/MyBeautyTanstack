import { SaleForm } from "@/components/features/sale/form";
import { BaseModal } from "@/components/ui/modal";

type ModalProps = {
  shown: boolean;
  initialAmount?: number;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
};

export default function ModalSale({ shown, initialAmount = 0, onClose, onSubmit }: ModalProps) {
  if (!shown) return null;

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <BaseModal
      title="Tạo hóa đơn"
      shown={shown}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-light me-2" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" form="invoice-form" className="btn btn-primary">
            Tạo hóa đơn
          </button>
        </>
      }
    >
      <SaleForm mode="add" initialAmount={initialAmount} onSubmit={handleSubmit} />
    </BaseModal>
  );
}
