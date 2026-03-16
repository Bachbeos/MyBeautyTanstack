import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import logo from "@assets/img/logo.svg";
import appleLogo from "@assets/img/icons/apple-logo.svg";
import googleLogo from "@assets/img/icons/google-logo.svg";
import facebookLogo from "@assets/img/icons/facebook-logo.svg";
import { useStep } from "@/hooks/use-step";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent
});

function RouteComponent() {
  // 1. Initialize the hook with 2 steps (Email input & Reset form)
  const [currentStep, helpers] = useStep(2);
  const [email, setEmail] = React.useState("");

  // Handle the primary button click
  const handleAction = () => {
    if (currentStep === 1) {
      // Add your logic to trigger the OTP email API here
      console.log("Sending OTP to:", email);
      helpers.goToNextStep();
    } else {
      // Add your logic to submit the new password here
      console.log("Resetting password...");
    }
  };

  return (
    <div className="main-wrapper">
      <div className="overflow-hidden p-3 acc-vh">
        <div className="row vh-100 w-100 g-0">
          <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
            <div className="row">
              <div className="col-md-10 mx-auto">
                <form
                  className="vh-100 d-flex justify-content-between flex-column p-4 pb-0"
                  onSubmit={(e) => e.preventDefault()} // Prevent page refresh
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
                          <input type="text" className="form-control" />
                          <span className="input-group-text">
                            <i className="ti ti-key"></i>
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Mật khẩu mới</label>
                        <div className="input-group input-group-flat pass-group">
                          <input type="password" className="form-control pass-input" />
                          <span className="input-group-text" style={{ cursor: "pointer" }}>
                            <i className="ti ti-eye-off"></i>
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Xác nhận mật khẩu</label>
                        <div className="input-group input-group-flat pass-group">
                          <input type="password" className="form-control pass-input" />
                          <span className="input-group-text" style={{ cursor: "pointer" }}>
                            <i className="ti ti-eye-off"></i>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-link p-0 mb-3"
                        onClick={helpers.goToPrevStep}
                      >
                        <i className="ti ti-arrow-left"></i> Quay lại nhập email
                      </button>
                    </div>
                  )}

                  <div className="mb-3">
                    <button type="button" className="btn btn-primary w-100" onClick={handleAction}>
                      {currentStep === 1 ? "Gửi OTP" : "Đổi mật khẩu"}
                    </button>
                  </div>

                  <div className="mb-3 text-center">
                    <p className="mb-0">
                      Quay lại
                      <a href="/login" className="link-indigo fw-bold link-hover ms-1">
                        Đăng nhập
                      </a>
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
                    </>
                  )}

                  <div className="text-center pb-4"></div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-6 d-none d-lg-block account-bg-03"></div>
        </div>
      </div>
    </div>
  );
}
