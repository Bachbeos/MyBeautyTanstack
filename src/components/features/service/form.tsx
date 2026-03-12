import { useEffect } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import { type ServiceDto } from "@/lib/types/service";

const serviceSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Vui lòng nhập tên dịch vụ"),
  code: z.string().min(1, "Mã sản phẩm không được để trống"),
  categoryId: z.coerce.number().min(1, "Vui lòng chọn danh mục"),
  price: z.coerce.number().min(0, "Giá bán không được âm"),
  cost: z.coerce.number().min(0, "Giá vốn không được âm"),
  intro: z.string().optional(),
  avatar: z.string().optional(),
  status: z.coerce.number().default(1),
  discount: z.coerce.number().min(0, "Giảm giá không được âm").default(0),
  isCombo: z.coerce.number().default(0),
  featured: z.coerce.number().default(0),
  treatmentNum: z.coerce.number().min(0, "Số lần điều trị không được âm").default(0),
  totalTime: z.coerce.number().min(0, "Tổng thời gian không được âm").default(0),
  priceVariation: z.array(z.string()).optional()
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

type ServiceFormProps = {
  mode: "add" | "edit" | "detail";
  service?: ServiceDto;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  categoryOptions: { label: string; value: number }[];
};

export function ServiceForm({ mode, service, onSubmit, categoryOptions }: ServiceFormProps) {
  const isReadOnly = mode === "detail";

  const form = useAppForm({
    defaultValues: {
      id: service?.id,
      name: service?.name || "",
      code: service?.code || "",
      categoryId: service?.categoryId,
      price: service?.price ?? 0,
      cost: service?.cost ?? 0,
      intro: service?.intro || "",
      avatar: service?.avatar || "",
      status: service?.status ?? 1,
      discount: service?.discount ?? 0,
      isCombo: service?.isCombo ?? 0,
      featured: service?.featured ?? 0,
      treatmentNum: service?.treatmentNum ?? 0,
      totalTime: service?.totalTime ?? 0,
      priceVariation: service?.priceVariation || []
    } as ServiceFormValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  // Đồng bộ dữ liệu khi voucher thay đổi (cho trường hợp Edit/Detail)
  useEffect(() => {
    if (service) {
      form.setFieldValue("name", service.name);
      // ... set các field khác tương tự
    }
  }, [service, form]);

  return (
    <form
      id="service-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="row">
        {/* Giữ nguyên Classname từ ModalService.tsx */}
        <div className="col-12 mb-3 text-center">
          <div className="position-relative d-inline-block">
            <img
              src={form.getFieldValue("image") || "assets/img/profiles/avatar-01.jpg"}
              className="avatar avatar-xxl rounded-circle border"
              alt="Service"
            />
            {!isReadOnly && (
              <div className="position-absolute bottom-0 end-0">
                <label className="btn btn-icon btn-sm btn-primary rounded-circle m-0">
                  <i className="ti ti-camera"></i>
                  <input type="file" className="d-none" />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Tên dịch vụ"
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
                disabled={isReadOnly}
                options={categoryOptions}
                placeholder="Chọn danh mục"
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="price">
            {(field) => (
              <field.Input label="Giá dịch vụ (VNĐ)" type="number" disabled={isReadOnly} />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="duration">
            {(field) => (
              <field.Input label="Thời gian (Phút)" type="number" disabled={isReadOnly} />
            )}
          </form.AppField>
        </div>

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
          <form.AppField name="description">
            {(field) => <field.Textarea label="Mô tả chi tiết" rows={3} disabled={isReadOnly} />}
          </form.AppField>
        </div>
      </div>
    </form>
  );
}
