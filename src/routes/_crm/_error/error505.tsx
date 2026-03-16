import { createFileRoute, Link } from "@tanstack/react-router";
import image_error500 from "@/assets/img/authentication/error-500.png";

export const Route = createFileRoute("/_crm/_error/error505")({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="main-wrapper error-page">
      <div className="container">
        <div className="row justify-content-center align-items-center vh-100">
          <div className="col-md-8 d-flex align-items-center justify-content-center mx-auto">
            <div>
              <div className="error-img mb-4">
                <img src={image_error500} className="img-fluid" alt="Error 505" />
              </div>

              <div className="text-center">
                <h2 className="mb-3">Không có quyền truy cập</h2>

                <p className="mb-3">
                  Bạn không có quyền xem trang này. <br />
                  Vui lòng liên hệ quản trị viên.
                </p>

                <div className="pb-4">
                  <Link to="/" className="btn btn-primary">
                    <i className="ti ti-chevron-left me-1"></i>
                    Trở về trang chủ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
