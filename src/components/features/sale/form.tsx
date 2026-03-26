import { useEffect, useState } from "react";
import { z } from "zod";

import { useAppForm } from "@/components/form/hooks";

const invoiceSchema = z.object({
  amount: z.number().min(0, "Số tiền hóa đơn không hợp lệ"),
  discount: z.number().min(0, "Tiền giảm giá không hợp lệ"),
  discountCode: z.string().max(50, "Mã giảm giá tối đa 50 ký tự").optional(),
  fee: z.number().min(0, "Tiền phải trả không hợp lệ"),
  paymentMethod: z.number().min(1, "Vui lòng chọn phương thức thanh toán")
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

type InvoiceFormProps = {
  mode?: "add" | "edit" | "detail";
  initialAmount?: number;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
};

const paymentMethods = [
  { id: 1, name: "Thanh toán tiền mặt" },
  { id: 2, name: "Chuyển khoản" }
];

export function SaleForm({ mode = "add", initialAmount = 0, onSubmit }: InvoiceFormProps) {
  const isReadOnly = mode === "detail";
  const [discountCodeError, setDiscountCodeError] = useState<string>("");

  const form = useAppForm({
    defaultValues: {
      amount: initialAmount,
      discount: 0,
      discountCode: "",
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
      return;
    }

    try {
      setDiscountCodeError("");
      // TODO: Call API to validate and apply discount code
      // const discountAmount = await applyDiscountCode(code);
      // form.setFieldValue("discount", discountAmount);
      console.log("Applying discount code:", code);
    } catch (error) {
      setDiscountCodeError("Mã giảm giá không hợp lệ");
    }
  };

  const calculateFee = () => {
    const amount = form.getFieldValue("amount") || 0;
    const discount = form.getFieldValue("discount") || 0;
    return Math.max(0, amount - discount);
  };

  useEffect(() => {
    const fee = calculateFee();
    form.setFieldValue("fee", fee);
  }, [form.getFieldValue("amount"), form.getFieldValue("discount")]);

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

        {/* Discount Code Field with Apply Button */}
        <div className="col-md-6 mb-3">
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
                  disabled={isReadOnly}
                  onClick={handleApplyDiscountCode}
                >
                  Áp dụng
                </button>
              </div>
            )}
          </form.AppField>
          {discountCodeError && (
            <small className="text-danger d-block mt-1">{discountCodeError}</small>
          )}
        </div>

        {/* Payment Method Select */}
        <div className="col-md-6 mb-3">
          <form.AppField name="paymentMethod">
            {(field) => (
              <div>
                <label className="form-label">
                  Phương thức thanh toán <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  required
                  disabled={isReadOnly}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                >
                  <option value={0}>-- Chọn phương thức thanh toán --</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.AppField>
        </div>

        {/* Create Invoice Button */}
        <div className="col-12 mt-3">
          <button type="submit" className="btn btn-primary" disabled={isReadOnly}>
            Tạo hóa đơn
          </button>
        </div>
      </div>
    </form>
  );
}
