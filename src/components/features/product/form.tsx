import { useEffect } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import type { ProductDto } from "@/lib/types/product";

const formatMoney = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "";
  return String(value)
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseMoney = (value: string | undefined): number => {
  if (!value) return 0;
  return Number(String(value).replace(/\./g, ""));
};

const productSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, "Mã sản phẩm không được để trống"),
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  categoryId: z.number().optional(),
  unitId: z.number().optional(),
  price: z.string().min(1, "Giá bán không được để trống"),
  discount: z.number().default(0),
  discountUnit: z.number().default(1),
  expiredPeriod: z.number().default(0),
  position: z.number().default(1),
  status: z.number().default(1),
  content: z.string().optional(),
  avatar: z.string().optional()
});

type ProductFormValues = z.infer<typeof productSchema>;
type ProductSubmitValues = Omit<ProductFormValues, "price"> & { price: number };

type ProductFormProps = {
  mode: "add" | "edit" | "detail";
  product?: ProductDto;
  categoryOptions: { label: string; value: number }[];
  unitOptions: { label: string; value: number }[];
  onSubmit: (values: ProductSubmitValues) => Promise<void>;
  onLoadMoreCategories?: () => void;
  onLoadMoreUnits?: () => void;
};

export function ProductForm({
  mode,
  product,
  categoryOptions,
  unitOptions,
  onSubmit,
  onLoadMoreCategories,
  onLoadMoreUnits
}: ProductFormProps) {
  const isReadOnly = mode === "detail";

  const form = useAppForm({
    defaultValues: {
      id: product?.id ? Number(product.id) : undefined,
      code: product?.code ?? "",
      name: product?.name ?? "",
      categoryId: product?.categoryId,
      unitId: product?.unitId,
      price: formatMoney(product?.price ?? 0),
      discount: product?.discount ?? 0,
      discountUnit: product?.discountUnit ?? 1,
      expiredPeriod: product?.expiredPeriod ?? 0,
      position: product?.position ?? 1,
      status: product?.status ?? 1,
      content: product?.content ?? "",
      avatar: product?.avatar ?? ""
    },
    validators: { onSubmit: productSchema as any },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        price: parseMoney(value.price)
      });
    }
  });

  useEffect(() => {
    if (product) {
      form.reset({
        id: Number(product.id),
        code: product.code ?? "",
        name: product.name,
        categoryId: product.categoryId,
        unitId: product.unitId,
        price: formatMoney(product.price),
        discount: product.discount ?? 0,
        discountUnit: product.discountUnit ?? 1,
        expiredPeriod: product.expiredPeriod ?? 0,
        position: product.position ?? 1,
        status: product.status ?? 1,
        content: product.content ?? "",
        avatar: product.avatar ?? ""
      });
    }
  }, [product, form]);

  return (
    <form
      id="product-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row">
        <div className="col-lg-3 text-center mb-3">
          <label className="form-label fw-bold">Ảnh đại diện</label>
          <div
            className="border rounded d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden mx-auto"
            style={{
              width: "100%",
              maxWidth: "200px",
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

        <div className="col-lg-9">
          <div className="row">
            <div className="mb-3 col-md-4">
              <form.AppField name="code">
                {(field) => (
                  <field.Input label="Mã sản phẩm *" disabled={isReadOnly} placeholder="Nhập mã" />
                )}
              </form.AppField>
            </div>
            <div className="mb-3 col-md-8">
              <form.AppField name="name">
                {(field) => (
                  <field.Input
                    label="Tên sản phẩm *"
                    disabled={isReadOnly}
                    placeholder="Nhập tên"
                  />
                )}
              </form.AppField>
            </div>

            <div className="mb-3 col-md-4">
              <form.AppField name="categoryId">
                {(field) => (
                  <field.Select
                    label="Danh mục"
                    options={categoryOptions}
                    disabled={isReadOnly}
                    onLoadMore={onLoadMoreCategories}
                  />
                )}
              </form.AppField>
            </div>
            <div className="mb-3 col-md-4">
              <form.AppField name="unitId">
                {(field) => (
                  <field.Select
                    label="Đơn vị tính"
                    options={unitOptions}
                    disabled={isReadOnly}
                    onLoadMore={onLoadMoreUnits}
                  />
                )}
              </form.AppField>
            </div>

            <div className="mb-3 col-md-4">
              <form.AppField name="price">
                {(field) => (
                  <field.Input
                    label="Giá bán (VNĐ)"
                    placeholder="0"
                    disabled={isReadOnly}
                    onChange={(e) => {
                      const formatted = formatMoney(e.target.value);
                      field.handleChange(formatted);
                    }}
                  />
                )}
              </form.AppField>
            </div>

            <div className="mb-3 col-md-4">
              <label className="form-label">Giảm giá</label>
              <div className="input-group">
                <form.AppField name="discount">
                  {(field) => (
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      disabled={isReadOnly}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.AppField>

                <form.AppField name="discountUnit">
                  {(field) => (
                    <select
                      className="form-select"
                      style={{ maxWidth: "70px" }}
                      disabled={isReadOnly}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    >
                      <option value={1}>%</option>
                      <option value={2}>$</option>
                    </select>
                  )}
                </form.AppField>
              </div>

              <form.AppField name="discount">
                {(field) =>
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <div className="invalid-feedback d-block">
                      {String(field.state.meta.errors[0] ?? "")}
                    </div>
                  )
                }
              </form.AppField>
            </div>
            {/* <div className="mb-3 col-md-4">
              <label className="form-label">Giảm giá</label>
              <div className="input-group">
                <form.AppField name="discount">
                  {(field) => (
                    <field.Input
                      label=""
                      wrapperClassName="flex-grow-1 mb-0"
                      type="number"
                      disabled={isReadOnly}
                    />
                  )}
                </form.AppField>
                <form.AppField name="discountUnit">
                  {(field) => (
                    <select
                      className="form-select"
                      style={{ maxWidth: "70px" }}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      disabled={isReadOnly}
                    >
                      <option value={1}>%</option>
                      <option value={2}>$</option>
                    </select>
                  )}
                </form.AppField>
              </div>
            </div> */}

            <div className="mb-3 col-md-4">
              <form.AppField name="expiredPeriod">
                {(field) => (
                  <field.Input type="number" label="Hạn dùng (Tháng)" disabled={isReadOnly} />
                )}
              </form.AppField>
            </div>

            <div className="mb-3 col-md-4">
              <form.AppField name="position">
                {(field) => <field.Input type="number" label="Thứ tự" disabled={isReadOnly} />}
              </form.AppField>
            </div>

            <div className="mb-3 col-12">
              <form.AppField name="status">
                {(field) => (
                  <field.Radio
                    label="Trạng thái"
                    options={[
                      { label: "Đang hoạt động", value: 1 },
                      { label: "Ngưng hoạt dộng", value: 0 }
                    ]}
                    disabled={isReadOnly}
                  />
                )}
              </form.AppField>
            </div>

            <div className="col-12">
              <form.AppField name="content">
                {(field) => (
                  <field.Textarea
                    label="Mô tả chi tiết"
                    placeholder="Nhập mô tả sản phẩm..."
                    rows={4}
                    disabled={isReadOnly}
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
