import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
  <>
    <Outlet />
    <TanStackRouterDevtools />
    <Toaster position="top-right" expand richColors={false} />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
