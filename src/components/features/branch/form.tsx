import { useEffect } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import { useCollapse } from "@/hooks/use-collapse"; // Tận dụng hook cũ của bạn

const branchSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Vui lòng nhập tên chi nhánh"),
  avatar: z.string().optional(),
  foundingDay: z.coerce.number().min(1).max(31).optional(),
  foundingMonth: z.coerce.number().min(1).max(12).optional(),
  foundingYear: z.coerce.number().optional(),
  status: z.coerce.number().default(1),
  description: z.string().optional(),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  phone: z.string().regex(/^0[0-9]{9,10}$/, "SĐT không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  website: z.string().optional(),
  ownerId: z.coerce.number().optional(),
  parentId: z.coerce.number().optional()
});

type BranchFormValues = z.input<typeof branchSchema>;

export function BranchForm({ mode, item, onSubmit, parentOptions, userOptions }: any) {
  const isReadOnly = mode === "detail";
  const basic = useCollapse(true); // Mặc định mở
  const contact = useCollapse(false);

  const form = useAppForm({
    defaultValues: {
      id: item?.id,
      name: item?.name || "",
      avatar: item?.avatar || "",
      foundingDay: item?.foundingDay || "",
      foundingMonth: item?.foundingMonth || "",
      foundingYear: item?.foundingYear || "",
      status: item?.status ?? 1,
      description: item?.description || "",
      address: item?.address || "",
      phone: item?.phone || "",
      email: item?.email || "",
      website: item?.website || "",
      ownerId: item?.ownerId || 0,
      parentId: item?.parentId || 0
    } as BranchFormValues,
    validators: { onSubmit: branchSchema },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        parentId: value.parentId !== 0 ? value.parentId : undefined,
        ownerId: value.ownerId !== 0 ? value.ownerId : undefined
      });
    }
  });

  useEffect(() => {
    if (item && mode !== "add") {
      form.reset({ ...item } as any);
    }
  }, [item]);

  return (
    <form
      id="branch-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="accordion accordion-bordered" id="branch_accordion">
        {/* THÔNG TIN CƠ BẢN */}
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
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-xxl border border-dashed me-3">
                        <img
                          src={f.state.value || "assets/img/profiles/avatar-01.jpg"}
                          style={{ width: 80, height: 80, objectFit: "cover" }}
                          alt="Avatar"
                        />
                      </div>
                      <button type="button" className="btn btn-sm btn-primary position-relative">
                        Tải ảnh lên{" "}
                        <input
                          type="file"
                          className="opacity-0 position-absolute start-0 w-100 h-100"
                          disabled={isReadOnly}
                        />
                      </button>
                    </div>
                  )}
                </form.AppField>
              </div>

              <div className="col-12 mb-3">
                <form.AppField name="name">
                  {(f) => <f.Input label="Tên chi nhánh *" disabled={isReadOnly} />}
                </form.AppField>
              </div>

              <div className="col-4 mb-3">
                <form.AppField name="foundingDay">
                  {(f) => <f.Input label="Ngày" type="number" disabled={isReadOnly} />}
                </form.AppField>
              </div>
              <div className="col-4 mb-3">
                <form.AppField name="foundingMonth">
                  {(f) => <f.Input label="Tháng" type="number" disabled={isReadOnly} />}
                </form.AppField>
              </div>
              <div className="col-4 mb-3">
                <form.AppField name="foundingYear">
                  {(f) => <f.Input label="Năm" type="number" disabled={isReadOnly} />}
                </form.AppField>
              </div>

              <div className="col-12 mb-3">
                <form.AppField name="status">
                  {(f) => (
                    <f.Radio
                      label="Trạng thái"
                      options={[
                        { label: "Hoạt động", value: 1 },
                        { label: "Ngưng hoạt động", value: 0 }
                      ]}
                      disabled={isReadOnly}
                    />
                  )}
                </form.AppField>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG TIN LIÊN HỆ */}
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
                  {(f) => <f.Input label="Địa chỉ *" disabled={isReadOnly} />}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="phone">
                  {(f) => <f.Input label="Số điện thoại *" disabled={isReadOnly} />}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="email">
                  {(f) => <f.Input label="Email *" disabled={isReadOnly} />}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="website">
                  {(f) => <f.Input label="Website" disabled={isReadOnly} />}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="ownerId">
                  {(f) => (
                    <f.Select label="Người phụ trách" options={userOptions} disabled={isReadOnly} />
                  )}
                </form.AppField>
              </div>
              <div className="col-md-6 mb-3">
                <form.AppField name="parentId">
                  {(f) => (
                    <f.Select label="Chi nhánh cha" options={parentOptions} disabled={isReadOnly} />
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
