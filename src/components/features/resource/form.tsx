import { useEffect } from "react";
import { z } from "zod";
import "./form.scss";

import { type ResourceDto } from "@/lib/types/resource";
import { useAppForm } from "@/components/form/hooks";

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
  actions: z.array(z.string())
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
      await onSubmit(value);
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
        <div className="col-md-6">
          <form.AppField name="name">
            {(field) => (
              <field.Input label="Tên tài nguyên" disabled={isReadOnly} placeholder="Nhập tên" />
            )}
          </form.AppField>
        </div>
        <div className="col-md-6">
          <form.AppField name="code">
            {(field) => (
              <field.Input label="Mã tài nguyên" disabled={isReadOnly} placeholder="Nhập mã" />
            )}
          </form.AppField>
        </div>
        <div className="col-12">
          <form.AppField name="uri">
            {(field) => (
              <field.Input label="Đường dẫn" disabled={isReadOnly} placeholder="Nhập đường dẫn" />
            )}
          </form.AppField>
        </div>
        <div className="col-12 mb-2">
          <label className="form-label">Lựa chọn hành động</label>
          <div className="action-checkboxes d-flex gap-3 flex-wrap mt-2">
            <form.AppField name="actions">
              {(field) => (
                <>
                  {action_options.map((opt) => (
                    <div className="form-check" key={opt.value}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`action-${opt.value}`}
                        disabled={isReadOnly}
                        checked={field.state.value?.includes(opt.value)}
                        onChange={(e) => {
                          const val = field.state.value || [];
                          if (e.target.checked) {
                            field.handleChange([...val, opt.value]);
                          } else {
                            field.handleChange(val.filter((v: string) => v !== opt.value));
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={`action-${opt.value}`}>
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </>
              )}
            </form.AppField>
          </div>
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
      {/* {!isReadOnly && (
        <button type="submit" className="btn btn-primary" disabled={form.state.isSubmitting}>
          {mode === "add" ? "Thêm mới" : "Lưu thay đổi"}
        </button>
      )} */}
    </form>
  );
}
