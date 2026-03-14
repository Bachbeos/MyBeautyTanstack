import { useEffect } from "react";
import { z } from "zod";

import { type CustomerSourceDto } from "@/lib/types/customer-source";
import { useAppForm } from "@/components/form/hooks";

const customerSourceSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, "Tên nguồn khách hàng không được để trống")
    .max(255, "Tên nguồn khách hàng tối đa 255 ký tự"),
  status: z.number()
});

type CustomerSourceFormValues = z.infer<typeof customerSourceSchema>;

type CustomerSourceFormProps = {
  mode: "add" | "edit" | "detail";
  customerSource?: CustomerSourceDto;
  onSubmit: (values: CustomerSourceFormValues) => Promise<void>;
};

export function CustomerSourceForm({ mode, customerSource, onSubmit }: CustomerSourceFormProps) {
  const isReadOnly = mode === "detail";

  const statusOptions = [
    { label: "Đang hoạt động", value: 1 },
    { label: "Ngưng hoạt động", value: 0 }
  ];

  const form = useAppForm({
    defaultValues: {
      id: customerSource?.id,
      name: customerSource?.name ?? "",
      status: customerSource?.status ?? 1
    } as CustomerSourceFormValues,
    validators: {
      onSubmit: customerSourceSchema
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  useEffect(() => {
    if (customerSource) {
      form.reset({
        id: customerSource.id,
        name: customerSource.name ?? "",
        status: customerSource.status ?? 1
      });
    }
  }, [customerSource]);

  return (
    <form
      id="customer-source-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row gx-3">
        <div className="col-12 mb-2">
          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Tên nguồn khách hàng"
                required
                disabled={isReadOnly}
                placeholder="Nhập tên nguồn khách hàng"
              />
            )}
          </form.AppField>
        </div>

        <div className="col-12 mb-2">
          <form.AppField name="status">
            {(field) => (
              <field.Radio
                label="Trạng thái"
                options={statusOptions}
                disabled={isReadOnly}
                inline={true}
              />
            )}
          </form.AppField>
        </div>
      </div>
    </form>
  );
}
