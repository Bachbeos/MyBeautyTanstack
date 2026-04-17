import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { authMutations } from "@/lib/tanstack/options/auth";
import { useStep } from "@/hooks/use-step";
import { Button } from "@/components/ui/button";

import logo from "@assets/img/logo.svg";
import appleLogo from "@assets/img/icons/apple-logo.svg";
import googleLogo from "@assets/img/icons/google-logo.svg";
import facebookLogo from "@assets/img/icons/facebook-logo.svg";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent
});

function RouteComponent() {
  const [currentStep, helpers] = useStep(2);
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const forgotMutation = useMutation(authMutations.forgotPassword());
  const resetMutation = useMutation(authMutations.resetPassword());

  const isLoading = forgotMutation.isPending || resetMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (!email || !email.includes("@")) {
        return;
      }
      forgotMutation.mutate(
        { email },
        {
          onSuccess: () => {
            helpers.goToNextStep();
          }
        }
      );
    } else {
      if (newPassword.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Mật khẩu nhập lại không khớp!");
        return;
      }

      resetMutation.mutate({
        email,
        otp,
        newPassword
      });
    }
  };

  return (
    <div className="main-wrapper">
      <div className="overflow-hidden p-3 acc-vh">
        <div className="row vh-100 w-100 g-0 align-items-center justify-content-center">
          <div className="col-lg-5 col-lg-4 vh-100 overflow-y-auto overflow-x-hidden">
            <div className="row h-100">
              <div className="col-md-11 mx-auto">
                <form
                  className="vh-100 d-flex justify-content-center flex-column p-4 pb-0"
                  onSubmit={handleSubmit}
                >
                  <div className="text-center mb-3 auth-logo">
                    <img src={logo} className="img-fluid" alt="Logo" />
                  </div>

                  {/* Step 1: Email Input */}
                  {currentStep === 1 && (
                    <div>
                      <div className="mb-3">
                        <h3 className="mb-2">Quên mật khẩu?</h3>
                        <p className="mb-0">
                          Nếu bạn quên mật khẩu, chúng tôi sẽ gửi mã OTP qua email cho bạn.
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="forgot-email">
                          Địa chỉ email
                        </label>
                        <div className="input-group input-group-flat">
                          <input
                            id="forgot-email"
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            required
                            disabled={isLoading}
                          />
                          <span className="input-group-text">
                            <i className="ti ti-mail"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: OTP & New Password */}
                  {currentStep === 2 && (
                    <div>
                      <div className="mb-3">
                        <h3 className="mb-2">Đặt lại mật khẩu</h3>
                        <p className="mb-0">
                          Vui lòng nhập mã OTP đã được gửi đến <strong>{email}</strong>
                        </p>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Mã OTP</label>
                        <div className="input-group input-group-flat">
                          <input
                            type="text"
                            className="form-control"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                          <span className="input-group-text">
                            <i className="ti ti-key"></i>
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Mật khẩu mới</label>
                        <div className="input-group input-group-flat pass-group">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            className="form-control pass-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                          <span
                            className="input-group-text toggle-password"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            <i className={`ti ${showNewPassword ? "ti-eye" : "ti-eye-off"}`}></i>
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Xác nhận mật khẩu</label>
                        <div className="input-group input-group-flat pass-group">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-control pass-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                          <span
                            className="input-group-text toggle-password"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            <i
                              className={`ti ${showConfirmPassword ? "ti-eye" : "ti-eye-off"}`}
                            ></i>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-link p-0 mb-3"
                        onClick={helpers.goToPrevStep}
                        disabled={isLoading}
                      >
                        <i className="ti ti-arrow-left"></i> Quay lại nhập email
                      </button>
                    </div>
                  )}

                  <div className="mb-3">
                    <Button type="submit" block loading={isLoading}>
                      {currentStep === 1 ? "Gửi OTP" : "Đổi mật khẩu"}
                    </Button>
                  </div>

                  <div className="mb-3 text-center">
                    <p className="mb-0">
                      Quay lại
                      <Link to="/login" className="link-indigo fw-bold link-hover ms-1">
                        {" "}
                        Đăng nhập
                      </Link>
                    </p>
                  </div>

                  {currentStep === 1 && (
                    <>
                      <div className="or-login text-center position-relative mb-3">
                        <h6 className="fs-14 mb-0 position-relative text-body">HOẶC</h6>
                      </div>
                      <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mb-3">
                        <div className="text-center flex-fill">
                          <a
                            href="javascript:void(0);"
                            className="p-2 btn btn-info d-flex align-items-center justify-content-center"
                          >
                            <img className="img-fluid m-1" src={facebookLogo} alt="Facebook" />
                          </a>
                        </div>
                        <div className="text-center flex-fill">
                          <a
                            href="javascript:void(0);"
                            className="p-2 btn btn-outline-light d-flex align-items-center justify-content-center"
                          >
                            <img className="img-fluid m-1" src={googleLogo} alt="Google" />
                          </a>
                        </div>
                        <div className="text-center flex-fill">
                          <a
                            href="javascript:void(0);"
                            className="p-2 btn btn-dark d-flex align-items-center justify-content-center"
                          >
                            <img className="img-fluid m-1" src={appleLogo} alt="Apple" />
                          </a>
                        </div>
                      </div>
                    </>
                  )}

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
