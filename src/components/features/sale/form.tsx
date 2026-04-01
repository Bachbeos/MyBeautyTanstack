import { useEffect, useState } from "react";
import { z } from "zod";

import { useAppForm } from "@/components/form/hooks";
import { getVoucherByCode, applyVoucher } from "@/lib/api/voucher";

const invoiceSchema = z.object({
  amount: z.number().min(0, "Số tiền hóa đơn không hợp lệ"),
  discount: z.number().min(0, "Tiền giảm giá không hợp lệ"),
  discountCode: z.string().max(50, "Mã giảm giá tối đa 50 ký tự").optional(),
  voucherId: z.number().optional(),
  fee: z.number().min(0, "Tiền phải trả không hợp lệ"),
  paymentMethod: z.number().min(1, "Vui lòng chọn phương thức thanh toán")
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

type InvoiceFormProps = {
  mode?: "add" | "edit" | "detail";
  initialAmount?: number;
  invoiceId?: number;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
};

const paymentMethods = [
  { label: "Thanh toán tiền mặt", value: 1 },
  { label: "Chuyển khoản", value: 2 }
];

export function SaleForm({
  mode = "add",
  initialAmount = 0,
  invoiceId,
  onSubmit
}: InvoiceFormProps) {
  const isReadOnly = mode === "detail";
  const [discountCodeError, setDiscountCodeError] = useState<string>("");
  const [discountCodeSuccess, setDiscountCodeSuccess] = useState<string>("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState<boolean>(false);

  const form = useAppForm({
    defaultValues: {
      amount: initialAmount,
      discount: 0,
      discountCode: "",
      voucherId: undefined,
      fee: initialAmount,
      paymentMethod: 0
    } satisfies InvoiceFormValues as InvoiceFormValues,
    validators: {
      onSubmit: invoiceSchema
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  const handleApplyDiscountCode = async () => {
    const code = form.getFieldValue("discountCode");
    if (!code || code.trim() === "") {
      setDiscountCodeError("Vui lòng nhập mã giảm giá");
      setDiscountCodeSuccess("");
      form.setFieldValue("voucherId", undefined);
      return;
    }

    if (!invoiceId) {
      setDiscountCodeError("Không tìm thấy hóa đơn. Vui lòng thử lại.");
      setDiscountCodeSuccess("");
      form.setFieldValue("voucherId", undefined);
      return;
    }

    try {
      setDiscountCodeError("");
      setDiscountCodeSuccess("");
      setIsApplyingVoucher(true);

      // Step 1: Check if voucher exists using getVoucherByCode
      const voucherResponse = await getVoucherByCode(code.trim());

      if (!(voucherResponse?.success || voucherResponse?.code === 200)) {
        setDiscountCodeError(voucherResponse?.message || "Mã giảm giá không tồn tại");
        form.setFieldValue("voucherId", undefined);
        setIsApplyingVoucher(false);
        return;
      }

      const voucherName = voucherResponse.result?.name || "";
      const voucherId = Number(voucherResponse.result?.id) || undefined;

      // Step 2: Apply voucher and get discount amount
      const applyResponse = await applyVoucher(invoiceId, code.trim());

      if (applyResponse?.success || applyResponse?.code === 200) {
        const discountAmount = typeof applyResponse.result === "number" ? applyResponse.result : 0;
        form.setFieldValue("voucherId", voucherId);
        form.setFieldValue("discount", discountAmount);

        // Recalculate fee after discount is applied
        const amount = form.getFieldValue("amount") || 0;
        const fee = Math.max(0, amount - discountAmount);
        form.setFieldValue("fee", fee);

        setDiscountCodeSuccess(`✓ Áp dụng voucher "${voucherName}" thành công`);
        console.log("Voucher applied successfully");
      } else {
        setDiscountCodeError(applyResponse?.message || "Không thể áp dụng mã giảm giá");
        form.setFieldValue("voucherId", undefined);
      }
    } catch (error: any) {
      console.error("Error applying voucher:", error);
      setDiscountCodeError(error?.response?.data?.message || "Mã giảm giá không hợp lệ");
      form.setFieldValue("voucherId", undefined);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const calculateFee = () => {
    const amount = form.getFieldValue("amount") || 0;
    const discount = form.getFieldValue("discount") || 0;
    return Math.max(0, amount - discount);
  };

  useEffect(() => {
    const amount = form.getFieldValue("amount") || 0;
    const discount = form.getFieldValue("discount") || 0;
    const fee = Math.max(0, amount - discount);
    form.setFieldValue("fee", fee);
  }, []);

  useEffect(() => {
    form.setFieldValue("amount", initialAmount);
    form.setFieldValue("fee", initialAmount);
  }, [initialAmount]);

  return (
    <form
      id="invoice-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row gx-3">
        {/* Amount Field */}
        <div className="col-md-6 mb-3">
          <form.AppField name="amount">
            {(field) => (
              <field.Input
                label="Tiền hóa đơn"
                type="number"
                required
                disabled={isReadOnly}
                placeholder="Nhập số tiền"
              />
            )}
          </form.AppField>
        </div>

        {/* Discount Field */}
        <div className="col-md-6 mb-3">
          <form.AppField name="discount">
            {(field) => (
              <field.Input
                label="Tiền giảm giá"
                type="number"
                disabled={isReadOnly}
                placeholder="Nhập tiền giảm giá"
              />
            )}
          </form.AppField>
        </div>

        {/* Fee Field (Read-only) */}
        <div className="col-md-6 mb-3">
          <form.AppField name="fee">
            {(field) => (
              <field.Input label="Tiền phải trả" type="number" disabled={true} placeholder="0" />
            )}
          </form.AppField>
        </div>

        {/* Payment Method Select */}
        <div className="col-md-6 mb-3">
          <form.AppField name="paymentMethod">
            {(field) => (
              <field.Select
                label="Phương thức thanh toán"
                required
                options={paymentMethods}
                placeholder="Chọn"
                disabled={isReadOnly}
                isClearable={false}
              />
            )}
          </form.AppField>
        </div>

        {/* Discount Code Field with Apply Button */}
        <div className="col-md-12 mb-3">
          <label className="form-label">Mã giảm giá</label>
          <form.AppField name="discountCode">
            {(field) => (
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  disabled={isReadOnly}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={isReadOnly || isApplyingVoucher}
                  onClick={handleApplyDiscountCode}
                >
                  {isApplyingVoucher ? (
                    <>
                      <i
                        className="ti ti-loader-2 me-2 d-inline-block"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    "Áp dụng"
                  )}
                </button>
              </div>
            )}
          </form.AppField>
          {discountCodeError && (
            <small className="text-danger d-block mt-1">{discountCodeError}</small>
          )}
          {discountCodeSuccess && (
            <small className="text-success d-block mt-1">{discountCodeSuccess}</small>
          )}
        </div>
      </div>
    </form>
  );
}
