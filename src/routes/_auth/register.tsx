import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import logo from "@assets/img/logo.svg";
import appleLogo from "@assets/img/icons/apple-logo.svg";
import googleLogo from "@assets/img/icons/google-logo.svg";
import facebookLogo from "@assets/img/icons/facebook-logo.svg";

import { useAppForm } from "@/components/form/hooks";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { authMutations } from "@/lib/tanstack/options/auth";

export const Route = createFileRoute("/_auth/register")({
  component: RouteComponent
});

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Họ và tên là bắt buộc"),
    phone: z
      .string()
      .regex(/^0[0-9]{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Vui lòng nhập lại mật khẩu"),
    agree: z.boolean().refine((v) => v === true, {
      message: "Bạn phải đồng ý với điều khoản"
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"]
  });

type RegisterInput = z.infer<typeof registerSchema>;

function RouteComponent() {
  const register = useMutation(authMutations.register());
  const form = useAppForm({
    defaultValues: {
      fullName: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agree: true
    } satisfies RegisterInput as RegisterInput,
    validators: {
      onSubmit: registerSchema
    },
    onSubmit: async ({ value }) => {
      const data = {
        name: value.fullName,
        phone: value.phone,
        plainPassword: value.password
      };
      register.mutate(data);
    }
  });

  return (
    <div className="main-wrapper">
      <div className="overflow-hidden p-3 acc-vh">
        <div className="row vh-100 w-100 g-0 align-items-center justify-content-center">
          <div className="col-lg-5 col-lg-4 vh-100">
            <div className="row h-100">
              <div className="col-md-11 mx-auto">
                <form
                  className="vh-100 d-flex justify-content-center flex-column p-4 pb-0"
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                >
                  <div className="text-center mb-4 auth-logo">
                    <img src={logo} className="img-fluid" alt="Logo" />
                  </div>

                  <div>
                    <div className="mb-3">
                      <h3 className="mb-2">Đăng ký</h3>
                      <p className="mb-0">Tham gia hệ thống My Beauty ngay hôm nay.</p>
                    </div>

                    <div className="mb-3">
                      <form.AppField name="fullName">
                        {(f) => <f.Input label="Họ và tên" />}
                      </form.AppField>
                    </div>

                    <div className="mb-3">
                      <form.AppField name="phone">
                        {(f) => <f.Phone label="Số điện thoại" />}
                      </form.AppField>
                    </div>

                    <div className="mb-3">
                      <form.AppField name="password">
                        {(f) => <f.Password label="Mật khẩu" />}
                      </form.AppField>
                    </div>

                    <div className="mb-3">
                      <form.AppField name="confirmPassword">
                        {(f) => <f.Password label="Nhập lại mật khẩu" />}
                      </form.AppField>
                    </div>

                    <form.Field name="agree">
                      {(field) => (
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="form-check form-check-md d-flex align-items-center">
                            <input
                              type="checkbox"
                              className="form-check-input mt-0"
                              checked={field.state.value}
                              onChange={(e) => field.handleChange(e.target.checked)}
                            />
                            <label className="form-check-label text-dark ms-1">
                              Tôi đồng ý với{" "}
                              <a href="#" className="text-primary">
                                Điều khoản &amp; Chính sách
                              </a>
                            </label>
                          </div>
                        </div>
                      )}
                    </form.Field>

                    <div className="mb-3">
                      <Button type="submit" block>
                        Đăng ký
                      </Button>
                    </div>

                    <div className="mb-3 text-center">
                      <p className="mb-0">
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="link-indigo fw-bold link-hover">
                          Đăng nhập ngay
                        </Link>
                      </p>
                    </div>

                    <div className="or-login text-center position-relative mb-3">
                      <h6 className="fs-14 mb-0 position-relative text-body">HOẶC</h6>
                    </div>

                    <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mb-3">
                      {/* <div className="text-center flex-fill">
                        <a
                          href="#"
                          className="p-2 btn btn-info d-flex align-items-center justify-content-center"
                        >
                          <img className="img-fluid m-1" src={facebookLogo} alt="Facebook" />
                        </a>
                      </div> */}

                      <div className="text-center flex-fill">
                        <a
                          href="#"
                          className="p-2 btn btn-outline-light d-flex align-items-center justify-content-center"
                        >
                          <img className="img-fluid m-1" src={googleLogo} alt="Google" />
                        </a>
                      </div>

                      {/* <div className="text-center flex-fill">
                        <a
                          href="#"
                          className="p-2 btn btn-dark d-flex align-items-center justify-content-center"
                        >
                          <img className="img-fluid m-1" src={appleLogo} alt="Apple" />
                        </a>
                      </div> */}
                    </div>
                  </div>

                  <div className="text-center pb-4"></div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
