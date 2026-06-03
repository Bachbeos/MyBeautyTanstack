import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import { useEffect } from "react";
import type { OpportunityDto } from "@/lib/types/opportunity";

const opportunitySchema = z.object({
  id: z.number().optional(),
  customerId: z.number().min(1, "Vui lòng chọn khách hàng"),
  name: z.string().min(1, "Tên cơ hội không được để trống"),
  userId: z.number().nullable().optional(),
  description: z.string().optional(),
  expectedValue: z.coerce.number().min(0).optional(),
  expectedCloseDate: z.string().optional(),
  priority: z.coerce.number().min(0).max(5).default(1),
  status: z.number().default(1)
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

type OpportunityFormProps = {
  mode: "add" | "edit" | "detail";
  opportunity?: OpportunityDto;
  userOptions: { label: string; value: number }[];
  customerOptions: { label: string; value: number }[];
  onSubmit: (values: OpportunityFormValues) => Promise<void>;
  onLoadMoreUsers?: () => void;
  onLoadMoreCustomers?: () => void;
  hideUserField?: boolean;
  hideExpectedCloseDateField?: boolean;
  forceStatusActive?: boolean;
};

export function OpportunityForm({
  mode,
  opportunity,
  userOptions,
  customerOptions,
  onSubmit,
  onLoadMoreUsers,
  onLoadMoreCustomers,
  hideUserField = false,
  hideExpectedCloseDateField = false,
  forceStatusActive = false
}: OpportunityFormProps) {
  const isReadOnly = mode === "detail";

  const form = useAppForm({
    defaultValues: {
      id: opportunity?.id,
      customerId: opportunity?.customerId ?? 0,
      name: opportunity?.name ?? "",
      userId: opportunity?.userId ?? null,
      description: opportunity?.description ?? "",
      expectedValue: opportunity?.expectedValue ?? 0,
      expectedCloseDate: opportunity?.expectedCloseDate
        ? opportunity.expectedCloseDate.substring(0, 10)
        : "",
      priority: (opportunity as any)?.priority ?? 1,
      status: forceStatusActive ? 1 : (opportunity?.status ?? 1)
    } as OpportunityFormValues,
    validators: { onSubmit: opportunitySchema as any },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        status: forceStatusActive ? 1 : value.status,
        expectedCloseDate: hideExpectedCloseDateField
          ? undefined
          : value.expectedCloseDate
            ? `${value.expectedCloseDate}T00:00:00`
            : undefined,
        userId: hideUserField ? null : (value.userId ?? null)
      };
      await onSubmit(payload as any);
    }
  });

  useEffect(() => {
    if (opportunity) {
      form.reset({
        id: opportunity.id,
        customerId: opportunity.customerId,
        name: opportunity.name,
        userId: opportunity.userId ?? null,
        description: opportunity.description,
        expectedValue: opportunity.expectedValue,
        expectedCloseDate: opportunity.expectedCloseDate?.substring(0, 10),
        priority: (opportunity as any).priority ?? 1,
        status: forceStatusActive ? 1 : opportunity.status
      } as any);
    }
  }, [opportunity]);

  return (
    <form
      id="opportunity-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row">
        <div className="col-md-12 mb-3">
          <form.AppField name="customerId">
            {(field) => (
              <field.Select
                label="Chọn khách hàng"
                options={customerOptions}
                disabled={isReadOnly}
                onLoadMore={onLoadMoreCustomers}
                required
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-12 mb-3">
          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Tên cơ hội"
                placeholder="Nhập tên cơ hội"
                disabled={isReadOnly}
                required
              />
            )}
          </form.AppField>
        </div>

        {!hideUserField && (
          <div className="col-md-6 mb-3">
            <form.AppField name="userId">
              {(field) => (
                <field.Select
                  label="Sale phụ trách"
                  options={userOptions}
                  disabled={isReadOnly}
                  onLoadMore={onLoadMoreUsers}
                />
              )}
            </form.AppField>
          </div>
        )}

        <div className="col-md-6 mb-3">
          <form.AppField name="expectedValue">
            {(field) => (
              <field.Input
                type="number"
                label="Giá trị dự kiến (VND)"
                placeholder="4,500,000"
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>

        {!hideExpectedCloseDateField && (
          <div className="col-md-6 mb-3">
            <form.AppField name="expectedCloseDate">
              {(field) => <field.Input type="date" label="Ngày dự kiến chốt" disabled={isReadOnly} />}
            </form.AppField>
          </div>
        )}

        <div className="col-md-6 mb-3">
          <form.AppField name="priority">
            {(field) => (
              <field.Select
                label="Mức độ ưu tiên"
                options={[
                  { label: "0 - Rất thấp", value: 0 },
                  { label: "1 - Thấp", value: 1 },
                  { label: "2 - Trung bình", value: 2 },
                  { label: "3 - Cao", value: 3 },
                  { label: "4 - Rất cao", value: 4 },
                  { label: "5 - Khẩn cấp", value: 5 }
                ]}
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>

        {!forceStatusActive && (
          <div className="col-md-6 mb-3">
            <form.AppField name="status">
              {(field) => (
                <field.Radio
                  label="Trạng thái"
                  options={[
                    { label: "Đang hoạt động", value: 1 },
                    { label: "Ngưng hoạt động", value: 0 }
                  ]}
                  disabled={isReadOnly}
                  inline
                />
              )}
            </form.AppField>
          </div>
        )}

        <div className="col-12">
          <form.AppField name="description">
            {(field) => (
              <field.Textarea
                label="Mô tả"
                rows={3}
                placeholder="Mô tả nhu cầu khách hàng"
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>
      </div>
    </form>
  );
}
