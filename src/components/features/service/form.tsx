import { useEffect, useState, type ChangeEvent } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import { type ServiceDto } from "@/lib/types/service";
import "./formService.scss";
import { uploadFile } from "@/lib/api/upload-image";

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

const serviceSchema = z.object({
  id: z.number().optional(),
  code: z.string().optional(),
  name: z.string().min(1, "Vui lòng nhập tên dịch vụ"),
  categoryId: z.number().min(1, "Vui lòng chọn danh mục"),
  price: z.coerce.string().min(0, "Giá bán không được âm"),
  cost: z.coerce.string().min(0, "Giá vốn không được âm"),
  discount: z.coerce.number().min(0).max(100).optional(),
  totalTime: z.coerce.number().min(0).optional(),
  treatmentNum: z.coerce.number().min(1).optional(),
  avatar: z.string().optional(),
  status: z.coerce.number().default(1),
  type: z.coerce.number().default(1),
  featured: z.coerce.number().optional(),
  intro: z.string().optional(),
  comboItems: z
    .array(
      z.object({
        name: z.string().optional(),
        price: z.coerce.number().min(0),
        discount: z.coerce.number().min(0),
        treatmentNum: z.coerce.number().min(1)
      })
    )
    .optional()
});

type ServiceFormProps = {
  mode: "add" | "edit" | "detail";
  service?: ServiceDto;
  onSubmit: (values: ServiceSubmitValues) => Promise<void> | void;
  categoryOptions: { label: string; value: number }[];
  onLoadMoreCategories?: () => void;
};

type ServiceFormValues = z.input<typeof serviceSchema>;
type ServiceSchemaOutput = z.output<typeof serviceSchema>;
type ServiceSubmitValues = ServiceSchemaOutput & {
  isCombo: number;
  priceVariation: string;
};

function parseComboItems(value: unknown): ServiceFormValues["comboItems"] {
  if (!value) return [];

  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (typeof value[0] !== "string") return value as ServiceFormValues["comboItems"];

    const raw = value[0];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function ServiceForm({
  mode,
  service,
  onSubmit,
  categoryOptions,
  onLoadMoreCategories
}: ServiceFormProps) {
  const isReadOnly = mode === "detail";
  const [uploading, setUploading] = useState(false);

  const form = useAppForm({
    defaultValues: {
      id: service?.id,
      code: service?.code || "",
      name: service?.name || "",
      categoryId: service?.categoryId || 0,
      price: service?.price ? formatMoney(service.price) : "",
      cost: service?.cost ? formatMoney(service.cost) : "",
      discount: service?.discount || 0,
      totalTime: service?.totalTime || 0,
      treatmentNum: service?.treatmentNum || 1,
      avatar: service?.avatar || "",
      status: service?.status ?? 1,
      type: service?.isCombo === 1 ? 2 : 1,
      featured: service?.featured || 0,
      intro: service?.intro || "",
      comboItems: parseComboItems(service?.priceVariation)
    } as ServiceFormValues,
    validators: { onSubmit: serviceSchema },
    onSubmit: async ({ value }) => {
      const parsedValue = serviceSchema.parse(value);
      const payload: ServiceSubmitValues = {
        ...parsedValue,
        price: String(parseMoney(parsedValue.price)),
        cost: String(parseMoney(parsedValue.cost)),
        isCombo: parsedValue.type === 2 ? 1 : 0,
        priceVariation: parsedValue.type === 2 ? JSON.stringify(parsedValue.comboItems) : "[]"
      };
      await onSubmit(payload);
    }
  });

  useEffect(() => {
    if (service) {
      form.reset({
        ...service,
        type: service.isCombo === 1 ? 2 : 1,
        comboItems: parseComboItems(service.priceVariation)
      } as ServiceFormValues);
    }
  }, [service, form]);

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
      id="service-form"
      className="service-form"
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
                <input
                  type="file"
                  accept="image/*"
                  className="position-absolute w-100 h-100 opacity-0 top-0 start-0"
                  onChange={handleFileChange}
                  disabled={uploading || isReadOnly}
                />
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-9">
          <div className="row">
            <div className="col-md-6 mb-3">
              <form.AppField name="name">
                {(field) => (
                  <field.Input
                    label="Tên dịch vụ"
                    required
                    disabled={isReadOnly}
                    placeholder="Nhập tên dịch vụ"
                  />
                )}
              </form.AppField>
            </div>
            <div className="col-md-6 mb-3">
              <form.AppField name="categoryId">
                {(field) => (
                  <field.Select
                    label="Danh mục"
                    required
                    disabled={isReadOnly}
                    options={categoryOptions}
                    placeholder="Chọn danh mục"
                    onLoadMore={onLoadMoreCategories}
                  />
                )}
              </form.AppField>
            </div>

            <div className="col-md-4 mb-3">
              <form.AppField name="code">
                {(field) => (
                  <field.Input
                    label="Mã dịch vụ"
                    required
                    disabled={isReadOnly}
                    placeholder="Nhập mã dịch vụ"
                  />
                )}
              </form.AppField>
            </div>
            <div className="col-md-4 mb-3">
              <form.AppField name="price">
                {(field) => (
                  <field.Input
                    label="Giá bán (VNĐ)"
                    placeholder="Nhập giá bán"
                    required
                    type="text"
                    disabled={isReadOnly}
                    onChange={(e) => {
                      const formatted = formatMoney(e.target.value);
                      field.handleChange(formatted);
                    }}
                  />
                )}
              </form.AppField>
            </div>
            <div className="col-md-4 mb-3">
              <form.AppField name="cost">
                {(field) => (
                  <field.Input
                    label="Giá vốn (VNĐ)"
                    placeholder="Nhập giá vốn"
                    required
                    type="text"
                    disabled={isReadOnly}
                    onChange={(e) => {
                      const formatted = formatMoney(e.target.value);
                      field.handleChange(formatted);
                    }}
                  />
                )}
              </form.AppField>
            </div>

            <div className="col-md-4 mb-3">
              <form.AppField name="discount">
                {(field) => (
                  <field.Input label="Giảm giá (%)" type="number" disabled={isReadOnly} />
                )}
              </form.AppField>
            </div>
            {/* <div className="col-md-4 mb-3">
              <form.AppField name="treatmentNum">
                {(field) => <field.Input label="Số buổi" type="number" disabled={isReadOnly} />}
              </form.AppField>
            </div> */}
            {/* <div className="col-md-4 mb-3">
              <form.AppField name="totalTime">
                {(field) => (
                  <field.Input label="Thời gian (phút)" type="number" disabled={isReadOnly} />
                )}
              </form.AppField>
            </div> */}
            <form.AppField name="type">
              {(typeField) => {
                const serviceType = Number(typeField.state.value ?? 1);

                return (
                  <>
                    <div className="col-md-6 mb-3">
                      <typeField.Radio
                        label="Loại dịch vụ"
                        disabled={isReadOnly}
                        options={[
                          { label: "Dịch vụ đơn lẻ", value: 1 },
                          { label: "Gói dịch vụ (Combo)", value: 2 }
                        ]}
                      />
                    </div>

                    {/* <div className="col-md-6 mb-3">
                      <form.AppField name="featured">
                        {(field) => (
                          <div className="">
                            <field.Checkbox
                              fieldLabel="Dịch vụ nổi bật?"
                              label="Dịch vụ nổi bật"
                              disabled={isReadOnly}
                            />
                          </div>
                        )}
                      </form.AppField>
                    </div> */}

                    {serviceType === 2 && (
                      <div className="col-12 mb-3">
                        <form.AppField name="comboItems">
                          {(comboField) => {
                            const items = comboField.state.value || [];
                            return (
                              <div className="card border shadow-none">
                                <div className="card-header d-flex justify-content-between align-items-center bg-light-lt py-2">
                                  <h6 className="mb-0 text-primary fw-bold">
                                    <i className="ti ti-table me-1"></i>Bảng giá Combo
                                  </h6>
                                  {!isReadOnly && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() =>
                                        comboField.handleChange([
                                          ...items,
                                          { name: "", price: 0, discount: 0, treatmentNum: 1 }
                                        ])
                                      }
                                    >
                                      <i className="ti ti-plus me-1"></i>Thêm dòng
                                    </button>
                                  )}
                                </div>
                                <div className="table-responsive">
                                  <table className="table table-bordered">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Tên gói combo</th>
                                        <th style={{ width: "160px" }}>Giá bán</th>
                                        <th style={{ width: "160px" }}>Giảm giá</th>
                                        <th style={{ width: "100px" }}>Số buổi</th>
                                        {!isReadOnly && <th style={{ width: "40px" }}></th>}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {items.map((_, idx) => (
                                        <tr key={idx}>
                                          <td className="p-0">
                                            <form.AppField name={`comboItems[${idx}].name`}>
                                              {(f) => (
                                                <f.Input
                                                  label={undefined as any}
                                                  placeholder="Tên gói"
                                                  disabled={isReadOnly}
                                                />
                                              )}
                                            </form.AppField>
                                          </td>
                                          <td className="p-2">
                                            <form.AppField name={`comboItems[${idx}].price`}>
                                              {(f) => (
                                                <f.Input
                                                  label=""
                                                  type="number"
                                                  disabled={isReadOnly}
                                                />
                                              )}
                                            </form.AppField>
                                          </td>
                                          <td className="p-2">
                                            <form.AppField name={`comboItems[${idx}].discount`}>
                                              {(f) => (
                                                <f.Input
                                                  label=""
                                                  type="number"
                                                  disabled={isReadOnly}
                                                />
                                              )}
                                            </form.AppField>
                                          </td>
                                          <td className="p-2">
                                            <form.AppField name={`comboItems[${idx}].treatmentNum`}>
                                              {(f) => (
                                                <f.Input
                                                  label=""
                                                  type="number"
                                                  disabled={isReadOnly}
                                                />
                                              )}
                                            </form.AppField>
                                          </td>
                                          {!isReadOnly && (
                                            <td className="text-center align-middle">
                                              <button
                                                type="button"
                                                className="btn btn-link text-danger p-0"
                                                onClick={() => {
                                                  const next = [...items];
                                                  next.splice(idx, 1);
                                                  comboField.handleChange(next);
                                                }}
                                              >
                                                <i className="ti ti-trash"></i>
                                              </button>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          }}
                        </form.AppField>
                      </div>
                    )}
                  </>
                );
              }}
            </form.AppField>

            <div className="col-12 mb-3">
              <form.AppField name="status">
                {(field) => (
                  <field.Radio
                    label="Trạng thái"
                    disabled={isReadOnly}
                    options={[
                      { label: "Đang hoạt động", value: 1 },
                      { label: "Ngưng hoạt động", value: 0 }
                    ]}
                  />
                )}
              </form.AppField>
            </div>

            <div className="col-12 mb-3">
              <form.AppField name="intro">
                {(field) => (
                  <field.Textarea
                    label="Giới thiệu"
                    rows={3}
                    disabled={isReadOnly}
                    placeholder="Nhập giới thiệu dịch vụ"
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
