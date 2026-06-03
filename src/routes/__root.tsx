import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import image_error404 from "@/assets/img/authentication/error-404.png";
import { ThemeProvider } from "@/components/theme/theme-provider";
import ThemeSettings from "@/components/theme/theme-setting";
import { SocketNotificationListener } from "@/components/socket/socket-notification-listener";

function RootLayout() {
  return (
    <ThemeProvider>
      <SocketNotificationListener />
      <Outlet />
      <ThemeSettings />
      <TanStackRouterDevtools />
      <Toaster position="bottom-right" expand richColors />
    </ThemeProvider>
  );
}

function Error404() {
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

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <Error404 />
});
