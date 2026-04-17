import { useEffect } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import type { UserDto } from "@/lib/types/user";

const userSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên người dùng không được để trống"),
  phone: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .regex(/^\+?\d+$/, "Chỉ được chứa số"),
  email: z.email("Email không hợp lệ").or(z.literal("")),
  active: z.number(),
  plainPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").or(z.literal("")),
  branchId: z.number().optional(),
  roleId: z.number().optional()
});

type UserFormValues = z.infer<typeof userSchema>;

type UserFormProps = {
  mode: "add" | "edit" | "detail";
  user?: UserDto;
  branchOptions: { label: string; value: number }[];
  roleOptions: { label: string; value: number }[];
  onSubmit: (values: UserFormValues) => Promise<void>;
  onLoadMoreBranches?: () => void;
};

export function UserForm({
  mode,
  user,
  branchOptions,
  roleOptions,
  onSubmit,
  onLoadMoreBranches
}: UserFormProps) {
  const isReadOnly = mode === "detail";

  const statusOptions = [
    { label: "Đang hoạt động", value: 1 },
    { label: "Ngưng hoạt động", value: 0 }
  ];

  const form = useAppForm({
    defaultValues: {
      id: user?.id,
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      email: user?.email ?? "",
      branchId: user?.branchId ?? undefined,
      plainPassword: "",
      active: user?.active ?? 1,
      roleId: user?.roleId ?? undefined
    } as UserFormValues,
    validators: { onSubmit: userSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        id: user.id,
        name: user.name ?? "",
        phone: String(user.phone ?? ""),
        email: user.email ?? "",
        branchId: user.branchId != null ? Number(user.branchId) : undefined,
        plainPassword: "",
        active: user.active ?? 1,
        roleId: user.roleId ?? undefined
      });
    }
  }, [user]);

  return (
    <form
      id="user-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row">
        <div className="mb-2 col-md-6">
          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Tên người dùng"
                required
                disabled={isReadOnly}
                placeholder="Nhập tên người dùng"
              />
            )}
          </form.AppField>
        </div>

        <div className="mb-2 col-md-6">
          <form.AppField name="phone">
            {(field) => (
              <field.Input
                label="Số điện thoại"
                required
                disabled={isReadOnly}
                placeholder="Nhập số điện thoại"
              />
            )}
          </form.AppField>
        </div>

        <div className="mb-2 col-md-6">
          <form.AppField name="email">
            {(field) => (
              <field.Input label="Email" disabled={isReadOnly} placeholder="Nhập email liên hệ" />
            )}
          </form.AppField>
        </div>

        <div className="mb-2 col-md-6">
          <form.AppField name="branchId">
            {(field) => (
              <field.Select
                label="Chi nhánh"
                options={branchOptions}
                disabled={isReadOnly}
                placeholder="Chọn chi nhánh"
                onLoadMore={onLoadMoreBranches}
              />
            )}
          </form.AppField>
        </div>

        <div className="mb-2 col-md-6">
          <form.AppField name="roleId">
            {(field) => (
              <field.Select
                label="Chức vụ"
                options={roleOptions}
                disabled={isReadOnly}
                placeholder="Chọn chức vụ"
              />
            )}
          </form.AppField>
        </div>

        <div className="mb-2 col-md-6">
          <form.AppField name="plainPassword">
            {(field) => (
              <field.Input
                label="Mật khẩu"
                type="text"
                disabled={isReadOnly}
                placeholder={mode === "edit" ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
              />
            )}
          </form.AppField>
        </div>

        <div className="mb-2 col-md-6">
          <form.AppField name="active">
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
