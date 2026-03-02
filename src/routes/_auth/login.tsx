import { createFileRoute, Link } from "@tanstack/react-router";
import { email, z } from "zod";

import logo from "@assets/img/logo.svg";
import appleLogo from "@assets/img/icons/apple-logo.svg";
import googleLogo from "@assets/img/icons/google-logo.svg";
import facebookLogo from "@assets/img/icons/facebook-logo.svg";
import { useAppForm } from "@/components/form/hooks";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { loginMutationOptions } from "@/lib/tanstack/options/auth";
import { useAuthStore } from "@/lib/stores/auth";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent
});

const loginSchema = z.object({
  phone: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .regex(/^\+?\d+$/, "Chỉ được chứa số"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean().optional()
});

type LoginInput = z.infer<typeof loginSchema>;

function RouteComponent() {
  const setAuth = useAuthStore((state) => state.set);
  const login = useMutation({
    ...loginMutationOptions(),
    onSuccess: (data) => {
      console.log(data.result?.token);
      setAuth({ accessToken: data.result?.token });
    }
  });
  const form = useAppForm({
    defaultValues: {
      phone: "",
      password: "",
      remember: true
    } satisfies LoginInput as LoginInput,
    validators: {
      onSubmit: loginSchema
    },
    onSubmit: async ({ value }) => {
      const data = {
        phone: value.phone,
        plainPassword: value.password
      };
      login.mutate(data);
    }
  });
  return (
    <div className="main-wrapper">
      <div className="overflow-hidden p-3 acc-vh">
        <div className="row vh-100 w-100 g-0">
          <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
            <div className="row">
              <div className="col-md-10 mx-auto">
                <form
                  className="vh-100 d-flex justify-content-between flex-column p-4 pb-0"
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
                      <h3 className="mb-2">Đăng nhập</h3>
                      <p className="mb-0">
                        Truy cập hệ thống My Beauty bằng số điện thoại và mật khẩu của bạn.
                      </p>
                    </div>

                    {/* Phone */}
                    <form.AppField name="phone">
                      {(f) => <f.Phone label="Số điện thoại" />}
                    </form.AppField>

                    {/* Password */}
                    <form.AppField name="password">
                      {(f) => <f.Password label="Mật khẩu" />}
                    </form.AppField>

                    {/* Remember */}
                    <form.Field name="remember">
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
                              Ghi nhớ đăng nhập
                            </label>
                          </div>

                          <div className="text-end">
                            <a href="/forgot-password" className="link-danger fw-medium link-hover">
                              Quên mật khẩu?
                            </a>
                          </div>
                        </div>
                      )}
                    </form.Field>

                    <div className="mb-3">
                      <Button type="submit" block>
                        Đăng nhập
                      </Button>
                    </div>

                    <div className="mb-3">
                      <p className="mb-0">
                        Mới sử dụng hệ thống của chúng tôi?
                        <Link to="/register" className="link-indigo fw-bold link-hover">
                          {" "}
                          Tạo tài khoản
                        </Link>
                      </p>
                    </div>

                    <div className="or-login text-center position-relative mb-3">
                      <h6 className="fs-14 mb-0 position-relative text-body">HOẶC</h6>
                    </div>

                    <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mb-3">
                      <div className="text-center flex-fill">
                        <a
                          href="#"
                          className="p-2 btn btn-info d-flex align-items-center justify-content-center"
                        >
                          <img className="img-fluid m-1" src={facebookLogo} alt="Facebook" />
                        </a>
                      </div>

                      <div className="text-center flex-fill">
                        <a
                          href="#"
                          className="p-2 btn btn-outline-light d-flex align-items-center justify-content-center"
                        >
                          <img className="img-fluid m-1" src={googleLogo} alt="Google" />
                        </a>
                      </div>

                      <div className="text-center flex-fill">
                        <a
                          href="#"
                          className="p-2 btn btn-dark d-flex align-items-center justify-content-center"
                        >
                          <img className="img-fluid m-1" src={appleLogo} alt="Apple" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pb-4"></div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-6 account-bg-01"></div>
        </div>
      </div>
    </div>
  );
}
