import { useEffect } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import type { CategoryDto } from "@/lib/types/category";

const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên danh mục không được để trống"),
  type: z.number(),
  parentId: z.number(),
  position: z.number(),
  active: z.number(),
  featured: z.string().optional(),
  avatar: z.string().optional()
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoryFormProps = {
  mode: "add" | "edit" | "delete" | "detail";
  category?: CategoryDto;
  parentOptions: { label: string; value: number }[];
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onLoadMoreParents?: () => void;
};

export function CategoryForm({
  mode,
  category,
  parentOptions,
  onSubmit,
  onLoadMoreParents
}: CategoryFormProps) {
  const isReadOnly = mode === "detail";

  const typeOptions = [
    { label: "Dịch vụ", value: 1 },
    { label: "Sản phẩm", value: 2 }
  ];

  const statusOptions = [
    { label: "Đang hoạt động", value: 1 },
    { label: "Ngưng hoạt động", value: 0 }
  ];

  const form = useAppForm({
    defaultValues: {
      id: category?.id,
      name: category?.name ?? "",
      type: category?.type ?? 1,
      parentId: category?.parentId ?? 0,
      position: category?.position ?? 1,
      active: category?.active ?? 1,
      featured: category?.featured ?? "",
      avatar: category?.avatar ?? ""
    } as CategoryFormValues,
    validators: { onSubmit: categorySchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  useEffect(() => {
    if (category) {
      form.reset({
        id: category.id,
        name: category.name ?? "",
        type: category.type ?? 1,
        parentId: category.parentId ?? 0,
        position: category.position ?? 1,
        active: category.active ?? 1,
        featured: category.featured ?? "",
        avatar: category.avatar ?? ""
      });
    }
  }, [category]);

  return (
    <form
      id="category-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row">
        <div className="col-lg-4 text-center">
          <label className="form-label fw-bold">Ảnh đại diện</label>
          <div
            className="border rounded d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden mx-auto"
            style={{
              width: "100%",
              aspectRatio: "1/1",
              cursor: isReadOnly ? "default" : "pointer"
            }}
          >
            {form.getFieldValue("avatar") ? (
              <img src={form.getFieldValue("avatar")} className="w-100 h-100 object-fit-cover" />
            ) : (
              <div className="text-muted">
                <i className="ti ti-photo fs-1"></i>
                <p className="small mb-0">Tải ảnh lên</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          <div className="row">
            <div className="col-12">
              <form.AppField name="name">
                {(field) => (
                  <field.Input
                    label="Tên danh mục"
                    disabled={isReadOnly}
                    placeholder="Nhập tên danh mục"
                  />
                )}
              </form.AppField>
            </div>

            <div className="col-md-6">
              <form.AppField name="type">
                {(field) => (
                  <field.Select label="Loại danh mục" options={typeOptions} disabled={isReadOnly} />
                )}
              </form.AppField>
            </div>

            <div className="col-md-6">
              <form.AppField name="parentId">
                {(field) => (
                  <field.Select
                    label="Danh mục cha"
                    options={parentOptions}
                    disabled={isReadOnly}
                    onLoadMore={onLoadMoreParents}
                  />
                )}
              </form.AppField>
            </div>

            <div className="col-md-6">
              <form.AppField name="position">
                {(field) => (
                  <field.Input type="number" label="Thứ tự hiển thị" disabled={isReadOnly} />
                )}
              </form.AppField>
            </div>

            <div className="col-md-6">
              <form.AppField name="active">
                {(field) => (
                  <field.Radio label="Trạng thái" options={statusOptions} disabled={isReadOnly} />
                )}
              </form.AppField>
            </div>

            <div className="col-12">
              <form.AppField name="featured">
                {(field) => (
                  <field.Textarea
                    className="form-control"
                    label="Mô tả"
                    disabled={isReadOnly}
                    placeholder="Nhập nội dung mô tả"
                    rows={4}
                  />
                )}
              </form.AppField>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
