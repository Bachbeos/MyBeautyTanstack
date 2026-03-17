import { useEffect, useState, type ChangeEvent } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import type { CategoryDto } from "@/lib/types/category";
import { uploadFile } from "@/lib/api/upload-image";
import "./formCategory.scss";

const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Tên danh mục không được để trống"),
  type: z.number(),
  parentId: z.number().optional(),
  position: z.number().optional(),
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
  const [uploading, setUploading] = useState(false);

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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const response = await uploadFile(file);
      if (response?.result) {
        form.setFieldValue("avatar", response.result);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <form
      id="category-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row">
        <div className="col-12 mb-3 ml-12">
          <form.AppField name="avatar">
            {(f) => (
              <div className="profile-upload d-flex align-items-center">
                <div className="profile-upload-img avatar avatar-xxl border border-dashed rounded position-relative flex-shrink-0">
                  {form.getFieldValue("avatar") ? (
                    <img
                      src={form.getFieldValue("avatar") as string}
                      alt="avatar"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8
                      }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <i className="ti ti-photo text-dark fs-16"></i>
                    </div>
                  )}
                  {form.getFieldValue("avatar") && (
                    <button
                      type="button"
                      className="profile-remove btn btn-sm position-absolute"
                      style={{ top: 6, right: 6 }}
                      onClick={() => form.setFieldValue("avatar", "")}
                    >
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>

                <div className="profile-upload-content ms-3">
                  <label
                    className="d-inline-flex align-items-center position-relative btn btn-primary btn-sm mb-2"
                    style={{ cursor: "pointer" }}
                  >
                    <i className="ti ti-file-broken me-1" />
                    {uploading ? "Đang tải..." : "Tải ảnh lên"}
                    <input
                      type="file"
                      accept="image/*"
                      className="position-absolute w-100 h-100 opacity-0 top-0 start-0"
                      onChange={handleFileChange}
                      disabled={uploading || isReadOnly}
                    />
                  </label>
                  <p className="mb-0">JPG, GIF hoặc PNG. Tối đa 5MB</p>
                </div>
              </div>
            )}
          </form.AppField>
        </div>

        <div className="col-12">
          <div className="row">
            <div className="col-12 mb-3">
              <form.AppField name="name">
                {(field) => (
                  <field.Input
                    label="Tên danh mục"
                    required
                    disabled={isReadOnly}
                    placeholder="Nhập tên danh mục"
                  />
                )}
              </form.AppField>
            </div>

            <div className="col-md-6 mb-3">
              <form.AppField name="type">
                {(field) => (
                  <field.Select
                    label="Loại danh mục"
                    required
                    options={typeOptions}
                    disabled={isReadOnly}
                  />
                )}
              </form.AppField>
            </div>

            <div className="col-md-6 mb-3">
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

            <div className="col-12 mb-3">
              <form.AppField name="position">
                {(field) => (
                  <field.Input type="number" label="Thứ tự hiển thị" disabled={isReadOnly} />
                )}
              </form.AppField>
            </div>

            <div className="col-12 mb-3">
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
