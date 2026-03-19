import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import { useCollapse } from "@/hooks/use-collapse";
import type { CustomerDto } from "@/lib/types/customer";
import { useQuery } from "@tanstack/react-query";
import { customerAttributeQueries } from "@/lib/tanstack/options/customer-attribute";
import { uploadFile } from "@/lib/api/upload-image";

type DynamicAttribute = {
  id: number;
  name: string;
  fieldName?: string;
  datatype: string;
  attributes?: unknown;
  data?: string;
  options?: string;
  required?: number;
  readonly?: number;
  parentId?: number;
  parentName?: string;
};

type DynamicOption = {
  id: string;
  name: string;
};

type CustomerExtraInfo = {
  id?: number | null;
  attributeValue?: string;
};

type RawCustomerExtraInfo = {
  id?: number | null;
  attributeId?: number | string | null;
  customerAttributeId?: number | string | null;
  fieldId?: number | string | null;
  attribute?: { id?: number | string | null } | null;
  customerAttribute?: { id?: number | string | null } | null;
  attributeValue?: string | null;
  value?: string | null;
};

type NumberFormatConfig = {
  maxFractionDigits: number;
};

const DEFAULT_NUMBER_FORMAT: NumberFormatConfig = {
  maxFractionDigits: 0
};

function getNumberFormatConfig(attr: DynamicAttribute): NumberFormatConfig {
  const jsonRaw = Array.isArray(attr.attributes) ? attr.attributes[0] : attr.attributes;
  if (typeof jsonRaw === "string" && jsonRaw.trim()) {
    try {
      const parsed = JSON.parse(jsonRaw);
      const preset =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as any).numberFormat
          : undefined;

      if (typeof preset === "string" && preset.includes(".")) {
        const fraction = preset.split(".")[1] ?? "";
        return { maxFractionDigits: fraction.length };
      }

      if (typeof preset === "string") {
        return DEFAULT_NUMBER_FORMAT;
      }
    } catch {}
  }

  return DEFAULT_NUMBER_FORMAT;
}

function formatNumberDisplay(raw: string, maxFractionDigits: number): string {
  const cleaned = String(raw ?? "")
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const firstDotIndex = cleaned.indexOf(".");
  const hasDot = firstDotIndex >= 0;
  const integerPartRaw = hasDot ? cleaned.slice(0, firstDotIndex) : cleaned;
  const decimalRaw = hasDot ? cleaned.slice(firstDotIndex + 1).replace(/\./g, "") : "";

  const integerPart = integerPartRaw.replace(/^0+(?=\d)/, "");
  const formattedInt = (integerPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (maxFractionDigits <= 0) return formattedInt;

  const limitedDecimal = decimalRaw.slice(0, maxFractionDigits);
  if (hasDot) {
    return `${formattedInt}.${limitedDecimal}`;
  }

  return formattedInt;
}

function sanitizeNumberPayload(raw: string): string {
  return String(raw ?? "")
    .replace(/,/g, "")
    .trim();
}

function getRawCustomerExtraInfos(customer?: CustomerDto): RawCustomerExtraInfo[] {
  const source =
    (customer as any)?.customerExtraInfos ??
    (customer as any)?.customerExtraInfoDtos ??
    (customer as any)?.extraInfos ??
    (customer as any)?.extraValues;

  if (!source) return [];

  if (Array.isArray(source)) return source as RawCustomerExtraInfo[];

  if (typeof source === "string") {
    try {
      const parsed = JSON.parse(source);
      if (Array.isArray(parsed)) return parsed as RawCustomerExtraInfo[];
      if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).items)) {
        return (parsed as any).items as RawCustomerExtraInfo[];
      }
    } catch {}
  }

  if (source && typeof source === "object") {
    const sourceObj = source as any;

    if (Array.isArray(sourceObj.items)) {
      return sourceObj.items as RawCustomerExtraInfo[];
    }

    return Object.entries(sourceObj)
      .map(([k, v]) => {
        if (v && typeof v === "object") {
          return {
            attributeId: k,
            id: (v as any).id ?? null,
            attributeValue: (v as any).attributeValue ?? (v as any).value ?? ""
          } as RawCustomerExtraInfo;
        }

        return {
          attributeId: k,
          id: null,
          attributeValue: v == null ? "" : String(v)
        } as RawCustomerExtraInfo;
      })
      .filter((x) => !!getExtraInfoAttributeId(x));
  }

  return [];
}

function getByKeyInsensitive(input: unknown, keys: string[]): unknown {
  if (!input || typeof input !== "object") return undefined;

  const normalizedTargets = keys.map((k) => k.toLowerCase().replace(/[_\s-]/g, ""));

  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const nk = k.toLowerCase().replace(/[_\s-]/g, "");
    if (normalizedTargets.includes(nk)) {
      return v;
    }
  }

  return undefined;
}

function getExtraInfoAttributeId(ei: RawCustomerExtraInfo): number {
  const direct =
    ei.attributeId ??
    ei.customerAttributeId ??
    ei.fieldId ??
    ei.attribute?.id ??
    ei.customerAttribute?.id ??
    getByKeyInsensitive(ei, [
      "attributeId",
      "customerAttributeId",
      "fieldId",
      "attribute_id",
      "customer_attribute_id",
      "field_id"
    ]);

  const nestedAttribute = getByKeyInsensitive(ei, ["attribute", "customerAttribute", "field"]);
  const nestedId =
    getByKeyInsensitive(nestedAttribute, ["id", "attributeId", "customerAttributeId"]) ?? 0;

  return Number(direct ?? nestedId ?? 0);
}

function getExtraInfoValue(ei: RawCustomerExtraInfo): string {
  const direct =
    ei.attributeValue ??
    ei.value ??
    getByKeyInsensitive(ei, [
      "attributeValue",
      "value",
      "attribute_value",
      "fieldValue",
      "field_value",
      "data",
      "content"
    ]);

  if (Array.isArray(direct)) {
    return direct.map((x) => String(x)).join(",");
  }

  if (direct && typeof direct === "object") {
    const maybeValue = getByKeyInsensitive(direct, ["value", "attributeValue", "data"]);
    if (maybeValue != null) return String(maybeValue);
    return JSON.stringify(direct);
  }

  return String(direct ?? "");
}

function toExtraValueKey(attributeId: number): string {
  return `attr_${attributeId}`;
}

function parseAttributeIdFromExtraKey(key: string): number {
  if (key.startsWith("attr_")) {
    return Number(key.slice(5));
  }
  return Number(key);
}

const getOptionsForAttribute = (attr: DynamicAttribute): DynamicOption[] => {
  const jsonRaw = Array.isArray(attr.attributes) ? attr.attributes[0] : attr.attributes;
  if (typeof jsonRaw === "string" && jsonRaw.trim()) {
    try {
      const parsed = JSON.parse(jsonRaw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item: any) => ({
            id: String(item?.value ?? "").trim(),
            name: String(item?.label ?? item?.value ?? "").trim()
          }))
          .filter((item) => item.id.length > 0);
      }
    } catch {}
  }

  const rawOptions = attr.data || attr.options || "";
  if (!rawOptions) return [];

  return rawOptions
    .split(",")
    .map((opt: string) => {
      const value = opt.trim();
      return { id: value, name: value };
    })
    .filter((opt) => opt.id.length > 0);
};

const customerSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Họ tên không được để trống"),
  avatar: z.string().optional(),
  age: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  birthday: z.string().optional(),
  gender: z.number().default(1),
  sourceId: z.number().nullable().optional(),
  address: z.string().optional(),
  phone: z.string().regex(/^0[0-9]{9,10}$/, "SĐT không hợp lệ"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")),
  note: z.string().optional(),
  extraValues: z.record(z.string(), z.any()).optional()
});

type CustomerFormValues = z.input<typeof customerSchema>;

type CustomerFormProps = {
  mode: "add" | "edit" | "detail";
  customer?: CustomerDto;
  onSubmit: (values: any) => Promise<void>;
  customerSourceOptions: { value: number; label: string }[];
  onLoadMorecustomerSources?: () => void;
};

export function CustomerForm({
  mode,
  customer,
  onSubmit,
  customerSourceOptions,
  onLoadMorecustomerSources
}: CustomerFormProps) {
  const hydrateSignatureRef = useRef<string>("");
  const isReadOnly = mode === "detail";
  const basic = useCollapse(true);
  const address = useCollapse(false);
  const extraInfo = useCollapse(false);
  const [uploading, setUploading] = useState(false);

  const { data: attrData } = useQuery(customerAttributeQueries.list({ page: 1, limit: 1000 }));
  const attributes = (attrData?.result?.items ?? []) as DynamicAttribute[];

  const form = useAppForm({
    defaultValues: {
      id: customer?.id,
      name: customer?.name || "",
      avatar: customer?.avatar || "",
      age: customer?.age || "",
      height: customer?.height || "",
      weight: customer?.weight || "",
      birthday: customer?.birthday || "",
      gender: customer?.gender ?? 1,
      sourceId: customer?.sourceId || null,
      address: customer?.address || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      note: customer?.note || "",
      extraValues: {}
    } as CustomerFormValues,
    validators: { onSubmit: customerSchema as any },
    onSubmit: async ({ value }) => {
      const numberAttrIds = new Set(
        attributes.filter((attr) => attr.datatype === "number").map((attr) => Number(attr.id))
      );

      const customerExtraInfos = Object.entries(value.extraValues || {}).map(
        ([attrId, v]: [string, CustomerExtraInfo]) => {
          const numericAttrId = parseAttributeIdFromExtraKey(attrId);
          const rawAttributeValue = v.attributeValue || "";

          return {
            attributeId: numericAttrId,
            attributeValue: numberAttrIds.has(numericAttrId)
              ? sanitizeNumberPayload(rawAttributeValue)
              : rawAttributeValue,
            id: v.id || null
          };
        }
      );

      await onSubmit({ ...value, customerExtraInfos });
    }
  });

  useEffect(() => {
    if (customer) {
      const extraMap: Record<string, CustomerExtraInfo> = {};
      const customerExtraInfos = getRawCustomerExtraInfos(customer);

      customerExtraInfos?.forEach((ei) => {
        const attrId = getExtraInfoAttributeId(ei);
        if (!attrId) return;
        extraMap[toExtraValueKey(attrId)] = {
          id: ei.id ?? null,
          attributeValue: getExtraInfoValue(ei)
        };
      });

      // Fallback for APIs that return dynamic values as flat keys by fieldName.
      if (!Object.keys(extraMap).length) {
        for (const attr of attributes) {
          const attrId = Number(attr.id);
          if (!attrId) continue;

          const key = String(attr.fieldName ?? "").trim();
          if (!key) continue;

          const raw = (customer as any)?.[key];
          if (raw == null) continue;

          extraMap[toExtraValueKey(attrId)] = {
            id: null,
            attributeValue: String(raw)
          };
        }
      }

      const attrIdsSignature = attributes.map((a) => Number(a.id) || 0).join(",");
      const signature = `${String((customer as any)?.id ?? "")}|${JSON.stringify(customerExtraInfos)}|${JSON.stringify(extraMap)}|${attrIdsSignature}`;

      if (hydrateSignatureRef.current === signature) return;

      const currentExtraValues =
        (form.getFieldValue?.("extraValues" as any) as Record<string, CustomerExtraInfo>) ?? {};
      const hasCurrentValues = Object.keys(currentExtraValues).length > 0;
      const hasIncomingValues = Object.keys(extraMap).length > 0;

      // Avoid wiping hydrated values when a later payload lacks dynamic fields.
      if (!hasIncomingValues && hasCurrentValues) {
        return;
      }

      form.reset({
        ...customer,
        extraValues: extraMap
      } as any);

      // Ensure dynamic nested fields are hydrated even if reset drops unknown nested keys.
      Object.entries(extraMap).forEach(([key, value]) => {
        form.setFieldValue(`extraValues.${key}.id` as any, (value?.id ?? null) as any);
        form.setFieldValue(
          `extraValues.${key}.attributeValue` as any,
          (value?.attributeValue ?? "") as any
        );
      });

      hydrateSignatureRef.current = signature;
    }
  }, [customer, attributes]);

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
      id="customer-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="accordion accordion-bordered" id="customer_accordion">
        <div className="accordion-item rounded mb-3">
          <div className="accordion-header">
            <button
              type="button"
              className={`accordion-button accordion-custom-button ${basic.isOpen ? "" : "collapsed"}`}
              onClick={() => basic.toggle()}
            >
              <span className="avatar avatar-md rounded me-1">
                <i className="ti ti-user-plus"></i>
              </span>
              Thông tin cơ bản
            </button>
          </div>
          <div
            className={`accordion-collapse collapse ${basic.isOpen ? "show" : ""}`}
            ref={basic.ref}
          >
            <div className="accordion-body border-top row">
              <div className="col-12 mb-3">
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
              <div className="col-12 mb-3">
                <form.AppField name="name">
                  {(f) => (
                    <f.Input
                      label="Họ tên"
                      required
                      disabled={isReadOnly}
                      placeholder="Nhập họ tên"
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-4 mb-3">
                <form.AppField name="age">
                  {(f) => (
                    <f.Input
                      label="Tuổi"
                      type="number"
                      disabled={isReadOnly}
                      placeholder="Nhập tuổi"
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-4 mb-3">
                <form.AppField name="height">
                  {(f) => (
                    <f.Input
                      label="Chiều cao (cm)"
                      type="number"
                      disabled={isReadOnly}
                      placeholder="Nhập chiều cao"
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-4 mb-3">
                <form.AppField name="weight">
                  {(f) => (
                    <f.Input
                      label="Cân nặng (kg)"
                      type="number"
                      disabled={isReadOnly}
                      placeholder="Nhập cân nặng"
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="birthday">
                  {(f) => <f.Input label="Ngày sinh" type="date" disabled={isReadOnly} />}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="sourceId">
                  {(f) => (
                    <f.Select
                      label="Nguồn khách hàng"
                      options={customerSourceOptions}
                      onLoadMore={onLoadMorecustomerSources}
                      disabled={isReadOnly}
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="gender">
                  {(f) => (
                    <f.Radio
                      label="Giới tính"
                      options={[
                        { label: "Nam", value: 2 },
                        { label: "Nữ", value: 1 }
                      ]}
                      disabled={isReadOnly}
                    />
                  )}
                </form.AppField>
              </div>
            </div>
          </div>
        </div>

        <div className="accordion-item rounded mb-3 border-top">
          <div className="accordion-header">
            <button
              type="button"
              className={`accordion-button accordion-custom-button ${address.isOpen ? "" : "collapsed"}`}
              onClick={() => address.toggle()}
            >
              <span className="avatar avatar-md rounded me-1">
                <i className="ti ti-map-pin-cog"></i>
              </span>
              Thông tin địa chỉ
            </button>
          </div>
          <div
            className={`accordion-collapse collapse ${address.isOpen ? "show" : ""}`}
            ref={address.ref}
          >
            <div className="accordion-body border-top row">
              <div className="col-md-6 mb-3">
                <form.AppField name="phone">
                  {(f) => (
                    <f.Input
                      label="Số điện thoại"
                      required
                      disabled={isReadOnly}
                      placeholder="Nhập số điện thoại"
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="email">
                  {(f) => <f.Input label="Email" disabled={isReadOnly} placeholder="Nhập email" />}
                </form.AppField>
              </div>
              <div className="col-12 mb-3">
                <form.AppField name="address">
                  {(f) => (
                    <f.Input label="Địa chỉ" disabled={isReadOnly} placeholder="Nhập địa chỉ" />
                  )}
                </form.AppField>
              </div>
              <div className="col-12 mb-0">
                <form.AppField name="note">
                  {(f) => (
                    <f.Textarea
                      label="Ghi chú"
                      disabled={isReadOnly}
                      rows={3}
                      placeholder="Nhập ghi chú"
                    />
                  )}
                </form.AppField>
              </div>
            </div>
          </div>
        </div>

        {attributes.length > 0 && (
          <div className="accordion-item rounded mb-3 border-top">
            <div className="accordion-header">
              <button
                type="button"
                className={`accordion-button accordion-custom-button ${extraInfo.isOpen ? "" : "collapsed"}`}
                onClick={() => extraInfo.toggle()}
              >
                <span className="avatar avatar-md rounded me-1">
                  <i className="ti ti-list"></i>
                </span>
                Thông tin bổ sung
              </button>
            </div>
            <div
              className={`accordion-collapse collapse ${extraInfo.isOpen ? "show" : ""}`}
              ref={extraInfo.ref}
            >
              <div className="accordion-body border-top">
                {(() => {
                  const groups: {
                    parentId: number | null;
                    parentName: string | null;
                    items: DynamicAttribute[];
                  }[] = [];
                  const groupMap = new Map<number | null, (typeof groups)[number]>();

                  for (const attr of attributes) {
                    const pid = attr.parentId || null;
                    const pname = attr.parentName || null;
                    if (!groupMap.has(pid)) {
                      const g = { parentId: pid, parentName: pname, items: [] };
                      groupMap.set(pid, g);
                      groups.push(g);
                    }
                    groupMap.get(pid)!.items.push(attr);
                  }

                  return groups.map((group) => (
                    <div key={group.parentId ?? "no-group"}>
                      {group.parentName && (
                        <p className="fw-semibold mb-2 mt-1 text-dark">{group.parentName}</p>
                      )}
                      <div className="row">
                        {group.items.map((attr) => {
                          const baseName =
                            `extraValues.${toExtraValueKey(Number(attr.id))}` as const;
                          const opts = getOptionsForAttribute(attr);
                          const selectOptions = opts.map((o) => ({ value: o.id, label: o.name }));
                          const radioOptions = selectOptions;
                          const label = String(attr.name ?? "");
                          const isRequired = !!attr.required;
                          const isDisabled = isReadOnly || !!attr.readonly;

                          return (
                            <div className="col-md-6 mb-3" key={attr.id}>
                              <form.AppField name={`${baseName}.id`}>{() => null}</form.AppField>

                              <form.AppField name={`${baseName}.attributeValue`}>
                                {(f) => {
                                  if (attr.datatype === "text") {
                                    return (
                                      <f.Input
                                        label={label}
                                        required={isRequired}
                                        disabled={isDisabled}
                                        placeholder="Nhập..."
                                      />
                                    );
                                  }

                                  if (attr.datatype === "textarea") {
                                    return (
                                      <f.Textarea
                                        label={label}
                                        required={isRequired}
                                        disabled={isDisabled}
                                        rows={3}
                                        placeholder="Nhập..."
                                      />
                                    );
                                  }

                                  if (attr.datatype === "number") {
                                    const cfg = getNumberFormatConfig(attr);

                                    return (
                                      <f.Input
                                        label={label}
                                        type="text"
                                        required={isRequired}
                                        disabled={isDisabled}
                                        placeholder="Nhập..."
                                        onChange={(e) => {
                                          const formatted = formatNumberDisplay(
                                            e.target.value,
                                            cfg.maxFractionDigits
                                          );
                                          form.setFieldValue(
                                            `${baseName}.attributeValue` as any,
                                            formatted as any
                                          );
                                        }}
                                      />
                                    );
                                  }

                                  if (attr.datatype === "date") {
                                    return (
                                      <f.Input
                                        label={label}
                                        type="date"
                                        required={isRequired}
                                        disabled={isDisabled}
                                      />
                                    );
                                  }

                                  if (attr.datatype === "dropdown" || attr.datatype === "select") {
                                    return (
                                      <f.Select
                                        label={label}
                                        options={selectOptions}
                                        required={isRequired}
                                        disabled={isDisabled}
                                        placeholder="Chọn"
                                      />
                                    );
                                  }

                                  if (attr.datatype === "radio") {
                                    return (
                                      <f.Radio
                                        label={label}
                                        options={radioOptions}
                                        required={isRequired}
                                        disabled={isDisabled}
                                      />
                                    );
                                  }

                                  if (attr.datatype === "checkbox") {
                                    return (
                                      <f.Checkbox
                                        fieldLabel={label}
                                        label={label}
                                        required={isRequired}
                                        disabled={isDisabled}
                                      />
                                    );
                                  }

                                  if (attr.datatype === "multiselect") {
                                    return (
                                      <f.Select
                                        label={label}
                                        options={selectOptions}
                                        required={isRequired}
                                        disabled={isDisabled}
                                        placeholder="Chọn nhiều"
                                        isMulti
                                      />
                                    );
                                  }

                                  return (
                                    <div className="text-muted small fst-italic">
                                      Loại {String(attr.datatype)}
                                    </div>
                                  );
                                }}
                              </form.AppField>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
