import { BaseModal } from "@/components/ui/modal";
import type { ServiceVariation } from "@/lib/types/service";

type VariationModalProps = {
  shown: boolean;
  serviceName: string;
  variations: ServiceVariation[];
  onClose: () => void;
  onSelect: (variation: ServiceVariation) => void;
};

export function VariationModal({
  shown,
  serviceName,
  variations,
  onClose,
  onSelect
}: VariationModalProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  return (
    <BaseModal title={`Chọn gói - ${serviceName}`} shown={shown} onClose={onClose} size="lg">
      <div className="row g-3">
        {variations.map((v, idx) => (
          <div className="col-12 col-md-6" key={idx}>
            <button
              type="button"
              className="card border shadow-sm w-100 p-0 text-start overflow-hidden hover-shadow-md transition-all"
              onClick={() => onSelect(v)}
            >
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold mb-0 text-primary">{v.name}</h6>
                  <span className="badge bg-soft-info text-info">{v.treatmentNum} buổi</span>
                </div>
                <div className="d-flex flex-column gap-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Giá gốc:</span>
                    <span className="text-decoration-line-through text-muted">
                      {formatPrice(v.price)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center text-danger">
                    <span className="small">Giảm giá:</span>
                    <span className="fw-medium">-{formatPrice(v.discount)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1 pt-1 border-top">
                    <span className="fw-bold">Thanh toán:</span>
                    <span className="fw-bold fs-5 text-primary">
                      {formatPrice(v.price - v.discount)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </BaseModal>
  );
}
