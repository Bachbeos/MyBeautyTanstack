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
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent
});

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "486014130328-d2ul4iub40vmmuv5oadmohe2d921s9dn.apps.googleusercontent.com";

const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^0[0-9]{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean().optional()
});

type LoginInput = z.infer<typeof loginSchema>;

function LoginForm() {
  const login = useMutation(authMutations.login());
  const loginGoogleMutation = useMutation(authMutations.loginGoogle());

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      loginGoogleMutation.mutate({ token: tokenResponse.access_token });
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

  const isLoading = login.isPending || loginGoogleMutation.isPending;

  return (
    <div className="main-wrapper">
      <div className="overflow-hidden p-3 acc-vh">
        <div className="row vh-100 w-100 g-0 align-items-center justify-content-center">
          <div className="col-lg-5 col-lg-4 vh-100 overflow-y-auto overflow-x-hidden">
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
                      <h3 className="mb-2">Đăng nhập</h3>
                      <p className="mb-0">
                        Truy cập hệ thống bằng số điện thoại và mật khẩu của bạn.
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="mb-3">
                      <form.AppField name="phone">
                        {(f) => <f.Phone label="Số điện thoại" disabled={isLoading} />}
                      </form.AppField>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <form.AppField name="password">
                        {(f) => <f.Password label="Mật khẩu" disabled={isLoading} />}
                      </form.AppField>
                    </div>

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
                              disabled={isLoading}
                            />
                            <label className="form-check-label text-dark ms-1">
                              Ghi nhớ đăng nhập
                            </label>
                          </div>

                          <div className="text-end">
                            <Link
                              to="/forgot-password"
                              className="link-danger fw-medium link-hover"
                            >
                              Quên mật khẩu?
                            </Link>
                          </div>
                        </div>
                      )}
                    </form.Field>

                    <div className="mb-3">
                      <Button type="submit" block loading={isLoading}>
                        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
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
                      {/* <div className="text-center flex-fill">
                        <a
                          href="javascript:void(0);"
                          className="p-2 btn btn-info d-flex align-items-center justify-content-center"
                        >
                          <img className="img-fluid m-1" src={facebookLogo} alt="Facebook" />
                        </a>
                      </div> */}

                      <div className="text-center flex-fill">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            googleLogin();
                          }}
                          disabled={isLoading}
                          className="p-2 btn btn-outline-light d-flex align-items-center justify-content-center w-100"
                        >
                          <img className="img-fluid m-1" src={googleLogo} alt="Google" />
                        </button>
                      </div>

                      {/* <div className="text-center flex-fill">
                        <a
                          href="javascript:void(0);"
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

function RouteComponent() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}
