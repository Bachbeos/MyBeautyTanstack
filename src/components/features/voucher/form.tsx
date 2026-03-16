import { useEffect } from "react";
import { z } from "zod";

import { type VoucherDto } from "@/lib/types/voucher";
import { useAppForm } from "@/components/form/hooks";

const formatMoney = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "";
  return String(value)
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseMoney = (value: string | undefined): number => {
  if (!value) return 0;
  return Number(String(value).replace(/\./g, ""));
};

const voucherSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, "Vui lòng nhập mã voucher"),
  name: z.string().min(1, "Vui lòng nhập tên chương trình"),
  description: z.string().optional(),
  discountType: z.coerce.number(),
  discountValue: z.coerce.string(),
  maxDiscount: z.coerce.string().optional(),
  minInvoiceAmount: z.coerce.string(),
  totalQuantity: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
  perUserLimit: z.coerce.number().min(1),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  status: z.coerce.number(),
  branchId: z.coerce.number().optional(),
  usageQuantity: z.coerce.number().optional()
});

type VoucherFormValues = z.input<typeof voucherSchema>;
type VoucherSchemaOutput = z.output<typeof voucherSchema>;
type VoucherSubmitValues = Omit<
  VoucherSchemaOutput,
  "discountValue" | "maxDiscount" | "minInvoiceAmount"
> & {
  discountValue: number;
  maxDiscount: number;
  minInvoiceAmount: number;
};

type VoucherFormProps = {
  mode: "add" | "edit" | "detail";
  voucher?: VoucherDto;
  onSubmit: (values: VoucherSubmitValues) => void;
  branchOptions: { label: string; value: number }[];
  onLoadMoreBranches: () => void;
};

export function VoucherForm({
  mode,
  voucher,
  onSubmit,
  branchOptions,
  onLoadMoreBranches
}: VoucherFormProps) {
  const isReadOnly = mode === "detail";

  const getTimeError = (start: string, end: string) => {
    if (start && end && new Date(end) < new Date(start)) {
      return "Ngày kết thúc không được trước ngày bắt đầu";
    }
    return "";
  };

  const form = useAppForm({
    defaultValues: {
      id: voucher?.id,
      code: voucher?.code || "",
      name: voucher?.name || "",
      description: voucher?.description || "",
      discountType: voucher?.discountType ?? 1,
      discountValue: voucher?.discountValue ? formatMoney(voucher.discountValue) : "",
      maxDiscount: voucher?.maxDiscount ? formatMoney(voucher.maxDiscount) : "",
      minInvoiceAmount: voucher?.minInvoiceAmount ? formatMoney(voucher.minInvoiceAmount) : "",
      totalQuantity: voucher?.totalQuantity ?? 100,
      perUserLimit: voucher?.perUserLimit ?? 1,
      startDate: voucher?.startDate ? voucher.startDate.slice(0, 16) : "",
      endDate: voucher?.endDate ? voucher.endDate.slice(0, 16) : "",
      status: voucher?.status ?? 1,
      branchId: voucher?.branchId || 0,
      usageQuantity: voucher?.usageQuantity || 0
    } as VoucherFormValues,
    validators: { onSubmit: voucherSchema },
    onSubmit: async ({ value }) => {
      const parsedValue = voucherSchema.parse(value);
      const timeError = getTimeError(parsedValue.startDate, parsedValue.endDate);
      if (timeError) return;

      const { discountValue, maxDiscount, minInvoiceAmount, ...rest } = parsedValue;
      const payload: VoucherSubmitValues = {
        ...rest,
        discountValue:
          parsedValue.discountType === 1 ? parseMoney(discountValue) : Number(discountValue),
        maxDiscount: parsedValue.discountType === 2 ? parseMoney(String(maxDiscount ?? "0")) : 0,
        minInvoiceAmount: parseMoney(minInvoiceAmount),
        branchId: rest.branchId && rest.branchId !== 0 ? rest.branchId : undefined
      };

      await onSubmit(payload);
    }
  });

  useEffect(() => {
    if (voucher) {
      form.reset({
        ...voucher,
        discountValue: voucher.discountValue ? formatMoney(voucher.discountValue) : "",
        maxDiscount: voucher.maxDiscount ? formatMoney(voucher.maxDiscount) : "",
        minInvoiceAmount: voucher.minInvoiceAmount ? formatMoney(voucher.minInvoiceAmount) : "",
        startDate: voucher.startDate ? voucher.startDate.slice(0, 16) : "",
        endDate: voucher.endDate ? voucher.endDate.slice(0, 16) : ""
      } as VoucherFormValues);
    }
  }, [voucher]);

  return (
    <form
      id="voucher-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row">
        <div className="col-md-6 mb-3">
          <form.AppField name="code">
            {(field) => (
              <field.Input
                label="Mã giảm giá"
                disabled={isReadOnly}
                placeholder="Nhập mã giảm giá"
              />
            )}
          </form.AppField>
        </div>
        <div className="col-md-6 mb-3">
          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Tên chương trình"
                disabled={isReadOnly}
                placeholder="Nhập tên chương trình"
              />
            )}
          </form.AppField>
        </div>

        <div className="col-12 mb-3">
          <form.AppField name="discountType">
            {(field) => (
              <field.Select
                label="Loại giảm giá"
                disabled={isReadOnly}
                options={[
                  { label: "Giảm theo số tiền (VNĐ)", value: 1 },
                  { label: "Giảm theo phần trăm (%)", value: 2 }
                ]}
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="discountType">
          {(discountTypeField) => {
            const discountType = Number(discountTypeField.state.value ?? 1);

            return (
              <>
                <div className={discountType === 2 ? "col-md-6 mb-3" : "col-12 mb-3"}>
                  <form.AppField name="discountValue">
                    {(field) => (
                      <field.Input
                        label={discountType === 1 ? "Số tiền giảm (VNĐ)" : "Phần trăm giảm (%)"}
                        type={discountType === 1 ? "text" : "number"}
                        disabled={isReadOnly}
                        onChange={
                          discountType === 1
                            ? (e) => {
                                const formatted = formatMoney(e.target.value);
                                field.handleChange(formatted);
                              }
                            : undefined
                        }
                      />
                    )}
                  </form.AppField>
                </div>
                {discountType === 2 && (
                  <div className="col-md-6 mb-3">
                    <form.AppField name="maxDiscount">
                      {(field) => (
                        <field.Input
                          label="Giảm tối đa (VNĐ)"
                          type="text"
                          disabled={isReadOnly}
                          onChange={(e) => {
                            const formatted = formatMoney(e.target.value);
                            field.handleChange(formatted);
                          }}
                        />
                      )}
                    </form.AppField>
                  </div>
                )}
              </>
            );
          }}
        </form.AppField>

        <div className="col-md-6 mb-3">
          <form.AppField name="minInvoiceAmount">
            {(field) => (
              <field.Input
                label="Giá trị đơn hàng tối thiểu"
                type="text"
                disabled={isReadOnly}
                onChange={(e) => {
                  const formatted = formatMoney(e.target.value);
                  field.handleChange(formatted);
                }}
              />
            )}
          </form.AppField>
        </div>
        <div className="col-md-6 mb-3">
          <form.AppField name="branchId">
            {(field) => (
              <field.Select
                label="Chi nhánh áp dụng"
                options={branchOptions}
                disabled={isReadOnly}
                onLoadMore={onLoadMoreBranches}
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="totalQuantity">
            {(field) => (
              <field.Input label="Tổng số lượt sử dụng" type="number" disabled={isReadOnly} />
            )}
          </form.AppField>
        </div>
        <div className="col-md-6 mb-3">
          <form.AppField name="perUserLimit">
            {(field) => (
              <field.Input label="Số lần dùng tối đa/khách" type="number" disabled={isReadOnly} />
            )}
          </form.AppField>
        </div>

        <form.AppField name="startDate">
          {(startDateField) => {
            const startDate = startDateField.state.value ?? "";

            return (
              <>
                <div className="col-md-6 mb-3">
                  <startDateField.Input
                    label="Ngày bắt đầu"
                    type="datetime-local"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <form.AppField name="endDate">
                    {(endDateField) => {
                      const endDate = endDateField.state.value ?? "";
                      const timeError = getTimeError(startDate, endDate);

                      return (
                        <>
                          <endDateField.Input
                            label="Ngày kết thúc"
                            type="datetime-local"
                            disabled={isReadOnly}
                          />
                          {timeError && <div className="text-danger small mt-1">{timeError}</div>}
                        </>
                      );
                    }}
                  </form.AppField>
                </div>
              </>
            );
          }}
        </form.AppField>

        <div className="col-12 mb-3">
          <form.AppField name="status">
            {(field) => (
              <field.Radio
                label="Trạng thái"
                disabled={isReadOnly}
                options={[
                  { label: "Đang hoạt động", value: 1 },
                  { label: "Ngưng hoạt động", value: 0 }
                ]}
              />
            )}
          </form.AppField>
        </div>

        <div className="col-12 mb-3">
          <form.AppField name="description">
            {(field) => <field.Textarea label="Mô tả chi tiết" rows={3} disabled={isReadOnly} />}
          </form.AppField>
        </div>
      </div>
    </form>
  );
}
