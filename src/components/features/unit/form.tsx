import { useEffect } from "react";
import { z } from "zod";

import { type UnitDto } from "@/lib/types/unit";
import { useAppForm } from "@/components/form/hooks";

const unitSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên đơn vị không được để trống").max(255, "Tên đơn vị tối đa 255 ký tự"),
  status: z.number(),
  position: z.number()
});

type UnitFormValues = z.infer<typeof unitSchema>;

type UnitFormProps = {
  mode: "add" | "edit" | "detail";
  unit?: UnitDto;
  onSubmit: (values: UnitFormValues) => Promise<void>;
};

export function UnitForm({ mode, unit, onSubmit }: UnitFormProps) {
  const isReadOnly = mode === "detail";

  const statusOptions = [
    { label: "Đang hoạt động", value: 1 },
    { label: "Ngưng hoạt động", value: 0 }
  ];

  const form = useAppForm({
    defaultValues: {
      id: unit?.id,
      name: unit?.name ?? "",
      status: unit?.status ?? 1,
      position: unit?.position ?? 1
    } as UnitFormValues,
    validators: {
      onSubmit: unitSchema
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  useEffect(() => {
    if (unit) {
      form.reset({
        id: unit.id,
        name: unit.name ?? "",
        status: unit.status ?? 1,
        position: unit.position ?? 1
      });
    }
  }, [unit]);

  return (
    <form
      id="unit-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row gx-3">
        <div className="col-md-6 mb-2">
          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Tên đơn vị *"
                disabled={isReadOnly}
                placeholder="Nhập tên đơn vị"
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-2">
          <form.AppField name="position">
            {(field) => (
              <field.Input
                type="number"
                label="Thứ tự hiển thị"
                disabled={isReadOnly}
                placeholder="1"
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
