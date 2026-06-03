import { useEffect, useState } from "react";
import { z } from "zod";

import { useAppForm } from "@/components/form/hooks";
import { getVoucherByCode, applyVoucher } from "@/lib/api/voucher";

const invoiceSchema = z.object({
  amount: z.string().min(1, "Số tiền hóa đơn không hợp lệ"),
  discount: z.string().optional(),
  discountCode: z.string().max(50, "Mã giảm giá tối đa 50 ký tự").optional(),
  voucherId: z.coerce.number().optional(),
  fee: z.string().min(1, "Tiền phải trả không hợp lệ"),
  paymentMethod: z.coerce.number().min(1, "Vui lòng chọn phương thức thanh toán")
});

type InvoiceFormValues = {
  amount: string;
  discount: string;
  discountCode?: string;
  voucherId?: number;
  fee: string;
  paymentMethod: number;
};
type InvoiceSubmitValues = {
  amount: number;
  discount: number;
  discountCode?: string;
  voucherId?: number;
  fee: number;
  paymentMethod: number;
};

const formatMoney = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "";
  return String(value)
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseMoney = (value: string | number | undefined): number => {
  if (value === undefined || value === null || value === "") return 0;
  return Number(String(value).replace(/\./g, ""));
};

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
  const [voucherId, setVoucherId] = useState<number | undefined>(undefined);

  const form = useAppForm({
    defaultValues: {
      amount: formatMoney(initialAmount),
      discount: formatMoney(0),
      discountCode: "",
      fee: formatMoney(initialAmount),
      paymentMethod: 0
    } satisfies InvoiceFormValues,
    validators: {
      onSubmit: invoiceSchema as any
    },
    onSubmit: async ({ value }) => {
      const parsedValue = invoiceSchema.parse(value);
      const payload: InvoiceSubmitValues = {
        amount: parseMoney(parsedValue.amount),
        discount: parseMoney(parsedValue.discount),
        discountCode: parsedValue.discountCode,
        voucherId,
        fee: parseMoney(parsedValue.fee),
        paymentMethod: parsedValue.paymentMethod
      };

      await onSubmit(payload as any);
    }
  });

  const handleApplyDiscountCode = async () => {
    const code = form.getFieldValue("discountCode");
    if (!code || code.trim() === "") {
      setDiscountCodeError("Vui lòng nhập mã giảm giá");
      setDiscountCodeSuccess("");
      setVoucherId(undefined);
      return;
    }

    if (!invoiceId) {
      setDiscountCodeError("Không tìm thấy hóa đơn. Vui lòng thử lại.");
      setDiscountCodeSuccess("");
      setVoucherId(undefined);
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
        setVoucherId(undefined);
        setIsApplyingVoucher(false);
        return;
      }

      const voucherName = voucherResponse.result?.name || "";
      const voucherId = Number(voucherResponse.result?.id) || undefined;

      // Step 2: Apply voucher and get discount amount
      const applyResponse = await applyVoucher(invoiceId, code.trim());

      if (applyResponse?.success || applyResponse?.code === 200) {
        const discountAmount = typeof applyResponse.result === "number" ? applyResponse.result : 0;
        setVoucherId(voucherId);
        form.setFieldValue("discount", formatMoney(discountAmount));

        // Recalculate fee after discount is applied
        const amount = parseMoney(form.getFieldValue("amount"));
        const fee = Math.max(0, amount - discountAmount);
        form.setFieldValue("fee", formatMoney(fee));

        setDiscountCodeSuccess(`✓ Áp dụng voucher "${voucherName}" thành công`);
        console.log("Voucher applied successfully");
      } else {
        setDiscountCodeError(applyResponse?.message || "Không thể áp dụng mã giảm giá");
        setVoucherId(undefined);
      }
    } catch (error: any) {
      console.error("Error applying voucher:", error);
      setDiscountCodeError(error?.response?.data?.message || "Mã giảm giá không hợp lệ");
      setVoucherId(undefined);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const calculateFee = () => {
    const amount = parseMoney(form.getFieldValue("amount"));
    const discount = parseMoney(form.getFieldValue("discount"));
    return Math.max(0, amount - discount);
  };

  useEffect(() => {
    const amount = parseMoney(form.getFieldValue("amount"));
    const discount = parseMoney(form.getFieldValue("discount"));
    const fee = Math.max(0, amount - discount);
    form.setFieldValue("fee", formatMoney(fee));
  }, []);

  useEffect(() => {
    form.setFieldValue("amount", formatMoney(initialAmount));
    form.setFieldValue("fee", formatMoney(initialAmount));
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
                type="text"
                inputMode="numeric"
                required
                disabled={isReadOnly}
                placeholder="Nhập số tiền"
                onChange={(e) => field.handleChange(formatMoney(e.target.value))}
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
                type="text"
                inputMode="numeric"
                disabled={isReadOnly}
                placeholder="Nhập tiền giảm giá"
                onChange={(e) => field.handleChange(formatMoney(e.target.value))}
              />
            )}
          </form.AppField>
        </div>

        {/* Fee Field (Read-only) */}
        <div className="col-md-6 mb-3">
          <form.AppField name="fee">
            {(field) => (
              <field.Input
                label="Tiền phải trả"
                type="text"
                inputMode="numeric"
                disabled={true}
                placeholder="0"
              />
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
