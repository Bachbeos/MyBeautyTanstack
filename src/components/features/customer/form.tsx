import { useEffect } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import { useCollapse } from "@/hooks/use-collapse";
import type { CustomerDto } from "@/lib/types/customer";

const customerSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Vui lòng nhập tên chi nhánh"),
  avatar: z.string(),
  foundingDay: z.number().min(1).max(31).optional(),
  foundingMonth: z.number().min(1).max(12).optional(),
  foundingYear: z.number().optional(),
  status: z.number().default(1),
  description: z.string(),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  phone: z.string().regex(/^0[0-9]{9,10}$/, "SĐT không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  website: z.string(),
  customerSourceId: z.number()
});

type CustomerFormValues = z.input<typeof customerSchema>;
type CustomerSchemaOutput = z.output<typeof customerSchema>;
type CustomerSubmitValues = Omit<CustomerSchemaOutput, "customerSourceId"> & {
  customerSourceId?: number;
};

type CustomerFormProps = {
  mode: "add" | "edit" | "detail";
  customer?: CustomerDto;
  onSubmit: (values: CustomerSubmitValues) => Promise<void>;
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
  const isReadOnly = mode === "detail";
  const basic = useCollapse(true);
  const contact = useCollapse(false);

  const form = useAppForm({
    defaultValues: {
      id: branch?.id ? Number(branch.id) : undefined,
      name: branch?.name || "",
      avatar: branch?.avatar || "",
      foundingDay: branch?.foundingDay,
      foundingMonth: branch?.foundingMonth,
      foundingYear: branch?.foundingYear,
      status: branch?.status ?? 1,
      description: branch?.description || "",
      address: branch?.address || "",
      phone: branch?.phone || "",
      email: branch?.email || "",
      website: branch?.website || "",
      ownerId: branch?.ownerId || 0,
      parentId: branch?.parentId || 0
    } as BranchFormValues,
    validators: { onSubmit: branchSchema },
    onSubmit: async ({ value }) => {
      const parsedValue = branchSchema.parse(value);

      await onSubmit({
        ...parsedValue,
        parentId: parsedValue.parentId !== 0 ? parsedValue.parentId : undefined,
        ownerId: parsedValue.ownerId !== 0 ? parsedValue.ownerId : undefined
      });
    }
  });

  useEffect(() => {
    form.reset({
      id: branch?.id ? Number(branch.id) : undefined,
      name: branch?.name || "",
      avatar: branch?.avatar || "",
      foundingDay: branch?.foundingDay,
      foundingMonth: branch?.foundingMonth,
      foundingYear: branch?.foundingYear,
      status: branch?.status ?? 1,
      description: branch?.description || "",
      address: branch?.address || "",
      phone: branch?.phone || "",
      email: branch?.email || "",
      website: branch?.website || "",
      ownerId: branch?.ownerId || 0,
      parentId: branch?.parentId || 0
    });
  }, [branch]);

  return (
    <form
      id="branch-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="accordion accordion-bordered" id="branch_accordion">
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
                          {/* {uploading ? "Đang tải..." : "Tải ảnh lên"} */}
                          {/* <input type="file" accept="image/*" className="position-absolute w-100 h-100 opacity-0 top-0 start-0" onChange={handleFileChange} disabled={uploading} /> */}
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
                      label="Tên chi nhánh"
                      required
                      disabled={isReadOnly}
                      placeholder="Nhập tên"
                    />
                  )}
                </form.AppField>
              </div>

              <div className="col-4 mb-3">
                <form.AppField name="foundingDay">
                  {(f) => (
                    <f.Input label="Ngày" type="number" disabled={isReadOnly} placeholder="Ngày" />
                  )}
                </form.AppField>
              </div>
              <div className="col-4 mb-3">
                <form.AppField name="foundingMonth">
                  {(f) => (
                    <f.Input
                      label="Tháng"
                      type="number"
                      disabled={isReadOnly}
                      placeholder="Tháng"
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-4 mb-3">
                <form.AppField name="foundingYear">
                  {(f) => (
                    <f.Input label="Năm" type="number" disabled={isReadOnly} placeholder="Năm" />
                  )}
                </form.AppField>
              </div>
              <div className="col-12 mb-3">
                <form.AppField name="status">
                  {(f) => (
                    <f.Radio
                      label="Trạng thái"
                      options={[
                        { label: "Đang hoạt động", value: 1 },
                        { label: "Ngưng hoạt động", value: 0 }
                      ]}
                      disabled={isReadOnly}
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-12 mb-3">
                <form.AppField name="description">
                  {(f) => (
                    <f.Textarea
                      label="Mô tả"
                      disabled={isReadOnly}
                      placeholder="Nhập mô tả"
                      rows={4}
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
              className={`accordion-button accordion-custom-button ${contact.isOpen ? "" : "collapsed"}`}
              onClick={() => contact.toggle()}
            >
              <span className="avatar avatar-md rounded me-1">
                <i className="ti ti-info-circle"></i>
              </span>
              Thông tin liên hệ
            </button>
          </div>
          <div
            className={`accordion-collapse collapse ${contact.isOpen ? "show" : ""}`}
            ref={contact.ref}
          >
            <div className="accordion-body border-top row">
              <div className="col-md-6 mb-3">
                <form.AppField name="address">
                  {(f) => (
                    <f.Input
                      label="Địa chỉ"
                      required
                      disabled={isReadOnly}
                      placeholder="Nhập địa chỉ"
                    />
                  )}
                </form.AppField>
              </div>
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
                  {(f) => (
                    <f.Input
                      label="Email"
                      required
                      disabled={isReadOnly}
                      placeholder="Nhập email"
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="website">
                  {(f) => (
                    <f.Input label="Website" disabled={isReadOnly} placeholder="Nhập website" />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="ownerId">
                  {(f) => (
                    <f.Select
                      label="Người phụ trách"
                      options={userOptions}
                      onLoadMore={onLoadMoreUsers}
                      disabled={isReadOnly}
                    />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="parentId">
                  {(f) => (
                    <f.Select
                      label="Chi nhánh cha"
                      options={parentOptions}
                      onLoadMore={onLoadMoreParents}
                      disabled={isReadOnly}
                    />
                  )}
                </form.AppField>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
