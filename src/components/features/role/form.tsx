import { useEffect } from "react";
import { z } from "zod";

import { type RoleDto } from "@/lib/types/role";
import { useAppForm } from "@/components/form/hooks";

const roleSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, "Tên chức vụ không được để trống")
    .max(255, "Tên chức vụ tối đa 255 ký tự"),
  isDefault: z.number().optional(),
  isOperator: z.number().optional()
});

type RoleFormValues = z.infer<typeof roleSchema>;

type RoleFormProps = {
  mode: "add" | "edit" | "detail" | "permission";
  role?: RoleDto;
  onSubmit: (values: RoleFormValues) => Promise<void>;
};

export function RoleForm({ mode, role, onSubmit }: RoleFormProps) {
  const isReadOnly = mode === "detail";

  const form = useAppForm({
    defaultValues: {
      id: role?.id,
      name: role?.name ?? "",
      isDefault: role?.isDefault ?? 0,
      isOperator: role?.isOperator ?? 0
    } satisfies RoleFormValues as RoleFormValues,
    validators: {
      onSubmit: roleSchema
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  useEffect(() => {
    form.reset({
      id: role?.id,
      name: role?.name ?? "",
      isDefault: role?.isDefault ?? 0,
      isOperator: role?.isOperator ?? 0
    });
  }, [role]);

  return (
    <form
      id="role-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="name">
        {(field) => (
          <field.Input label="Tên chức vụ" disabled={isReadOnly} placeholder="Nhập tên" />
        )}
      </form.AppField>
      <form.AppField name="isDefault">
        {(field) => <field.Checkbox label="Quyền mặc định" disabled={isReadOnly} />}
      </form.AppField>
      <form.AppField name="isOperator">
        {(field) => <field.Checkbox label="Quyền điều hành" disabled={isReadOnly} />}
      </form.AppField>
    </form>
  );
}
