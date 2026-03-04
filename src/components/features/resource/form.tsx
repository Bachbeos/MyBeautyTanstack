import { useEffect } from "react";
import { z } from "zod";

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
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional()
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

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
      description: resource?.description ?? ""
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
      description: resource?.description ?? ""
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
      <form.AppField name="name">
        {(field) => <field.Input label="Tên tài nguyên" disabled={isReadOnly} />}
      </form.AppField>

      <form.AppField name="code">
        {(field) => <field.Input label="Mã tài nguyên" disabled={isReadOnly} />}
      </form.AppField>

      <form.AppField name="description">
        {(field) => <field.Textarea label="Mô tả" rows={4} disabled={isReadOnly} />}
      </form.AppField>

      {/* {!isReadOnly && (
        <button type="submit" className="btn btn-primary" disabled={form.state.isSubmitting}>
          {mode === "add" ? "Thêm mới" : "Lưu thay đổi"}
        </button>
      )} */}
    </form>
  );
}
