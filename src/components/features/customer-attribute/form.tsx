import { useEffect } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import { type CustomerAttributeDto } from "@/lib/types/customer-attribute";
import "./formAttribute.scss";

type ParentOption = { label: string; value: number };

const datatypeOptions = [
  { label: "Văn bản (text)", value: "text" },
  { label: "Văn bản dài (textarea)", value: "textarea" },
  { label: "Số (number)", value: "number" },
  { label: "Danh sách chọn (dropdown)", value: "dropdown" },
  { label: "Nhiều lựa chọn (multiselect)", value: "multiselect" },
  { label: "Hộp kiểm (checkbox)", value: "checkbox" },
  { label: "Nút chọn (radio)", value: "radio" },
  { label: "Ngày tháng (date)", value: "date" }
];

const numberFormatPresets = ["1,234", "1,234.5", "1,234.56", "1,234.567"];

const dropdownOptionSchema = z.object({
  value: z.string().optional().default(""),
  label: z.string().optional().default("")
});

const attributeSchema = z.object({
  id: z.any().optional(),
  name: z.string().min(1, "Vui lòng nhập tên trường"),
  fieldName: z.string().min(1, "Vui lòng nhập mã trường"),
  datatype: z.string().min(1, "Vui lòng chọn kiểu dữ liệu"),
  position: z.coerce.number().default(0),
  parentId: z.coerce.number().default(0),
  required: z.coerce.number().default(0),
  uniqued: z.coerce.number().default(0),
  readonly: z.coerce.number().default(0),

  dropdownOptions: z.array(dropdownOptionSchema).optional(),
  numberFormat: z.string().optional()
});

type AttributeFormValues = z.input<typeof attributeSchema>;

type AttributeFormProps = {
  mode: "add" | "edit" | "detail";
  attribute?: CustomerAttributeDto;
  parentOptions: ParentOption[];
  onSubmit: (values: any) => Promise<void>;
};

const isChoiceDatatype = (dt: string) => ["dropdown", "radio", "multiselect"].includes(dt);

function safeJsonParse(raw: unknown) {
  if (!raw) return null;
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeAttributesFromDto(attribute?: CustomerAttributeDto): {
  dropdownOptions: { value: string; label: string }[];
  numberFormat: string;
} {
  const fallback = {
    dropdownOptions: [{ value: "", label: "" }],
    numberFormat: ""
  };

  if (!attribute) return fallback;

  const raw = Array.isArray(attribute.attributes) ? attribute.attributes[0] : attribute.attributes;
  const parsed = safeJsonParse(raw);

  if (attribute.datatype === "number") {
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const nf = typeof parsed.numberFormat === "string" ? parsed.numberFormat : "";
      return { dropdownOptions: fallback.dropdownOptions, numberFormat: nf };
    }
    return fallback;
  }

  if (isChoiceDatatype(attribute.datatype)) {
    if (Array.isArray(parsed)) {
      const cleaned = parsed
        .map((x: any) => ({
          value: typeof x?.value === "string" ? x.value : "",
          label: typeof x?.label === "string" ? x.label : ""
        }))
        .filter((o) => o.value || o.label);

      return {
        dropdownOptions: cleaned.length ? cleaned : fallback.dropdownOptions,
        numberFormat: ""
      };
    }
    return fallback;
  }

  return fallback;
}

function serializeAttributes(values: AttributeFormValues): string[] {
  const dt = values.datatype;

  if (dt === "number") {
    const payload = { numberFormat: values.numberFormat ?? "" };
    return [JSON.stringify(payload)];
  }

  if (isChoiceDatatype(dt)) {
    const options = (values.dropdownOptions ?? [])
      .map((o) => ({
        value: (o?.value ?? "").trim(),
        label: (o?.label ?? "").trim()
      }))
      .filter((o) => o.value || o.label);

    return [JSON.stringify(options)];
  }

  return [];
}

export function AttributeForm({ mode, attribute, onSubmit, parentOptions }: AttributeFormProps) {
  const isReadOnly = mode === "detail";

  const form = useAppForm({
    defaultValues: {
      id: attribute?.id,
      name: attribute?.name || "",
      fieldName: String(attribute?.fileName || ""),
      datatype: attribute?.datatype || "text",
      position: attribute?.position || 0,
      parentId: attribute?.parentId || 0,
      required: attribute?.required || 0,
      uniqued: attribute?.unique || 0,
      readonly: attribute?.readonly || 0,
      dropdownOptions: [{ value: "", label: "" }],
      numberFormat: ""
    } as AttributeFormValues,
    validators: { onSubmit: attributeSchema },
    onSubmit: async ({ value }) => {
      const attributes = serializeAttributes(value);

      await onSubmit({
        id: value.id,
        name: value.name,
        fileName: value.fieldName,
        datatype: value.datatype,
        position: value.position,

        required: Number(value.required) || 0,
        unique: Number(value.uniqued) || 0,
        readonly: Number(value.readonly) || 0,

        attributes,

        parentId: value.parentId !== 0 ? value.parentId : undefined
      });
    }
  });

  useEffect(() => {
    if (!attribute || mode === "add") return;

    const extra = normalizeAttributesFromDto(attribute);

    form.reset({
      id: attribute.id,
      name: attribute.name ?? "",
      fieldName: String(attribute.fileName ?? ""),
      datatype: attribute.datatype ?? "text",
      position: attribute.position ?? 0,
      parentId: attribute.parentId ?? 0,
      required: attribute.required ?? 0,
      uniqued: attribute.unique ?? 0,
      readonly: attribute.readonly ?? 0,
      dropdownOptions: extra.dropdownOptions,
      numberFormat: extra.numberFormat
    } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attribute?.id, mode]);

  const selectedDatatype = (form.state.values as any)?.datatype;

  useEffect(() => {
    if (selectedDatatype !== "number") {
      const nf = form.getFieldValue?.("numberFormat" as any);
      if (nf) form.setFieldValue?.("numberFormat" as any, "");
    }

    if (!isChoiceDatatype(selectedDatatype)) {
      const opts = form.getFieldValue?.("dropdownOptions" as any);
      if (Array.isArray(opts) && opts.some((o: any) => o?.value || o?.label)) {
        form.setFieldValue?.("dropdownOptions" as any, [{ value: "", label: "" }] as any);
      }
    }
  }, [selectedDatatype, form]);

  return (
    <form
      id="attribute-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row">
        <div className="col-md-6 mb-3">
          <form.AppField name="name">
            {(f) => (
              <f.Input
                label="Tên trường thông tin"
                required
                disabled={isReadOnly}
                placeholder="Nhập tên trường"
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="fieldName">
            {(f) => (
              <f.Input
                label="Mã trường thông tin"
                required
                disabled={isReadOnly}
                placeholder="Nhập mã trường"
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="datatype">
            {(f) => (
              <f.Select
                label="Kiểu dữ liệu"
                required
                options={datatypeOptions}
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="position">
            {(f) => <f.Input label="Thứ tự hiển thị" type="number" disabled={isReadOnly} />}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="parentId">
            {(f) => (
              <f.Select
                label="Thuộc nhóm"
                options={parentOptions}
                disabled={isReadOnly}
                placeholder="Chọn nhóm"
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="required">
            {(f) => (
              <f.Radio
                label="Bắt buộc nhập?"
                options={[
                  { label: "Có", value: 1 },
                  { label: "Không", value: 0 }
                ]}
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="uniqued">
            {(f) => (
              <f.Radio
                label="Trường duy nhất?"
                options={[
                  { label: "Có", value: 1 },
                  { label: "Không", value: 0 }
                ]}
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="readonly">
            {(f) => (
              <f.Checkbox
                fieldLabel="Quyền truy cập"
                label="Chỉ cho phép đọc (Read-only)"
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="datatype">
          {(dt) => {
            const type = dt.state.value;

            if (type === "number") {
              return (
                <div className="col-12 mb-3">
                  <form.AppField name="numberFormat">
                    {(f) => (
                      <f.Radio
                        label="Định dạng số"
                        options={numberFormatPresets.map((p) => ({ label: p, value: p }))}
                        disabled={isReadOnly}
                      />
                    )}
                  </form.AppField>
                </div>
              );
            }

            if (isChoiceDatatype(type)) {
              return (
                <div className="col-12 mb-3 attribute-dropdown-options">
                  <form.AppField name="dropdownOptions">
                    {(opt) => {
                      const items = opt.state.value || [{ value: "", label: "" }];

                      return (
                        <>
                          <label className="form-label">Lựa chọn</label>
                          <div className="d-flex flex-column gap-2">
                            {items.map((_, idx) => (
                              <div className="row g-2" key={idx}>
                                <div className="col-md-5 ps-0">
                                  <form.AppField name={`dropdownOptions[${idx}].value`}>
                                    {(f) => (
                                      <f.Input
                                        label=""
                                        placeholder="Giá trị"
                                        disabled={isReadOnly}
                                      />
                                    )}
                                  </form.AppField>
                                </div>

                                <div className="col-md-5">
                                  <form.AppField name={`dropdownOptions[${idx}].label`}>
                                    {(f) => (
                                      <f.Input
                                        label=""
                                        placeholder="Nhãn hiển thị"
                                        disabled={isReadOnly}
                                      />
                                    )}
                                  </form.AppField>
                                </div>

                                {!isReadOnly && (
                                  <div className="col-md-2 d-flex">
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger w-100"
                                      onClick={() => {
                                        const next = [...items];
                                        next.splice(idx, 1);
                                        opt.handleChange(
                                          next.length ? next : [{ value: "", label: "" }]
                                        );
                                      }}
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}

                            {!isReadOnly && (
                              <div>
                                <button
                                  type="button"
                                  className="btn btn-outline-primary"
                                  onClick={() =>
                                    opt.handleChange([...items, { value: "", label: "" }])
                                  }
                                >
                                  + Thêm lựa chọn
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    }}
                  </form.AppField>
                </div>
              );
            }

            return null;
          }}
        </form.AppField>
      </div>
    </form>
  );
}
