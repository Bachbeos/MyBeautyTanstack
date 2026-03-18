import { createFileRoute, Link } from "@tanstack/react-router";
import image_error404 from "@/assets/img/authentication/error-404.png";

export const Route = createFileRoute("/_crm/_error/error404")({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="main-wrapper error-page">
      <div className="container">
        <div className="row justify-content-center align-items-center vh-100">
          <div className="col-md-8 d-flex align-items-center justify-content-center mx-auto">
            <div>
              <div className="error-img p-4">
                <img src={image_error404} className="img-fluid" alt="Img" />
              </div>
              <div className="text-center">
                <h2 className="mb-3">Rất tiếc, có lỗi xảy ra</h2>
                <p className="mb-3">
                  Lỗi 404 Không tìm thấy trang. Rất tiếc, trang bạn đang tìm kiếm không tồn tại{" "}
                  <br /> hoặc đã bị di chuyển.
                </p>
                <div className="pb-4">
                  <Link to="/resource" className="btn btn-primary d-inline-flex align-items-center">
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

export default RouteComponent;
