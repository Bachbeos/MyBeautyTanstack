import { useEffect } from "react";
import { z } from "zod";
import "./form.scss";

import { type ResourceDto } from "@/lib/types/resource";
import { useAppForm } from "@/components/form/hooks";
import { FormCheckboxGroup } from "@/components/form/form-checkbox-group";

const resourceSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, "Tên tài nguyên không được để trống")
    .max(255, "Tên tài nguyên tối đa 255 ký tự"),
  code: z
    .string()
    .min(1, "Mã tài nguyên không được để trống")
    .max(100, "Mã tài nguyên tối đa 100 ký tự"),
  uri: z.string().min(1, "Đường dẫn không được để trống").max(255, "Đường dẫn tối đa 255 ký tự"),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  actions: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một hành động")
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

const action_options = [
  { label: "Xem", value: "VIEW" },
  { label: "Thêm", value: "CREATE" },
  { label: "Sửa", value: "UPDATE" },
  { label: "Xóa", value: "DELETE" }
];

type ResourceFormProps = {
  mode: "add" | "edit" | "detail";
  resource?: ResourceDto;
  onSubmit: (values: ResourceFormValues) => Promise<void>;
};

export function ResourceForm({ mode, resource, onSubmit }: ResourceFormProps) {
  const isReadOnly = mode === "detail";

  const form = useAppForm({
    defaultValues: {
      id: resource?.id,
      name: resource?.name ?? "",
      code: resource?.code ?? "",
      uri: resource?.uri ?? "",
      description: resource?.description ?? "",
      actions: resource?.actions
        ? typeof resource.actions === "string"
          ? JSON.parse(resource.actions)
          : resource.actions
        : ([] as string[])
    } satisfies ResourceFormValues as ResourceFormValues,
    validators: {
      onSubmit: resourceSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        actions: JSON.stringify(value.actions)
      };

      await onSubmit(payload as any);
    }
  });

  useEffect(() => {
    form.reset({
      id: resource?.id,
      name: resource?.name ?? "",
      code: resource?.code ?? "",
      uri: resource?.uri ?? "",
      description: resource?.description ?? "",
      actions: resource?.actions
        ? typeof resource.actions === "string"
          ? JSON.parse(resource.actions)
          : resource.actions
        : []
    });
  }, [resource]);

  return (
    <form
      id="resource-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row gx-3">
        <div className="col-md-6 mb-3">
          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Tên tài nguyên"
                required
                disabled={isReadOnly}
                placeholder="Nhập tên"
              />
            )}
          </form.AppField>
        </div>
        <div className="col-md-6 mb-3">
          <form.AppField name="code">
            {(field) => (
              <field.Input
                label="Mã tài nguyên"
                required
                disabled={isReadOnly}
                placeholder="Nhập mã"
              />
            )}
          </form.AppField>
        </div>
        <div className="col-12 mb-3">
          <form.AppField name="uri">
            {(field) => (
              <field.Input
                label="Đường dẫn"
                required
                disabled={isReadOnly}
                placeholder="Nhập đường dẫn"
              />
            )}
          </form.AppField>
        </div>
        <div className="col-12 mb-3">
          <form.AppField name="actions">
            {() => (
              <FormCheckboxGroup
                label="Lựa chọn hành động"
                required
                options={action_options}
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>
        <div className="col-12 mb-2">
          <label className="form-label">Mô tả</label>
          <form.AppField name="description">
            {(field) => (
              <textarea
                className="form-control description-textarea"
                rows={3}
                disabled={isReadOnly}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Nhập mô tả"
              />
            )}
          </form.AppField>
        </div>
      </div>
    </form>
  );
}
