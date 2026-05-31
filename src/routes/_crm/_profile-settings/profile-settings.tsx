import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useEffect, useState, type ChangeEvent } from "react";

import { userQueries, userMutations } from "@/lib/tanstack/options/user";
import { useAppForm } from "@/components/form/hooks";
import { AsyncBoundary } from "@/components/async-boundary";
import { useVietnamLocations } from "@/hooks/use-vietnam-locations";
import { uploadFile } from "@/lib/api/upload-image";

const profileSchema = z.object({
  id: z.any(),
  name: z.string().min(1, "Họ và tên không được để trống"),
  phone: z.string().regex(/^0[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không đúng định dạng"),
  avatar: z.string().optional(),
  gender: z.number(),
  alias: z.string().optional(),
  cityName: z.string().optional(),
  subdistrictName: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ChangePasswordForm() {
  const changePasswordMutation = useMutation(userMutations.updatePassword());

  const passwordSchema = z
    .object({
      oldPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
      newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
      confirmPassword: z.string().min(6, "Xác nhận mật khẩu mới phải có ít nhất 6 ký tự")
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"]
    });

  type PasswordFormValues = z.infer<typeof passwordSchema>;

  const form = useAppForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    } as PasswordFormValues,
    validators: { onSubmit: passwordSchema },
    onSubmit: async ({ value }) => {
      await changePasswordMutation.mutateAsync({
        oldPassword: value.oldPassword,
        newPassword: value.newPassword
      });
      form.reset();
    }
  });

  return (
    <div className="card mb-0 border-0 shadow-sm">
      <div className="card-body">
        <div className="border-bottom mb-3 pb-3">
          <h5 className="mb-0 fs-17">Đổi mật khẩu</h5>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="row">
            <div className="col-md-6 mb-3">
              <form.AppField name="oldPassword">
                {(field) => (
                  <field.Password
                    label="Mật khẩu hiện tại"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                    disabled={changePasswordMutation.isPending}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <form.AppField name="newPassword">
                {(field) => (
                  <field.Password
                    label="Mật khẩu mới"
                    placeholder="Nhập mật khẩu mới"
                    required
                    disabled={changePasswordMutation.isPending}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <form.AppField name="confirmPassword">
                {(field) => (
                  <field.Password
                    label="Xác nhận mật khẩu mới"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    disabled={changePasswordMutation.isPending}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-end flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => form.reset()}
              disabled={changePasswordMutation.isPending}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_crm/_profile-settings/profile-settings")({
  component: RouteComponent
});

function RouteComponent() {
  const query = useQuery(userQueries.info());
  const updateMutation = useMutation(userMutations.updateInfo());
  const user = query.data?.result;
  const location = useVietnamLocations();

  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const form = useAppForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      gender: user?.gender ?? 1,
      alias: user?.alias || "",
      cityName: user?.cityName || "",
      subdistrictName: user?.subdistrictName || ""
    } as ProfileFormValues,
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync(value);
    }
  });

  useEffect(() => {
    if (!user) return;

    form.reset({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      avatar: user.avatar || "",
      gender: user.gender ?? 1,
      alias: user.alias || "",
      cityName: user.cityName || "",
      subdistrictName: user.subdistrictName || ""
    } as ProfileFormValues);

    if (user.cityName) {
      const province = location.provinces.find((p) => p.name === user.cityName);
      if (province) {
        location.handleProvinceChange(String(province.code));
      }
    }
  }, [user, location.provinces]);

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
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1">Cài đặt chung</h4>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 p-0">
                <div className="text-muted small">Cài đặt chung / Hồ sơ cá nhân</div>
              </ol>
            </nav>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <button
              className="btn btn-icon btn-outline-light shadow"
              onClick={() => query.refetch()}
            >
              <i className="ti ti-refresh" />
            </button>
          </div>
        </div>

        <AsyncBoundary status={query.status} error={query.error} data={user}>
          {() => (
            <div className="row mt-3">
              <div className="col-xl-3 col-lg-12">
                <div className="card mb-3 mb-xl-0 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="settings-sidebar">
                      <h5 className="mb-3 fs-17">Cài đặt chung</h5>
                      <div className="list-group list-group-flush">
                        <a
                          href="#"
                          className={`d-block p-2 fw-medium rounded ${
                            activeTab === "profile" ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab("profile");
                          }}
                        >
                          Hồ sơ cá nhân
                        </a>
                        <a
                          href="#"
                          className={`d-block p-2 fw-medium rounded mt-1 ${
                            activeTab === "password" ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab("password");
                          }}
                        >
                          Đổi mật khẩu
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-9 col-lg-12">
                {activeTab === "profile" ? (
                  <div className="card mb-0 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="border-bottom mb-3 pb-3">
                        <h5 className="mb-0 fs-17">Hồ sơ</h5>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          form.handleSubmit();
                        }}
                      >
                        <div className="mb-3">
                          <h6 className="mb-1">Ảnh đại diện</h6>
                        </div>

                        <div className="mb-3">
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
                                  disabled={uploading}
                                />
                              </label>
                              <p className="mb-0">JPG, GIF hoặc PNG. Tối đa 5MB</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-bottom mb-3">
                          <h6 className="mb-3">Thông tin chi tiết</h6>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <form.AppField name="name">
                                {(field) => (
                                  <field.Input
                                    label="Họ và tên"
                                    placeholder="Nhập họ và tên"
                                    required
                                  />
                                )}
                              </form.AppField>
                            </div>
                            <div className="col-md-6 mb-3">
                              <form.AppField name="alias">
                                {(field) => (
                                  <field.Input
                                    label="Bí danh / Nickname"
                                    placeholder="Nhập bí danh"
                                  />
                                )}
                              </form.AppField>
                            </div>
                            <div className="col-md-6 mb-3">
                              <form.AppField name="phone">
                                {(field) => (
                                  <field.Input
                                    label="Số điện thoại"
                                    placeholder="Nhập số điện thoại"
                                    required
                                  />
                                )}
                              </form.AppField>
                            </div>
                            <div className="col-md-6 mb-3">
                              <form.AppField name="email">
                                {(field) => (
                                  <field.Input label="Email" placeholder="Nhập email" required />
                                )}
                              </form.AppField>
                            </div>
                            <div className="col-md-6 mb-3">
                              <form.AppField name="gender">
                                {(field) => (
                                  <field.Select
                                    label="Giới tính"
                                    options={[
                                      { label: "Nam", value: 1 },
                                      { label: "Nữ", value: 2 },
                                      { label: "Khác", value: 0 }
                                    ]}
                                  />
                                )}
                              </form.AppField>
                            </div>
                          </div>
                        </div>

                        <div className="border-bottom mb-3">
                          <div className="mb-3">
                            <h6 className="mb-1">Địa chỉ</h6>
                          </div>
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <form.AppField
                                name="cityName"
                                listeners={{
                                  onChange: ({ value }) => {
                                    if (!value) return;

                                    const province = location.provinces.find((p) => p.name === value);
                                    if (province) {
                                      location.handleProvinceChange(String(province.code));
                                    }
                                  }
                                }}
                              >
                                {(field) => (
                                  <field.Select
                                    label="Tỉnh / Thành phố"
                                    options={[
                                      { label: "Chọn tỉnh / thành", value: "" },
                                      ...location.provinces.map((p) => ({
                                        label: p.name,
                                        value: p.name
                                      }))
                                    ]}
                                  />
                                )}
                              </form.AppField>
                            </div>

                            <div className="col-md-4 mb-3">
                              <form.AppField
                                name="subdistrictName"
                                listeners={{
                                  onChange: ({ value }) => {
                                    if (!value) return;

                                    const district = location.districts.find((d) => d.name === value);
                                    if (district) {
                                      location.handleDistrictChange(String(district.code));
                                    }
                                  }
                                }}
                              >
                                {(field) => (
                                  <field.Select
                                    label="Quận / Huyện"
                                    options={[
                                      { label: "Chọn quận / huyện", value: "" },
                                      ...location.districts.map((d) => ({
                                        label: d.name,
                                        value: d.name
                                      }))
                                    ]}
                                  />
                                )}
                              </form.AppField>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-end flex-wrap gap-2 mt-3">
                          <button
                            type="button"
                            className="btn btn-sm btn-light"
                            onClick={() => form.reset()}
                          >
                            Huỷ
                          </button>
                          <button
                            type="submit"
                            className="btn btn-sm btn-primary"
                            disabled={updateMutation.isPending || uploading}
                          >
                            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <ChangePasswordForm />
                )}
              </div>
            </div>
          )}
        </AsyncBoundary>
      </div>
    </div>
  );
}
