import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useEffect, useState } from "react";

import { userQueries, userMutations, userKeys } from "@/lib/tanstack/options/user";
import { useAppForm } from "@/components/form/hooks";
import { AsyncBoundary } from "@/components/async-boundary";
import { queryClient } from "@/lib/tanstack/query-client";

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

export const Route = createFileRoute("/_crm/_profile-settings/profile-settings")({
  component: RouteComponent
});

function RouteComponent() {
  const query = useQuery(userQueries.info());
  const updateMutation = useMutation(userMutations.update());
  const user = query.data?.result;

  const [uploading, setUploading] = useState(false);

  const form = useAppForm({
    defaultValues: {
      id: user?.id,
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
      await updateMutation.mutateAsync(value as any);
      queryClient.invalidateQueries({ queryKey: userKeys.info() });
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        id: user.id,
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        avatar: user.avatar || "",
        gender: user.gender ?? 1,
        alias: user.alias || "",
        cityName: user.cityName || "",
        subdistrictName: user.subdistrictName || ""
      } as ProfileFormValues);
    }
  }, [user]);

  // Logic upload file giữ nguyên từ bản cũ của Bách
  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setUploading(true);
  //   try {
  //     const response = await uploadFile(file); // Call API upload
  //     if (response && response.code === 200) {
  //       form.setFieldValue("avatar", response.result);
  //     }
  //   } catch (err) {
  //     console.error("Upload error:", err);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header Breadcrumb giữ nguyên từ Profile.tsx cũ */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1">Cài đặt chung</h4>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 p-0">
                <li className="breadcrumb-item">
                  <a href="/">Trang chủ</a>
                </li>
                <li className="breadcrumb-item active">Cài đặt chung</li>
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
                        <a href="#" className="d-block p-2 fw-medium active">
                          Hồ sơ cá nhân
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-9 col-lg-12">
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
                              {/* <input type="file" accept="image/*" className="position-absolute w-100 h-100 opacity-0 top-0 start-0" onChange={handleFileChange} disabled={uploading} /> */}
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
                          <div className="col-md-6 mb-3">
                            <form.AppField name="cityName">
                              {(field) => (
                                <field.Input
                                  label="Tỉnh / Thành phố"
                                  placeholder="Nhập tên thành phố"
                                />
                              )}
                            </form.AppField>
                          </div>
                          <div className="col-md-6 mb-3">
                            <form.AppField name="subdistrictName">
                              {(field) => (
                                <field.Input
                                  label="Phường / Xã / Quận"
                                  placeholder="Nhập tên phường/xã"
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
              </div>
            </div>
          )}
        </AsyncBoundary>
      </div>
    </div>
  );
}
